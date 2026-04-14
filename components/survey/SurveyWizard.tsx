"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Send, Sparkles, Loader2, CheckCircle2, FilePlus2, RotateCcw } from "lucide-react";
import type { SurveyDataV2, AutoFillResult } from "@/lib/survey-types";
import { WIZARD_STEPS } from "@/lib/survey-types";
import { defaultSurveyData } from "@/lib/survey-defaults";
import { useRole } from "@/lib/role-context";
import { savePhotos, loadPhotos, clearPhotos } from "@/lib/photo-store";
import StepIndicator from "./StepIndicator";
import SectionAForm from "./SectionAForm";
import SectionBForm from "./SectionBForm";
import SectionCForm from "./SectionCForm";
import SectionDForm from "./SectionDForm";
import SectionEForm from "./SectionEForm";
import PhotoStep from "./PhotoStep";
import ReviewStep from "./ReviewStep";

interface SurveyWizardProps {
  onSubmit: (data: SurveyDataV2) => void;
  importedData?: SurveyDataV2 | null;
}

const STORAGE_KEY = "risklens-v2-survey";
const STEP_KEY = "risklens-v2-step";

export default function SurveyWizard({ onSubmit, importedData }: SurveyWizardProps) {
  const role = useRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SurveyDataV2>(defaultSurveyData);
  const [errors, setErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const suppressPopRef = useRef(false);

  // Resume gate — if saved data exists, show choice screen first
  // "checking" → reading localStorage; "choosing" → waiting for user; "ready" → form visible
  const [resumeState, setResumeState] = useState<"checking" | "choosing" | "ready">("checking");
  const [savedLabel, setSavedLabel] = useState("");

  // Auto-fill state
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [autoFillSummary, setAutoFillSummary] = useState("");
  const [autoFillError, setAutoFillError] = useState("");
  const [autoFilledFields, setAutoFilledFields] = useState<number>(0);
  const [autoFillProgress, setAutoFillProgress] = useState("");

  // Check localStorage on mount — but DON'T auto-load if meaningful data exists
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedPhotoCount = (await loadPhotos()).length;

        if (saved) {
          const parsed = JSON.parse(saved);

          // Check if any meaningful data exists (not just empty defaults)
          const hasContent =
            (parsed.sectionA?.insuredName?.trim()) ||
            (parsed.sectionA?.address?.trim()) ||
            (parsed.sectionA?.surveyorName?.trim()) ||
            savedPhotoCount > 0;

          if (hasContent) {
            // Show choice screen instead of auto-loading
            setSavedLabel(
              parsed.sectionA?.insuredName?.trim() ||
              parsed.sectionA?.address?.trim() ||
              "Previous survey"
            );
            setResumeState("choosing");
            setLoaded(true);
            return;
          }
        } else if (savedPhotoCount > 0) {
          // Only photos saved (no form data yet)
          setSavedLabel("Previous survey");
          setResumeState("choosing");
          setLoaded(true);
          return;
        }
      } catch {
        // ignore parse errors
      }
      // No meaningful saved data — go straight to empty form
      setResumeState("ready");
      setLoaded(true);
    })();
  }, []);

  // Load imported data (from analyst JSON import)
  useEffect(() => {
    if (importedData) {
      setData(importedData);
      setResumeState("ready");
      setLoaded(true);
      setCurrentStep(6); // Jump to review step
    }
  }, [importedData]);

  // Load saved data into form state (called when user clicks "Continue")
  const loadSavedData = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedPhotos = await loadPhotos();

      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old totalArea → plotArea
        if (parsed.sectionA) {
          if (parsed.sectionA.totalArea && !parsed.sectionA.plotArea) {
            parsed.sectionA.plotArea = parsed.sectionA.totalArea;
          }
          delete parsed.sectionA.totalArea;
          parsed.sectionA.plotArea = parsed.sectionA.plotArea || "";
          parsed.sectionA.constructedArea = parsed.sectionA.constructedArea || "";
          parsed.sectionA.latitude = parsed.sectionA.latitude || "";
          parsed.sectionA.longitude = parsed.sectionA.longitude || "";
          parsed.sectionA.floodRiskLevel = parsed.sectionA.floodRiskLevel || "";
          parsed.sectionA.floodRiskDetails = parsed.sectionA.floodRiskDetails || "";
        }
        setData((prev) => ({
          ...prev,
          photos: savedPhotos.length > 0 ? savedPhotos : prev.photos,
          sectionA: parsed.sectionA || prev.sectionA,
          sectionB: parsed.sectionB || prev.sectionB,
          sectionC: parsed.sectionC || prev.sectionC,
          sectionD: parsed.sectionD || prev.sectionD,
          sectionE: parsed.sectionE || prev.sectionE,
        }));
      } else if (savedPhotos.length > 0) {
        setData((prev) => ({ ...prev, photos: savedPhotos }));
      }
    } catch {
      // ignore
    }
    // Restore saved step position
    try {
      const savedStep = localStorage.getItem(STEP_KEY);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 0 && step < WIZARD_STEPS.length) {
          setCurrentStep(step);
        }
      }
    } catch { /* ignore */ }
    setResumeState("ready");
  };

  // Start fresh — clear localStorage + IndexedDB photos and proceed with empty form
  const startFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
    clearPhotos();
    setData(defaultSurveyData);
    setCurrentStep(0);
    setResumeState("ready");
  };

  // Auto-save form fields + current step to localStorage
  useEffect(() => {
    if (!loaded || resumeState !== "ready") return;
    try {
      const toSave = {
        sectionA: data.sectionA,
        sectionB: data.sectionB,
        sectionC: data.sectionC,
        sectionD: data.sectionD,
        sectionE: data.sectionE,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore quota errors
    }
  }, [data.sectionA, data.sectionB, data.sectionC, data.sectionD, data.sectionE, loaded, resumeState]);

  // Persist currentStep so it survives page refresh / resume
  useEffect(() => {
    if (!loaded || resumeState !== "ready") return;
    try {
      localStorage.setItem(STEP_KEY, String(currentStep));
    } catch { /* ignore */ }
  }, [currentStep, loaded, resumeState]);

  // Browser history integration — back button goes to previous wizard step
  useEffect(() => {
    if (resumeState !== "ready") return;

    // Push an initial history entry so the first back press stays on /survey
    if (!window.history.state?.wizardStep && window.history.state?.wizardStep !== 0) {
      window.history.replaceState({ wizardStep: currentStep }, "");
    }

    const handlePopState = (e: PopStateEvent) => {
      if (suppressPopRef.current) {
        suppressPopRef.current = false;
        return;
      }
      const prevStep = e.state?.wizardStep;
      if (typeof prevStep === "number" && prevStep >= 0) {
        setErrors([]);
        setCurrentStep(prevStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // No wizard state — user is navigating away from the survey entirely.
        // Push them back into the survey at step 0 to prevent accidental data loss.
        if (currentStep > 0) {
          window.history.pushState({ wizardStep: 0 }, "");
          setErrors([]);
          setCurrentStep(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        // If already at step 0, let the browser navigate away normally
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [resumeState, currentStep]);

  // Photo save is handled explicitly in handlePhotosChange below
  // (not via useEffect to avoid race conditions with initial load)

  // Auto-fill from photos (processes in batches of 15)
  const handleAutoFill = async () => {
    if (data.photos.length === 0) return;

    setAutoFilling(true);
    setAutoFillError("");
    setAutoFillProgress("");

    try {
      const BATCH_SIZE = 15;
      const totalPhotos = data.photos.length;
      const totalBatches = Math.ceil(totalPhotos / BATCH_SIZE);

      // Collect results from all batches
      const allPhotoCategories: { section: string; caption: string }[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let mergedSections: Record<string, any> = {
        sectionA: {}, sectionB: {}, sectionC: {}, sectionD: {}, sectionE: {},
      };
      let lastSummary = "";

      for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, totalPhotos);
        const batchPhotos = data.photos.slice(start, end);

        setAutoFillProgress(
          totalBatches > 1
            ? `Analyzing batch ${batch + 1} of ${totalBatches} (photos ${start + 1}–${end})...`
            : `Analyzing ${totalPhotos} photo${totalPhotos > 1 ? "s" : ""}...`
        );

        const response = await fetch("/api/autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: batchPhotos }),
        });

        if (!response.ok) {
          let errMsg = `Batch ${batch + 1} failed`;
          try {
            const errData = await response.json();
            errMsg = errData.error || errMsg;
          } catch {
            errMsg = `Server error (${response.status}) on batch ${batch + 1}.`;
          }
          throw new Error(errMsg);
        }

        const result: AutoFillResult = await response.json();

        // Collect photo categories from this batch
        if (result.photoCategories) {
          allPhotoCategories.push(...result.photoCategories);
        } else {
          // Fill with defaults if AI didn't return categories
          for (let i = 0; i < batchPhotos.length; i++) {
            allPhotoCategories.push({ section: "general", caption: "" });
          }
        }

        // Merge section fields: first non-empty value wins
        const sectionKeys = ["sectionA", "sectionB", "sectionC", "sectionD", "sectionE"] as const;
        for (const key of sectionKeys) {
          const incoming = result[key];
          if (!incoming) continue;
          for (const [field, value] of Object.entries(incoming)) {
            if (value && typeof value === "string" && value.trim() && !mergedSections[key][field]) {
              mergedSections[key][field] = value;
            }
          }
        }

        if (result.summary) lastSummary = result.summary;
      }

      // Count total non-empty fields across all batches
      let fieldCount = 0;
      for (const section of Object.values(mergedSections)) {
        for (const value of Object.values(section as Record<string, string>)) {
          if (value && typeof value === "string" && value.trim()) fieldCount++;
        }
      }

      // Apply all merged data + photo categories to state
      setData((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mergeFields = (existing: any, incoming: any) => {
          if (!incoming) return existing;
          const out = { ...existing };
          for (const [key, value] of Object.entries(incoming)) {
            if (value && typeof value === "string" && (value as string).trim() && !out[key]) {
              out[key] = value;
            }
          }
          return out;
        };

        // Apply AI photo categories to ALL photos
        const updatedPhotos = prev.photos.map((photo, idx) => {
          const cat = idx < allPhotoCategories.length ? allPhotoCategories[idx] : null;
          if (!cat) return photo;
          return {
            ...photo,
            section: photo.section === "general" && cat.section ? (cat.section as typeof photo.section) : photo.section,
            caption: !photo.caption.trim() && cat.caption ? cat.caption : photo.caption,
          };
        });

        return {
          ...prev,
          photos: updatedPhotos,
          sectionA: mergeFields(prev.sectionA, mergedSections.sectionA),
          sectionB: mergeFields(prev.sectionB, mergedSections.sectionB),
          sectionC: mergeFields(prev.sectionC, mergedSections.sectionC),
          sectionD: mergeFields(prev.sectionD, mergedSections.sectionD),
          sectionE: mergeFields(prev.sectionE, mergedSections.sectionE),
        };
      });

      const photosTagged = allPhotoCategories.filter((c) => c.section && c.section !== "general").length;

      setAutoFilledFields(fieldCount);
      setAutoFilled(true);
      setAutoFillProgress("");
      setAutoFillSummary(
        (lastSummary || "Form fields pre-filled from photos.") +
        (photosTagged > 0 ? ` ${photosTagged} photo${photosTagged > 1 ? "s" : ""} auto-categorized.` : "")
      );
    } catch (err) {
      setAutoFillError(
        err instanceof Error ? err.message : "Auto-fill failed. You can still fill the form manually."
      );
    } finally {
      setAutoFilling(false);
      setAutoFillProgress("");
    }
  };

  // Step order: 0=Photos, 1=A, 2=B, 3=C, 4=D, 5=E, 6=Review
  const validateStep = useCallback(
    (step: number): string[] => {
      const errs: string[] = [];
      switch (step) {
        case 0: // Photos — optional but encouraged
          break;
        case 1: // Section A
          if (!data.sectionA.insuredName.trim()) errs.push("Insured name is required");
          if (!data.sectionA.address.trim()) errs.push("Property address is required");
          if (!data.sectionA.surveyorName.trim()) errs.push("Surveyor name is required");
          if (!data.sectionA.occupancy) errs.push("Occupancy type is required");
          break;
        case 2: // Section B
          if (!data.sectionB.structuralFrame) errs.push("Structural frame is required");
          if (!data.sectionB.externalWalls) errs.push("External walls is required");
          if (!data.sectionB.roofStructure) errs.push("Roof structure is required");
          if (!data.sectionB.buildingCondition) errs.push("Building condition is required");
          break;
        case 3: // Section C
          if (!data.sectionC.fireDetectionSystem) errs.push("Fire detection status is required");
          if (!data.sectionC.sprinklerSystem) errs.push("Sprinkler status is required");
          if (!data.sectionC.fireExtinguishers) errs.push("Fire extinguisher status is required");
          break;
        case 4: // Section D
          if (!data.sectionD.hazardousStorage) errs.push("Hazardous storage status is required");
          if (!data.sectionD.electricalInstallation) errs.push("Electrical installation condition is required");
          break;
        case 5: // Section E
          if (!data.sectionE.generalHousekeeping) errs.push("Housekeeping rating is required");
          if (!data.sectionE.maintenanceProgram) errs.push("Maintenance program is required");
          break;
        case 6: // Review
          if (!data.sectionA.address.trim()) errs.push("Property address is missing");
          if (!data.sectionA.surveyorName.trim()) errs.push("Surveyor name is missing");
          break;
      }
      return errs;
    },
    [data]
  );

  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    const nextStep = Math.min(currentStep + 1, WIZARD_STEPS.length - 1);
    window.history.pushState({ wizardStep: nextStep }, "");
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors([]);
    if (currentStep > 0) {
      // Use browser history.back() so popstate handler stays in sync
      window.history.back();
    }
  };

  const handleGoToStep = (step: number) => {
    setErrors([]);
    window.history.pushState({ wizardStep: step }, "");
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const errs = validateStep(6);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
    clearPhotos();
    onSubmit(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Photos first!
        return (
          <PhotoStep
            photos={data.photos}
            onChange={(photos) => {
              setData((prev) => ({ ...prev, photos }));
              savePhotos(photos);
            }}
          />
        );
      case 1:
        return (
          <SectionAForm
            data={data.sectionA}
            onChange={(sectionA) => setData((prev) => ({ ...prev, sectionA }))}
            onFireBrigadeFound={(station) =>
              setData((prev) => ({
                ...prev,
                sectionC: {
                  ...prev.sectionC,
                  fireBrigade: `${station.category} (${station.name}, ${station.distance} km)`,
                },
              }))
            }
          />
        );
      case 2:
        return (
          <SectionBForm
            data={data.sectionB}
            onChange={(sectionB) => setData((prev) => ({ ...prev, sectionB }))}
          />
        );
      case 3:
        return (
          <SectionCForm
            data={data.sectionC}
            onChange={(sectionC) => setData((prev) => ({ ...prev, sectionC }))}
          />
        );
      case 4:
        return (
          <SectionDForm
            data={data.sectionD}
            onChange={(sectionD) => setData((prev) => ({ ...prev, sectionD }))}
          />
        );
      case 5:
        return (
          <SectionEForm
            data={data.sectionE}
            onChange={(sectionE) => setData((prev) => ({ ...prev, sectionE }))}
          />
        );
      case 6:
        return <ReviewStep data={data} onGoToStep={handleGoToStep} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isPhotoStep = currentStep === 0;

  // ─── Choice screen: Resume or Start Fresh ───
  if (resumeState === "choosing") {
    return (
      <div className="mx-auto max-w-md py-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <RotateCcw className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Previous survey found
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You have a saved survey in progress:
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            &ldquo;{savedLabel}&rdquo;
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={loadSavedData}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4" />
              Continue Previous Survey
            </button>
            <button
              type="button"
              onClick={startFresh}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-gray-50"
            >
              <FilePlus2 className="h-4 w-4" />
              Start New Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading state ───
  if (resumeState === "checking") {
    return null;
  }

  // ─── Main form ───
  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator currentStep={currentStep} />

      {/* Auto-fill success banner */}
      {autoFilled && !autoFilling && currentStep > 0 && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                AI pre-filled {autoFilledFields} fields from your photos
              </p>
              <p className="mt-0.5 text-xs text-emerald-700">
                {autoFillSummary} Review and correct any fields below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Please fix the following:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-700">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step content */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        {renderStep()}
      </div>

      {/* Auto-fill banner after photo upload (shown on photo step) */}
      {isPhotoStep && data.photos.length > 0 && !autoFilled && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          {autoFilling ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  AI is analyzing your photos...
                </p>
                <p className="text-xs text-blue-700">
                  {autoFillProgress || "Extracting building details, categorizing photos, and pre-filling the checklist."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 sm:items-center sm:justify-between flex-col sm:flex-row">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-blue-600 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Auto-fill checklist from photos?
                  </p>
                  <p className="text-xs text-blue-700">
                    AI will scan your {data.photos.length} photo{data.photos.length > 1 ? "s" : ""}, auto-categorize them into sections, and pre-fill observable details. You can review and correct everything.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="mt-3 sm:mt-0 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                Auto-Fill
              </button>
            </div>
          )}
          {autoFillError && (
            <p className="mt-2 text-xs text-red-600">{autoFillError}</p>
          )}
        </div>
      )}

      {/* Already auto-filled indicator on photo step */}
      {isPhotoStep && autoFilled && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {autoFilledFields} fields pre-filled from photos
              </p>
              <p className="text-xs text-emerald-700">
                {autoFillSummary} Click Next to review the auto-filled checklist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl ${
                role === "analyst"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-light)]"
              }`}
            >
              {role === "analyst" ? (
                <>
                  <Send className="h-4 w-4" />
                  Submit for Analysis
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Survey
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={autoFilling}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--primary-light)] hover:shadow-xl disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
