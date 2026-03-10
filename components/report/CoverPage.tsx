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
    <div className="relative overflow-hidden rounded-3xl bg-[#1a0a2e] text-white shadow-2xl print-cover-page">
      {/* Top accent bar — NTRU purple gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500" />

      {/* Main content — flex column with vertical centering */}
      <div className="flex min-h-[920px] flex-col justify-between px-10 py-12 sm:px-14 sm:py-16">

        {/* Top: NTRU Branding */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">NTRU</h1>
            <p className="text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
              NewTech Reinsurance &amp; Underwriting
            </p>
          </div>
        </div>

        {/* Centre: Title + Property Cards */}
        <div className="flex-1 flex flex-col justify-center py-10">
          {/* Title Section */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Confidential Report
              </span>
            </div>
            <h2 className="mt-5 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl">
              Risk Inspection
              <br />
              <span className="text-purple-400">
                Report
              </span>
            </h2>
            <p className="mt-4 text-sm font-medium tracking-widest text-white/30 uppercase">
              Empowering Risk Solutions
            </p>
          </div>

          {/* Property Details — 2x2 glass cards */}
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <Building2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Insured</p>
                <p className="mt-1.5 text-base font-bold text-white/90 leading-snug">{sectionA.insuredName || "\u2014"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <MapPin className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Property Address</p>
                <p className="mt-1.5 text-base font-bold text-white/90 leading-snug">{sectionA.address || "\u2014"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <Calendar className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Date of Inspection</p>
                <p className="mt-1.5 text-base font-bold text-white/90 leading-snug">{date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <User className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Surveyor</p>
                <p className="mt-1.5 text-base font-bold text-white/90 leading-snug">{sectionA.surveyorName || "\u2014"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats Grid — always at bottom */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
                {stat.label}
              </p>
              <p className="mt-1 text-xs font-bold text-white/80 leading-snug break-words">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
