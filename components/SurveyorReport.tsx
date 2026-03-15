"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  ArrowLeft,
  Shield,
  Camera,
  Building2,
  HardHat,
  Flame,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import type { SurveyDataV2 } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import { exportSurveyToDocx } from "@/lib/docx-survey-export";

interface SurveyorReportProps {
  surveyData: SurveyDataV2;
  onBack: () => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  A: Building2,
  B: HardHat,
  C: Flame,
  D: AlertTriangle,
  E: Wrench,
};

function countFilled(obj: Record<string, string>): { filled: number; total: number } {
  const entries = Object.values(obj);
  return {
    filled: entries.filter((v) => v && v.trim()).length,
    total: entries.length,
  };
}

export default function SurveyorReport({ surveyData, onBack }: SurveyorReportProps) {
  const [exportingWord, setExportingWord] = useState(false);

  const address = surveyData.sectionA.address || "survey";
  const date = new Date().toISOString().split("T")[0];
  const reportRef = `NTRU-${Date.now().toString(36).toUpperCase()}`;

  const handleDownloadJSON = () => {
    const filename = `NTRU-Survey-${address.replace(/[^a-zA-Z0-9]/g, "-")}-${date}.json`;
    const blob = new Blob([JSON.stringify(surveyData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    setExportingWord(true);
    try {
      const filename = `NTRU-Survey-${address.replace(/[^a-zA-Z0-9]/g, "-")}-${date}.docx`;
      await exportSurveyToDocx(surveyData, reportRef, filename);
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setExportingWord(false);
    }
  };

  const sections = [
    { id: "A", data: surveyData.sectionA },
    { id: "B", data: surveyData.sectionB },
    { id: "C", data: surveyData.sectionC },
    { id: "D", data: surveyData.sectionD },
    { id: "E", data: surveyData.sectionE },
  ];

  const totalPhotos = surveyData.photos.length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">New Survey</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3D1556]">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-[var(--foreground)] tracking-tight hidden sm:inline">
              NTRU
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handleExportWord}
              disabled={exportingWord}
              className="flex items-center gap-1.5 rounded-xl bg-[#3D1556] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#5B2D8E] disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              {exportingWord ? "Generating..." : "Word"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Success Banner */}
        <div className="mb-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800">
            Survey Data Saved
          </h1>
          <p className="mt-2 text-sm text-emerald-700 max-w-md mx-auto">
            Your survey data has been downloaded as a JSON file. Please send it to the NTRU analyst team for report generation.
          </p>
          <p className="mt-3 text-xs text-emerald-600">
            You can also export as Word document using the button above.
          </p>
        </div>

        {/* Property Summary */}
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            Property Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Insured Name", value: surveyData.sectionA.insuredName },
              { label: "Address", value: surveyData.sectionA.address },
              { label: "Surveyor", value: surveyData.sectionA.surveyorName },
              { label: "Date", value: surveyData.sectionA.dateOfSurvey },
              { label: "Occupancy", value: surveyData.sectionA.occupancy },
              { label: "Floors", value: surveyData.sectionA.numberOfFloors },
            ].map((item) => (
              <div key={item.label} className="flex justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-xs font-medium text-[var(--muted)]">{item.label}</span>
                <span className="text-xs font-bold text-[var(--foreground)]">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Completion Summary */}
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            Sections Completed
          </h2>
          <div className="space-y-3">
            {sections.map((section) => {
              const meta = SECTION_META.find((m) => m.id === section.id);
              const Icon = SECTION_ICONS[section.id] || Building2;
              const { filled, total } = countFilled(section.data as unknown as Record<string, string>);
              const pct = Math.round((filled / total) * 100);

              return (
                <div key={section.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                    <Icon className="h-4 w-4 text-[#3D1556]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      Section {section.id}: {meta?.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3D1556] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--muted)]">
                        {filled}/{total}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo Summary */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-[var(--muted)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Photos
            </h2>
            <span className="ml-auto rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-[#3D1556]">
              {totalPhotos} total
            </span>
          </div>

          {totalPhotos > 0 ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {surveyData.photos.slice(0, 24).map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={photo.dataUrl} alt={photo.caption || `Photo ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
              {totalPhotos > 24 && (
                <div className="aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--muted)]">+{totalPhotos - 24}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No photos uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}
