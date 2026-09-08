"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SEED, isApiError } from "@district-ops/api-client";
import { useDistrictApi } from "../../api/useDistrictApi";
import { usePersona } from "../../identity/PersonaProvider";
import { isLiveJobStatus, jobStageState, JOB_STAGES } from "../../lib/job-status";
import { Module, StatusStamp } from "../Module";
import { Donut } from "../synthetic/DashboardViz";
import { useConsoleWorkflows } from "./WorkflowsProvider";

export function LiveEnrollmentModule() {
  const api = useDistrictApi();
  const { persona } = usePersona();
  const { reload } = useConsoleWorkflows();
  const [title, setTitle] = useState("Spring enrollment transfer");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onStartEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!persona.canEdit) {
      setLocalError("Forbidden: viewer cannot start enrollment");
      return;
    }
    setSubmitting(true);
    setLocalError(null);
    try {
      await api.startEnrollment(persona.tenantId, SEED.divisionNorth, title);
      await reload();
    } catch (err) {
      setLocalError(
        isApiError(err) && err.isForbidden
          ? "Forbidden"
          : err instanceof Error
            ? err.message
            : "Submit failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
      {localError && (
        <p
          className="ops-alert ops-alert-error"
          role="alert"
          style={{ marginTop: "0.65rem" }}
        >
          {localError}
        </p>
      )}
    </Module>
  );
}

export function LiveJobMixModule() {
  const { workflows } = useConsoleWorkflows();
  const liveCount = workflows.filter((w) => isLiveJobStatus(w.job?.status)).length;

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

  return (
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
  );
}

export function LiveWorkflowListModule() {
  const { workflows, error, loading, reload } = useConsoleWorkflows();

  return (
    <Module
      title="Workflows"
      tab="List"
      className="span-12 ops-workflows-priority"
      action={
        <button
          type="button"
          className="ops-btn ops-btn-ghost"
          onClick={() => void reload()}
        >
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
        <p className="ops-empty">Empty: no visible workflows for this persona.</p>
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
                const live = isLiveJobStatus(w.job?.status);
                const stages = jobStageState(w.job?.status);
                return (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.title}</strong>
                      {w.job?.errorMessage ? (
                        <p
                          className="ops-alert ops-alert-warn"
                          style={{ marginTop: "0.35rem" }}
                        >
                          {w.job.errorMessage}
                        </p>
                      ) : null}
                      {w.job ? (
                        <ol className="ops-stages" style={{ marginTop: "0.4rem" }}>
                          {JOB_STAGES.map((s, i) => {
                            const done = !stages.failed && stages.current > i;
                            const current =
                              !stages.failed && stages.current === i;
                            return (
                              <li
                                key={s}
                                className={
                                  done
                                    ? "is-done"
                                    : current
                                      ? "is-current"
                                      : undefined
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
                          href={`/jobs/${w.job.id}`}
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
  );
}
