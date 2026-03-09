"use client";

import type { TaggedPhoto } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import { ImageIcon } from "lucide-react";

interface PhotoAppendixProps {
  photos: TaggedPhoto[];
}

function getSectionLabel(section: string) {
  if (section === "general") return "General";
  const meta = SECTION_META.find((s) => s.id === section);
  return meta ? `${meta.id}: ${meta.title}` : section;
}

function getSectionColor(section: string) {
  switch (section) {
    case "A":
      return "bg-blue-100 text-blue-700";
    case "B":
      return "bg-orange-100 text-orange-700";
    case "C":
      return "bg-red-100 text-red-700";
    case "D":
      return "bg-amber-100 text-amber-700";
    case "E":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PhotoAppendix({ photos }: PhotoAppendixProps) {
  if (photos.length === 0) return null;

  return (
    <div
      id="section-photos"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Photo Appendix ({photos.length} photos)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--border)] overflow-hidden bg-white"
          >
            <div className="relative aspect-video">
              <img
                src={photo.dataUrl}
                alt={photo.caption || `Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span
                className={`absolute right-2 top-2 rounded-lg px-2 py-1 text-[10px] font-bold ${getSectionColor(photo.section)}`}
              >
                {getSectionLabel(photo.section)}
              </span>
            </div>
            {photo.caption && (
              <div className="px-3 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-600">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
