"use client";

import {
  createApiClient,
  credentialsFromPersona,
  type DistrictApi,
} from "@district-ops/api-client";
import { useMemo } from "react";
import { usePersona } from "../identity/PersonaProvider";

/**
 * Web-owned mapping: active persona → API credentials.
 * Swap credentialsFromPersona for bearer/BFF without changing page hooks.
 */
export function useDistrictApi(): DistrictApi {
  const { persona } = usePersona();
  return useMemo(
    () =>
      createApiClient({
        credentials: credentialsFromPersona(persona),
      }),
    [persona],
  );
}
