"use client";

import { usePersona } from "../identity/PersonaProvider";
import {
  LiveEnrollmentModule,
  LiveJobMixModule,
  LiveWorkflowListModule,
} from "../components/console/LiveConsole";
import { WorkflowsProvider } from "../components/console/WorkflowsProvider";
import {
  SyntheticCharts,
  SyntheticKpiStrip,
} from "../components/synthetic/SyntheticMosaic";

export default function HomePage() {
  const { persona } = usePersona();

  return (
    <>
      <header className="ops-top">
        <div>
          <h1>Operational console</h1>
          <p className="ops-top-copy">
            Multi-tenant K-12 workflow UI against ASP.NET Core. Dev auth uses
            headers; ReBAC is enforced on the API.
          </p>
        </div>
        <span className="ops-tenant-chip" title={persona.tenantId}>
          tenant {persona.tenantId.slice(0, 8)}…
        </span>
      </header>

      <div className="ops-grid">
        <SyntheticKpiStrip />
        <WorkflowsProvider>
          <LiveEnrollmentModule />
          <LiveJobMixModule />
          <SyntheticCharts />
          <LiveWorkflowListModule />
        </WorkflowsProvider>
      </div>
    </>
  );
}
