"use client";

import clsx from "clsx";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={clsx(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-kaspa-300 via-kaspa-blue-400 to-kaspa-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
