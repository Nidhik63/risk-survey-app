"use client";

import type { SectionD } from "@/lib/survey-types";
import SelectField from "@/components/fields/SelectField";
import TextField from "@/components/fields/TextField";
import TextAreaField from "@/components/fields/TextAreaField";
import YesNoField from "@/components/fields/YesNoField";
import { AlertTriangle } from "lucide-react";

interface SectionDFormProps {
  data: SectionD;
  onChange: (data: SectionD) => void;
}

const CONDITION_OPTIONS = [
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

const SMOKING_OPTIONS = [
  { value: "Prohibited", label: "Smoking Prohibited" },
  { value: "Designated Areas", label: "Designated Smoking Areas" },
  { value: "Unrestricted", label: "Unrestricted" },
];

const STORAGE_OPTIONS = [
  { value: "Segregated", label: "Segregated (Separate Store)" },
  { value: "Mixed", label: "Mixed with General Storage" },
  { value: "N/A", label: "N/A" },
];

export default function SectionDForm({ data, onChange }: SectionDFormProps) {
  const update = (field: keyof SectionD, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section D: EHS / Hazard Information
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Hazardous materials, electrical safety, and environmental risks
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Hazardous Materials */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Hazardous Materials</h3>
          <div className="space-y-4">
            <YesNoField
              label="Hazardous Materials Stored on Site?"
              value={data.hazardousStorage}
              onChange={(v) => update("hazardousStorage", v)}
              required
            />
            {data.hazardousStorage === "Yes" && (
              <>
                <TextAreaField
                  label="Types of Hazardous Materials"
                  value={data.hazardousMaterials}
                  onChange={(v) => update("hazardousMaterials", v)}
                  placeholder="e.g. Paints, solvents, chemicals, gases"
                  rows={2}
                />
                <SelectField
                  label="Storage Arrangement"
                  value={data.storageArrangement}
                  onChange={(v) => update("storageArrangement", v)}
                  options={STORAGE_OPTIONS}
                />
              </>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Flammable Liquid Storage"
                value={data.flammableLiquidStorage}
                onChange={(v) => update("flammableLiquidStorage", v)}
                placeholder="Type & quantity if any"
              />
              <TextField
                label="LPG / Gas Storage"
                value={data.lpgStorage}
                onChange={(v) => update("lpgStorage", v)}
                placeholder="Type & quantity if any"
              />
            </div>
          </div>
        </div>

        {/* Electrical */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Electrical Safety</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Electrical Installation Condition"
                value={data.electricalInstallation}
                onChange={(v) => update("electricalInstallation", v)}
                options={CONDITION_OPTIONS}
                required
              />
              <TextField
                label="Last Electrical Maintenance"
                value={data.electricalMaintDate}
                onChange={(v) => update("electricalMaintDate", v)}
                type="date"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <YesNoField
                label="Lightning Protection?"
                value={data.lightningProtection}
                onChange={(v) => update("lightningProtection", v)}
              />
              <YesNoField
                label="Emergency Lighting?"
                value={data.emergencyLighting}
                onChange={(v) => update("emergencyLighting", v)}
              />
            </div>
          </div>
        </div>

        {/* Other Hazards */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Other Hazards</h3>
          <div className="space-y-4">
            <SelectField
              label="Smoking Policy"
              value={data.smokingPolicy}
              onChange={(v) => update("smokingPolicy", v)}
              options={SMOKING_OPTIONS}
            />
            <YesNoField
              label="Dust Hazard Present?"
              value={data.dustHazard}
              onChange={(v) => update("dustHazard", v)}
              helper="e.g. Grain, wood, paper, or metal dust"
            />
            <TextAreaField
              label="Process Hazards"
              value={data.processHazards}
              onChange={(v) => update("processHazards", v)}
              placeholder="Describe any manufacturing or process-related hazards"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
