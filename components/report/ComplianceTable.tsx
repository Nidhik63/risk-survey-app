"use client";

import type { ComplianceItem } from "@/lib/survey-types";
import { CheckCircle2, XCircle, AlertCircle, Minus } from "lucide-react";

interface ComplianceTableProps {
  items: ComplianceItem[];
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Compliant":
      return { icon: <CheckCircle2 className="h-4 w-4" />, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Pass" };
    case "Non-Compliant":
      return { icon: <XCircle className="h-4 w-4" />, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Fail" };
    case "Partially Compliant":
      return { icon: <AlertCircle className="h-4 w-4" />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Partial" };
    default:
      return { icon: <Minus className="h-4 w-4" />, color: "#9ca3af", bg: "rgba(156,163,175,0.1)", label: "N/A" };
  }
}

export default function ComplianceTable({ items }: ComplianceTableProps) {
  const grouped = items.reduce<Record<string, ComplianceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const compliantCount = items.filter((i) => i.status === "Compliant").length;
  const nonCompliantCount = items.filter((i) => i.status === "Non-Compliant").length;
  const partialCount = items.filter((i) => i.status === "Partially Compliant").length;
  const total = items.length;
  const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 0;

  return (
    <div id="section-compliance" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">Compliance</h2>
            <p className="text-xs text-[var(--muted)]">{total} items assessed</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[var(--surface)] border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-[var(--foreground)]">{complianceRate}%</p>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Rate</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{compliantCount}</p>
          <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Compliant</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-amber-600">{partialCount}</p>
          <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mt-1">Partial</p>
        </div>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-red-600">{nonCompliantCount}</p>
          <p className="text-[10px] font-bold text-red-600/60 uppercase tracking-widest mt-1">Non-Compliant</p>
        </div>
      </div>

      {/* Items by category */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="rounded-2xl border border-gray-200 bg-[var(--surface)] overflow-hidden shadow-sm break-inside-avoid">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">{category}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {catItems.map((item, i) => {
                const s = getStatusStyle(item.status);
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.item}</p>
                      {item.remarks && (
                        <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{item.remarks}</p>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
