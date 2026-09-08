using DistrictOps.Domain.Enums;
using DistrictOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DistrictOps.Infrastructure.Jobs;

/// <summary>
/// Advances Pending/Retrying jobs so the UI can show honest async state (stand-in for Temporal).
/// </summary>
public sealed class JobSimulatorHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<JobSimulatorHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await TickAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Job simulator tick failed");
            }

            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
        }
    }

    private async Task TickAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var jobs = await db.Jobs
            .Where(j => j.Status == JobStatus.Pending || j.Status == JobStatus.Running || j.Status == JobStatus.Retrying)
            .OrderBy(j => j.UpdatedAt)
            .Take(10)
            .ToListAsync(ct);

        foreach (var job in jobs)
        {
            var now = DateTimeOffset.UtcNow;
            job.UpdatedAt = now;

            switch (job.Status)
            {
                case JobStatus.Pending:
                    job.Status = JobStatus.Running;
                    job.Attempt = Math.Max(1, job.Attempt);
                    break;
                case JobStatus.Running when job.Attempt == 1 && job.CreatedAt > now.AddSeconds(-6):
                    // First attempt fails once so the UI can show Retrying.
                    job.Status = JobStatus.Retrying;
                    job.ErrorMessage = "Transient validation service timeout";
                    break;
                case JobStatus.Retrying:
                    job.Status = JobStatus.Running;
                    job.Attempt += 1;
                    job.ErrorMessage = null;
                    break;
                case JobStatus.Running:
                    job.Status = JobStatus.Succeeded;
                    job.CompletedAt = now;
                    job.ErrorMessage = null;
                    break;
            }
        }

        if (jobs.Count > 0)
        {
            await db.SaveChangesAsync(ct);
        }
    }
}
