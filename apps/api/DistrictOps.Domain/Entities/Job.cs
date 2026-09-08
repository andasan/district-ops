using DistrictOps.Domain.Enums;

namespace DistrictOps.Domain.Entities;

public sealed class Job
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public Workflow Workflow { get; set; } = null!;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public string? ErrorMessage { get; set; }
    public int Attempt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }
}
