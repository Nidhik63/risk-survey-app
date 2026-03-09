"use client";

import type { SectionA } from "@/lib/survey-types";
import TextField from "@/components/fields/TextField";
import SelectField from "@/components/fields/SelectField";
import TextAreaField from "@/components/fields/TextAreaField";
import { Building2 } from "lucide-react";

interface SectionAFormProps {
  data: SectionA;
  onChange: (data: SectionA) => void;
}

const OCCUPANCY_OPTIONS = [
  { value: "Warehouse", label: "Warehouse" },
  { value: "Manufacturing", label: "Manufacturing / Factory" },
  { value: "Manufacturing + Warehouse", label: "Manufacturing + Warehouse" },
  { value: "Manufacturing + Warehouse + Office", label: "Manufacturing + Warehouse + Office" },
  { value: "Office", label: "Office Building" },
  { value: "Retail", label: "Retail / Shopping" },
  { value: "Residential", label: "Residential" },
  { value: "Mixed Use", label: "Mixed Use" },
  { value: "Industrial", label: "Industrial" },
  { value: "Cold Storage", label: "Cold Storage" },
  { value: "Food Processing", label: "Food Processing" },
  { value: "Chemical", label: "Chemical / Petrochemical" },
  { value: "Logistics", label: "Logistics / Distribution" },
  { value: "Other", label: "Other" },
];

export default function SectionAForm({ data, onChange }: SectionAFormProps) {
  const update = (field: keyof SectionA, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section A: General Information
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Property details, occupancy, and contact information
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Insured / Company Name"
            value={data.insuredName}
            onChange={(v) => update("insuredName", v)}
            placeholder="e.g. Acme Corporation"
            required
          />
          <TextField
            label="Survey Date"
            value={data.dateOfSurvey}
            onChange={(v) => update("dateOfSurvey", v)}
            type="date"
            required
          />
        </div>

        <TextField
          label="Property Address"
          value={data.address}
          onChange={(v) => update("address", v)}
          placeholder="Full address of the insured property"
          required
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Contact Person"
            value={data.contactPerson}
            onChange={(v) => update("contactPerson", v)}
            placeholder="Site contact name"
          />
          <TextField
            label="Contact Phone"
            value={data.contactPhone}
            onChange={(v) => update("contactPhone", v)}
            placeholder="+971 50 123 4567"
            type="tel"
          />
        </div>

        <TextField
          label="Surveyor Name"
          value={data.surveyorName}
          onChange={(v) => update("surveyorName", v)}
          placeholder="Your name"
          required
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Occupancy Type"
            value={data.occupancy}
            onChange={(v) => update("occupancy", v)}
            options={OCCUPANCY_OPTIONS}
            required
          />
          <TextField
            label="Occupancy Details"
            value={data.occupancyDetails}
            onChange={(v) => update("occupancyDetails", v)}
            placeholder="Describe what is stored/manufactured"
          />
        </div>

        {data.occupancy === "Other" && (
          <TextField
            label="Please specify occupancy type"
            value={data.occupancyOther || ""}
            onChange={(v) => update("occupancyOther" as keyof SectionA, v)}
            placeholder="e.g. Data Center, Hospital, School, etc."
            required
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TextField
            label="Building Age (Years)"
            value={data.buildingAge}
            onChange={(v) => update("buildingAge", v)}
            placeholder="e.g. 15"
            type="number"
          />
          <TextField
            label="Total Area (sq m)"
            value={data.totalArea}
            onChange={(v) => update("totalArea", v)}
            placeholder="e.g. 5000"
            type="number"
          />
          <TextField
            label="Number of Floors"
            value={data.numberOfFloors}
            onChange={(v) => update("numberOfFloors", v)}
            placeholder="e.g. 2"
            type="number"
          />
        </div>

        <TextField
          label="Number of Basements"
          value={data.numberOfBasements}
          onChange={(v) => update("numberOfBasements", v)}
          placeholder="e.g. 0"
          type="number"
        />

        <TextAreaField
          label="Surrounding Exposures"
          value={data.surroundingExposures}
          onChange={(v) => update("surroundingExposures", v)}
          placeholder="Describe neighboring buildings, roads, hazards, open land, etc."
          helper="Note any nearby fire hazards, chemical plants, fuel stations, or flood-prone areas"
        />
      </div>
    </div>
  );
}
