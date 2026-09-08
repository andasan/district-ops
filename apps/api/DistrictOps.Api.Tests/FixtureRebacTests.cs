using DistrictOps.Domain.Authz;
using DistrictOps.Infrastructure.Authz;
using DistrictOps.Infrastructure.Persistence;

namespace DistrictOps.Api.Tests;

public class FixtureRebacTests
{
    private readonly FixtureRebacService _rebac = new();

    [Fact]
    public async Task Editor_can_edit_own_division_but_not_other_tenant()
    {
        Assert.True(await _rebac.CheckAsync(
            SeedData.EditorUserId, Relation.DivisionEditor, "division", SeedData.DivisionNorthId));

        Assert.False(await _rebac.CheckAsync(
            SeedData.EditorUserId, Relation.DivisionViewer, "division", SeedData.DivisionOtherTenantId));
    }

    [Fact]
    public async Task Viewer_cannot_edit()
    {
        Assert.True(await _rebac.CheckAsync(
            SeedData.ViewerUserId, Relation.DivisionViewer, "division", SeedData.DivisionNorthId));

        Assert.False(await _rebac.CheckAsync(
            SeedData.ViewerUserId, Relation.DivisionEditor, "division", SeedData.DivisionNorthId));
    }

    [Fact]
    public async Task Tenant_admin_implies_division_access()
    {
        Assert.True(await _rebac.CheckAsync(
            SeedData.AdminUserId, Relation.DivisionEditor, "division", SeedData.DivisionSouthId));
    }
}
