"use client";

import { useState, useEffect } from "react";
import { User, Building2, ArrowRight } from "lucide-react";
import type { SurveyorIdentity } from "@/lib/survey-types";

const LS_KEY = "ntru-surveyor-identity";

interface SurveyorIdentityScreenProps {
  onContinue: (identity: SurveyorIdentity) => void;
}

/** Load saved identity from localStorage */
export function loadSurveyorIdentity(): SurveyorIdentity | null {
  try {
    const json = localStorage.getItem(LS_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed.fieldSurveyorName) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/** Save identity to localStorage */
function saveIdentity(identity: SurveyorIdentity) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(identity));
  } catch {
    // ignore quota errors
  }
}

export default function SurveyorIdentityScreen({
  onContinue,
}: SurveyorIdentityScreenProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Pre-fill from localStorage if available
  useEffect(() => {
    const saved = loadSurveyorIdentity();
    if (saved) {
      setName(saved.fieldSurveyorName);
      setCompany(saved.fieldSurveyorCompany);
    }
    setLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const identity: SurveyorIdentity = {
      fieldSurveyorName: name.trim(),
      fieldSurveyorCompany: company.trim(),
    };
    saveIdentity(identity);
    onContinue(identity);
  };

  if (!loaded) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/30 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3D1556]">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Before you begin
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tell us who is conducting this survey
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-lg"
        >
          {/* Name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                autoFocus
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-[#3D1556] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1556]/20"
              />
            </div>
          </div>

          {/* Company */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. ABC Risk Services"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-[#3D1556] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1556]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D1556] py-3 text-sm font-bold text-white transition-all hover:bg-[#5B2D8E] disabled:opacity-50"
          >
            Continue to Survey
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-3 text-center text-[10px] text-gray-400">
            This info is for internal tracking only and will not appear in reports.
          </p>
        </form>
      </div>
    </div>
  );
}
