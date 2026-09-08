import type { JobStatus } from "@district-ops/api-client";

export const JOB_STAGES = [
  "Pending",
  "Running",
  "Retrying",
  "Succeeded",
] as const satisfies readonly JobStatus[];

export function isTerminalJobStatus(status: string | undefined) {
  return status === "Succeeded" || status === "Failed";
}

export function isLiveJobStatus(status: string | undefined) {
  return !!status && !isTerminalJobStatus(status);
}

export function jobStageState(status?: string) {
  if (!status) return { current: -1, failed: false };
  if (status === "Failed") return { current: 2, failed: true };
  const idx = JOB_STAGES.indexOf(status as (typeof JOB_STAGES)[number]);
  return { current: idx, failed: false };
}
