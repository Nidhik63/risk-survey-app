"use client";

import { Shield } from "lucide-react";
import type { SurveyDataV2 } from "@/lib/survey-types";

interface CoverPageProps {
  surveyData: SurveyDataV2;
  reportRef: string;
}

export default function CoverPage({ surveyData, reportRef }: CoverPageProps) {
  const { sectionA } = surveyData;
  const date = new Date(sectionA.dateOfSurvey || Date.now()).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#2a5298] to-[#1e3a5f] p-8 text-white shadow-xl sm:p-12">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">RiskLens</h1>
            <p className="text-xs font-medium text-blue-200">AI-Powered Risk Engineering</p>
          </div>
        </div>

        {/* Report title */}
        <div className="mt-10 sm:mt-14">
          <div className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200">
            Confidential
          </div>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Risk Inspection Report
          </h2>
          <div className="mt-2 h-1 w-20 rounded-full bg-amber-400" />
        </div>

        {/* Property details */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Insured</p>
            <p className="mt-1 text-lg font-bold">{sectionA.insuredName || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Property Address</p>
            <p className="mt-1 text-lg font-bold">{sectionA.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Date of Inspection</p>
            <p className="mt-1 text-lg font-bold">{date}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Surveyor</p>
            <p className="mt-1 text-lg font-bold">{sectionA.surveyorName || "—"}</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/20 pt-6">
          <div>
            <p className="text-xs text-blue-300">Report Reference</p>
            <p className="text-sm font-bold">{reportRef}</p>
          </div>
          <div>
            <p className="text-xs text-blue-300">Occupancy</p>
            <p className="text-sm font-bold">{sectionA.occupancy || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-blue-300">Total Area</p>
            <p className="text-sm font-bold">{sectionA.totalArea ? `${sectionA.totalArea} sq m` : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
