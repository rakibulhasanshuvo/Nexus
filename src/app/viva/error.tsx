"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat route error:", error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-apple-in">
      <div className="w-16 h-16 rounded-3xl bg-[var(--danger)]/10 flex items-center justify-center mb-6 border border-[var(--danger)]/20 shadow-lg shadow-[var(--danger)]/5">
        <AlertTriangle className="w-8 h-8 text-[var(--danger)]" />
      </div>

      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
        Viva Session Failed
      </h2>

      <p className="text-[13px] text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
        We couldn't start the Viva Simulator. This might be a temporary network issue or an API timeout.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
        >
          <RefreshCcw className="w-4 h-4" />
          Reconnect
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-[13px] font-bold hover:bg-[var(--bg-tertiary)] transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
