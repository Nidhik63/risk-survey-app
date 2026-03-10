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

/* ── Section colors for category headers ── */
const SECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  B: { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe" },
  C: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  D: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  E: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  general: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
};

function getSectionLabel(section: string) {
  if (section === "general") return "General";
  const meta = SECTION_META.find((s) => s.id === section);
  return meta ? `${meta.id}: ${meta.title}` : section;
}

function getSectionTitle(section: string) {
  if (section === "general") return "General Photos";
  const meta = SECTION_META.find((s) => s.id === section);
  return meta ? meta.title : section;
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

/* ── Ordered section keys ── */
const SECTION_ORDER = ["A", "B", "C", "D", "E", "general"];

export default function PhotoAppendix({ photos, sections }: PhotoAppendixProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (photos.length === 0) return null;

  /* ── Group photos by section ── */
  const grouped: Record<string, TaggedPhoto[]> = {};
  for (const photo of photos) {
    const key = photo.section || "general";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(photo);
  }

  /* ── Build section findings map ── */
  const sectionFindings: Record<string, { findings: RIFinding[]; positives: string[] }> = {};
  if (sections) {
    for (const s of sections) {
      sectionFindings[s.sectionId] = {
        findings: s.findings || [],
        positives: s.positives || [],
      };
    }
  }

  /* ── Ordered groups: only sections that have photos ── */
  const orderedKeys = SECTION_ORDER.filter((k) => grouped[k] && grouped[k].length > 0);

  /* ── Flat list for lightbox navigation ── */
  const flatPhotos: TaggedPhoto[] = [];
  for (const key of orderedKeys) {
    flatPhotos.push(...grouped[key]);
  }

  /* ── Global photo index for lightbox ── */
  const openLightbox = (sectionKey: string, localIdx: number) => {
    let globalIdx = 0;
    for (const key of orderedKeys) {
      if (key === sectionKey) {
        globalIdx += localIdx;
        break;
      }
      globalIdx += grouped[key].length;
    }
    setLightboxIdx(globalIdx);
  };

  return (
    <div id="section-photos" className="space-y-8">
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
            {photos.length} photos across {orderedKeys.length} categories
          </p>
        </div>
      </div>

      {/* ── Category groups ── */}
      {orderedKeys.map((sectionKey) => {
        const sectionPhotos = grouped[sectionKey];
        const colors = SECTION_COLORS[sectionKey] || SECTION_COLORS.general;
        const analysis = sectionFindings[sectionKey];
        const risks = analysis?.findings || [];
        const positives = analysis?.positives || [];
        const hasAnalysis = risks.length > 0 || positives.length > 0;

        return (
          <div
            key={sectionKey}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm page-break-before"
            style={{ borderColor: colors.border }}
          >
            {/* ── Category header ── */}
            <div
              className="flex items-center justify-between gap-3 px-6 py-4"
              style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{ backgroundColor: colors.text }}
                >
                  {sectionKey === "general" ? "—" : sectionKey}
                </div>
                <div>
                  <h3
                    className="text-base font-bold tracking-tight"
                    style={{ color: colors.text }}
                  >
                    {getSectionTitle(sectionKey)}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {sectionPhotos.length} photo{sectionPhotos.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Photo grid (2 columns) ── */}
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sectionPhotos.map((photo, localIdx) => (
                  <div
                    key={localIdx}
                    className="overflow-hidden rounded-xl border border-gray-150 bg-white shadow-sm"
                  >
                    {/* Clean photo — no overlays */}
                    <div
                      className="relative overflow-hidden cursor-pointer bg-gray-100"
                      style={{ paddingBottom: "66.67%" }}
                      onClick={() => openLightbox(sectionKey, localIdx)}
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || `Photo`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {/* Tiny number badge */}
                      <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-[10px] font-bold text-white">
                        {localIdx + 1}
                      </div>
                    </div>

                    {/* Caption below photo */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                        {photo.caption || `Photo ${localIdx + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── AI Analysis — shown ONCE for the whole category ── */}
            {hasAnalysis && (
              <div
                className="mx-4 mb-4 rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    AI Risk Analysis — {getSectionLabel(sectionKey)}
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
        );
      })}

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && lightboxIdx < flatPhotos.length && (
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
          {lightboxIdx < flatPhotos.length - 1 && (
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
            src={flatPhotos[lightboxIdx].dataUrl}
            alt={flatPhotos[lightboxIdx].caption || ""}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-black/60 backdrop-blur-sm px-6 py-3 text-center border border-white/10">
            <p className="text-sm font-bold text-white">
              {flatPhotos[lightboxIdx].caption || `Photo ${lightboxIdx + 1}`}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
              {lightboxIdx + 1} of {flatPhotos.length} &middot;{" "}
              {getSectionLabel(flatPhotos[lightboxIdx].section)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
