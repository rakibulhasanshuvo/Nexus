"use client";

import React from "react";

export default function VivaLoading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-8 animate-apple-in">
      <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shimmer-swipe" />
      <div className="space-y-3 text-center w-full max-w-sm">
         <div className="h-6 w-48 bg-[var(--bg-tertiary)] rounded-xl mx-auto shimmer-swipe" />
         <div className="h-3 w-64 bg-[var(--bg-tertiary)] rounded-full mx-auto shimmer-swipe" />
      </div>
      <div className="w-full max-w-md h-12 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] shimmer-swipe" />
    </div>
  );
}
