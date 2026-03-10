"use client";

import { useState } from "react";
import type { TaggedPhoto, RIReportSection, RIFinding } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import {
  ImageIcon,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
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

function getSeverityStyle(severity: string) {
  switch (severity) {
    case "Critical":
      return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", icon: AlertOctagon };
    case "High":
      return { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", icon: AlertTriangle };
    case "Medium":
      return { bg: "#fffbeb", text: "#d97706", border: "#fde68a", icon: Info };
    default:
      return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", icon: Info };
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
          <p className="text-xs text-[var(--muted)]">
            {photos.length} photos with AI risk analysis
          </p>
        </div>
      </div>

      {/* Photo grid — one photo per row for maximum clarity */}
      <div className="space-y-6">
        {photos.map((photo, index) => {
          const annotations = getPhotoAnnotations(photo);
          const risks = annotations?.findings || [];
          const positives = annotations?.positives || [];
          const hasAnalysis = risks.length > 0 || positives.length > 0;

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Clean photo — NO overlays, NO text on image */}
              <div
                className="relative overflow-hidden cursor-pointer bg-gray-100"
                style={{ paddingBottom: "56.25%" }}
                onClick={() => setLightboxIdx(index)}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Minimal photo number — small, top-left, semi-transparent */}
                <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-[11px] font-bold text-white">
                  {index + 1}
                </div>
              </div>

              {/* Info panel BELOW the photo */}
              <div className="p-5 space-y-4">
                {/* Caption + section tag row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Photo {index + 1} of {photos.length}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {photo.caption || `Photo ${index + 1}`}
                    </p>
                  </div>

                  {/* Section badge */}
                  {photo.section !== "general" && (
                    <span
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      Section {photo.section}
                    </span>
                  )}
                </div>

                {/* AI Analysis section — below caption */}
                {hasAnalysis && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        AI Risk Analysis &middot; {getSectionLabel(photo.section)}
                      </p>
                    </div>

                    {/* Risk findings */}
                    {risks.map((finding, fi) => {
                      const style = getSeverityStyle(finding.severity);
                      const Icon = style.icon;
                      return (
                        <div
                          key={fi}
                          className="rounded-lg p-3"
                          style={{
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <Icon
                              className="h-4 w-4 shrink-0 mt-0.5"
                              style={{ color: style.text }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wider"
                                  style={{ color: style.text }}
                                >
                                  {finding.severity}
                                </span>
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: style.text }}
                                >
                                  {finding.title}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                                {finding.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Positive observations */}
                    {positives.map((pos, pi) => (
                      <div
                        key={pi}
                        className="flex items-start gap-2.5 rounded-lg p-3"
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 mt-0.5"
                          style={{ color: "#16a34a" }}
                        />
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          {pos}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
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
              {lightboxIdx + 1} of {photos.length} &middot;{" "}
              {getSectionLabel(photos[lightboxIdx].section)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
