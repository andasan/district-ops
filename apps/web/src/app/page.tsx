"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEV_PERSONAS,
  SEED,
  createApiClient,
  type DevPersona,
  type WorkflowDto,
} from "@district-ops/api-client";
import { AppShell, Module, StatusStamp } from "../components/AppShell";
import {
  Delta,
  Donut,
  ProgressBar,
  SYNTH,
  Sparkline,
} from "../components/DashboardViz";

const STAGES = ["Pending", "Running", "Retrying", "Succeeded"] as const;

function stageState(status?: string) {
  if (!status) return { current: -1, failed: false };
  if (status === "Failed") return { current: 2, failed: true };
  const idx = STAGES.indexOf(status as (typeof STAGES)[number]);
  return { current: idx, failed: false };
}

export default function HomePage() {
  const [persona, setPersona] = useState<DevPersona>(DEV_PERSONAS[1]);
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Spring enrollment transfer");
  const [submitting, setSubmitting] = useState(false);

  const api = useMemo(
    () =>
      createApiClient({
        userId: persona.userId,
        tenantId: persona.tenantId,
        displayName: persona.displayName,
      }),
    [persona],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listWorkflows(persona.tenantId);
      setWorkflows(data);
    } catch (e) {
      setWorkflows([]);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);

  async function onStartEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!persona.canEdit) {
      setError("Forbidden: viewer cannot start enrollment");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.startEnrollment(persona.tenantId, SEED.divisionNorth, title);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  const liveCount = workflows.filter(
    (w) =>
      w.job &&
      w.job.status !== "Succeeded" &&
      w.job.status !== "Failed",
  ).length;

  const jobSegments = useMemo(() => {
    const counts = { Succeeded: 0, Failed: 0, Running: 0, Other: 0 };
    for (const w of workflows) {
      const s = w.job?.status;
      if (s === "Succeeded") counts.Succeeded += 1;
      else if (s === "Failed") counts.Failed += 1;
      else if (s === "Running" || s === "Retrying" || s === "Pending")
        counts.Running += 1;
      else counts.Other += 1;
    }
    return [
      { value: counts.Succeeded || 0, color: "var(--ops-ok)", label: "Succeeded" },
      { value: counts.Running || 0, color: "var(--ops-run)", label: "In flight" },
      { value: counts.Failed || 0, color: "var(--ops-bad)", label: "Failed" },
      { value: counts.Other || 0, color: "var(--ops-gray-3)", label: "Other" },
    ].filter((s) => s.value > 0);
  }, [workflows]);

  const taskPct = Math.round((SYNTH.tasksDone / SYNTH.tasksTotal) * 100);
  const budgetPct = Math.round((SYNTH.budget.spent / SYNTH.budget.total) * 1000) / 10;

  return (
    <AppShell eyebrow="Operational console">
      <header className="ops-top">
        <div>
          <h1>Operational console</h1>
          <p className="ops-top-copy">
            Multi-tenant K-12 workflow UI against ASP.NET Core. Dev auth uses
            headers; ReBAC is enforced on the API.
          </p>
        </div>
        <span className="ops-tenant-chip" title={persona.tenantId}>
          tenant {persona.tenantId.slice(0, 8)}…
        </span>
      </header>

      <div className="ops-grid">
        <Module title="Today attendance" tab="KPI" className="span-2">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-kpi">
            <p className="ops-kpi-value">{SYNTH.attendancePct}%</p>
            <div className="ops-kpi-row">
              <Delta value={SYNTH.attendanceDelta} />
              <p className="ops-kpi-sub">vs prior day</p>
            </div>
          </div>
        </Module>

        <Module title="Enrollment" tab="KPI" className="span-2">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-kpi">
            <p className="ops-kpi-value">
              {SYNTH.enrollment.toLocaleString()}
            </p>
            <div className="ops-kpi-row">
              <Delta value={SYNTH.enrollmentDelta} unit="" />
              <p className="ops-kpi-sub">headcount</p>
            </div>
          </div>
        </Module>

        <Module title="Incidents today" tab="KPI" className="span-2">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-kpi">
            <p className="ops-kpi-value">{SYNTH.incidents}</p>
            <div className="ops-kpi-row">
              <Delta value={SYNTH.incidentsDelta} unit="" />
              <p className="ops-kpi-sub">behavior</p>
            </div>
          </div>
        </Module>

        <Module title="Active cases" tab="KPI" className="span-2">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-kpi">
            <p className="ops-kpi-value">{SYNTH.cases}</p>
            <p className="ops-kpi-sub">open case load</p>
          </div>
        </Module>

        <Module title="Tasks due" tab="Chart" className="span-2">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-donut-layout">
            <Donut
              size={72}
              thickness={10}
              center={`${taskPct}%`}
              segments={[
                { value: SYNTH.tasksDone, color: "var(--ops-ok)" },
                {
                  value: SYNTH.tasksTotal - SYNTH.tasksDone,
                  color: "var(--ops-gray-2)",
                },
              ]}
            />
            <div>
              <p className="ops-kpi-sub">
                {SYNTH.tasksDone}/{SYNTH.tasksTotal}
              </p>
              <p className="ops-kpi-sub">{SYNTH.tasksOverdue} overdue</p>
            </div>
          </div>
        </Module>

        <Module title="Alerts" tab="Now" className="span-2 is-alert">
          <p className="ops-synth-note">Synthetic demo</p>
          <ul className="ops-alert-list">
            {SYNTH.alerts.map((a) => (
              <li key={a.id} className={`tone-${a.tone}`}>
                {a.text}
              </li>
            ))}
          </ul>
        </Module>

        <Module title="Dev persona" tab="Authz" className="span-4">
          <div className="ops-persona-strip" role="tablist" aria-label="Quick persona">
            {DEV_PERSONAS.map((p) => (
              <button
                key={p.userId}
                type="button"
                role="tab"
                aria-selected={persona.userId === p.userId}
                className={`ops-persona-chip${persona.userId === p.userId ? " is-active" : ""}`}
                onClick={() => setPersona(p)}
              >
                {p.label.split("(")[0].trim()}
              </button>
            ))}
          </div>
          <label className="ops-field">
            <span>Persona</span>
            <select
              className="ops-select"
              value={persona.userId}
              onChange={(e) => {
                const next = DEV_PERSONAS.find((p) => p.userId === e.target.value);
                if (next) setPersona(next);
              }}
            >
              {DEV_PERSONAS.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <p className="ops-meta" style={{ marginTop: "0.65rem" }}>
            Acting as <strong>{persona.displayName}</strong> ({persona.userId}) on
            tenant <code>{persona.tenantId.slice(0, 8)}…</code>
          </p>
        </Module>

        <Module title="Start enrollment workflow" tab="Write" className="span-5">
          <form className="ops-enroll-form" onSubmit={onStartEnrollment}>
            <label className="ops-field">
              <span>Enrollment title</span>
              <input
                className="ops-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Enrollment title"
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !persona.canEdit}
              className="ops-btn ops-btn-primary ops-btn-start"
            >
              <span>{submitting ? "Starting…" : "Start"}</span>
              <span aria-hidden="true">›</span>
            </button>
          </form>
          {!persona.canEdit && (
            <p className="ops-alert ops-alert-deny" style={{ marginTop: "0.65rem" }}>
              Viewer persona: start button disabled. API also returns 403.
            </p>
          )}
        </Module>

        <Module
          title="Job mix"
          tab="Live"
          className="span-3"
          action={
            <span className="ops-meta">
              {liveCount > 0 ? `${liveCount} live` : "idle"}
            </span>
          }
        >
          {jobSegments.length === 0 ? (
            <p className="ops-empty">No jobs yet for this persona.</p>
          ) : (
            <div className="ops-donut-layout">
              <Donut
                size={76}
                thickness={11}
                center={String(workflows.length)}
                segments={jobSegments}
              />
              <ul className="ops-legend">
                {jobSegments.map((s) => (
                  <li key={s.label}>
                    <i style={{ background: s.color }} />
                    {s.label} · {s.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Module>

        <Module title="Attendance by school" tab="Chart" className="span-5">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <caption className="sr-only">Synthetic attendance by school</caption>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Trend</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {SYNTH.schools.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>
                      <Sparkline values={s.spark} />
                    </td>
                    <td className="tabular-nums">{s.pct.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Module>

        <Module title="Incidents · 7 days" tab="Chart" className="span-4">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-donut-layout">
            <Donut
              size={92}
              thickness={14}
              center={String(
                SYNTH.incidentsBySeverity.reduce((a, b) => a + b.value, 0),
              )}
              segments={SYNTH.incidentsBySeverity.map((s) => ({
                value: s.value,
                color: s.color,
              }))}
            />
            <ul className="ops-legend">
              {SYNTH.incidentsBySeverity.map((s) => (
                <li key={s.label}>
                  <i style={{ background: s.color }} />
                  {s.label} · {s.value}
                </li>
              ))}
            </ul>
          </div>
        </Module>

        <Module title="Budget FY" tab="Chart" className="span-3">
          <p className="ops-synth-note">Synthetic demo</p>
          <div className="ops-finance-grid">
            <div>
              <span>Budget</span>
              <strong>
                ${SYNTH.budget.total}
                {SYNTH.budget.unit}
              </strong>
            </div>
            <div>
              <span>Spent</span>
              <strong>
                ${SYNTH.budget.spent}
                {SYNTH.budget.unit}
              </strong>
            </div>
            <div>
              <span>Left</span>
              <strong>
                ${(SYNTH.budget.total - SYNTH.budget.spent).toFixed(1)}
                {SYNTH.budget.unit}
              </strong>
            </div>
          </div>
          <p className="ops-kpi-sub" style={{ marginBottom: "0.35rem" }}>
            Usage {budgetPct}%
          </p>
          <ProgressBar value={SYNTH.budget.spent} max={SYNTH.budget.total} />
        </Module>

        <Module
          title="Job stage rail"
          tab="Async"
          className="span-4"
        >
          <ol className="ops-stages" aria-label="Recoverable job stages">
            {STAGES.map((s, i) => (
              <li key={s} className={i === 0 ? "is-current" : undefined}>
                {String(i + 1).padStart(2, "0")} {s}
              </li>
            ))}
            <li>Failed</li>
          </ol>
          <p className="ops-meta">
            Simulator moves Pending → Running → Retrying → Succeeded. Polling
            jobs show a live marker on their stamp.
          </p>
        </Module>

        <Module title="Demo honesty" tab="Learn" className="span-8">
          <p className="ops-meta">
            Switch personas to see ReBAC and tenant isolation. OpenAPI stays
            linked from the rail. Cross-tenant Prairie admin is the deny demo.
            KPI / chart tiles above are synthetic composition fill — workflow
            list and enrollment stay live against the API.
          </p>
        </Module>

        <Module
          title="Workflows"
          tab="List"
          className="span-12 ops-workflows-priority"
          action={
            <button type="button" className="ops-btn ops-btn-ghost" onClick={() => void load()}>
              Refresh
            </button>
          }
        >
          {loading && <p className="ops-empty">Loading…</p>}
          {error && (
            <p className="ops-alert ops-alert-error" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && workflows.length === 0 && (
            <p className="ops-empty">
              Empty: no visible workflows for this persona.
            </p>
          )}

          {!loading && workflows.length > 0 && (
            <div className="ops-table-wrap">
              <table className="ops-table">
                <caption className="sr-only">Workflows for current persona</caption>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Division</th>
                    <th>Type</th>
                    <th>Created by</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((w) => {
                    const live =
                      !!w.job &&
                      w.job.status !== "Succeeded" &&
                      w.job.status !== "Failed";
                    const stages = stageState(w.job?.status);
                    return (
                      <tr key={w.id}>
                        <td>
                          <strong>{w.title}</strong>
                          {w.job?.errorMessage ? (
                            <p className="ops-alert ops-alert-warn" style={{ marginTop: "0.35rem" }}>
                              {w.job.errorMessage}
                            </p>
                          ) : null}
                          {w.job ? (
                            <ol className="ops-stages" style={{ marginTop: "0.4rem" }}>
                              {STAGES.map((s, i) => {
                                const done = !stages.failed && stages.current > i;
                                const current =
                                  !stages.failed && stages.current === i;
                                return (
                                  <li
                                    key={s}
                                    className={
                                      done ? "is-done" : current ? "is-current" : undefined
                                    }
                                  >
                                    {String(i + 1).padStart(2, "0")}
                                  </li>
                                );
                              })}
                            </ol>
                          ) : null}
                        </td>
                        <td>{w.divisionName}</td>
                        <td>{w.type}</td>
                        <td>
                          <code>{w.createdByUserId}</code>
                        </td>
                        <td>
                          {w.job ? (
                            <StatusStamp
                              status={w.job.status}
                              attempt={w.job.attempt}
                              live={live}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {w.job ? (
                            <Link
                              className="ops-btn ops-btn-ghost"
                              href={`/workflows/${w.id}?jobId=${w.job.id}`}
                            >
                              Open job detail
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Module>
      </div>
    </AppShell>
  );
}
