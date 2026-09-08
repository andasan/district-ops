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
    src/identity           Shared persona (localStorage) — demo auth until Keycloak
    src/api                Web-owned credentials → DistrictApi seam
    src/hooks              Live data hooks (workflows, attendance, job poll)
    src/components
      AppShell             Rail + persona switcher (single identity control)
      console/             Live enrollment / job mix / workflow list
      synthetic/           SYNTH mosaic only — no API imports
  apps/api                 ASP.NET Core (.NET 10)
    DistrictOps.Api        HTTP, auth middleware, endpoints
    DistrictOps.Domain     Entities, ReBAC contracts
    DistrictOps.Infrastructure  EF Core, fixture ReBAC, job simulator
  packages/api-client      Typed fetch client; credentials seam for headers→bearer/BFF
  packages/ui              Shared UI helpers (shadcn home later)
  e2e                      Playwright
  docker-compose.yml       Postgres + optional Keycloak profile
  docs/
```

## Request path

1. Browser loads Next.js App Router; root layout mounts `PersonaProvider` + `AppShell`
2. Pages call ASP.NET via `@district-ops/api-client` (`createApiClient({ credentials })`) through `useDistrictApi()`:
   - **Development:** `credentialsFromPersona` → `X-User-Id` / `X-Tenant-Id` / `X-User-Name`
   - **Later:** swap credential resolver for JWT bearer or BFF (same `DistrictApi` surface)
3. API resolves `CurrentUser`, then `IRebacService.CheckAsync` before reads/writes
4. Mutations create `Workflow` + `Job`; `JobSimulatorHostedService` advances status

## Web module seams

| Module | Interface | Notes |
|---|---|---|
| `PersonaProvider` | `persona` / `setPersona*` | Survives navigation + refresh (localStorage) |
| `useDistrictApi` | `DistrictApi` | Maps active persona → credentials; only web entry to HTTP |
| `useWorkflows` / `useAttendance` / `useJobPolling` | load state machines | 403 → forbidden; 200+[] → empty-in-scope |
| `synthetic/*` | presentational SYNTH | Must not import hooks or DTOs |

SSR data fetching is deferred until server-readable identity (Keycloak/BFF).

## Rendering / data

| Surface | Pattern |
|---|---|
| Console list | Client fetch + loading / empty / error / forbidden |
| Job detail `/jobs/[id]` | Client poll every 2s until terminal; path id = job id |
| Attendance | Client fetch; 403 deny stamp vs empty-in-scope copy |

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

1. Wire Auth.js / next-auth Keycloak provider; replace `credentialsFromPersona`
2. Generate `packages/api-client` from `/openapi/v1.json`
3. Add shadcn/ui + Storybook under `packages/ui`
4. Replace fixture ReBAC with OpenFGA
5. Optional Next BFF once cookies exist; GitLab-style CI: `dotnet test` + Playwright
