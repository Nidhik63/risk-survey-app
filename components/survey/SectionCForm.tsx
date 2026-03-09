"use client";

import type { SectionC } from "@/lib/survey-types";
import SelectField from "@/components/fields/SelectField";
import TextField from "@/components/fields/TextField";
import YesNoField from "@/components/fields/YesNoField";
import { Flame } from "lucide-react";

interface SectionCFormProps {
  data: SectionC;
  onChange: (data: SectionC) => void;
}

const DETECTION_TYPE_OPTIONS = [
  { value: "Smoke Detectors", label: "Smoke Detectors" },
  { value: "Heat Detectors", label: "Heat Detectors" },
  { value: "Beam Detectors", label: "Beam Detectors" },
  { value: "VESDA", label: "VESDA (Aspirating)" },
  { value: "Multi-Sensor", label: "Multi-Sensor" },
  { value: "Other", label: "Other" },
];

const SPRINKLER_TYPE_OPTIONS = [
  { value: "Wet Pipe", label: "Wet Pipe" },
  { value: "Dry Pipe", label: "Dry Pipe" },
  { value: "Deluge", label: "Deluge" },
  { value: "Pre-Action", label: "Pre-Action" },
  { value: "Foam", label: "Foam System" },
  { value: "Other", label: "Other" },
];

const COVERAGE_OPTIONS = [
  { value: "Full", label: "Full Coverage" },
  { value: "Partial", label: "Partial Coverage" },
];

const EXTINGUISHER_OPTIONS = [
  { value: "CO2", label: "CO2" },
  { value: "DCP", label: "Dry Chemical Powder (DCP)" },
  { value: "Foam", label: "Foam (AFFF)" },
  { value: "Water", label: "Water" },
  { value: "Mixed Types", label: "Mixed Types" },
];

const EXIT_OPTIONS = [
  { value: "Adequate", label: "Adequate" },
  { value: "Inadequate", label: "Inadequate" },
];

const BRIGADE_OPTIONS = [
  { value: "Public - Within 5 km", label: "Public - Within 5 km" },
  { value: "Public - 5-15 km", label: "Public - 5-15 km" },
  { value: "Public - Over 15 km", label: "Public - Over 15 km" },
  { value: "Private On-Site", label: "Private On-Site" },
  { value: "Private Nearby", label: "Private Nearby" },
];

export default function SectionCForm({ data, onChange }: SectionCFormProps) {
  const update = (field: keyof SectionC, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <Flame className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section C: Fire Protection
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Detection systems, sprinklers, extinguishers, and emergency procedures
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Fire Detection */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Fire Detection</h3>
          <div className="space-y-4">
            <YesNoField
              label="Fire Detection System Installed?"
              value={data.fireDetectionSystem}
              onChange={(v) => update("fireDetectionSystem", v)}
              required
            />
            {data.fireDetectionSystem === "Yes" && (
              <SelectField
                label="Detection Type"
                value={data.detectionType}
                onChange={(v) => update("detectionType", v)}
                options={DETECTION_TYPE_OPTIONS}
              />
            )}
            <YesNoField
              label="Fire Alarm Panel?"
              value={data.fireAlarmPanel}
              onChange={(v) => update("fireAlarmPanel", v)}
            />
          </div>
        </div>

        {/* Sprinkler System */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Sprinkler System</h3>
          <div className="space-y-4">
            <YesNoField
              label="Sprinkler System Installed?"
              value={data.sprinklerSystem}
              onChange={(v) => update("sprinklerSystem", v)}
              required
            />
            {data.sprinklerSystem === "Yes" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Sprinkler Type"
                  value={data.sprinklerType}
                  onChange={(v) => update("sprinklerType", v)}
                  options={SPRINKLER_TYPE_OPTIONS}
                />
                <SelectField
                  label="Coverage"
                  value={data.sprinklerCoverage}
                  onChange={(v) => update("sprinklerCoverage", v)}
                  options={COVERAGE_OPTIONS}
                />
              </div>
            )}
          </div>
        </div>

        {/* Portable & Fixed Protection */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Portable & Fixed Protection</h3>
          <div className="space-y-4">
            <YesNoField
              label="Fire Extinguishers Available?"
              value={data.fireExtinguishers}
              onChange={(v) => update("fireExtinguishers", v)}
              required
            />
            {data.fireExtinguishers === "Yes" && (
              <SelectField
                label="Extinguisher Types"
                value={data.extinguisherTypes}
                onChange={(v) => update("extinguisherTypes", v)}
                options={EXTINGUISHER_OPTIONS}
              />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <YesNoField
                label="Fire Hose Reels?"
                value={data.fireHoseReels}
                onChange={(v) => update("fireHoseReels", v)}
              />
              <YesNoField
                label="External Hydrants?"
                value={data.externalHydrants}
                onChange={(v) => update("externalHydrants", v)}
              />
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Emergency Preparedness</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Emergency Exits"
                value={data.emergencyExits}
                onChange={(v) => update("emergencyExits", v)}
                options={EXIT_OPTIONS}
              />
              <SelectField
                label="Nearest Fire Brigade"
                value={data.fireBrigade}
                onChange={(v) => update("fireBrigade", v)}
                options={BRIGADE_OPTIONS}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Last Fire Drill Date"
                value={data.lastFireDrillDate}
                onChange={(v) => update("lastFireDrillDate", v)}
                type="date"
              />
              <YesNoField
                label="Hot Work Procedures in Place?"
                value={data.hotWorkProcedures}
                onChange={(v) => update("hotWorkProcedures", v)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
