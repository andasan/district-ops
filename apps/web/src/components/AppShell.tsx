"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@district-ops/ui";
import { usePersona } from "../identity/PersonaProvider";

const NAV = [
  { href: "/", label: "Console", code: "01" },
  { href: "/reports", label: "Attendance report", code: "02" },
  {
    href: "http://localhost:5080/openapi/v1.json",
    label: "OpenAPI",
    code: "03",
    external: true,
  },
] as const;

const EYEBROW_BY_PATH: Array<{ match: (path: string) => boolean; label: string }> = [
  { match: (p) => p.startsWith("/jobs/"), label: "Async job status" },
  { match: (p) => p.startsWith("/reports"), label: "Attendance report" },
  { match: () => true, label: "Operational console" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { persona, personas, setPersonaByUserId } = usePersona();
  const eyebrow =
    EYEBROW_BY_PATH.find((e) => e.match(pathname))?.label ?? "District Ops";

  return (
    <div className="ops-shell">
      <aside className="ops-rail" aria-label="Primary">
        <div className="ops-rail-brand">
          <span className="ops-rail-mark" aria-hidden />
          <div>
            <p className="ops-rail-title">District Ops</p>
            <p className="ops-rail-sub">K-12 · ReBAC demo</p>
          </div>
        </div>
        <nav className="ops-rail-nav">
          {NAV.map((item) => {
            const active =
              !("external" in item && item.external) &&
              (item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href));
            if ("external" in item && item.external) {
              return (
                <a
                  key={item.code}
                  className="ops-rail-link"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="ops-rail-code">{item.code}</span>
                  <span>{item.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.code}
                href={item.href}
                className={cx("ops-rail-link", active && "is-active")}
                aria-current={active ? "page" : undefined}
              >
                <span className="ops-rail-code">{item.code}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ops-rail-persona">
          <label className="ops-field">
            <span>Dev persona</span>
            <select
              className="ops-select"
              value={persona.userId}
              onChange={(e) => setPersonaByUserId(e.target.value)}
              aria-label="Dev persona"
            >
              {personas.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <p className="ops-rail-persona-meta">
            {persona.displayName}
            <br />
            <code>{persona.userId}</code>
          </p>
        </div>

        <p className="ops-rail-foot">
          Dev headers · fixture ReBAC
          <br />
          {eyebrow}
        </p>
      </aside>
      <div className="ops-main">{children}</div>
    </div>
  );
}
