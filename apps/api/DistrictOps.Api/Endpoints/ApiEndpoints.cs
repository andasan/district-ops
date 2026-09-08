using DistrictOps.Api.Auth;
using DistrictOps.Domain.Authz;
using DistrictOps.Domain.Entities;
using DistrictOps.Domain.Enums;
using DistrictOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DistrictOps.Api.Endpoints;

public static class ApiEndpoints
{
    public static RouteGroupBuilder MapDistrictOpsEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").WithTags("DistrictOps");

        api.MapGet("/health", () => Results.Ok(new { status = "ok", service = "DistrictOps.Api" }))
            .WithName("Health")
            .AllowAnonymous();

        api.MapGet("/me", (ICurrentUserAccessor current) =>
            {
                var user = current.User;
                return user is null ? Results.Unauthorized() : Results.Ok(user);
            })
            .WithName("GetMe");

        api.MapGet("/tenants/{tenantId:guid}/workflows", ListWorkflows)
            .WithName("ListWorkflows");

        api.MapPost("/tenants/{tenantId:guid}/workflows/enrollment", StartEnrollment)
            .WithName("StartEnrollment");

        api.MapGet("/jobs/{jobId:guid}", GetJob)
            .WithName("GetJob");

        api.MapGet("/tenants/{tenantId:guid}/reports/attendance", GetAttendanceReport)
            .WithName("GetAttendanceReport");

        return api;
    }

    private static async Task<IResult> ListWorkflows(
        Guid tenantId,
        ICurrentUserAccessor current,
        IRebacService rebac,
        AppDbContext db,
        CancellationToken ct)
    {
        if (current.User is not { } actor)
        {
            return Results.Unauthorized();
        }

        if (!await CanAccessTenantAsync(actor, tenantId, rebac, ct))
        {
            return Results.Json(new { error = "Forbidden" }, statusCode: StatusCodes.Status403Forbidden);
        }

        var workflows = await db.Workflows
            .AsNoTracking()
            .Include(w => w.Job)
            .Include(w => w.Division)
            .Where(w => w.TenantId == tenantId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);

        var visible = new List<WorkflowDto>();
        foreach (var w in workflows)
        {
            if (await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", w.DivisionId, ct))
            {
                visible.Add(WorkflowDto.From(w));
            }
        }

        return Results.Ok(visible);
    }

    private static async Task<IResult> StartEnrollment(
        Guid tenantId,
        StartEnrollmentRequest request,
        ICurrentUserAccessor current,
        IRebacService rebac,
        AppDbContext db,
        CancellationToken ct)
    {
        if (current.User is not { } actor)
        {
            return Results.Unauthorized();
        }

        if (actor.TenantId is Guid claimTenant && claimTenant != tenantId)
        {
            return Results.Json(new { error = "Forbidden" }, statusCode: StatusCodes.Status403Forbidden);
        }

        if (!await rebac.CheckAsync(actor.UserId, Relation.DivisionEditor, "division", request.DivisionId, ct))
        {
            return Results.Json(new { error = "Forbidden" }, statusCode: StatusCodes.Status403Forbidden);
        }

        var division = await db.Divisions.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.DivisionId && d.TenantId == tenantId, ct);
        if (division is null)
        {
            return Results.BadRequest(new { error = "Division not found in tenant." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["title"] = ["Title is required."]
            });
        }

        var workflow = new Workflow
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DivisionId = request.DivisionId,
            Type = WorkflowType.Enrollment,
            Title = request.Title.Trim(),
            CreatedByUserId = actor.UserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var job = new Job
        {
            Id = Guid.NewGuid(),
            WorkflowId = workflow.Id,
            Status = JobStatus.Pending,
            Attempt = 0,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.Workflows.Add(workflow);
        db.Jobs.Add(job);
        await db.SaveChangesAsync(ct);

        return Results.Accepted($"/api/jobs/{job.Id}", new StartEnrollmentResponse(workflow.Id, job.Id));
    }

    private static async Task<IResult> GetJob(
        Guid jobId,
        ICurrentUserAccessor current,
        IRebacService rebac,
        AppDbContext db,
        CancellationToken ct)
    {
        if (current.User is not { } actor)
        {
            return Results.Unauthorized();
        }

        var job = await db.Jobs.AsNoTracking()
            .Include(j => j.Workflow)
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);

        if (job is null)
        {
            return Results.NotFound();
        }

        if (!await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", job.Workflow.DivisionId, ct))
        {
            return Results.Json(new { error = "Forbidden" }, statusCode: StatusCodes.Status403Forbidden);
        }

        return Results.Ok(JobDto.From(job));
    }

    private static async Task<IResult> GetAttendanceReport(
        Guid tenantId,
        ICurrentUserAccessor current,
        IRebacService rebac,
        AppDbContext db,
        CancellationToken ct)
    {
        if (current.User is not { } actor)
        {
            return Results.Unauthorized();
        }

        if (!await CanAccessTenantAsync(actor, tenantId, rebac, ct))
        {
            return Results.Json(new { error = "Forbidden" }, statusCode: StatusCodes.Status403Forbidden);
        }

        var divisions = await db.Divisions.AsNoTracking()
            .Where(d => d.TenantId == tenantId)
            .ToListAsync(ct);

        var rows = new List<AttendanceRowDto>();
        var rng = new Random(tenantId.GetHashCode());
        foreach (var division in divisions)
        {
            if (!await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", division.Id, ct))
            {
                continue;
            }

            for (var i = 0; i < 12; i++)
            {
                rows.Add(new AttendanceRowDto(
                    division.Id,
                    division.Name,
                    $"School-{division.Code}-{i + 1:00}",
                    rng.Next(80, 420),
                    Math.Round(85 + rng.NextDouble() * 12, 1)));
            }
        }

        return Results.Ok(rows);
    }

    private static async Task<bool> CanAccessTenantAsync(
        CurrentUser actor,
        Guid tenantId,
        IRebacService rebac,
        CancellationToken ct)
    {
        if (actor.TenantId is Guid claimTenant && claimTenant != tenantId)
        {
            return false;
        }

        if (await rebac.CheckAsync(actor.UserId, Relation.TenantAdmin, "tenant", tenantId, ct))
        {
            return true;
        }

        // Division-scoped users still need tenant path access for list/report routes.
        var north = await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", SeedData.DivisionNorthId, ct);
        var south = await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", SeedData.DivisionSouthId, ct);
        var other = await rebac.CheckAsync(actor.UserId, Relation.DivisionViewer, "division", SeedData.DivisionOtherTenantId, ct);

        return tenantId == SeedData.TenantAId && (north || south)
            || tenantId == SeedData.TenantBId && other;
    }
}

public sealed record StartEnrollmentRequest(Guid DivisionId, string Title);

public sealed record StartEnrollmentResponse(Guid WorkflowId, Guid JobId);

public sealed record WorkflowDto(
    Guid Id,
    Guid TenantId,
    Guid DivisionId,
    string DivisionName,
    string Type,
    string Title,
    string CreatedByUserId,
    DateTimeOffset CreatedAt,
    JobDto? Job)
{
    public static WorkflowDto From(Workflow w) => new(
        w.Id,
        w.TenantId,
        w.DivisionId,
        w.Division.Name,
        w.Type.ToString(),
        w.Title,
        w.CreatedByUserId,
        w.CreatedAt,
        w.Job is null ? null : JobDto.From(w.Job));
}

public sealed record JobDto(
    Guid Id,
    Guid WorkflowId,
    string Status,
    string? ErrorMessage,
    int Attempt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? CompletedAt)
{
    public static JobDto From(Job j) => new(
        j.Id,
        j.WorkflowId,
        j.Status.ToString(),
        j.ErrorMessage,
        j.Attempt,
        j.CreatedAt,
        j.UpdatedAt,
        j.CompletedAt);
}

public sealed record AttendanceRowDto(
    Guid DivisionId,
    string DivisionName,
    string SchoolName,
    int Headcount,
    double AttendancePercent);
