"use client";

import type { SurveyDataV2 } from "@/lib/survey-types";
import { Building2 } from "lucide-react";

interface PropertySummaryProps {
  surveyData: SurveyDataV2;
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 break-inside-avoid">
      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-[var(--foreground)] leading-snug">
        {value || "\u2014"}
      </p>
    </div>
  );
}

export default function PropertySummary({ surveyData }: PropertySummaryProps) {
  const { sectionA, sectionB } = surveyData;

  return (
    <div className="rounded-3xl border border-gray-200 bg-[var(--surface)] p-6 sm:p-8 shadow-sm break-inside-avoid">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">Property Summary</h2>
          <p className="text-xs text-[var(--muted)]">Key details at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DataCard label="Insured" value={sectionA.insuredName} />
        <DataCard label="Address" value={sectionA.address} />
        <DataCard label="Occupancy" value={`${sectionA.occupancy}${sectionA.occupancyDetails ? ` \u2014 ${sectionA.occupancyDetails}` : ""}`} />
        <DataCard label="Plot Area" value={sectionA.plotArea ? `${sectionA.plotArea} sqm` : ""} />
        <DataCard label="Constructed Area" value={sectionA.constructedArea ? `${sectionA.constructedArea} sqm` : ""} />
        <DataCard label="GEO Code" value={sectionA.latitude && sectionA.longitude ? `${parseFloat(sectionA.latitude).toFixed(4)}, ${parseFloat(sectionA.longitude).toFixed(4)}` : ""} />
        <DataCard label="Flood Risk" value={sectionA.floodRiskLevel || ""} />
        <DataCard label="Building Age" value={sectionA.buildingAge ? `${sectionA.buildingAge} years` : ""} />
        <DataCard label="Floors" value={sectionA.numberOfFloors} />
        <DataCard label="Frame" value={sectionB.structuralFrame} />
        <DataCard label="Walls" value={sectionB.externalWalls} />
        <DataCard label="Roof" value={`${sectionB.roofStructure}${sectionB.roofCovering ? ` / ${sectionB.roofCovering}` : ""}`} />
        <DataCard label="Condition" value={sectionB.buildingCondition} />
        <DataCard label="Insulation" value={sectionB.insulationType} />
        <DataCard label="Surroundings" value={sectionA.surroundingExposures} />
      </div>
    </div>
  );
}
