import { test, expect } from "@playwright/test";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

test.describe("API authz boundaries", () => {
  test("editor can list Pacific workflows", async ({ request }) => {
    const res = await request.get(
      `${API}/api/tenants/11111111-1111-1111-1111-111111111111/workflows`,
      {
        headers: {
          "X-User-Id": "user-editor-north",
          "X-Tenant-Id": "11111111-1111-1111-1111-111111111111",
        },
      },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test("other tenant cannot list Pacific workflows", async ({ request }) => {
    const res = await request.get(
      `${API}/api/tenants/11111111-1111-1111-1111-111111111111/workflows`,
      {
        headers: {
          "X-User-Id": "user-admin-b",
          "X-Tenant-Id": "22222222-2222-2222-2222-222222222222",
        },
      },
    );
    expect(res.status()).toBe(403);
  });

  test("viewer cannot start enrollment", async ({ request }) => {
    const res = await request.post(
      `${API}/api/tenants/11111111-1111-1111-1111-111111111111/workflows/enrollment`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "user-viewer-north",
          "X-Tenant-Id": "11111111-1111-1111-1111-111111111111",
        },
        data: {
          divisionId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Should fail",
        },
      },
    );
    expect(res.status()).toBe(403);
  });
});
