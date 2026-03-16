"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  X,
  ImageIcon,
  ChevronDown,
  ChevronRight,
  Building2,
  Flame,
  Package,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import type { TaggedPhoto } from "@/lib/survey-types";
import { PHOTO_CATEGORY_GROUPS } from "@/lib/survey-types";
import type { PhotoCategoryDef } from "@/lib/survey-types";
import { compressImage } from "@/lib/image-compress";

interface PhotoStepProps {
  photos: TaggedPhoto[];
  onChange: (photos: TaggedPhoto[]) => void;
}

// Icon map for group headers
const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Flame,
  Package,
  Wrench,
};

// Total expected photos across all categories
const TOTAL_EXPECTED = PHOTO_CATEGORY_GROUPS.reduce(
  (sum, g) => sum + g.categories.reduce((s, c) => s + c.maxPhotos, 0),
  0
);

export default function PhotoStep({ photos, onChange }: PhotoStepProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(PHOTO_CATEGORY_GROUPS.map((g) => g.id))
  );
  // cameraTip modal removed — camera now opens directly on click
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const generalFileRef = useRef<HTMLInputElement>(null);
  const generalCameraRef = useRef<HTMLInputElement>(null);
  const activeCategoryRef = useRef<PhotoCategoryDef | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Get photos for a specific category code
  const getPhotosForCategory = (code: string) =>
    photos.filter((p) => p.caption.startsWith(`[${code}]`));

  // Get photos not belonging to any category (general)
  const getGeneralPhotos = () =>
    photos.filter(
      (p) =>
        p.section === "general" &&
        !PHOTO_CATEGORY_GROUPS.some((g) =>
          g.categories.some((c) => p.caption.startsWith(`[${c.code}]`))
        )
    );

  // Add photos for a specific category
  const addPhotosForCategory = async (
    files: FileList | File[],
    category: PhotoCategoryDef | null
  ) => {
    const fileArray = Array.from(files);
    const newPhotos: TaggedPhoto[] = [];
    for (const file of fileArray) {
      const dataUrl = await readFileAsDataUrl(file);
      const compressed = await compressImage(dataUrl);
      newPhotos.push({
        dataUrl: compressed,
        section: category ? category.section : "general",
        caption: category ? `[${category.code}] ${category.label}` : "",
      });
    }
    onChange([...photos, ...newPhotos]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addPhotosForCategory(e.target.files, activeCategoryRef.current);
      e.target.value = ""; // Reset so same file can be re-selected
    }
  };

  const handleGeneralFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addPhotosForCategory(e.target.files, null);
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const removePhotoByRef = (photo: TaggedPhoto) => {
    const idx = photos.indexOf(photo);
    if (idx >= 0) removePhoto(idx);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleBrowse = (cat: PhotoCategoryDef) => {
    activeCategoryRef.current = cat;
    fileInputRef.current?.click();
  };

  const handleCamera = (cat: PhotoCategoryDef) => {
    activeCategoryRef.current = cat;
    // Open camera directly — no popup needed, tip is in category description
    cameraInputRef.current?.click();
  };

  // Overall progress
  const totalPhotos = photos.length;
  const progressPct = Math.min(100, Math.round((totalPhotos / TOTAL_EXPECTED) * 100));

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Camera className="h-5 w-5 text-[#3D1556]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Site Photos
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Follow the guided categories below. Each tells you what to photograph.
          </p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--muted)]">
            Overall Progress
          </span>
          <span className="text-xs font-bold text-[var(--foreground)]">
            {totalPhotos} / {TOTAL_EXPECTED} photos
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3D1556] to-[#5B2D8E] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-3">
        {PHOTO_CATEGORY_GROUPS.map((group) => {
          const GroupIcon = GROUP_ICONS[group.icon] || Building2;
          const isExpanded = expandedGroups.has(group.id);
          const groupPhotoCount = group.categories.reduce(
            (sum, c) => sum + getPhotosForCategory(c.code).length,
            0
          );
          const groupMaxPhotos = group.categories.reduce(
            (sum, c) => sum + c.maxPhotos,
            0
          );

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <GroupIcon className="h-4.5 w-4.5 text-[#3D1556]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {group.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {group.categories.length} categories
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    groupPhotoCount >= groupMaxPhotos
                      ? "bg-green-100 text-green-700"
                      : groupPhotoCount > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {groupPhotoCount}/{groupMaxPhotos}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                )}
              </button>

              {/* Category Cards */}
              {isExpanded && (
                <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
                  {group.categories.map((cat) => {
                    const catPhotos = getPhotosForCategory(cat.code);
                    const isFull = catPhotos.length >= cat.maxPhotos;

                    return (
                      <div
                        key={cat.code}
                        className={`rounded-xl border p-4 ${
                          isFull
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        {/* Category header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#3D1556] text-[10px] font-bold text-white shrink-0">
                                {cat.code}
                              </span>
                              <h4 className="text-sm font-bold text-[var(--foreground)]">
                                {cat.label}
                              </h4>
                              {isFull && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                              {cat.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                              isFull
                                ? "bg-green-100 text-green-700"
                                : catPhotos.length > 0
                                ? "bg-purple-100 text-[#3D1556]"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {catPhotos.length}/{cat.maxPhotos}
                          </span>
                        </div>

                        {/* Photo thumbnails */}
                        {catPhotos.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {catPhotos.map((photo) => (
                              <div
                                key={photos.indexOf(photo)}
                                className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={photo.dataUrl}
                                  alt={cat.label}
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePhotoByRef(photo)}
                                  className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isFull && (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleBrowse(cat)}
                              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50"
                            >
                              <Upload className="h-3 w-3" />
                              Browse
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCamera(cat)}
                              className="flex items-center gap-1.5 rounded-lg bg-[#3D1556] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#5B2D8E]"
                            >
                              <Camera className="h-3 w-3" />
                              Camera
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* General / Other Photos */}
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-4 w-4 text-[var(--muted)]" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            General / Other Photos
          </h3>
          <span className="text-xs text-[var(--muted)]">
            ({getGeneralPhotos().length} photos)
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">
          Any additional photos that don&apos;t fit the categories above.
        </p>

        {/* General photo thumbnails */}
        {getGeneralPhotos().length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {getGeneralPhotos().map((photo) => (
              <div
                key={photos.indexOf(photo)}
                className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={photo.dataUrl}
                  alt="General"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhotoByRef(photo)}
                  className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generalFileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50"
          >
            <Upload className="h-3 w-3" />
            Browse Files
          </button>
          <button
            type="button"
            onClick={() => generalCameraRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50"
          >
            <Camera className="h-3 w-3" />
            Take Photo
          </button>
        </div>

        <input
          ref={generalFileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGeneralFileChange}
        />
        <input
          ref={generalCameraRef}
          type="file"
          accept="image/*"
          capture={isMobile ? "environment" : undefined}
          className="hidden"
          onChange={handleGeneralFileChange}
        />
      </div>

      {/* Hidden file inputs for category uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture={isMobile ? "environment" : undefined}
        className="hidden"
        onChange={handleFileChange}
      />

    </div>
  );
}
