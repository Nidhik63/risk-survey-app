"use client";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "date" | "tel" | "number";
  helper?: string;
}

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  helper,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-gray-400 transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
      />
      {helper && (
        <p className="mt-1 text-xs text-[var(--muted)]">{helper}</p>
      )}
    </div>
  );
}
