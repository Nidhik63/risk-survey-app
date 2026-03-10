"use client";

import { useState } from "react";
import {
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FilePlus2,
} from "lucide-react";
import Link from "next/link";
import SurveyWizard from "@/components/survey/SurveyWizard";
import RIReport from "@/components/report/RIReport";
import type { SurveyDataV2, RIReportAnalysis } from "@/lib/survey-types";

type AppState = "form" | "analyzing" | "report";

const STORAGE_KEY = "risklens-v2-survey";

const ANALYSIS_STEPS = [
  "Uploading survey data & images...",
  "Analyzing general property information...",
  "Evaluating construction & structural details...",
  "Assessing fire protection systems...",
  "Reviewing EHS & hazard information...",
  "Inspecting housekeeping & maintenance...",
  "Cross-referencing photos with checklist...",
  "Generating compliance assessment...",
  "Building professional RI report...",
  "Finalizing recommendations...",
];

export default function SurveyPage() {
  const [appState, setAppState] = useState<AppState>("form");
  const [surveyData, setSurveyData] = useState<SurveyDataV2 | null>(null);
  const [analysis, setAnalysis] = useState<RIReportAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [wizardKey, setWizardKey] = useState(0); // Increment to force clean remount

  const handleSubmit = async (data: SurveyDataV2) => {
    setError("");
    setSurveyData(data);
    setAppState("analyzing");
    setAnalysisStep(0);

    // Animate through analysis steps
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    try {
      // Limit photos sent to Claude to avoid payload size limits
      // Keep max 15 photos for API (all photos still shown in report appendix)
      const MAX_API_PHOTOS = 15;
      const apiData: SurveyDataV2 = {
        ...data,
        photos: data.photos.length > MAX_API_PHOTOS
          ? data.photos.slice(0, MAX_API_PHOTOS)
          : data.photos,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: 2,
          surveyData: apiData,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        let errMsg = "Analysis failed";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {
          errMsg = `Server error (${response.status}). The request may be too large — try reducing photo count or size.`;
        }
        throw new Error(errMsg);
      }

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Failed to parse analysis response. Please try again.");
      }

      setAnalysis(result.analysis);
      setSurveyData(data); // Keep ALL photos for report appendix
      setAppState("report");
    } catch (err) {
      clearInterval(stepInterval);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setAppState("form");
    }
  };

  const handleNewSurvey = () => {
    // Clear saved survey data from localStorage
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setSurveyData(null);
    setAnalysis(null);
    setError("");
    setAppState("form");
    setWizardKey((k) => k + 1); // Force SurveyWizard to remount fresh
  };

  // Report view
  if (appState === "report" && analysis && surveyData) {
    return (
      <RIReport
        analysis={analysis}
        surveyData={surveyData}
        onBack={handleNewSurvey}
      />
    );
  }

  // Analyzing view
  if (appState === "analyzing") {
    const photoCount = surveyData?.photos.length || 0;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="relative mb-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Generating RI Report
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Our AI is analyzing your survey data
            {photoCount > 0 ? ` and ${photoCount} photo${photoCount > 1 ? "s" : ""}` : ""}
            {" "}to produce a professional Risk Inspection Report
          </p>

          <div className="mt-8 space-y-2.5">
            {ANALYSIS_STEPS.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-500 ${
                  index < analysisStep
                    ? "bg-green-50 text-green-700"
                    : index === analysisStep
                    ? "bg-blue-50 text-[var(--primary)] font-medium"
                    : "text-gray-300"
                }`}
              >
                {index < analysisStep ? (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                ) : index === analysisStep ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Form view — V2 wizard
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--foreground)]">
              NTRU
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new survey? This will clear all current data and photos.")) {
                handleNewSurvey();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-gray-50 hover:text-[var(--foreground)]"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            New Survey
          </button>
        </div>
      </nav>

      {/* Wizard */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Property Risk Survey
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Complete the checklist below. Your progress is automatically saved.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <SurveyWizard key={wizardKey} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
