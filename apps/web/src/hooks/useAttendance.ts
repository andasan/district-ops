"use client";

import { isApiError, type AttendanceRowDto } from "@district-ops/api-client";
import { useEffect, useState } from "react";
import { useDistrictApi } from "../api/useDistrictApi";
import { usePersona } from "../identity/PersonaProvider";

export type AttendanceLoadState =
  | { status: "loading" }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AttendanceRowDto[] };

/**
 * Attendance is ReBAC-filtered: 403 is deny, 200+[] is empty-in-scope.
 */
export function useAttendance(): AttendanceLoadState {
  const api = useDistrictApi();
  const { persona } = usePersona();
  const [state, setState] = useState<AttendanceLoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void api
      .getAttendance(persona.tenantId)
      .then((rows) => {
        if (!cancelled) setState({ status: "ready", rows });
      })
      .catch((e) => {
        if (cancelled) return;
        if (isApiError(e) && e.isForbidden) {
          setState({ status: "forbidden", message: e.message });
          return;
        }
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Failed",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [api, persona.tenantId]);

  return state;
}
