"use client";

import type { SectionB } from "@/lib/survey-types";
import SelectField from "@/components/fields/SelectField";
import TextField from "@/components/fields/TextField";
import TextAreaField from "@/components/fields/TextAreaField";
import { HardHat } from "lucide-react";

interface SectionBFormProps {
  data: SectionB;
  onChange: (data: SectionB) => void;
}

const FRAME_OPTIONS = [
  { value: "RCC", label: "RCC (Reinforced Concrete)" },
  { value: "Steel Frame", label: "Steel Frame" },
  { value: "Load Bearing", label: "Load Bearing Masonry" },
  { value: "Pre-Engineered", label: "Pre-Engineered Metal Building" },
  { value: "Composite", label: "Composite / Hybrid" },
  { value: "Timber", label: "Timber Frame" },
  { value: "Other", label: "Other" },
];

const WALL_OPTIONS = [
  { value: "Concrete Block", label: "Concrete Block / CMU" },
  { value: "Sandwich Panel", label: "Sandwich Panel (Insulated)" },
  { value: "Metal Cladding", label: "Metal Cladding / Profiled Sheet" },
  { value: "Brick", label: "Brick Masonry" },
  { value: "Precast Concrete", label: "Precast Concrete" },
  { value: "Curtain Wall", label: "Curtain Wall (Glass)" },
  { value: "Other", label: "Other" },
];

const ROOF_STRUCTURE_OPTIONS = [
  { value: "RCC Slab", label: "RCC Slab" },
  { value: "Metal Deck", label: "Metal Deck on Steel" },
  { value: "Metal Truss", label: "Metal Truss" },
  { value: "Portal Frame", label: "Portal Frame" },
  { value: "Timber Truss", label: "Timber Truss" },
  { value: "Other", label: "Other" },
];

const ROOF_COVERING_OPTIONS = [
  { value: "Metal Sheet", label: "Metal Profiled Sheet" },
  { value: "Built-up", label: "Built-up Roofing" },
  { value: "Single Ply", label: "Single Ply Membrane" },
  { value: "Concrete Tile", label: "Concrete / Clay Tile" },
  { value: "Sandwich Panel", label: "Insulated Sandwich Panel" },
  { value: "Other", label: "Other" },
];

const FLOOR_OPTIONS = [
  { value: "Concrete", label: "Concrete (Ground Slab)" },
  { value: "Raised Floor", label: "Raised Floor" },
  { value: "Tiled", label: "Tiled" },
  { value: "Epoxy Coated", label: "Epoxy Coated" },
  { value: "Other", label: "Other" },
];

const INSULATION_OPTIONS = [
  { value: "Non-Combustible", label: "Non-Combustible (Mineral Wool / Glass Wool)" },
  { value: "Combustible", label: "Combustible (EPS / PU Foam)" },
  { value: "None", label: "None / Unknown" },
];

const CONDITION_OPTIONS = [
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

export default function SectionBForm({ data, onChange }: SectionBFormProps) {
  const update = (field: keyof SectionB, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
          <HardHat className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section B: Construction Details
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Structural frame, walls, roof, and building condition
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Structural Frame"
            value={data.structuralFrame}
            onChange={(v) => update("structuralFrame", v)}
            options={FRAME_OPTIONS}
            required
          />
          <SelectField
            label="External Walls"
            value={data.externalWalls}
            onChange={(v) => update("externalWalls", v)}
            options={WALL_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Roof Structure"
            value={data.roofStructure}
            onChange={(v) => update("roofStructure", v)}
            options={ROOF_STRUCTURE_OPTIONS}
            required
          />
          <SelectField
            label="Roof Covering"
            value={data.roofCovering}
            onChange={(v) => update("roofCovering", v)}
            options={ROOF_COVERING_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Floor Type"
            value={data.floorType}
            onChange={(v) => update("floorType", v)}
            options={FLOOR_OPTIONS}
          />
          <TextField
            label="Ceiling Type"
            value={data.ceilingType}
            onChange={(v) => update("ceilingType", v)}
            placeholder="e.g. Exposed structure, Suspended ceiling"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Insulation Type"
            value={data.insulationType}
            onChange={(v) => update("insulationType", v)}
            options={INSULATION_OPTIONS}
            helper="Combustible insulation (EPS/PU) is a significant fire risk"
          />
          <TextField
            label="Mezzanine Floors"
            value={data.mezzanineFloors}
            onChange={(v) => update("mezzanineFloors", v)}
            placeholder="e.g. Yes - steel mezzanine on north side"
          />
        </div>

        <SelectField
          label="Overall Building Condition"
          value={data.buildingCondition}
          onChange={(v) => update("buildingCondition", v)}
          options={CONDITION_OPTIONS}
          required
        />

        <TextAreaField
          label="Structural Concerns"
          value={data.structuralConcerns}
          onChange={(v) => update("structuralConcerns", v)}
          placeholder="Note any visible cracks, settlement, corrosion, water damage, etc."
        />
      </div>
    </div>
  );
}
