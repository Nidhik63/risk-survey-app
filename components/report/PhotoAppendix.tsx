"use client";

import { useState } from "react";
import type { TaggedPhoto, RIReportSection, RIFinding } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import {
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface PhotoAppendixProps {
  photos: TaggedPhoto[];
  sections?: RIReportSection[];
}

function getSectionLabel(section: string) {
  if (section === "general") return "General";
  const meta = SECTION_META.find((s) => s.id === section);
  return meta ? `${meta.id}: ${meta.title}` : section;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "Critical": return { bg: "bg-red-500", text: "text-red-100", border: "border-red-400" };
    case "High": return { bg: "bg-orange-500", text: "text-orange-100", border: "border-orange-400" };
    case "Medium": return { bg: "bg-amber-500", text: "text-amber-100", border: "border-amber-400" };
    default: return { bg: "bg-blue-500", text: "text-blue-100", border: "border-blue-400" };
  }
}

export default function PhotoAppendix({ photos, sections }: PhotoAppendixProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (photos.length === 0) return null;

  // Build a map: section -> findings + positives from that section
  const sectionFindings: Record<string, { findings: RIFinding[]; positives: string[] }> = {};
  if (sections) {
    for (const s of sections) {
      sectionFindings[s.sectionId] = {
        findings: s.findings || [],
        positives: s.positives || [],
      };
    }
  }

  const getPhotoAnnotations = (photo: TaggedPhoto) => {
    if (photo.section === "general" || !sectionFindings[photo.section]) return null;
    return sectionFindings[photo.section];
  };

  return (
    <div id="section-photos" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">
            Photo Evidence
          </h2>
          <p className="text-xs text-[var(--muted)]">{photos.length} photos with AI risk analysis overlay</p>
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {photos.map((photo, index) => {
          const annotations = getPhotoAnnotations(photo);
          const risks = annotations?.findings || [];
          const positives = annotations?.positives || [];

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-lg border border-white/[0.06] transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
            >
              {/* Photo — using padding-bottom trick for html2canvas compatibility */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{ paddingBottom: "75%" }}
                onClick={() => setLightboxIdx(index)}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Photo number badge */}
                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-xs font-bold text-white">
                  {index + 1}
                </div>

                {/* Section badge */}
                {photo.section !== "general" && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 border border-blue-400/30">
                    <Sparkles className="h-3 w-3 text-blue-100" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Section {photo.section}
                    </span>
                  </div>
                )}

                {/* Risk annotation chips overlaid on photo */}
                {risks.length > 0 && (
                  <div className="absolute left-3 bottom-14 right-3 flex flex-wrap gap-1.5">
                    {risks.slice(0, 3).map((finding, fi) => {
                      const colors = getSeverityColor(finding.severity);
                      return (
                        <div
                          key={fi}
                          className={`flex items-center gap-1 rounded-lg ${colors.bg}/90 backdrop-blur-sm px-2 py-1 border ${colors.border}/30`}
                        >
                          <AlertTriangle className={`h-3 w-3 ${colors.text}`} />
                          <span className={`text-[10px] font-bold ${colors.text} leading-tight max-w-[140px] truncate`}>
                            {finding.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Positive annotation chips */}
                {positives.length > 0 && risks.length === 0 && (
                  <div className="absolute left-3 bottom-14 right-3 flex flex-wrap gap-1.5">
                    {positives.slice(0, 2).map((pos, pi) => (
                      <div
                        key={pi}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500/90 backdrop-blur-sm px-2 py-1 border border-emerald-400/30"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-100" />
                        <span className="text-[10px] font-bold text-emerald-100 leading-tight max-w-[160px] truncate">
                          {pos}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caption bar */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                  <p className="text-sm font-semibold text-white/90 leading-snug">
                    {photo.caption || `Photo ${index + 1}`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/40 font-medium uppercase tracking-wider">
                    {getSectionLabel(photo.section)}
                  </p>
                </div>
              </div>

              {/* Findings detail panel below photo */}
              {annotations && (risks.length > 0 || positives.length > 0) && (
                <div className="border-t border-white/[0.06] bg-[#111] p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-3.5 w-3.5 text-white/40" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      AI Analysis
                    </p>
                  </div>
                  {risks.map((finding, fi) => {
                    const colors = getSeverityColor(finding.severity);
                    return (
                      <div key={fi} className="flex items-start gap-2">
                        <span className={`mt-0.5 inline-flex items-center gap-1 rounded-md ${colors.bg}/20 px-1.5 py-0.5 text-[9px] font-bold ${colors.bg === "bg-red-500" ? "text-red-400" : colors.bg === "bg-orange-500" ? "text-orange-400" : colors.bg === "bg-amber-500" ? "text-amber-400" : "text-blue-400"} uppercase shrink-0`}>
                          {finding.severity}
                        </span>
                        <p className="text-xs text-white/60 leading-relaxed">{finding.description}</p>
                      </div>
                    );
                  })}
                  {positives.map((pos, pi) => (
                    <div key={pi} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-400/80 leading-relaxed">{pos}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          <img
            src={photos[lightboxIdx].dataUrl}
            alt={photos[lightboxIdx].caption || ""}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-black/60 backdrop-blur-sm px-6 py-3 text-center border border-white/10">
            <p className="text-sm font-bold text-white">
              {photos[lightboxIdx].caption || `Photo ${lightboxIdx + 1}`}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
              {lightboxIdx + 1} of {photos.length} &middot; {getSectionLabel(photos[lightboxIdx].section)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
