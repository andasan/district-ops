"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  DEV_PERSONAS,
  createApiClient,
  type JobDto,
} from "@district-ops/api-client";
import { AppShell, Module, StatusStamp } from "../../../components/AppShell";

const STAGES = ["Pending", "Running", "Retrying", "Succeeded"] as const;

function JobDetailInner() {
  const params = useSearchParams();
  const jobId = params.get("jobId");
  const [job, setJob] = useState<JobDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const persona = DEV_PERSONAS[1];

  const api = useMemo(
    () =>
      createApiClient({
        userId: persona.userId,
        tenantId: persona.tenantId,
        displayName: persona.displayName,
      }),
    [persona],
  );

  const live =
    !!job && job.status !== "Succeeded" && job.status !== "Failed";

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.getJob(jobId!);
        if (!cancelled) {
          setJob(data);
          setError(null);
        }
        if (
          data.status !== "Succeeded" &&
          data.status !== "Failed" &&
          !cancelled
        ) {
          window.setTimeout(poll, 2000);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load job");
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [api, jobId]);

  return (
    <AppShell eyebrow="Async job status">
      <header className="ops-top">
        <div>
          <h1>Async job status</h1>
          <p className="ops-top-copy">
            Polls the ASP.NET Core job endpoint. Simulator moves Pending →
            Running → Retrying → Succeeded.
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
              <StatusStamp status={job.status} attempt={job.attempt} live={live} />
            ) : null
          }
        >
          {!jobId && (
            <p className="ops-alert ops-alert-error">Missing jobId query param.</p>
          )}
          {error && (
            <p className="ops-alert ops-alert-error" role="alert">
              {error}
            </p>
          )}
          {job && (
            <>
              <ol className="ops-stages" aria-label="Job stage progression">
                {STAGES.map((s, i) => {
                  const idx = STAGES.indexOf(
                    (job.status === "Failed" ? "Retrying" : job.status) as (typeof STAGES)[number],
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
                <li className={job.status === "Failed" ? "is-current" : undefined}>
                  Failed
                </li>
              </ol>
              <dl className="ops-dl">
                <div>
                  <dt>Job ID</dt>
                  <dd className="mono">{job.id}</dd>
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
                    <dd className="text-[color:var(--ops-warn)]">{job.errorMessage}</dd>
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
            {live
              ? "Live marker active — refreshing every 2s until terminal status."
              : "Terminal status reached — polling stopped."}
          </p>
        </Module>
      </div>
    </AppShell>
  );
}

export default function WorkflowJobPage() {
  return (
    <Suspense fallback={<p className="ops-empty p-10">Loading…</p>}>
      <JobDetailInner />
    </Suspense>
  );
}
