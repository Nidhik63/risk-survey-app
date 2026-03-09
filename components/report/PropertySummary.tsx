"use client";

import type { SurveyDataV2 } from "@/lib/survey-types";
import { Building2 } from "lucide-react";

interface PropertySummaryProps {
  surveyData: SurveyDataV2;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 py-2.5 last:border-0">
      <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-[var(--foreground)] text-right max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function PropertySummary({ surveyData }: PropertySummaryProps) {
  const { sectionA, sectionB } = surveyData;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">Property Summary</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2">General Details</h3>
          <SummaryRow label="Insured" value={sectionA.insuredName} />
          <SummaryRow label="Address" value={sectionA.address} />
          <SummaryRow label="Occupancy" value={`${sectionA.occupancy}${sectionA.occupancyDetails ? ` — ${sectionA.occupancyDetails}` : ""}`} />
          <SummaryRow label="Total Area" value={sectionA.totalArea ? `${sectionA.totalArea} sq m` : ""} />
          <SummaryRow label="Building Age" value={sectionA.buildingAge ? `${sectionA.buildingAge} years` : ""} />
          <SummaryRow label="Floors" value={sectionA.numberOfFloors} />
          <SummaryRow label="Basements" value={sectionA.numberOfBasements} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2">Construction</h3>
          <SummaryRow label="Frame" value={sectionB.structuralFrame} />
          <SummaryRow label="External Walls" value={sectionB.externalWalls} />
          <SummaryRow label="Roof Structure" value={sectionB.roofStructure} />
          <SummaryRow label="Roof Covering" value={sectionB.roofCovering} />
          <SummaryRow label="Insulation" value={sectionB.insulationType} />
          <SummaryRow label="Condition" value={sectionB.buildingCondition} />
        </div>
      </div>
    </div>
  );
}
