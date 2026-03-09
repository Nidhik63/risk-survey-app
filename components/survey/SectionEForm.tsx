"use client";

import type { SectionE } from "@/lib/survey-types";
import SelectField from "@/components/fields/SelectField";
import TextField from "@/components/fields/TextField";
import TextAreaField from "@/components/fields/TextAreaField";
import YesNoField from "@/components/fields/YesNoField";
import { Wrench } from "lucide-react";

interface SectionEFormProps {
  data: SectionE;
  onChange: (data: SectionE) => void;
}

const CONDITION_OPTIONS = [
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

const MAINTENANCE_OPTIONS = [
  { value: "Planned", label: "Planned / Preventive" },
  { value: "Reactive", label: "Reactive (Break-Fix)" },
  { value: "None", label: "None / Unknown" },
];

const SECURITY_OPTIONS = [
  { value: "Security Guards", label: "Security Guards (24/7)" },
  { value: "Guards + CCTV", label: "Guards + CCTV" },
  { value: "CCTV Only", label: "CCTV Only" },
  { value: "Alarm System", label: "Alarm System Only" },
  { value: "Minimal", label: "Minimal / None" },
];

const NATCAT_OPTIONS = [
  { value: "None", label: "None / Minimal" },
  { value: "Earthquake", label: "Earthquake Zone" },
  { value: "Cyclone", label: "Cyclone / Hurricane" },
  { value: "Flood", label: "Flood Prone" },
  { value: "Sandstorm", label: "Sandstorm" },
  { value: "Multiple", label: "Multiple Exposures" },
];

export default function SectionEForm({ data, onChange }: SectionEFormProps) {
  const update = (field: keyof SectionE, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Wrench className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section E: Housekeeping & Maintenance
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Maintenance programs, security, and natural catastrophe exposure
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Housekeeping */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Housekeeping</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="General Housekeeping"
                value={data.generalHousekeeping}
                onChange={(v) => update("generalHousekeeping", v)}
                options={CONDITION_OPTIONS}
                required
              />
              <SelectField
                label="Waste Management"
                value={data.wasteManagement}
                onChange={(v) => update("wasteManagement", v)}
                options={CONDITION_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Maintenance Programs</h3>
          <div className="space-y-4">
            <SelectField
              label="Maintenance Program"
              value={data.maintenanceProgram}
              onChange={(v) => update("maintenanceProgram", v)}
              options={MAINTENANCE_OPTIONS}
              required
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextField
                label="Roof Maintenance"
                value={data.roofMaintenance}
                onChange={(v) => update("roofMaintenance", v)}
                placeholder="Last inspected"
              />
              <TextField
                label="Electrical Maintenance"
                value={data.electricalMaintenance}
                onChange={(v) => update("electricalMaintenance", v)}
                placeholder="Last inspected"
              />
              <TextField
                label="Fire Safety Maintenance"
                value={data.fireSafetyMaintenance}
                onChange={(v) => update("fireSafetyMaintenance", v)}
                placeholder="Last inspected"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Security</h3>
          <div className="space-y-4">
            <SelectField
              label="Security Arrangements"
              value={data.securityArrangements}
              onChange={(v) => update("securityArrangements", v)}
              options={SECURITY_OPTIONS}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <YesNoField
                label="Perimeter Fencing?"
                value={data.perimeterFencing}
                onChange={(v) => update("perimeterFencing", v)}
              />
              <YesNoField
                label="Access Control?"
                value={data.accessControl}
                onChange={(v) => update("accessControl", v)}
              />
            </div>
          </div>
        </div>

        {/* Natural Catastrophe */}
        <div className="rounded-xl border border-[var(--border)] bg-gray-50/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Natural Catastrophe Exposure</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <YesNoField
                label="Flood Exposure?"
                value={data.floodExposure}
                onChange={(v) => update("floodExposure", v)}
              />
              <SelectField
                label="Natural Cat Exposure"
                value={data.naturalCatExposure}
                onChange={(v) => update("naturalCatExposure", v)}
                options={NATCAT_OPTIONS}
              />
            </div>
            <YesNoField
              label="Business Continuity Plan in Place?"
              value={data.businessContinuityPlan}
              onChange={(v) => update("businessContinuityPlan", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
