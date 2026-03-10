"use client";

import { useState, useEffect } from "react";
import { Download, ArrowLeft, Printer, Share2, Shield } from "lucide-react";
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
    <div className="no-print sticky top-0 z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">New Survey</span>
        </button>

        {/* Center brand mark */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3D1556]">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-black text-[var(--foreground)] tracking-tight hidden sm:inline">
            NTRU
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canShare && (
            <button
              onClick={() => shareReport(title, shareText)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl bg-[#3D1556] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#5B2D8E] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {pdfFailed && (
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 font-medium">
            PDF not supported on this browser. Use <strong>Print</strong> and &quot;Save as PDF&quot; instead.
          </div>
        </div>
      )}
    </div>
  );
}
