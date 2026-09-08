using DistrictOps.Domain.Authz;
using DistrictOps.Domain.Entities;
using DistrictOps.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DistrictOps.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Division> Divisions => Set<Division>();
    public DbSet<Workflow> Workflows => Set<Workflow>();
    public DbSet<Job> Jobs => Set<Job>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tenant>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Slug).HasMaxLength(100);
        });

        modelBuilder.Entity<Division>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Code).HasMaxLength(50);
            e.HasOne(x => x.Tenant).WithMany(t => t.Divisions).HasForeignKey(x => x.TenantId);
        });

        modelBuilder.Entity<Workflow>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(300);
            e.Property(x => x.CreatedByUserId).HasMaxLength(100);
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
            e.HasOne(x => x.Tenant).WithMany(t => t.Workflows).HasForeignKey(x => x.TenantId);
            e.HasOne(x => x.Division).WithMany().HasForeignKey(x => x.DivisionId);
            e.HasOne(x => x.Job).WithOne(j => j.Workflow).HasForeignKey<Job>(j => j.WorkflowId);
        });

        modelBuilder.Entity<Job>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            e.Property(x => x.ErrorMessage).HasMaxLength(1000);
        });
    }
}

public static class SeedData
{
    public static readonly Guid TenantAId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid TenantBId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid DivisionNorthId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid DivisionSouthId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid DivisionOtherTenantId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

    public const string AdminUserId = "user-admin-a";
    public const string EditorUserId = "user-editor-north";
    public const string ViewerUserId = "user-viewer-north";
    public const string OtherTenantUserId = "user-admin-b";

    public static async Task EnsureSeededAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Tenants.AnyAsync(ct))
        {
            return;
        }

        var tenantA = new Tenant { Id = TenantAId, Name = "Pacific School Division", Slug = "pacific" };
        var tenantB = new Tenant { Id = TenantBId, Name = "Prairie School Division", Slug = "prairie" };

        db.Tenants.AddRange(tenantA, tenantB);
        db.Divisions.AddRange(
            new Division { Id = DivisionNorthId, TenantId = TenantAId, Name = "North Region", Code = "NORTH" },
            new Division { Id = DivisionSouthId, TenantId = TenantAId, Name = "South Region", Code = "SOUTH" },
            new Division { Id = DivisionOtherTenantId, TenantId = TenantBId, Name = "Central Region", Code = "CENTRAL" });

        var workflow = new Workflow
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            TenantId = TenantAId,
            DivisionId = DivisionNorthId,
            Type = WorkflowType.Enrollment,
            Title = "Fall enrollment batch",
            CreatedByUserId = EditorUserId,
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-2)
        };
        db.Workflows.Add(workflow);
        db.Jobs.Add(new Job
        {
            Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            WorkflowId = workflow.Id,
            Status = JobStatus.Succeeded,
            Attempt = 1,
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-2),
            UpdatedAt = DateTimeOffset.UtcNow.AddHours(-1),
            CompletedAt = DateTimeOffset.UtcNow.AddHours(-1)
        });

        await db.SaveChangesAsync(ct);
    }
}
