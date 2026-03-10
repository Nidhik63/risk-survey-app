"use client";

import type { RIReportAnalysis, SurveyDataV2 } from "@/lib/survey-types";
import ReportToolbar from "./ReportToolbar";
import CoverPage from "./CoverPage";
import TableOfContents from "./TableOfContents";
import PropertySummary from "./PropertySummary";
import ReportSection from "./ReportSection";
import ComplianceTable from "./ComplianceTable";
import PhotoAppendix from "./PhotoAppendix";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import {
  Target,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";

interface RIReportProps {
  analysis: RIReportAnalysis;
  surveyData: SurveyDataV2;
  onBack: () => void;
}

export default function RIReport({ analysis, surveyData, onBack }: RIReportProps) {
  const reportRef = `RL-${Date.now().toString(36).toUpperCase()}`;
  const filename = `RiskLens-RI-Report-${(surveyData.sectionA.address || "survey").replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

  const tocItems = [
    { id: "section-summary", label: "Executive Summary" },
    { id: "section-property", label: "Property Summary" },
    ...analysis.sections.map((s) => ({
      id: `section-${s.sectionId}`,
      label: `Section ${s.sectionId}: ${s.title}`,
      score: s.riskScore,
      grade: s.riskGrade,
    })),
    { id: "section-compliance", label: "Compliance Summary" },
    { id: "section-recommendations", label: "Priority Recommendations" },
    ...(surveyData.photos.length > 0
      ? [{ id: "section-photos", label: "Photo Evidence" }]
      : []),
  ];

  // Group recommendations by timeframe
  const recGroups = [
    { key: "Immediate", label: "Immediate Action", color: "#ef4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.12)" },
    { key: "30 days", label: "Within 30 Days", color: "#f97316", bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.12)" },
    { key: "90 days", label: "Within 90 Days", color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)" },
    { key: "12 months", label: "Within 12 Months", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.12)" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ReportToolbar
        reportId="ri-report"
        title={`RiskLens RI Report - ${surveyData.sectionA.address}`}
        shareText={`Property risk inspection for ${surveyData.sectionA.address}. Overall risk: ${analysis.overallRiskScore}/100 (${analysis.overallRiskGrade}).`}
        onBack={onBack}
        filename={filename}
      />

      <div id="ri-report" className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        {/* 1. Cover Page */}
        <CoverPage surveyData={surveyData} reportRef={reportRef} />

        {/* 2. Table of Contents */}
        <TableOfContents items={tocItems} />

        {/* 3. Executive Summary */}
        <div id="section-summary" className="rounded-3xl border border-gray-100 bg-[var(--surface)] p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">
              Executive Summary
            </h2>
          </div>

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
            <div className="flex-1">
              <p className="text-[15px] leading-[1.8] text-gray-600">
                {analysis.executiveSummary}
              </p>
              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: "Occupancy", value: surveyData.sectionA.occupancy || "\u2014" },
                  { label: "Plot Area", value: surveyData.sectionA.plotArea ? `${surveyData.sectionA.plotArea} sqm` : "\u2014" },
                  { label: "Built Area", value: surveyData.sectionA.constructedArea ? `${surveyData.sectionA.constructedArea} sqm` : "\u2014" },
                  { label: "Floors", value: surveyData.sectionA.numberOfFloors || "\u2014" },
                  { label: "Flood Risk", value: surveyData.sectionA.floodRiskLevel || "\u2014" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{stat.label}</p>
                    <p className="mt-1.5 text-sm font-bold text-[var(--foreground)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <RiskScoreGauge score={analysis.overallRiskScore} />
            </div>
          </div>
        </div>

        {/* 4. Property Summary */}
        <div id="section-property">
          <PropertySummary surveyData={surveyData} />
        </div>

        {/* 5. Section Analysis */}
        {analysis.sections.map((section, index) => (
          <ReportSection key={section.sectionId} section={section} sectionIndex={index} />
        ))}

        {/* 6. Compliance */}
        <ComplianceTable items={analysis.complianceItems} />

        {/* 7. Priority Recommendations */}
        <div id="section-recommendations" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">
                Recommendations
              </h2>
              <p className="text-xs text-[var(--muted)]">Prioritized action items</p>
            </div>
          </div>

          {recGroups.map((group) => {
            const recs = analysis.recommendations.filter((r) => r.timeframe === group.key);
            if (recs.length === 0) return null;
            return (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: group.color }}>
                    {group.label}
                  </h3>
                </div>
                {recs.map((rec) => (
                  <div
                    key={rec.priority}
                    className="flex items-start gap-4 rounded-2xl p-5 transition-all"
                    style={{ backgroundColor: group.bg, border: `1px solid ${group.border}` }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
                      style={{ backgroundColor: group.color }}
                    >
                      {rec.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{rec.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Clock className="h-3 w-3" /> {rec.timeframe}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3" /> Section {rec.section}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* 8. Photo Evidence with AI overlays */}
        <PhotoAppendix photos={surveyData.photos} sections={analysis.sections} />

        {/* 9. Disclaimer */}
        <div className="rounded-3xl bg-[#0a0a0a] p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Shield className="h-4 w-4 text-white/60" />
            </div>
          </div>
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            Report generated by RiskLens AI
          </p>
          <p className="text-[11px] text-white/30 max-w-lg mx-auto leading-relaxed">
            This Risk Inspection Report is generated using AI-powered image analysis and surveyor
            input data. It should be used as a supplementary tool alongside professional on-site
            inspection. All findings and recommendations should be verified by a qualified risk
            engineer before underwriting decisions are made.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-white/20">
            <span>Ref: {reportRef}</span>
            <span>&middot;</span>
            <span>
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
