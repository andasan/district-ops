"use client";

import { createContext, useContext } from "react";
import { useWorkflows } from "../../hooks/useWorkflows";

type WorkflowsValue = ReturnType<typeof useWorkflows>;

const WorkflowsContext = createContext<WorkflowsValue | null>(null);

/** One workflows subscription for the console page's live modules. */
export function WorkflowsProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkflows();
  return (
    <WorkflowsContext.Provider value={value}>{children}</WorkflowsContext.Provider>
  );
}

export function useConsoleWorkflows(): WorkflowsValue {
  const ctx = useContext(WorkflowsContext);
  if (!ctx) {
    throw new Error("useConsoleWorkflows must be used within WorkflowsProvider");
  }
  return ctx;
}
