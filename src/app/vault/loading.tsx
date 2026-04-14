"use client";

import React from "react";

export default function VaultLoading() {
  return (
    <div className="w-full space-y-6 animate-apple-in">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-[var(--bg-tertiary)] rounded-full shimmer-swipe" />
          <div className="h-8 w-64 bg-[var(--bg-tertiary)] rounded-xl shimmer-swipe" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-10 w-24 bg-[var(--bg-tertiary)] rounded-xl shimmer-swipe" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
         {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
         ))}
      </div>
      <div className="h-[400px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe mt-6" />
    </div>
  );
}
