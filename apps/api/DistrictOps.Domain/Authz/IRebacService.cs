namespace DistrictOps.Domain.Authz;

public sealed record AuthzTuple(
    string UserId,
    string Relation,
    string ObjectType,
    Guid ObjectId);

public interface IRebacService
{
    Task<bool> CheckAsync(
        string userId,
        string relation,
        string objectType,
        Guid objectId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Guid>> ListObjectIdsAsync(
        string userId,
        string relation,
        string objectType,
        CancellationToken cancellationToken = default);
}
