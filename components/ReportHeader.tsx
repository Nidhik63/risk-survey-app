"use client";

import { Shield, MapPin, Building2, Calendar } from "lucide-react";
import type { SiteDetails } from "@/lib/risk-scoring";

interface ReportHeaderProps {
  siteDetails: SiteDetails;
  date: string;
}

export default function ReportHeader({ siteDetails, date }: ReportHeaderProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RiskLens</h1>
            <p className="text-sm text-blue-200">
              Property Risk Assessment Report
            </p>
          </div>
        </div>
        <div className="text-sm text-blue-100">
          <p className="font-medium">Report Generated</p>
          <p>{date}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200">Address</p>
            <p className="text-sm font-medium">{siteDetails.address || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200">Building Type</p>
            <p className="text-sm font-medium">
              {siteDetails.buildingType || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200">Year Built</p>
            <p className="text-sm font-medium">
              {siteDetails.yearBuilt || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200">Surveyor</p>
            <p className="text-sm font-medium">
              {siteDetails.surveyorName || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
