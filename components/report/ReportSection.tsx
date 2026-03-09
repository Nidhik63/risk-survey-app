"use client";

import type { RIReportSection } from "@/lib/survey-types";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  DollarSign,
  ThumbsUp,
} from "lucide-react";

interface ReportSectionProps {
  section: RIReportSection;
  sectionIndex: number;
}

function getGradeStyle(grade: string) {
  switch (grade) {
    case "Low": return { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" };
    case "Moderate": return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" };
    case "High": return { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.15)" };
    case "Critical": return { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" };
    default: return { color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.15)" };
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "Critical": return <AlertOctagon className="h-4 w-4 text-red-500" />;
    case "High": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "Medium": return <Info className="h-4 w-4 text-amber-500" />;
    default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
  }
}

function getSeverityDot(severity: string) {
  switch (severity) {
    case "Critical": return "bg-red-500";
    case "High": return "bg-orange-500";
    case "Medium": return "bg-amber-500";
    default: return "bg-blue-500";
  }
}

export default function ReportSection({ section }: ReportSectionProps) {
  const style = getGradeStyle(section.riskGrade);

  return (
    <div
      id={`section-${section.sectionId}`}
      className="rounded-3xl border bg-[var(--surface)] overflow-hidden transition-all duration-300"
      style={{ borderColor: style.border }}
    >
      {/* Header */}
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-black text-lg"
              style={{ backgroundColor: style.color }}
            >
              {section.sectionId}
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight">
                {section.title}
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                >
                  {section.riskGrade} Risk
                </span>
              </div>
            </div>
          </div>

          {/* Score circle */}
          <div className="shrink-0 flex flex-col items-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: style.bg, border: `2px solid ${style.border}` }}
            >
              <span className="text-2xl font-black" style={{ color: style.color }}>
                {section.riskScore}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-[var(--muted)] font-medium">/100</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${section.riskScore}%`, backgroundColor: style.color }}
          />
        </div>

        {/* Narrative */}
        <div className="mt-6">
          {section.narrative.split("\n").map((para, i) => (
            <p key={i} className="text-[15px] leading-[1.7] text-gray-600 mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        {/* Positives */}
        {section.positives && section.positives.length > 0 && (
          <div className="mt-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Positive Observations
              </h4>
            </div>
            <div className="space-y-2">
              {section.positives.map((pos, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-emerald-800 leading-relaxed">{pos}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings */}
        {section.findings && section.findings.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
              Findings
            </h4>
            {section.findings.map((finding, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(finding.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-sm font-bold text-[var(--foreground)]">
                        {finding.title}
                      </h5>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getSeverityDot(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{finding.description}</p>

                    {/* Recommendation card */}
                    <div className="mt-3 rounded-xl bg-white border border-gray-200/60 p-4">
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">
                        Recommendation
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">{finding.recommendation}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          {finding.timeframe}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <DollarSign className="h-3.5 w-3.5" />
                          {finding.estimatedCost} cost
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
