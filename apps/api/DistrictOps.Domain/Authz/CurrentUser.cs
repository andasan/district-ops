namespace DistrictOps.Domain.Authz;

public sealed class CurrentUser
{
    public required string UserId { get; init; }
    public required string DisplayName { get; init; }
    public Guid? TenantId { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = [];
}
