"use client";

import { Shield } from "lucide-react";
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

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] p-10 text-white shadow-2xl sm:p-14">
      {/* Ambient glow effects */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-[80px]" />
      <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-cyan-400/10 blur-[60px]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">RiskLens</h1>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              AI-Powered Risk Engineering
            </p>
          </div>
        </div>

        {/* Report title */}
        <div className="mt-16 sm:mt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Confidential Report
            </span>
          </div>
          <h2 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            Risk Inspection
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Report
            </span>
          </h2>
        </div>

        {/* Property details glass cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Insured", value: sectionA.insuredName },
            { label: "Property Address", value: sectionA.address },
            { label: "Date of Inspection", value: date },
            { label: "Surveyor", value: sectionA.surveyorName },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">{item.label}</p>
              <p className="mt-2 text-lg font-bold text-white/90 leading-snug">{item.value || "\u2014"}</p>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/[0.06] pt-8">
          {[
            { label: "Ref", value: reportRef },
            { label: "Occupancy", value: sectionA.occupancy || "\u2014" },
            { label: "Area", value: sectionA.totalArea ? `${sectionA.totalArea} sqm` : "\u2014" },
            { label: "Floors", value: sectionA.numberOfFloors || "\u2014" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-3">
              {i > 0 && <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/25">{stat.label}</p>
                <p className="text-sm font-bold text-white/70">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
