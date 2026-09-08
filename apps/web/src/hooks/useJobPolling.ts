"use client";

import { isApiError, type JobDto } from "@district-ops/api-client";
import { useEffect, useRef, useState } from "react";
import { useDistrictApi } from "../api/useDistrictApi";
import { isTerminalJobStatus } from "../lib/job-status";

const POLL_MS = 2000;

export type JobLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; job: JobDto };

/** Polls until terminal status. Re-binds when api (persona) or jobId changes. */
export function useJobPolling(jobId: string | undefined): JobLoadState {
  const api = useDistrictApi();
  const [state, setState] = useState<JobLoadState>(
    jobId ? { status: "loading" } : { status: "idle" },
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    function clearTimer() {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    async function poll() {
      try {
        const job = await api.getJob(jobId!);
        if (cancelled) return;
        setState({ status: "ready", job });
        if (!isTerminalJobStatus(job.status)) {
          timerRef.current = window.setTimeout(() => {
            void poll();
          }, POLL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        clearTimer();
        if (isApiError(e) && e.isForbidden) {
          setState({ status: "forbidden", message: e.message });
          return;
        }
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Failed to load job",
        });
      }
    }

    void poll();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [api, jobId]);

  return state;
}
