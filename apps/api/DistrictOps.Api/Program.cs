using DistrictOps.Api.Auth;
using DistrictOps.Api.Endpoints;
using DistrictOps.Infrastructure;
using DistrictOps.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                ?? ["http://localhost:3000"])
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var authMode = builder.Configuration["Auth:Mode"] ?? "Development";
if (string.Equals(authMode, "Keycloak", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = builder.Configuration["Auth:Authority"];
            options.Audience = builder.Configuration["Auth:Audience"];
            options.RequireHttpsMetadata = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                NameClaimType = "preferred_username"
            };
        });
    builder.Services.AddAuthorization();
}
else
{
    builder.Services.AddAuthorization();
}

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedData.EnsureSeededAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("web");
app.UseMiddleware<DevHeaderAuthMiddleware>();

if (string.Equals(authMode, "Keycloak", StringComparison.OrdinalIgnoreCase))
{
    app.UseAuthentication();
    app.UseAuthorization();
}

app.MapGet("/", () => Results.Ok(new
{
    service = "DistrictOps.Api",
    openApi = "/openapi/v1.json",
    health = "/api/health"
})).AllowAnonymous();

app.MapDistrictOpsEndpoints();

app.Run();

public partial class Program;
