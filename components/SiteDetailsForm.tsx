"use client";

import { Building2, MapPin, Calendar, Layers, Users, User } from "lucide-react";
import type { SiteDetails } from "@/lib/risk-scoring";

interface SiteDetailsFormProps {
  siteDetails: SiteDetails;
  onSiteDetailsChange: (details: SiteDetails) => void;
}

const BUILDING_TYPES = [
  "Residential - Single Family",
  "Residential - Multi Family",
  "Commercial - Office",
  "Commercial - Retail",
  "Industrial - Warehouse",
  "Industrial - Manufacturing",
  "Mixed Use",
  "Institutional",
  "Other",
];

const OCCUPANCY_TYPES = [
  "Owner Occupied",
  "Tenant Occupied",
  "Vacant",
  "Partially Occupied",
];

export default function SiteDetailsForm({
  siteDetails,
  onSiteDetailsChange,
}: SiteDetailsFormProps) {
  const update = (field: keyof SiteDetails, value: string) => {
    onSiteDetailsChange({ ...siteDetails, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        Site Details
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Surveyor Name */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <User className="h-4 w-4 text-[var(--primary)]" />
            Surveyor Name
          </label>
          <input
            type="text"
            value={siteDetails.surveyorName}
            onChange={(e) => update("surveyorName", e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100 placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <MapPin className="h-4 w-4 text-[var(--primary)]" />
            Property Address
          </label>
          <input
            type="text"
            value={siteDetails.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Enter full property address"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100 placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Building Type */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Building2 className="h-4 w-4 text-[var(--primary)]" />
            Building Type
          </label>
          <select
            value={siteDetails.buildingType}
            onChange={(e) => update("buildingType", e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select type...</option>
            {BUILDING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Year Built */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Calendar className="h-4 w-4 text-[var(--primary)]" />
            Year Built
          </label>
          <input
            type="text"
            value={siteDetails.yearBuilt}
            onChange={(e) => update("yearBuilt", e.target.value)}
            placeholder="e.g. 1995"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100 placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Floors */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Layers className="h-4 w-4 text-[var(--primary)]" />
            Number of Floors
          </label>
          <input
            type="text"
            value={siteDetails.floors}
            onChange={(e) => update("floors", e.target.value)}
            placeholder="e.g. 3"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100 placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Occupancy */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Users className="h-4 w-4 text-[var(--primary)]" />
            Occupancy
          </label>
          <select
            value={siteDetails.occupancy}
            onChange={(e) => update("occupancy", e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select occupancy...</option>
            {OCCUPANCY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
