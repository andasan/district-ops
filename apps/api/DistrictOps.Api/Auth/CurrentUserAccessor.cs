using System.Security.Claims;
using DistrictOps.Domain.Authz;
using DistrictOps.Infrastructure.Persistence;

namespace DistrictOps.Api.Auth;

public interface ICurrentUserAccessor
{
    CurrentUser? User { get; }
}

public sealed class CurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccessor
{
    public CurrentUser? User
    {
        get
        {
            var http = httpContextAccessor.HttpContext;
            if (http is null)
            {
                return null;
            }

            if (http.Items.TryGetValue(DevAuthConstants.ItemKey, out var boxed) && boxed is CurrentUser staged)
            {
                return staged;
            }

            var principal = http.User;
            if (principal.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            var userId = principal.FindFirstValue("sub")
                ?? principal.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? principal.Identity.Name;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return null;
            }

            Guid? tenantId = null;
            var tenantClaim = principal.FindFirstValue("tenant_id");
            if (Guid.TryParse(tenantClaim, out var parsed))
            {
                tenantId = parsed;
            }

            return new CurrentUser
            {
                UserId = userId,
                DisplayName = principal.FindFirstValue("name") ?? userId,
                TenantId = tenantId,
                Roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray()
            };
        }
    }
}

public static class DevAuthConstants
{
    public const string ItemKey = "DistrictOps.CurrentUser";
    public const string UserHeader = "X-User-Id";
    public const string TenantHeader = "X-Tenant-Id";
    public const string NameHeader = "X-User-Name";
}

/// <summary>
/// Local-dev auth so the FE can demo without Keycloak. Never enable outside Development.
/// </summary>
public sealed class DevHeaderAuthMiddleware(RequestDelegate next, IHostEnvironment env, IConfiguration config)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var mode = config["Auth:Mode"] ?? "Development";
        if (env.IsDevelopment() &&
            string.Equals(mode, "Development", StringComparison.OrdinalIgnoreCase) &&
            context.Request.Headers.TryGetValue(DevAuthConstants.UserHeader, out var userHeader))
        {
            var userId = userHeader.ToString();
            Guid? tenantId = null;
            if (context.Request.Headers.TryGetValue(DevAuthConstants.TenantHeader, out var tenantHeader) &&
                Guid.TryParse(tenantHeader.ToString(), out var parsed))
            {
                tenantId = parsed;
            }

            var name = context.Request.Headers.TryGetValue(DevAuthConstants.NameHeader, out var nameHeader)
                ? nameHeader.ToString()
                : userId;

            context.Items[DevAuthConstants.ItemKey] = new CurrentUser
            {
                UserId = userId,
                DisplayName = name,
                TenantId = tenantId ?? SeedData.TenantAId,
                Roles = ["dev"]
            };
        }

        await next(context);
    }
}
