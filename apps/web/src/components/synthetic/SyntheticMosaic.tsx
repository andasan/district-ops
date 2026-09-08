"use client";

/**
 * Synthetic demo mosaic — ambient ops chrome only.
 * Must not import API hooks or live DTOs (hard live/synth fence).
 */
import { Module } from "../Module";
import {
  Delta,
  Donut,
  ProgressBar,
  SYNTH,
  Sparkline,
} from "./DashboardViz";
import { JOB_STAGES } from "../../lib/job-status";

export function SyntheticKpiStrip() {
  const taskPct = Math.round((SYNTH.tasksDone / SYNTH.tasksTotal) * 100);

  return (
    <>
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
          <p className="ops-kpi-value">{SYNTH.enrollment.toLocaleString()}</p>
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
    </>
  );
}

export function SyntheticCharts() {
  const budgetPct =
    Math.round((SYNTH.budget.spent / SYNTH.budget.total) * 1000) / 10;

  return (
    <>
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

      <Module title="Job stage rail" tab="Async" className="span-4">
        <ol className="ops-stages" aria-label="Recoverable job stages">
          {JOB_STAGES.map((s, i) => (
            <li key={s} className={i === 0 ? "is-current" : undefined}>
              {String(i + 1).padStart(2, "0")} {s}
            </li>
          ))}
          <li>Failed</li>
        </ol>
        <p className="ops-meta">
          Simulator moves Pending → Running → Retrying → Succeeded. Polling jobs
          show a live marker on their stamp.
        </p>
      </Module>

      <Module title="Demo honesty" tab="Learn" className="span-8">
        <p className="ops-meta">
          Switch personas in the rail to see ReBAC and tenant isolation. OpenAPI
          stays linked from the rail. Cross-tenant Prairie admin is the deny
          demo. KPI / chart tiles here are synthetic composition fill — workflow
          list and enrollment stay live against the API.
        </p>
      </Module>
    </>
  );
}
