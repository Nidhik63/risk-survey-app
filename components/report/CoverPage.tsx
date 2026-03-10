"use client";

import { Shield, MapPin, Calendar, User, Building2 } from "lucide-react";
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

  const stats = [
    { label: "Ref", value: reportRef },
    { label: "Occupancy", value: sectionA.occupancy || "\u2014" },
    { label: "Plot Area", value: sectionA.plotArea ? `${sectionA.plotArea} sqm` : "\u2014" },
    { label: "Built Area", value: sectionA.constructedArea ? `${sectionA.constructedArea} sqm` : "\u2014" },
    { label: "Floors", value: sectionA.numberOfFloors || "\u2014" },
    { label: "Flood Risk", value: sectionA.floodRiskLevel || "\u2014" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-purple-200 bg-white shadow-2xl">
      {/* ── Purple Header Banner ── */}
      <div className="bg-[#3D1556] px-10 py-8 sm:px-14 sm:py-10 print-cover-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">NTRU</h1>
              <p className="text-[10px] font-medium tracking-[0.2em] text-purple-200 uppercase">
                NewTech Reinsurance &amp; Underwriting
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-purple-300">
              Empowering Risk Solutions
            </p>
          </div>
        </div>
      </div>

      {/* ── Light Body — flex column for vertical distribution ── */}
      <div className="flex min-h-[780px] flex-col justify-between px-10 py-10 sm:px-14 sm:py-12">

        {/* Title Section */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3D1556]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3D1556]">
              Confidential Report
            </span>
          </div>
          <h2 className="mt-5 text-5xl font-black leading-[1.1] tracking-tight text-gray-900 sm:text-6xl">
            Risk Inspection
            <br />
            <span className="text-[#3D1556]">
              Report
            </span>
          </h2>
        </div>

        {/* Property Details — 2x2 cards, white bg, purple border */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border-2 border-purple-200 bg-white p-5">
            <Building2 className="h-5 w-5 text-[#3D1556] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Insured</p>
              <p className="mt-1.5 text-base font-bold text-gray-900 leading-snug">{sectionA.insuredName || "\u2014"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border-2 border-purple-200 bg-white p-5">
            <MapPin className="h-5 w-5 text-[#3D1556] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Property Address</p>
              <p className="mt-1.5 text-base font-bold text-gray-900 leading-snug">{sectionA.address || "\u2014"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border-2 border-purple-200 bg-white p-5">
            <Calendar className="h-5 w-5 text-[#3D1556] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Date of Inspection</p>
              <p className="mt-1.5 text-base font-bold text-gray-900 leading-snug">{date}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border-2 border-purple-200 bg-white p-5">
            <User className="h-5 w-5 text-[#3D1556] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Surveyor</p>
              <p className="mt-1.5 text-base font-bold text-gray-900 leading-snug">{sectionA.surveyorName || "\u2014"}</p>
            </div>
          </div>
        </div>

        {/* Bottom: Stats Grid */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-purple-100 bg-purple-50/50 px-3 py-3 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
              <p className="mt-1 text-xs font-bold text-gray-800 leading-snug break-words">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom purple accent strip ── */}
      <div className="h-2 w-full bg-gradient-to-r from-[#3D1556] via-[#5B2D8E] to-[#3D1556]" />
    </div>
  );
}
