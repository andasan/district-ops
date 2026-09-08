using DistrictOps.Domain.Enums;

namespace DistrictOps.Domain.Entities;

public sealed class Workflow
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    public Guid DivisionId { get; set; }
    public Division Division { get; set; } = null!;
    public WorkflowType Type { get; set; }
    public required string Title { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Job? Job { get; set; }
}
