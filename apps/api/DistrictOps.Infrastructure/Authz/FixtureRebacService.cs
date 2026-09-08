using DistrictOps.Domain.Authz;
using DistrictOps.Infrastructure.Persistence;

namespace DistrictOps.Infrastructure.Authz;

/// <summary>
/// In-memory ReBAC tuples mirroring OpenFGA. Swap for OpenFGA client without changing endpoint code.
/// </summary>
public sealed class FixtureRebacService : IRebacService
{
    private readonly List<AuthzTuple> _tuples =
    [
        new(SeedData.AdminUserId, Relation.TenantAdmin, "tenant", SeedData.TenantAId),
        new(SeedData.EditorUserId, Relation.DivisionEditor, "division", SeedData.DivisionNorthId),
        new(SeedData.ViewerUserId, Relation.DivisionViewer, "division", SeedData.DivisionNorthId),
        new(SeedData.OtherTenantUserId, Relation.TenantAdmin, "tenant", SeedData.TenantBId),
        new(SeedData.OtherTenantUserId, Relation.DivisionEditor, "division", SeedData.DivisionOtherTenantId)
    ];

    public Task<bool> CheckAsync(
        string userId,
        string relation,
        string objectType,
        Guid objectId,
        CancellationToken cancellationToken = default)
    {
        var allowed = _tuples.Any(t =>
            t.UserId == userId &&
            t.ObjectType == objectType &&
            t.ObjectId == objectId &&
            RelationImplies(t.Relation, relation));

        // Tenant admins can act as editor/viewer on any division in that tenant.
        if (!allowed && objectType == "division")
        {
            var tenantId = objectId == SeedData.DivisionNorthId || objectId == SeedData.DivisionSouthId
                ? SeedData.TenantAId
                : objectId == SeedData.DivisionOtherTenantId
                    ? SeedData.TenantBId
                    : (Guid?)null;

            if (tenantId is Guid tid)
            {
                allowed = _tuples.Any(t =>
                    t.UserId == userId &&
                    t.ObjectType == "tenant" &&
                    t.ObjectId == tid &&
                    t.Relation == Relation.TenantAdmin);
            }
        }

        return Task.FromResult(allowed);
    }

    public Task<IReadOnlyList<Guid>> ListObjectIdsAsync(
        string userId,
        string relation,
        string objectType,
        CancellationToken cancellationToken = default)
    {
        var ids = _tuples
            .Where(t => t.UserId == userId && t.ObjectType == objectType && RelationImplies(t.Relation, relation))
            .Select(t => t.ObjectId)
            .Distinct()
            .ToList();

        return Task.FromResult<IReadOnlyList<Guid>>(ids);
    }

    private static bool RelationImplies(string granted, string required) =>
        granted == required ||
        (granted == Relation.DivisionEditor && required == Relation.DivisionViewer) ||
        (granted == Relation.TenantAdmin &&
         (required is Relation.TenantAdmin or Relation.DivisionEditor or Relation.DivisionViewer));
}
