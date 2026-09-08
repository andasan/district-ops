namespace DistrictOps.Domain.Entities;

public sealed class Division
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    public required string Name { get; set; }
    public required string Code { get; set; }
}
