export type JobStatus = "Pending" | "Running" | "Retrying" | "Succeeded" | "Failed";

export type JobDto = {
  id: string;
  workflowId: string;
  status: JobStatus | string;
  errorMessage: string | null;
  attempt: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type WorkflowDto = {
  id: string;
  tenantId: string;
  divisionId: string;
  divisionName: string;
  type: string;
  title: string;
  createdByUserId: string;
  createdAt: string;
  job: JobDto | null;
};

export type AttendanceRowDto = {
  divisionId: string;
  divisionName: string;
  schoolName: string;
  headcount: number;
  attendancePercent: number;
};

export type CurrentUser = {
  userId: string;
  displayName: string;
  tenantId: string | null;
  roles: string[];
};

export type DevPersona = {
  userId: string;
  tenantId: string;
  displayName: string;
  label: string;
  canEdit: boolean;
};

export const SEED = {
  tenantA: "11111111-1111-1111-1111-111111111111",
  tenantB: "22222222-2222-2222-2222-222222222222",
  divisionNorth: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  divisionSouth: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
} as const;

export const DEV_PERSONAS: DevPersona[] = [
  {
    userId: "user-admin-a",
    tenantId: SEED.tenantA,
    displayName: "Pacific Admin",
    label: "Tenant admin (Pacific)",
    canEdit: true,
  },
  {
    userId: "user-editor-north",
    tenantId: SEED.tenantA,
    displayName: "North Editor",
    label: "Division editor (North)",
    canEdit: true,
  },
  {
    userId: "user-viewer-north",
    tenantId: SEED.tenantA,
    displayName: "North Viewer",
    label: "Division viewer (North)",
    canEdit: false,
  },
  {
    userId: "user-admin-b",
    tenantId: SEED.tenantB,
    displayName: "Prairie Admin",
    label: "Other tenant (should not see Pacific)",
    canEdit: true,
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export type ApiClientOptions = {
  userId: string;
  tenantId: string;
  displayName?: string;
};

function headers(opts: ApiClientOptions): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-User-Id": opts.userId,
    "X-Tenant-Id": opts.tenantId,
    "X-User-Name": opts.displayName ?? opts.userId,
  };
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (res.status === 403) {
    throw new Error("Forbidden");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function createApiClient(opts: ApiClientOptions) {
  return {
    getMe: () =>
      fetch(`${API_URL}/api/me`, { headers: headers(opts) }).then((r) =>
        parse<CurrentUser>(r),
      ),
    listWorkflows: (tenantId: string) =>
      fetch(`${API_URL}/api/tenants/${tenantId}/workflows`, {
        headers: headers(opts),
      }).then((r) => parse<WorkflowDto[]>(r)),
    startEnrollment: (tenantId: string, divisionId: string, title: string) =>
      fetch(`${API_URL}/api/tenants/${tenantId}/workflows/enrollment`, {
        method: "POST",
        headers: headers(opts),
        body: JSON.stringify({ divisionId, title }),
      }).then((r) => parse<{ workflowId: string; jobId: string }>(r)),
    getJob: (jobId: string) =>
      fetch(`${API_URL}/api/jobs/${jobId}`, { headers: headers(opts) }).then(
        (r) => parse<JobDto>(r),
      ),
    getAttendance: (tenantId: string) =>
      fetch(`${API_URL}/api/tenants/${tenantId}/reports/attendance`, {
        headers: headers(opts),
      }).then((r) => parse<AttendanceRowDto[]>(r)),
  };
}
