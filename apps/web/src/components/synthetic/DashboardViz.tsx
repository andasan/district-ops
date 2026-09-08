"use client";

/** Synthetic demo visuals for the approved Comp A mosaic — not live API metrics. */

export const SYNTH = {
  attendancePct: 92.6,
  attendanceDelta: 1.3,
  enrollment: 24567,
  enrollmentDelta: 128,
  incidents: 42,
  incidentsDelta: 6,
  cases: 186,
  tasksDone: 162,
  tasksTotal: 225,
  tasksOverdue: 18,
  alerts: [
    { id: "a1", text: "High-priority cases (34)", tone: "bad" as const },
    { id: "a2", text: "Schools below attendance target (2)", tone: "warn" as const },
    { id: "a3", text: "Enrollment backlog this week", tone: "run" as const },
  ],
  schools: [
    { name: "Lincoln High", pct: 94.8, spark: [91, 92, 93, 94, 95, 94, 95] },
    { name: "Washington Middle", pct: 91.7, spark: [90, 91, 90, 92, 91, 92, 92] },
    { name: "Roosevelt Elementary", pct: 96.1, spark: [95, 95, 96, 96, 97, 96, 96] },
    { name: "Kennedy High", pct: 88.4, spark: [90, 89, 88, 87, 88, 89, 88] },
    { name: "Jefferson Middle", pct: 93.2, spark: [92, 93, 93, 94, 93, 93, 93] },
  ],
  incidentsBySeverity: [
    { label: "Major", value: 48, color: "var(--ops-red)" },
    { label: "Medium", value: 112, color: "var(--ops-warn)" },
    { label: "Minor", value: 126, color: "var(--ops-ok)" },
  ],
  budget: { total: 42.8, spent: 29.4, unit: "M" },
};

export function Sparkline({
  values,
  width = 72,
  height = 22,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.1);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="ops-spark"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="var(--ops-ink)"
        strokeWidth="1.25"
        points={pts}
      />
    </svg>
  );
}

export function Donut({
  segments,
  size = 88,
  thickness = 12,
  center,
}: {
  segments: Array<{ value: number; color: string; label?: string }>;
  size?: number;
  thickness?: number;
  center?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="ops-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((seg, i) => {
            const len = (seg.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      {center ? <span className="ops-donut-center">{center}</span> : null}
    </div>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 1000) / 10);
  return (
    <div
      className="ops-progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Delta({ value, unit = "pp" }: { value: number; unit?: string }) {
  const up = value >= 0;
  return (
    <span className={`ops-delta ${up ? "is-up" : "is-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}
      {unit}
    </span>
  );
}
