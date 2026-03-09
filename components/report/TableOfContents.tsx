"use client";

import { List } from "lucide-react";

interface TocItem {
  id: string;
  label: string;
  score?: number;
  grade?: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "Low":
      return "bg-emerald-100 text-emerald-700";
    case "Moderate":
      return "bg-amber-100 text-amber-700";
    case "High":
      return "bg-orange-100 text-orange-700";
    case "Critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">Table of Contents</h2>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-gray-50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-[var(--muted)]">
              {index + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-[var(--foreground)]">
              {item.label}
            </span>
            {item.grade && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getGradeColor(
                  item.grade
                )}`}
              >
                {item.score}/100
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
