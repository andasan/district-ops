"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkflowDto } from "@district-ops/api-client";
import { useDistrictApi } from "../api/useDistrictApi";
import { usePersona } from "../identity/PersonaProvider";

export function useWorkflows() {
  const api = useDistrictApi();
  const { persona } = usePersona();
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
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
  }, [api, persona.tenantId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { workflows, error, loading, reload, setError };
}
