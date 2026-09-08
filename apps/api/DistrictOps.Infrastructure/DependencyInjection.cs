using DistrictOps.Domain.Authz;
using DistrictOps.Infrastructure.Authz;
using DistrictOps.Infrastructure.Jobs;
using DistrictOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DistrictOps.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Host=localhost;Port=5432;Database=district_ops;Username=district;Password=district";

        var useSqlite = configuration.GetValue("Database:UseInMemory", true);
        if (useSqlite)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("district-ops"));
        }
        else
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        services.AddSingleton<IRebacService, FixtureRebacService>();
        services.AddHostedService<JobSimulatorHostedService>();
        return services;
    }
}
