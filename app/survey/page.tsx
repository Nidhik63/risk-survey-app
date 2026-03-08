"use client";

import { useState } from "react";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import PhotoUploader from "@/components/PhotoUploader";
import SiteDetailsForm from "@/components/SiteDetailsForm";
import RiskReport from "@/components/RiskReport";
import type { RiskAnalysis, SiteDetails } from "@/lib/risk-scoring";

type AppState = "form" | "analyzing" | "report";

const ANALYSIS_STEPS = [
  "Uploading images for analysis...",
  "Scanning for structural risks...",
  "Evaluating fire safety hazards...",
  "Assessing water and flood risks...",
  "Checking electrical safety...",
  "Analyzing environmental hazards...",
  "Reviewing security measures...",
  "Generating risk report...",
];

export default function SurveyPage() {
  const [appState, setAppState] = useState<AppState>("form");
  const [images, setImages] = useState<string[]>([]);
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({
    address: "",
    buildingType: "",
    yearBuilt: "",
    floors: "",
    occupancy: "",
    surveyorName: "",
  });
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const [analysisStep, setAnalysisStep] = useState(0);

  const canSubmit =
    images.length > 0 &&
    siteDetails.address.trim() !== "" &&
    siteDetails.buildingType !== "";

  const handleAnalyze = async () => {
    setError("");
    setAppState("analyzing");
    setAnalysisStep(0);

    // Animate through analysis steps
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, siteDetails }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const result: RiskAnalysis = await response.json();
      setAnalysis(result);
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
    setImages([]);
    setSiteDetails({
      address: "",
      buildingType: "",
      yearBuilt: "",
      floors: "",
      occupancy: "",
      surveyorName: "",
    });
    setAnalysis(null);
    setAppState("form");
  };

  // Report view
  if (appState === "report" && analysis) {
    return (
      <RiskReport
        analysis={analysis}
        siteDetails={siteDetails}
        onBack={handleNewSurvey}
      />
    );
  }

  // Analyzing view
  if (appState === "analyzing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="relative mb-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Analyzing Property
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Our AI is inspecting your {images.length} photo
            {images.length > 1 ? "s" : ""} across 6 risk categories
          </p>

          <div className="mt-8 space-y-3">
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

  // Form view
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
              RiskLens
            </span>
          </div>
          <div className="w-14" />
        </div>
      </nav>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            New Risk Survey
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload site photos and fill in property details to generate your AI
            risk assessment
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Photo upload section */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <PhotoUploader images={images} onImagesChange={setImages} />
          </div>

          {/* Site details section */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <SiteDetailsForm
              siteDetails={siteDetails}
              onSiteDetailsChange={setSiteDetails}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[var(--primary-light)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Send className="h-5 w-5" />
              Analyze Risk
            </button>
          </div>

          {!canSubmit && (
            <p className="text-center text-sm text-[var(--muted)]">
              Please upload at least 1 photo, and enter the property address and
              building type to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
