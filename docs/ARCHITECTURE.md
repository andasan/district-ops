# District Ops — Architecture

Learning scaffold for operational SaaS.

## Goals

- Next.js App Router UI for workflow-heavy, permission-sensitive screens
- ASP.NET Core REST API (OpenAPI/Swagger) as the system of record for authz and jobs
- Multi-tenant isolation (school division A never sees division B / other tenant)
- Honest async job states (Pending → Running → Retrying → Succeeded/Failed)
- Swap path to Keycloak OIDC + OpenFGA without rewriting endpoint shapes

## Solution layout

```text
district-ops/
  apps/web                 Next.js 15 + React 19 + Tailwind
  apps/api                 ASP.NET Core (.NET 10)
    DistrictOps.Api        HTTP, auth middleware, endpoints
    DistrictOps.Domain     Entities, ReBAC contracts
    DistrictOps.Infrastructure  EF Core, fixture ReBAC, job simulator
  packages/api-client      Typed fetch client (hand-written; generate from OpenAPI later)
  packages/ui              Shared UI helpers (shadcn home later)
  e2e                      Playwright
  docker-compose.yml       Postgres + optional Keycloak profile
  docs/
```

## Request path

1. Browser calls Next.js pages (client components for interactive console)
2. Pages call ASP.NET via `NEXT_PUBLIC_API_URL` with either:
   - **Development:** `X-User-Id` / `X-Tenant-Id` headers
   - **Keycloak:** JWT bearer (`Auth:Mode=Keycloak`)
3. API resolves `CurrentUser`, then `IRebacService.CheckAsync` before reads/writes
4. Mutations create `Workflow` + `Job`; `JobSimulatorHostedService` advances status

## Rendering / data

| Surface | Pattern |
|---|---|
| Console list | Client fetch + loading / empty / error / forbidden |
| Job detail | Client poll every 2s until terminal status |
| Attendance | Client fetch dense table; rows filtered by ReBAC |

SSR can be added later for authenticated dashboards; scaffold prioritizes clear API contracts.

## Authz model (OpenFGA-shaped)

| User | Relations |
|---|---|
| `user-admin-a` | `admin` on tenant Pacific |
| `user-editor-north` | `editor` on North division |
| `user-viewer-north` | `viewer` on North division |
| `user-admin-b` | `admin` on tenant Prairie |

`FixtureRebacService` implements implication (admin → editor/viewer, editor → viewer). Replace with OpenFGA client behind `IRebacService`.

## Backend learning notes (.NET)

- Clean-ish layering: Api → Domain contracts ← Infrastructure
- Minimal APIs + DTOs
- EF Core InMemory by default; set `Database:UseInMemory=false` + Postgres for real persistence
- Hosted service stands in for Temporal-style long-running work
- OpenAPI document at `/openapi/v1.json` when Development

## Next increments

1. Wire Auth.js / next-auth Keycloak provider on the web app
2. Generate `packages/api-client` from `/openapi/v1.json`
3. Add shadcn/ui + Storybook under `packages/ui`
4. Replace fixture ReBAC with OpenFGA
5. GitLab-style CI: `dotnet test` + Playwright
