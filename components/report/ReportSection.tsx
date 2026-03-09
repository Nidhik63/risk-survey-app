"use client";

import type { RIReportSection } from "@/lib/survey-types";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

interface ReportSectionProps {
  section: RIReportSection;
  sectionIndex: number;
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "Low":
      return "bg-emerald-500";
    case "Moderate":
      return "bg-amber-500";
    case "High":
      return "bg-orange-500";
    case "Critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "Low":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "Moderate":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "High":
      return "bg-orange-50 border-orange-200 text-orange-800";
    case "Critical":
      return "bg-red-50 border-red-200 text-red-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "Critical":
      return <AlertOctagon className="h-4 w-4 text-red-600" />;
    case "High":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case "Medium":
      return <Info className="h-4 w-4 text-amber-600" />;
    case "Low":
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    default:
      return <Info className="h-4 w-4 text-gray-600" />;
  }
}

function getSeverityBg(severity: string) {
  switch (severity) {
    case "Critical":
      return "border-red-200 bg-red-50";
    case "High":
      return "border-orange-200 bg-orange-50";
    case "Medium":
      return "border-amber-200 bg-amber-50";
    case "Low":
      return "border-blue-200 bg-blue-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
}

export default function ReportSection({
  section,
  sectionIndex,
}: ReportSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      id={`section-${section.sectionId}`}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden"
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-gray-50/50"
      >
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm ${getGradeColor(section.riskGrade)}`}>
            {section.sectionId}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {section.title}
            </h3>
            <div className="mt-1 flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getGradeBg(section.riskGrade)}`}>
                {section.riskGrade} Risk
              </span>
              <span className="text-sm font-medium text-[var(--muted)]">
                Score: {section.riskScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-32 h-2.5 rounded-full bg-gray-200">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${getGradeColor(section.riskGrade)}`}
              style={{ width: `${section.riskScore}%` }}
            />
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--muted)]" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-6">
          {/* Narrative */}
          <div className="prose prose-sm max-w-none text-[var(--foreground)]">
            {section.narrative.split("\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700 mb-3">
                {para}
              </p>
            ))}
          </div>

          {/* Positives */}
          {section.positives && section.positives.length > 0 && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-800">Positive Observations</h4>
              </div>
              <ul className="space-y-1">
                {section.positives.map((pos, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Findings */}
          {section.findings && section.findings.length > 0 && (
            <div className="mt-5 space-y-3">
              <h4 className="text-sm font-bold text-[var(--foreground)]">
                Findings ({section.findings.length})
              </h4>
              {section.findings.map((finding, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${getSeverityBg(finding.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(finding.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-[var(--foreground)]">
                          {finding.title}
                        </h5>
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 border border-gray-200">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{finding.description}</p>
                      <div className="mt-3 rounded-lg bg-white/60 border border-gray-200 p-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Recommendation
                        </p>
                        <p className="text-sm text-gray-800">{finding.recommendation}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {finding.timeframe}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <DollarSign className="h-3 w-3" />
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
      )}
    </div>
  );
}
