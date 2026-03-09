"use client";

import { useState, useEffect } from "react";
import { Download, ArrowLeft, Printer, Share2 } from "lucide-react";
import { exportReportToPDF, printReport, shareReport } from "@/lib/pdf-export";

interface ReportToolbarProps {
  reportId: string;
  title: string;
  shareText: string;
  onBack: () => void;
  filename: string;
}

export default function ReportToolbar({
  reportId,
  title,
  shareText,
  onBack,
  filename,
}: ReportToolbarProps) {
  const [exporting, setExporting] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setPdfFailed(false);
    try {
      const success = await exportReportToPDF(reportId, filename);
      if (!success) setPdfFailed(true);
    } catch {
      setPdfFailed(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="no-print sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition-all hover:bg-gray-100 hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">New Survey</span>
        </button>

        <div className="flex items-center gap-2">
          {canShare && (
            <button
              onClick={() => shareReport(title, shareText)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary-light)] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Generating..." : "PDF"}
          </button>
        </div>
      </div>

      {pdfFailed && (
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
            PDF download not supported on this browser. Use the{" "}
            <strong>Print</strong> button and select &quot;Save as PDF&quot; instead.
          </div>
        </div>
      )}
    </div>
  );
}
