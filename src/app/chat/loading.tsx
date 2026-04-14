"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-apple-in">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-[var(--bg-tertiary)] rounded-full shimmer-swipe" />
          <div className="h-8 w-64 bg-[var(--bg-tertiary)] rounded-xl shimmer-swipe" />
        </div>
        <div className="h-10 w-48 bg-[var(--bg-tertiary)] rounded-2xl shimmer-swipe" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-[150px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
            <div className="h-[150px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
          </div>
          <div className="h-[400px] bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shimmer-swipe" />
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
