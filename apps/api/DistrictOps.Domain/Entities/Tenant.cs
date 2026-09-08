namespace DistrictOps.Domain.Entities;

public sealed class Tenant
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public ICollection<Division> Divisions { get; set; } = [];
    public ICollection<Workflow> Workflows { get; set; } = [];
}
