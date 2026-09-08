"use client";

import {
  DEV_PERSONAS,
  type DevPersona,
} from "@district-ops/api-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PERSONA,
  personaByUserId,
  readStoredPersonaUserId,
  writeStoredPersonaUserId,
} from "./persona-storage";

type PersonaContextValue = {
  persona: DevPersona;
  personas: typeof DEV_PERSONAS;
  setPersona: (persona: DevPersona) => void;
  setPersonaByUserId: (userId: string) => void;
};

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<DevPersona>(DEFAULT_PERSONA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPersonaState(personaByUserId(readStoredPersonaUserId()));
    setHydrated(true);
  }, []);

  const setPersona = useCallback((next: DevPersona) => {
    setPersonaState(next);
    writeStoredPersonaUserId(next.userId);
  }, []);

  const setPersonaByUserId = useCallback(
    (userId: string) => {
      setPersona(personaByUserId(userId));
    },
    [setPersona],
  );

  const value = useMemo(
    () => ({
      persona,
      personas: DEV_PERSONAS,
      setPersona,
      setPersonaByUserId,
    }),
    [persona, setPersona, setPersonaByUserId],
  );

  return (
    <PersonaContext.Provider value={value}>
      {/* Avoid a flash of default persona before localStorage hydrate on controlled selects */}
      <div data-persona-hydrated={hydrated ? "true" : "false"}>{children}</div>
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used within PersonaProvider");
  }
  return ctx;
}
