"use client";

import { ChevronRight } from "lucide-react";

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
    case "Low": return "#10b981";
    case "Moderate": return "#f59e0b";
    case "High": return "#f97316";
    case "Critical": return "#ef4444";
    default: return "#6b7280";
  }
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
      <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
        Contents
      </h2>
      <div className="space-y-0.5">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-gray-50 group"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-bold text-[var(--muted)] group-hover:bg-gray-200 transition-colors">
              {index + 1}
            </span>
            <span className="flex-1 text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              {item.label}
            </span>
            {item.grade && (
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: getGradeColor(item.grade) }}
              >
                {item.score}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[var(--primary)] transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
