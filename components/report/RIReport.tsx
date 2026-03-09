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
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
} from "lucide-react";

interface RIReportProps {
  analysis: RIReportAnalysis;
  surveyData: SurveyDataV2;
  onBack: () => void;
}

export default function RIReport({ analysis, surveyData, onBack }: RIReportProps) {
  const reportRef = `RL-${Date.now().toString(36).toUpperCase()}`;
  const filename = `RiskLens-RI-Report-${(surveyData.sectionA.address || "survey").replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

  // Build ToC items
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
      ? [{ id: "section-photos", label: "Photo Appendix" }]
      : []),
  ];

  // Group recommendations by timeframe
  const immediateRecs = analysis.recommendations.filter((r) => r.timeframe === "Immediate");
  const shortTermRecs = analysis.recommendations.filter((r) => r.timeframe === "30 days");
  const mediumTermRecs = analysis.recommendations.filter((r) => r.timeframe === "90 days");
  const longTermRecs = analysis.recommendations.filter((r) => r.timeframe === "12 months");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ReportToolbar
        reportId="ri-report"
        title={`RiskLens RI Report - ${surveyData.sectionA.address}`}
        shareText={`Property risk inspection for ${surveyData.sectionA.address}. Overall risk: ${analysis.overallRiskScore}/100 (${analysis.overallRiskGrade}).`}
        onBack={onBack}
        filename={filename}
      />

      <div id="ri-report" className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* 1. Cover Page */}
        <CoverPage surveyData={surveyData} reportRef={reportRef} />

        {/* 2. Table of Contents */}
        <TableOfContents items={tocItems} />

        {/* 3. Executive Summary */}
        <div
          id="section-summary"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
            Executive Summary
          </h2>
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-gray-700">
                {analysis.executiveSummary}
              </p>
              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs text-[var(--muted)]">Occupancy</p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {surveyData.sectionA.occupancy || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs text-[var(--muted)]">Area</p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {surveyData.sectionA.totalArea ? `${surveyData.sectionA.totalArea} sqm` : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs text-[var(--muted)]">Floors</p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {surveyData.sectionA.numberOfFloors || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs text-[var(--muted)]">Age</p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {surveyData.sectionA.buildingAge ? `${surveyData.sectionA.buildingAge} yrs` : "—"}
                  </p>
                </div>
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

        {/* 5. Section-by-Section Analysis */}
        {analysis.sections.map((section, index) => (
          <ReportSection key={section.sectionId} section={section} sectionIndex={index} />
        ))}

        {/* 6. Compliance Table */}
        <ComplianceTable items={analysis.complianceItems} />

        {/* 7. Priority Recommendations */}
        <div
          id="section-recommendations"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Priority Recommendations
            </h2>
          </div>

          <div className="space-y-6">
            {/* Immediate */}
            {immediateRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">
                    Immediate Action Required
                  </h3>
                </div>
                <div className="space-y-2">
                  {immediateRecs.map((rec) => (
                    <div key={rec.priority} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {rec.priority}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-red-900">{rec.title}</h4>
                        <p className="mt-1 text-sm text-red-800">{rec.description}</p>
                        <span className="mt-2 inline-block text-xs text-red-600 font-medium">
                          Section {rec.section}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short term */}
            {shortTermRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wider">
                    Within 30 Days
                  </h3>
                </div>
                <div className="space-y-2">
                  {shortTermRecs.map((rec) => (
                    <div key={rec.priority} className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        {rec.priority}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-orange-900">{rec.title}</h4>
                        <p className="mt-1 text-sm text-orange-800">{rec.description}</p>
                        <span className="mt-2 inline-block text-xs text-orange-600 font-medium">
                          Section {rec.section}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium term */}
            {mediumTermRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                    Within 90 Days
                  </h3>
                </div>
                <div className="space-y-2">
                  {mediumTermRecs.map((rec) => (
                    <div key={rec.priority} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                        {rec.priority}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">{rec.title}</h4>
                        <p className="mt-1 text-sm text-amber-800">{rec.description}</p>
                        <span className="mt-2 inline-block text-xs text-amber-600 font-medium">
                          Section {rec.section}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long term */}
            {longTermRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                    Within 12 Months
                  </h3>
                </div>
                <div className="space-y-2">
                  {longTermRecs.map((rec) => (
                    <div key={rec.priority} className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                        {rec.priority}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900">{rec.title}</h4>
                        <p className="mt-1 text-sm text-blue-800">{rec.description}</p>
                        <span className="mt-2 inline-block text-xs text-blue-600 font-medium">
                          Section {rec.section}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 8. Photo Appendix */}
        <PhotoAppendix photos={surveyData.photos} />

        {/* 9. Disclaimer Footer */}
        <div className="rounded-2xl bg-gray-50 border border-[var(--border)] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Report generated by RiskLens AI
            </p>
          </div>
          <p className="text-xs text-[var(--muted)] max-w-lg mx-auto">
            This Risk Inspection Report is generated using AI-powered image analysis and surveyor
            input data. It should be used as a supplementary tool alongside professional on-site
            inspection. All findings and recommendations should be verified by a qualified risk
            engineer or surveyor before underwriting decisions are made.
          </p>
          <p className="mt-2 text-[10px] text-gray-400">
            Report Reference: {reportRef} | Generated:{" "}
            {new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
