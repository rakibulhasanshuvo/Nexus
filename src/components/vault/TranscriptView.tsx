"use client";

import React from 'react';
import { GraduationCap, FileText, Download, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { COURSE_MAPPING } from '@/lib/constants';
import { SemesterResult } from '@/lib/types';

interface TranscriptViewProps {
  results: SemesterResult[];
  cgpa: number;
  totalCredits: number;
  standing: { label: string; color: string };
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ 
  results, cgpa, totalCredits, standing 
}) => {
  return (
    <motion.div 
      key="transcript"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card bg-[var(--bg-secondary)] min-h-[600px] border-[var(--border-subtle)] shadow-2xl relative overflow-hidden flex flex-col mx-auto max-w-5xl"
    >
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <GraduationCap className="w-[500px] h-[500px]" />
      </div>

      {/* Header / Letterhead */}
      <div className="p-10 border-b-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)] uppercase">Official Student Progress Transcript</h1>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mt-1">Academic Division · BOU</h2>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Status Valid Until</p>
                <p className="text-[11px] font-black text-[var(--text-primary)]">MAY 2026</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Authenticated ID</p>
                <p className="text-[11px] font-black text-[var(--text-primary)] tracking-tighter">#BOU-ENG-0613</p>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest">
           <div className="space-y-1">
              <span className="text-[var(--text-tertiary)] block">Program of Study</span>
              <span className="text-[var(--text-primary)]">B.Sc. Computer Science & Engineering</span>
           </div>
           <div className="space-y-1 text-center">
              <span className="text-[var(--text-tertiary)] block">Current Completion</span>
              <span className="text-[var(--text-primary)]">{totalCredits.toFixed(1)} / 148.0 Credits</span>
           </div>
           <div className="space-y-1 text-right">
              <span className="text-[var(--text-tertiary)] block">Academic Standing</span>
              <span className={`font-black ${standing.color}`}>{standing.label}</span>
           </div>
        </div>
      </div>

      <div className="p-10 flex-grow relative z-10 bg-[var(--bg-secondary)]">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {results.map(sem => (
              <div key={sem.semester} className="space-y-5">
                <div className="flex items-center justify-between border-b-2 pb-3 border-[var(--text-primary)]">
                  <h2 className="text-xs font-black uppercase tracking-[0.1em] text-[var(--text-primary)]">Term Record: S0{sem.semester}</h2>
                  <p className="text-[11px] font-bold text-[var(--text-secondary)]">GPA: <span className="text-[var(--text-primary)] font-black">{sem.gpa.toFixed(2)}</span></p>
                </div>
                <div className="space-y-3">
                   {COURSE_MAPPING[sem.semester - 1]?.courses.map(c => (
                     <div key={c.id} className="flex items-center justify-between text-xs py-2 border-b border-[var(--border-subtle)] last:border-0 border-dashed hover:bg-[var(--bg-tertiary)]/50 rounded px-2 transition-colors">
                        <span className="text-[var(--text-primary)] font-bold uppercase tracking-tight">{c.name}</span>
                        <div className="flex items-center gap-6">
                           <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{c.credits.toFixed(1)} Cr</span>
                           <span className="font-black text-[var(--text-primary)] border-l border-[var(--border-subtle)] pl-4 w-10 text-right">A-</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center mb-8">
               <FileText className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-3">Transcripts Awaiting Integration</h2>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest max-w-sm leading-relaxed">
              Log your semester results in the <span className="text-[var(--text-primary)] underline">Vault</span> to generate a certified academic progress report.
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary / Certification */}
      <div className="p-10 bg-[var(--text-primary)] text-[var(--bg-primary)] relative z-10 shadow-[var(--card-shadow-elevated)] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex gap-16 items-center">
          <div className="text-left">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-3">Verified Cumulative GPA</p>
             <p className="text-5xl font-black tracking-tighter tabular-nums leading-none">{cgpa.toFixed(2)}</p>
          </div>
          <div className="w-px h-16 bg-[var(--bg-primary)]/20 hidden md:block" />
          <div className="text-left">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-3">Honors Classification</p>
             <p className={`text-xl font-black uppercase tracking-wider ${standing.color}`}>{standing.label}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
           <button className="flex items-center gap-3 bg-[var(--bg-primary)] text-[var(--text-primary)] px-12 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 group">
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" /> Export Certification
           </button>
           <div className="flex items-center gap-2 opacity-30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Digitally Authenticated by Nex-Sys</span>
           </div>
        </div>
      </div>

      <div className="p-8 bg-[var(--bg-tertiary)]/50 text-[10px] font-bold text-[var(--text-tertiary)] text-center uppercase tracking-[0.3em] italic border-t border-[var(--border-subtle)]">
          Vortexa Academic Record Ecosystem · BOU Unit 1.0
      </div>
    </motion.div>
  );
};
