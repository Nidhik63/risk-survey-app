"use client";

import { useState } from "react";
import { Shield, Lock, ArrowLeft } from "lucide-react";

interface PinDialogProps {
  onVerified: () => void;
  onCancel: () => void;
}

export default function PinDialog({ onVerified, onCancel }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        sessionStorage.setItem("ntru-analyst-verified", "true");
        onVerified();
      } else {
        setError("Invalid PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#2a0e42] to-[#1a0a2e] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            NTRU Analyst Access
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Enter your team PIN to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Access PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                autoFocus
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-[#3D1556] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1556]/20"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full rounded-xl bg-[#3D1556] py-3 text-sm font-bold text-white transition-all hover:bg-[#5B2D8E] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}
