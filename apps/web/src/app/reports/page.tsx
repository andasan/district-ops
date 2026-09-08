"use client";

import { usePersona } from "../../identity/PersonaProvider";
import { useAttendance } from "../../hooks/useAttendance";
import { Module } from "../../components/Module";

export default function ReportsPage() {
  const { persona } = usePersona();
  const state = useAttendance();

  return (
    <>
      <header className="ops-top">
        <div>
          <h1>Attendance report</h1>
          <p className="ops-top-copy">
            Data-dense table filtered by ReBAC. Switch to Prairie admin in the
            rail to see tenant isolation.
          </p>
        </div>
        <div className="ops-scope-chip" title={persona.tenantId}>
          <span className="ops-scope-label">Scope</span>
          <strong>{persona.displayName}</strong>
          <span className="ops-meta">
            tenant {persona.tenantId.slice(0, 8)}… · {persona.userId}
          </span>
        </div>
      </header>

      <div className="ops-grid">
        <Module title="Visible rows" tab="ReBAC" className="span-12">
          {state.status === "loading" && <p className="ops-empty">Loading…</p>}
          {state.status === "forbidden" && (
            <p className="ops-alert ops-alert-deny" role="alert">
              Forbidden — this persona cannot read attendance for the requested
              tenant ({state.message}).
            </p>
          )}
          {state.status === "error" && (
            <p className="ops-alert ops-alert-error" role="alert">
              {state.message}
            </p>
          )}
          {state.status === "ready" && (
            <div className="ops-table-wrap">
              <table className="ops-table">
                <caption className="sr-only">
                  School attendance by division for {persona.displayName}
                </caption>
                <thead>
                  <tr>
                    <th>Division</th>
                    <th>School</th>
                    <th>Headcount</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.map((row) => (
                    <tr key={`${row.divisionId}-${row.schoolName}`}>
                      <td>{row.divisionName}</td>
                      <td>{row.schoolName}</td>
                      <td className="tabular-nums">{row.headcount}</td>
                      <td className="tabular-nums">
                        {row.attendancePercent.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {state.rows.length === 0 && (
                <p className="ops-empty">
                  No rows in scope for {persona.displayName} on this tenant —
                  ReBAC returned an empty set, not a deny.
                </p>
              )}
            </div>
          )}
        </Module>
      </div>
    </>
  );
}
