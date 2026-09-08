# Definition of done (frontend feature)

A feature is incomplete until all of the following are true:

1. **Code** merged in a small, reviewable change
2. **API contract** respected (loading, empty, error, forbidden, partial failure where relevant)
3. **Authz** enforced on the server; UI reflects permissions without being the only gate
4. **Async honesty** if a long-running process exists (in-progress / retry / failed)
5. **Tests:** unit/component where logic is non-trivial; Playwright on the critical path
6. **Accessibility:** keyboard path, labels, focus on errors; aim WCAG 2.x AA for interactive flows
7. **Docs:** endpoint or component notes updated when another engineer would otherwise guess
8. **Supportable:** no silent failure; errors are actionable

This mirrors product-engineering expectations on embedded client teams (pilot → GA).
