namespace DistrictOps.Domain.Authz;

/// <summary>
/// OpenFGA-shaped relations for the scaffold. Replace FixtureRebac with a real OpenFGA client later.
/// </summary>
public static class Relation
{
    public const string TenantAdmin = "admin";
    public const string DivisionViewer = "viewer";
    public const string DivisionEditor = "editor";
}
