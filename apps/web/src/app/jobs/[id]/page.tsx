"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useJobPolling } from "../../../hooks/useJobPolling";
import { isLiveJobStatus, JOB_STAGES } from "../../../lib/job-status";
import { Module, StatusStamp } from "../../../components/Module";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = typeof params.id === "string" ? params.id : params.id?.[0];
  const state = useJobPolling(jobId);
  const job = state.status === "ready" ? state.job : null;
  const live = isLiveJobStatus(job?.status);

  return (
    <>
      <header className="ops-top">
        <div>
          <h1>Async job status</h1>
          <p className="ops-top-copy">
            Polls the ASP.NET Core job endpoint. Simulator moves Pending →
            Running → Retrying → Succeeded. Persona switches in the rail
            re-fetch under new headers.
          </p>
        </div>
        <Link className="ops-btn ops-btn-ghost" href="/">
          ← Back
        </Link>
      </header>

      <div className="ops-grid">
        <Module
          title="Job readout"
          tab={live ? "Live" : "Terminal"}
          className="span-8"
          action={
            job ? (
              <StatusStamp
                status={job.status}
                attempt={job.attempt}
                live={live}
              />
            ) : null
          }
        >
          {!jobId && (
            <p className="ops-alert ops-alert-error">Missing job id in path.</p>
          )}
          {state.status === "loading" && <p className="ops-empty">Loading…</p>}
          {state.status === "forbidden" && (
            <p className="ops-alert ops-alert-deny" role="alert">
              Forbidden — current persona cannot read this job ({state.message}).
            </p>
          )}
          {state.status === "error" && (
            <p className="ops-alert ops-alert-error" role="alert">
              {state.message}
            </p>
          )}
          {job && (
            <>
              <ol className="ops-stages" aria-label="Job stage progression">
                {JOB_STAGES.map((s, i) => {
                  const idx = JOB_STAGES.indexOf(
                    (job.status === "Failed"
                      ? "Retrying"
                      : job.status) as (typeof JOB_STAGES)[number],
                  );
                  const done = job.status !== "Failed" && idx > i;
                  const current =
                    job.status === s ||
                    (job.status === "Failed" && s === "Retrying" && i === 2);
                  return (
                    <li
                      key={s}
                      className={
                        done ? "is-done" : current ? "is-current" : undefined
                      }
                    >
                      {String(i + 1).padStart(2, "0")} {s}
                    </li>
                  );
                })}
                <li
                  className={job.status === "Failed" ? "is-current" : undefined}
                >
                  Failed
                </li>
              </ol>
              <dl className="ops-dl">
                <div>
                  <dt>Job ID</dt>
                  <dd className="mono">{job.id}</dd>
                </div>
                <div>
                  <dt>Workflow ID</dt>
                  <dd className="mono">{job.workflowId}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{job.status}</dd>
                </div>
                <div>
                  <dt>Attempt</dt>
                  <dd className="tabular-nums">{job.attempt}</dd>
                </div>
                {job.errorMessage && (
                  <div>
                    <dt>Error</dt>
                    <dd className="text-[color:var(--ops-warn)]">
                      {job.errorMessage}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(job.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
            </>
          )}
        </Module>

        <Module title="Polling" tab="Now" className="span-4">
          <p className="ops-meta">
            {state.status === "forbidden"
              ? "Polling stopped — authz denied for this persona."
              : live
                ? "Live marker active — refreshing every 2s until terminal status."
                : "Terminal status reached — polling stopped."}
          </p>
        </Module>
      </div>
    </>
  );
}
