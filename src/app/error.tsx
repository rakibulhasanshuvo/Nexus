"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center animate-apple-in">
      <div className="w-16 h-16 rounded-3xl bg-[var(--danger)]/10 flex items-center justify-center mb-6 border border-[var(--danger)]/20 shadow-lg shadow-[var(--danger)]/5">
        <AlertTriangle className="w-8 h-8 text-[var(--danger)]" />
      </div>
      
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
        Something went wrong!
      </h2>
      
      <p className="text-[13px] text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] max-w-2xl w-full overflow-auto text-left text-xs font-mono text-[var(--danger)]">
          {error.message}
        </div>
      )}
    </div>
  );
}
