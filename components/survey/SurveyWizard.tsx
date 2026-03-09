"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Send, Save } from "lucide-react";
import type { SurveyDataV2 } from "@/lib/survey-types";
import { WIZARD_STEPS } from "@/lib/survey-types";
import { defaultSurveyData } from "@/lib/survey-defaults";
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
}

const STORAGE_KEY = "risklens-v2-survey";

export default function SurveyWizard({ onSubmit }: SurveyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SurveyDataV2>(defaultSurveyData);
  const [errors, setErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore all fields except photos (too large for localStorage)
        setData((prev) => ({
          ...prev,
          sectionA: parsed.sectionA || prev.sectionA,
          sectionB: parsed.sectionB || prev.sectionB,
          sectionC: parsed.sectionC || prev.sectionC,
          sectionD: parsed.sectionD || prev.sectionD,
          sectionE: parsed.sectionE || prev.sectionE,
        }));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Auto-save to localStorage (excluding photos)
  useEffect(() => {
    if (!loaded) return;
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
  }, [data, loaded]);

  const validateStep = useCallback(
    (step: number): string[] => {
      const errs: string[] = [];
      switch (step) {
        case 0: // Section A
          if (!data.sectionA.insuredName.trim()) errs.push("Insured name is required");
          if (!data.sectionA.address.trim()) errs.push("Property address is required");
          if (!data.sectionA.surveyorName.trim()) errs.push("Surveyor name is required");
          if (!data.sectionA.occupancy) errs.push("Occupancy type is required");
          break;
        case 1: // Section B
          if (!data.sectionB.structuralFrame) errs.push("Structural frame is required");
          if (!data.sectionB.externalWalls) errs.push("External walls is required");
          if (!data.sectionB.roofStructure) errs.push("Roof structure is required");
          if (!data.sectionB.buildingCondition) errs.push("Building condition is required");
          break;
        case 2: // Section C
          if (!data.sectionC.fireDetectionSystem) errs.push("Fire detection status is required");
          if (!data.sectionC.sprinklerSystem) errs.push("Sprinkler status is required");
          if (!data.sectionC.fireExtinguishers) errs.push("Fire extinguisher status is required");
          break;
        case 3: // Section D
          if (!data.sectionD.hazardousStorage) errs.push("Hazardous storage status is required");
          if (!data.sectionD.electricalInstallation) errs.push("Electrical installation condition is required");
          break;
        case 4: // Section E
          if (!data.sectionE.generalHousekeeping) errs.push("Housekeeping rating is required");
          if (!data.sectionE.maintenanceProgram) errs.push("Maintenance program is required");
          break;
        case 5: // Photos — optional but encouraged
          break;
        case 6: // Review — validate all required fields one more time
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
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToStep = (step: number) => {
    setErrors([]);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const errs = validateStep(6);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    // Clear saved data
    localStorage.removeItem(STORAGE_KEY);
    onSubmit(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SectionAForm
            data={data.sectionA}
            onChange={(sectionA) => setData((prev) => ({ ...prev, sectionA }))}
          />
        );
      case 1:
        return (
          <SectionBForm
            data={data.sectionB}
            onChange={(sectionB) => setData((prev) => ({ ...prev, sectionB }))}
          />
        );
      case 2:
        return (
          <SectionCForm
            data={data.sectionC}
            onChange={(sectionC) => setData((prev) => ({ ...prev, sectionC }))}
          />
        );
      case 3:
        return (
          <SectionDForm
            data={data.sectionD}
            onChange={(sectionD) => setData((prev) => ({ ...prev, sectionD }))}
          />
        );
      case 4:
        return (
          <SectionEForm
            data={data.sectionE}
            onChange={(sectionE) => setData((prev) => ({ ...prev, sectionE }))}
          />
        );
      case 5:
        return (
          <PhotoStep
            photos={data.photos}
            onChange={(photos) => setData((prev) => ({ ...prev, photos }))}
          />
        );
      case 6:
        return <ReviewStep data={data} onGoToStep={handleGoToStep} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator currentStep={currentStep} />

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
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              <Send className="h-4 w-4" />
              Submit for Analysis
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--primary-light)] hover:shadow-xl"
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
