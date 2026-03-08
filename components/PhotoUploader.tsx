"use client";

import { useCallback, useRef } from "react";
import { Camera, Upload, X, ImagePlus } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

interface PhotoUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export default function PhotoUploader({
  images,
  onImagesChange,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = 10 - images.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          const compressed = await compressImage(result, 1280, 0.75);
          onImagesChange([...images, compressed]);
        };
        reader.readAsDataURL(file);
      });
    },
    [images, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Site Photos
        </h3>
        <span className="text-sm text-[var(--muted)]">
          {images.length}/10 photos
        </span>
      </div>

      {images.length < 10 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center transition-all hover:border-[var(--primary)] hover:bg-blue-50/50 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <ImagePlus className="h-7 w-7 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Drag & drop photos here, or click to browse
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                JPG, PNG, WebP up to 10 photos
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Camera capture button for mobile */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-gray-50 hover:border-[var(--primary)]"
      >
        <Camera className="h-5 w-5 text-[var(--primary)]" />
        Take Photo with Camera
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-gray-100"
            >
              <img
                src={img}
                alt={`Site photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
