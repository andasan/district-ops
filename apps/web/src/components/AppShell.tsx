"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@district-ops/ui";

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

export function AppShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  const pathname = usePathname();

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
        <p className="ops-rail-foot">
          Dev headers · fixture ReBAC
          {eyebrow ? (
            <>
              <br />
              {eyebrow}
            </>
          ) : null}
        </p>
      </aside>
      <div className="ops-main">{children}</div>
    </div>
  );
}

export function StatusStamp({
  status,
  attempt,
  live,
}: {
  status: string;
  attempt?: number;
  live?: boolean;
}) {
  const tone =
    status === "Succeeded"
      ? "ok"
      : status === "Failed"
        ? "bad"
        : status === "Retrying"
          ? "warn"
          : status === "Running"
            ? "run"
            : "idle";

  return (
    <span className={cx("ops-stamp", `tone-${tone}`, live && "is-live")}>
      <span className="ops-stamp-label">{status}</span>
      {typeof attempt === "number" && attempt > 0 ? (
        <span className="ops-stamp-meta">· attempt {attempt}</span>
      ) : null}
      {live ? <span className="ops-stamp-now" aria-hidden /> : null}
    </span>
  );
}

export function Module({
  title,
  tab,
  children,
  className,
  action,
}: {
  title: string;
  tab?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cx("ops-module", className)}>
      <header className="ops-module-head">
        <div className="ops-module-titles">
          {tab ? <span className="ops-tab">{tab}</span> : null}
          <h2 className="ops-module-title">{title}</h2>
        </div>
        {action}
      </header>
      <div className="ops-module-body">{children}</div>
    </section>
  );
}
