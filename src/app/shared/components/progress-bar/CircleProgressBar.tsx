import { useState } from "react";

/**
 * Circular progress indicator.
 *
 * Color comes from `currentColor`, so set it with CSS `color` on the
 * component or any ancestor. The track is the same color at low opacity.
 */
export function CircularProgressBar({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label = "Progress",
  children,
  style,
  ...rest
}) {
  const clamped = Math.min(Math.max(value, 0), max);
  const fraction = max > 0 ? clamped / max : 0;

  // Keep the stroke inside the viewBox: radius is measured to the stroke's center.
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      style={{
        position: "relative",
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        ...style,
      }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        // Start the arc at 12 o'clock instead of 3 o'clock.
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        <style>{`
          .cp-bar { transition: stroke-dashoffset 300ms ease-out; }
          @media (prefers-reduced-motion: reduce) {
            .cp-bar { transition: none; }
          }
        `}</style>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={strokeWidth}
        />

        {/* Progress: one dash as long as the circumference, slid back by the unfilled part */}
        <circle
          className="cp-bar"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>

      <span style={{ position: "relative", fontVariantNumeric: "tabular-nums" }}>
        {children ?? `${Math.round(fraction * 100)}%`}
      </span>
    </div>
  );
}

export default function Demo() {
  const [value, setValue] = useState(64);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white p-8">
      <div className="flex items-center gap-10 text-teal-700">
        <CircularProgressBar value={value} size={160} strokeWidth={14} label="Upload progress">
          <span className="text-3xl font-semibold text-slate-900">{value}%</span>
        </CircularProgressBar>

        <CircularProgressBar value={value} size={72} strokeWidth={6} label="Upload progress, compact">
          <span className="text-sm font-medium text-slate-900">{value}</span>
        </CircularProgressBar>
      </div>

      <label className="flex w-64 flex-col gap-2 text-sm text-slate-600">
        Value
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
