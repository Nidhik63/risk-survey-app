"use client";

import {
  Building2,
  Flame,
  Droplets,
  Zap,
  Leaf,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { getRiskColor, getRiskLevel, type RiskCategory } from "@/lib/risk-scoring";
import FindingCard from "./FindingCard";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  building: Building2,
  flame: Flame,
  droplets: Droplets,
  zap: Zap,
  leaf: Leaf,
  shield: Shield,
};

interface RiskCategoryCardProps {
  category: RiskCategory;
  index: number;
}

export default function RiskCategoryCard({
  category,
  index,
}: RiskCategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[category.icon] || Building2;
  const score = category.score * 10;
  const level = getRiskLevel(score);
  const color = getRiskColor(level);

  return (
    <div
      className={`animate-fade-in-up stagger-${index + 1} overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)]">
              {category.name}
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Weight: {(category.weight * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score bar */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${score}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color }}
              >
                {score}
              </span>
            </div>
          </div>

          {/* Mobile score */}
          <span
            className="text-lg font-bold sm:hidden"
            style={{ color }}
          >
            {score}
          </span>

          {expanded ? (
            <ChevronUp className="h-5 w-5 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--muted)]" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--border)] bg-gray-50/50 p-5">
          <p className="mb-4 text-sm text-[var(--muted)]">{category.summary}</p>
          <div className="space-y-3">
            {category.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
