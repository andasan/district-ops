"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEV_PERSONAS,
  createApiClient,
  type AttendanceRowDto,
  type DevPersona,
} from "@district-ops/api-client";
import { AppShell, Module } from "../../components/AppShell";

export default function ReportsPage() {
  const [persona, setPersona] = useState<DevPersona>(DEV_PERSONAS[1]);
  const [rows, setRows] = useState<AttendanceRowDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useMemo(
    () =>
      createApiClient({
        userId: persona.userId,
        tenantId: persona.tenantId,
        displayName: persona.displayName,
      }),
    [persona],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void api
      .getAttendance(persona.tenantId)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          setError(e instanceof Error ? e.message : "Failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, persona]);

  return (
    <AppShell eyebrow="Attendance report">
      <header className="ops-top">
        <div>
          <h1>Attendance report</h1>
          <p className="ops-top-copy">
            Data-dense table filtered by ReBAC. Switch to Prairie admin to see
            tenant isolation.
          </p>
        </div>
        <label className="ops-field" style={{ minWidth: "16rem" }}>
          <span>Dev persona</span>
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
      </header>

      <div className="ops-grid">
        <Module title="Visible rows" tab="ReBAC" className="span-12">
          {loading && <p className="ops-empty">Loading…</p>}
          {error && (
            <p className="ops-alert ops-alert-error" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && (
            <div className="ops-table-wrap">
              <table className="ops-table">
                <caption className="sr-only">School attendance by division</caption>
                <thead>
                  <tr>
                    <th>Division</th>
                    <th>School</th>
                    <th>Headcount</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
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
              {rows.length === 0 && (
                <p className="ops-empty">No rows visible.</p>
              )}
            </div>
          )}
        </Module>
      </div>
    </AppShell>
  );
}
