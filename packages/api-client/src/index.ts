export type JobStatus =
  | "Pending"
  | "Running"
  | "Retrying"
  | "Succeeded"
  | "Failed";

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

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

/** Thrown for non-2xx responses. Callers branch on status, not string matching. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Auth seam: callers inject how credentials become request headers.
 * Today: X-User-* via {@link credentialsFromPersona}.
 * Later: bearer JWT or BFF cookie — same createApiClient interface.
 */
export type ResolveCredentials = () =>
  | HeadersInit
  | Promise<HeadersInit>;

export type CreateApiClientOptions = {
  baseUrl?: string;
  credentials: ResolveCredentials;
};

/** Dev-header adapter — maps a persona (or Keycloak-shaped claims later) to headers. */
export function credentialsFromPersona(persona: {
  userId: string;
  tenantId: string;
  displayName?: string;
}): ResolveCredentials {
  return () => ({
    "Content-Type": "application/json",
    "X-User-Id": persona.userId,
    "X-Tenant-Id": persona.tenantId,
    "X-User-Name": persona.displayName ?? persona.userId,
  });
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new ApiError(401, "Unauthorized");
  }
  if (res.status === 403) {
    throw new ApiError(403, "Forbidden");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export type DistrictApi = {
  getMe: () => Promise<CurrentUser>;
  listWorkflows: (tenantId: string) => Promise<WorkflowDto[]>;
  startEnrollment: (
    tenantId: string,
    divisionId: string,
    title: string,
  ) => Promise<{ workflowId: string; jobId: string }>;
  getJob: (jobId: string) => Promise<JobDto>;
  getAttendance: (tenantId: string) => Promise<AttendanceRowDto[]>;
};

export function createApiClient(options: CreateApiClientOptions): DistrictApi {
  const baseUrl = options.baseUrl ?? DEFAULT_API_URL;

  async function request(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const auth = await options.credentials();
    const headers = new Headers(auth);
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${baseUrl}${path}`, { ...init, headers });
  }

  return {
    getMe: () => request("/api/me").then((r) => parse<CurrentUser>(r)),
    listWorkflows: (tenantId) =>
      request(`/api/tenants/${tenantId}/workflows`).then((r) =>
        parse<WorkflowDto[]>(r),
      ),
    startEnrollment: (tenantId, divisionId, title) =>
      request(`/api/tenants/${tenantId}/workflows/enrollment`, {
        method: "POST",
        body: JSON.stringify({ divisionId, title }),
      }).then((r) => parse<{ workflowId: string; jobId: string }>(r)),
    getJob: (jobId) =>
      request(`/api/jobs/${jobId}`).then((r) => parse<JobDto>(r)),
    getAttendance: (tenantId) =>
      request(`/api/tenants/${tenantId}/reports/attendance`).then((r) =>
        parse<AttendanceRowDto[]>(r),
      ),
  };
}
