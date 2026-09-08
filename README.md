# District Ops

Multi-tenant K-12 operational console scaffold for learning **ASP.NET Core** and product FE (Next.js + authz + async workflows).

Not a client deliverable. Demo / study repo.

## Stack

| Layer | Tech |
|---|---|
| Web | Next.js 15, React 19, TypeScript, Tailwind |
| API | ASP.NET Core (.NET 10), Minimal APIs, Swagger |
| Data | EF Core (InMemory default; Postgres via compose) |
| Authn | Dev headers now; Keycloak realm import ready |
| Authz | Fixture ReBAC (`IRebacService`) OpenFGA-shaped |
| E2E | Playwright (API authz boundaries) |

## Quick start (no Docker required)

Terminal 1 — API (http://localhost:5080, OpenAPI `/openapi/v1.json`):

```bash
cd ~/development/district-ops
dotnet run --project apps/api/DistrictOps.Api --launch-profile http
```

Terminal 2 — Web (http://localhost:3000):

```bash
cd ~/development/district-ops
pnpm install
pnpm dev:web
```

Open the console, switch **Dev persona**, start an enrollment, watch job status move through Retrying → Succeeded.

## Useful commands

```bash
pnpm build:api          # or: dotnet build DistrictOps.slnx
pnpm test:api           # ReBAC unit tests
pnpm docker:up          # Postgres only
pnpm docker:auth        # Postgres + Keycloak (profile)
pnpm test:e2e           # API must be running on :5080
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Definition of done](docs/DEFINITION_OF_DONE.md)

## Seed users (dev headers)

| User id | Role |
|---|---|
| `user-admin-a` | Pacific tenant admin |
| `user-editor-north` | North division editor |
| `user-viewer-north` | North division viewer |
| `user-admin-b` | Prairie tenant (cross-tenant deny demo) |

## Out of scope (v1)

OpenFGA container, Auth.js wiring, shadcn/Storybook, Temporal, ClickHouse, GitLab CI clone.
