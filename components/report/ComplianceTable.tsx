"use client";

import type { ComplianceItem } from "@/lib/survey-types";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle, Minus } from "lucide-react";

interface ComplianceTableProps {
  items: ComplianceItem[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Compliant":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "Non-Compliant":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Partially Compliant":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "Compliant":
      return "bg-emerald-50 text-emerald-700";
    case "Non-Compliant":
      return "bg-red-50 text-red-700";
    case "Partially Compliant":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-50 text-gray-500";
  }
}

export default function ComplianceTable({ items }: ComplianceTableProps) {
  // Group by category
  const grouped = items.reduce<Record<string, ComplianceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const compliantCount = items.filter((i) => i.status === "Compliant").length;
  const nonCompliantCount = items.filter((i) => i.status === "Non-Compliant").length;
  const partialCount = items.filter((i) => i.status === "Partially Compliant").length;

  return (
    <div
      id="section-compliance"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">Compliance Summary</h2>
      </div>

      {/* Stats */}
      <div className="mb-5 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {compliantCount} Compliant
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {partialCount} Partial
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          {nonCompliantCount} Non-Compliant
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Item</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)] hidden sm:table-cell">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([category, catItems]) =>
              catItems.map((item, i) => (
                <tr key={`${category}-${i}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                  {i === 0 && (
                    <td
                      className="px-4 py-3 text-xs font-bold text-[var(--foreground)] align-top"
                      rowSpan={catItems.length}
                    >
                      {category}
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-gray-700">{item.item}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBg(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="hidden sm:inline">{item.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{item.remarks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
