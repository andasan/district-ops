# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Users in-product are the seed “dev personas” (tenant admin, division editor, division viewer, cross-tenant admin) used to demonstrate ReBAC and isolation.

## Product Purpose

District Ops is a multi-tenant K-12 operational console scaffold. It lets someone start an enrollment workflow, watch async job status (Pending → Running → Retrying → Succeeded/Failed), switch personas to see permission differences, and open a ReBAC-filtered attendance report. Success for this redesign: the app reads as a serious edtech ops product that keeps learning intent visible (personas, OpenAPI, ReBAC).

## Positioning

Next.js UI against an ASP.NET Core API with fixture ReBAC

## Operating Context

- Home console: persona switcher, start enrollment, workflow list with status, links to job detail and attendance
- Job detail `/jobs/[id]`: polls ASP.NET job endpoint until terminal status; rail persona switch re-fetches
- Attendance report: dense table filtered by ReBAC; Prairie persona demos tenant isolation
- Dev auth via headers today; Keycloak path planned
- Demo / study repo; not production SaaS

## Capabilities and Constraints

- Preserve all current controls and factual copy (persona select, enrollment form, workflow list/refresh, OpenAPI link, attendance table, job detail fields, forbidden/viewer messaging)
- No dark mode
- Serious edtech ops tool — not playful, gamified, or child-facing
- Scope of visual redesign: full app shell (console + attendance + job detail) as one coherent system
- Learning intent stays visible: personas, OpenAPI, ReBAC framing
- Technical stack fixed: Next.js 15, React 19, Tailwind, ASP.NET API

## Brand Commitments

- Product name: District Ops
- Voice: operational, precise (scaffolding is acknowledged, not hidden)

## Evidence on Hand

- Live UI at `/`, `/reports`, `/jobs/[id]`
- Seed personas and README role table
- API OpenAPI at `http://localhost:5080/openapi/v1.json` in local demo
- No real customer logos, testimonials, or production metrics — do not fabricate commercial claims

## Product Principles

1. Task clarity over decoration — operators must scan status and act without hunting
2. Authz is product truth — forbidden and cross-tenant states are first-class, not errors to hide
3. Demo honesty — show the scaffold (personas, OpenAPI, ReBAC) without undermining seriousness
4. One app shell — console, reports, and job detail share one visual system
5. Accessibility is non-optional — meet a WCAG-oriented bar for contrast, focus, and labels

## Accessibility & Inclusion

Target WCAG 2.2 AA for color contrast, visible focus, form labels, and status that is not color-only. Light theme only.
