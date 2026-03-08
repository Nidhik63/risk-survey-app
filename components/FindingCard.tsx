"use client";

import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { getRiskBgClass, type RiskFinding } from "@/lib/risk-scoring";

const SEVERITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  low: CheckCircle2,
  moderate: AlertCircle,
  high: AlertTriangle,
  critical: XCircle,
};

interface FindingCardProps {
  finding: RiskFinding;
}

export default function FindingCard({ finding }: FindingCardProps) {
  const Icon = SEVERITY_ICONS[finding.severity] || AlertCircle;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon
            className={`h-5 w-5 ${
              finding.severity === "critical"
                ? "text-red-500"
                : finding.severity === "high"
                ? "text-orange-500"
                : finding.severity === "moderate"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-sm text-[var(--foreground)]">
              {finding.title}
            </h5>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRiskBgClass(
                finding.severity
              )}`}
            >
              {finding.severity}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mb-2">
            {finding.description}
          </p>
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-xs font-medium text-blue-800">
              Recommendation: {finding.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
