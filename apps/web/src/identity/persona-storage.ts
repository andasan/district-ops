import {
  DEV_PERSONAS,
  type DevPersona,
} from "@district-ops/api-client";

export const PERSONA_STORAGE_KEY = "district-ops:persona-user-id";

export const DEFAULT_PERSONA = DEV_PERSONAS[1];

export function personaByUserId(userId: string | null | undefined): DevPersona {
  if (!userId) return DEFAULT_PERSONA;
  return DEV_PERSONAS.find((p) => p.userId === userId) ?? DEFAULT_PERSONA;
}

export function readStoredPersonaUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PERSONA_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredPersonaUserId(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, userId);
  } catch {
    /* quota / private mode — identity still works in-memory */
  }
}
