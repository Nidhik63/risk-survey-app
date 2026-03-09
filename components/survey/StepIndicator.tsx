"use client";

import { Check } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/survey-types";

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Mobile: simple text */}
      <div className="flex items-center justify-between sm:hidden">
        <span className="text-sm font-medium text-[var(--primary)]">
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </span>
        <span className="text-sm text-[var(--muted)]">
          {WIZARD_STEPS[currentStep].title}
        </span>
      </div>
      {/* Mobile progress bar */}
      <div className="mt-2 h-2 w-full rounded-full bg-gray-200 sm:hidden">
        <div
          className="h-2 rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* Desktop: step dots */}
      <div className="hidden sm:flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20"
                      : "border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium text-center max-w-[80px] ${
                    isCurrent
                      ? "text-[var(--primary)]"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
