"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, ImageIcon, Sparkles } from "lucide-react";
import type { TaggedPhoto } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import { compressImage } from "@/lib/image-compress";
import SelectField from "@/components/fields/SelectField";

interface PhotoStepProps {
  photos: TaggedPhoto[];
  onChange: (photos: TaggedPhoto[]) => void;
}

// No hard limit — engineers may need many photos for large sites

const SECTION_OPTIONS = [
  { value: "general", label: "General / Overview" },
  ...SECTION_META.map((s) => ({ value: s.id, label: `Section ${s.id}: ${s.title}` })),
];

export default function PhotoStep({ photos, onChange }: PhotoStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const addPhotos = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    const newPhotos: TaggedPhoto[] = [];
    for (const file of fileArray) {
      const dataUrl = await readFileAsDataUrl(file);
      const compressed = await compressImage(dataUrl);
      newPhotos.push({
        dataUrl: compressed,
        section: "general",
        caption: "",
      });
    }

    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const updatePhoto = (index: number, updates: Partial<TaggedPhoto>) => {
    onChange(
      photos.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      await addPhotos(e.dataTransfer.files);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
          <Camera className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Site Photos
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Upload photos of the property. Tag each photo with the relevant section for better analysis.
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? "border-[var(--primary)] bg-blue-50"
            : "border-[var(--border)] hover:border-[var(--primary)]/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-10 w-10 text-[var(--muted)]" />
        <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
          Drag & drop photos here
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          or use the buttons below ({photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded)
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary-light)]"
          >
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Browse Files
            </span>
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm transition-all hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Take Photo
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addPhotos(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && addPhotos(e.target.files)}
        />
      </div>

      {/* Photo grid with tagging */}
      {photos.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Tag your photos ({photos.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                <div className="relative aspect-video">
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {photo.section !== "general" && (
                    <span className="absolute left-2 bottom-2 flex items-center gap-1 rounded-lg bg-blue-600/90 px-2 py-1 text-xs font-bold text-white">
                      <Sparkles className="h-3 w-3" />
                      Section {photo.section}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <SelectField
                    label="Section"
                    value={photo.section}
                    onChange={(v) => updatePhoto(index, { section: v as TaggedPhoto["section"] })}
                    options={SECTION_OPTIONS}
                  />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => updatePhoto(index, { caption: e.target.value })}
                      placeholder="e.g. Main entrance, Roof condition"
                      className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-gray-400 focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-8">
          <ImageIcon className="h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-[var(--muted)]">
            No photos uploaded yet. Photos help the AI provide more accurate analysis.
          </p>
        </div>
      )}
    </div>
  );
}
