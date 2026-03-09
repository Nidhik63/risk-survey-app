"use client";

import {
  Download,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Share2,
} from "lucide-react";
import type { RiskAnalysis, SiteDetails } from "@/lib/risk-scoring";
import RiskScoreGauge from "./RiskScoreGauge";
import RiskCategoryCard from "./RiskCategoryCard";
import ReportHeader from "./ReportHeader";
import { exportReportToPDF, printReport, shareReport } from "@/lib/pdf-export";
import { useState, useEffect } from "react";

interface RiskReportProps {
  analysis: RiskAnalysis;
  siteDetails: SiteDetails;
  onBack: () => void;
}

export default function RiskReport({
  analysis,
  siteDetails,
  onBack,
}: RiskReportProps) {
  const [exporting, setExporting] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setPdfFailed(false);
    try {
      const success = await exportReportToPDF(
        "risk-report",
        `RiskLens-Report-${(siteDetails.address || "survey").replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      if (!success) {
        setPdfFailed(true);
      }
    } catch (err) {
      console.error("PDF export failed:", err);
      setPdfFailed(true);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    printReport();
  };

  const handleShare = async () => {
    await shareReport(
      `RiskLens Report - ${siteDetails.address}`,
      `Property risk assessment for ${siteDetails.address}. Overall risk score: ${analysis.overallScore}/100 (${analysis.riskLevel}).`
    );
  };

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sticky toolbar */}
      <div className="no-print sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition-all hover:bg-gray-100 hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">New Survey</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Share button (mobile) */}
            {canShare && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* PDF Download button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary-light)] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Generating..." : "PDF"}
            </button>
          </div>
        </div>

        {/* PDF failed fallback message */}
        {pdfFailed && (
          <div className="mx-auto max-w-5xl px-4 pb-3">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
              PDF download not supported on this browser. Use the <strong>Print</strong> button and select &quot;Save as PDF&quot; instead.
            </div>
          </div>
        )}
      </div>

      {/* Report content */}
      <div id="risk-report" className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <ReportHeader siteDetails={siteDetails} date={date} />

        {/* Overall Score */}
        <div className="mt-8 animate-scale-in rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Overall Risk Score
              </h2>
              <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                {analysis.executiveSummary}
              </p>
            </div>
            <RiskScoreGauge score={analysis.overallScore} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">
            Risk Category Breakdown
          </h2>
          <div className="space-y-3">
            {analysis.categories.map((category, index) => (
              <RiskCategoryCard
                key={category.name}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="mt-8 animate-fade-in-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Priority Recommendations
            </h2>
          </div>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                  {index + 1}
                </span>
                <p className="text-sm text-amber-900">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-2xl bg-gray-50 border border-[var(--border)] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Report generated by RiskLens AI
            </p>
          </div>
          <p className="text-xs text-[var(--muted)] max-w-lg mx-auto">
            This assessment is generated using AI-powered image analysis and should be used as a
            supplementary tool alongside professional on-site inspection. All findings should be
            verified by a qualified surveyor.
          </p>
        </div>
      </div>
    </div>
  );
}
