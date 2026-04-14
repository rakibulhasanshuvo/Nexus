"use client";

import React from "react";

export default function GlobalLoading() {
  return (
    <div className="w-full space-y-6 animate-apple-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Feed Skeleton */}
        <div className="lg:col-span-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] shimmer-swipe" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-[var(--bg-tertiary)] rounded-full shimmer-swipe" />
                  <div className="h-2 w-16 bg-[var(--bg-tertiary)] rounded-full shimmer-swipe" />
                </div>
              </div>
              <div className="h-20 w-full bg-[var(--bg-tertiary)] rounded-2xl shimmer-swipe" />
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[250px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
          <div className="h-[300px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
        </div>
      </div>
    </div>
  );
}
