"use client";

interface YesNoFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
}

export default function YesNoField({
  label,
  value,
  onChange,
  required,
  helper,
}: YesNoFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange("Yes")}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            value === "Yes"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange("No")}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            value === "No"
              ? "border-red-400 bg-red-50 text-red-700"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50"
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange("N/A")}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            value === "N/A"
              ? "border-gray-400 bg-gray-100 text-gray-700"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50"
          }`}
        >
          N/A
        </button>
      </div>
      {helper && (
        <p className="mt-1 text-xs text-[var(--muted)]">{helper}</p>
      )}
    </div>
  );
}
