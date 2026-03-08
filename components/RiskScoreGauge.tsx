"use client";

import { getRiskColor, getRiskLevel } from "@/lib/risk-scoring";

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
}

export default function RiskScoreGauge({
  score,
  size = 200,
}: RiskScoreGaugeProps) {
  const level = getRiskLevel(score);
  const color = getRiskColor(level);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  const labels: Record<string, string> = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
    critical: "Critical Risk",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="animate-gauge-fill transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">/ 100</span>
        </div>
      </div>
      <div
        className="rounded-full px-4 py-1.5 text-sm font-semibold"
        style={{
          backgroundColor: `${color}18`,
          color: color,
        }}
      >
        {labels[level]}
      </div>
    </div>
  );
}
