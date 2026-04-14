"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-apple-in">
      <div className="w-20 h-20 rounded-3xl bg-[var(--danger-subtle)] border border-[var(--danger)]/30 flex items-center justify-center mb-8 shadow-xl">
        <AlertCircle className="w-10 h-10 text-[var(--danger)]" />
      </div>
      
      <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-3">
        Unexpected System Interrupt
      </h1>
      
      <p className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest max-w-md leading-relaxed mb-10">
        Nex-Sys experienced a recovery state exception. Your core data is safe, but the current UI view reached a critical failure point.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95"
        >
          <RefreshCcw className="w-4 h-4" /> Reset Environment
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[var(--bg-secondary)] transition-all border border-[var(--border-subtle)] shadow-sm active:scale-95"
        >
          <Home className="w-4 h-4" /> Return Dashboard
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] w-full max-w-xs">
        <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.4em] opacity-40">
          Error Signature: {error.digest || "RUNTIME_EXCEPTION"}
        </p>
      </div>
    </div>
  );
}
