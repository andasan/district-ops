"use client";

import { cx } from "@district-ops/ui";

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
