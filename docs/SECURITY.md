# District Ops — Security

## Principles

1. **Authn ≠ authz.** Login proves identity. Permission checks decide data and actions.
2. **Server is the authority.** Hiding a button is UX. Every mutate/read re-checks ReBAC on the API.
3. **Tenant id is not a client trust signal alone.** Dev headers and JWT claims are validated against membership tuples.
4. **Cross-tenant denial is a feature.** E2E should assert Prairie users cannot list Pacific workflows.

## Current modes

### Development (default)

- Middleware reads `X-User-Id`, optional `X-Tenant-Id`, `X-User-Name`
- Only active when `ASPNETCORE_ENVIRONMENT=Development` and `Auth:Mode=Development`
- Never ship this mode

### Keycloak (compose profile)

```bash
docker compose --profile auth up -d
```

Set API:

```json
"Auth": {
  "Mode": "Keycloak",
  "Authority": "http://localhost:8080/realms/district-ops",
  "Audience": "district-ops-api"
}
```

Map Keycloak `sub` / custom attributes to the same user ids used in fixture tuples (or migrate tuples to Keycloak user ids).

## Threat notes (scaffold)

| Risk | Mitigation in scaffold | Production follow-up |
|---|---|---|
| Spoofed `X-User-Id` | Dev-only middleware | Remove headers; JWT only |
| IDOR on `/jobs/{id}` | Division viewer check before return | Same + audit log |
| Cross-tenant list | Tenant claim + ReBAC filter | OpenFGA + row-level DB filters |
| PII in logs | Avoid logging student payloads | Structured redaction |
| CSRF on cookie auth | Header/token API today | SameSite cookies + antiforgery if cookie session |

## Privacy / public sector (talking points, not claims)

This repo does **not** implement AODA/PIPEDA/FIPPA compliance. Consideration:

- Prefer Canadian hosting and data residency
- Minimize PII in client bundles and Playwright traces
- Treat accessibility (WCAG 2.x AA) as part of definition of done

## Secrets

- No real secrets in git
- Keycloak admin `admin`/`admin` is local-only
- API client secret in realm JSON is for local import only
