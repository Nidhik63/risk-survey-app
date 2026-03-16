"use client";

import { useState, useEffect } from "react";

interface DateOrNaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function DateOrNaField({
  label,
  value,
  onChange,
  required,
}: DateOrNaFieldProps) {
  const [isNa, setIsNa] = useState(value === "N/A");

  // Sync if value changes externally
  useEffect(() => {
    setIsNa(value === "N/A");
  }, [value]);

  const handleToggleNa = () => {
    if (isNa) {
      // Switching back to date — clear value
      setIsNa(false);
      onChange("");
    } else {
      // Mark as N/A
      setIsNa(true);
      onChange("N/A");
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {isNa ? (
        <div className="flex h-[46px] items-center rounded-xl border border-amber-200 bg-amber-50 px-4">
          <span className="text-sm font-medium text-amber-700">
            Not Available
          </span>
        </div>
      ) : (
        <input
          type="date"
          value={value === "N/A" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-gray-400 transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      )}
      <button
        type="button"
        onClick={handleToggleNa}
        className={`mt-1.5 text-xs font-medium transition-colors ${
          isNa
            ? "text-[#3D1556] hover:text-[#5B2D8E]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        {isNa ? "↩ Enter a date instead" : "Mark as N/A"}
      </button>
    </div>
  );
}
