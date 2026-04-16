"use client";

import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { COURSE_MAPPING } from '@/lib/constants';
import { SemesterResult } from '@/lib/types';

interface VaultViewProps {
  results: SemesterResult[];
  cgpa: number;
  totalCredits: number;
  progress: number;
  standing: { label: string; color: string };
  onAdd: (sem: number, gpa: number, credits: number) => void;
  onRemove: (semester: number) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ 
  results, cgpa, totalCredits, progress, standing, onAdd, onRemove 
}) => {
  const [editing, setEditing] = useState({ semester: '', gpa: '', credits: '' });

  const handleAdd = () => {
    const sem = parseInt(editing.semester);
    const gpa = parseFloat(editing.gpa);
    const credits = parseFloat(editing.credits);
    if (isNaN(sem) || isNaN(gpa) || isNaN(credits)) return;
    onAdd(sem, gpa, credits);
    setEditing({ semester: '', gpa: '', credits: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Analytics Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CGPA CARD */}
          <div className="apple-card p-6 bg-[var(--text-primary)] text-[var(--bg-primary)] relative h-[150px] flex flex-col justify-between overflow-hidden group">
            <div className="grid grid-cols-2 gap-4 h-full relative z-10">
              <div className="flex flex-col justify-between py-1">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 opacity-80">
                      <TrendingUp className={`w-3.5 h-3.5 ${standing.color}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--bg-primary)]">Cumulative GPA</span>
                   </div>
                   <div className="flex items-baseline gap-2 mt-2">
                     <p className="text-5xl font-black tracking-tighter text-[var(--bg-primary)]">{cgpa.toFixed(2)}</p>
                     <span className="text-xs font-bold opacity-30 text-[var(--bg-primary)]">/ 4.00</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end py-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-current bg-current/10 ${standing.color}`}>
                   {standing.label}
                </span>
                
                <div className="text-right space-y-2 w-full max-w-[140px]">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--bg-primary)]/50 mb-1">
                      <span>Growth View</span>
                      <span className="text-[var(--success)]">Target</span>
                   </div>
                   {results.length < 2 ? (
                     <div className="space-y-1.5">
                        <p className="text-[12px] font-bold text-[var(--bg-primary)] tracking-tight">Aim for 3.00+</p>
                        <div className="h-1.5 w-full bg-[var(--bg-primary)]/10 rounded-full overflow-hidden border border-[var(--bg-primary)]/20">
                           <div className="h-full bg-[var(--success)] w-3/4 rounded-full" />
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-1.5">
                        <p className={`text-[12px] font-bold tracking-tight ${results[results.length-1].gpa >= results[Math.max(0, results.length-2)].gpa ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                          {results[results.length-1].gpa >= results[Math.max(0, results.length-2)].gpa ? '+ UPWARD TREND' : '- DOWNWARD TREND'}
                        </p>
                        <div className="h-1 w-full bg-[var(--bg-primary)]/10 rounded-full overflow-hidden">
                           <div className={`h-full ${results[results.length-1].gpa >= results[Math.max(0, results.length-2)].gpa ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} style={{ width: '100%' }} />
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
            {/* Sparkline could be added back here if desired */}
          </div>

          {/* PROGRESS CARD */}
          <div className="apple-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] h-[150px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-[var(--text-secondary)] mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Graduation Path</span>
                </div>
                <span className="text-[11px] font-bold text-[var(--text-primary)]">{totalCredits.toFixed(1)} <span className="text-[var(--text-tertiary)]">/ 148</span></span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[var(--text-primary)] rounded-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
               <p className="text-lg font-bold text-[var(--text-primary)]">{progress.toFixed(1)}% Completed</p>
               <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--success)] bg-[var(--success)]/10 px-3 py-1 rounded-lg">8 Sem Journey</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="apple-card bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/30">
            <h2 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Academic History Log</h2>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{results.length} Semesters</span>
               <div className="w-px h-3 bg-[var(--border-subtle)]" />
               <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Verified Records</span>
            </div>
          </div>
          {results.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)] max-h-[400px] overflow-y-auto no-scrollbar">
              {results.map(r => (
                <div key={r.semester} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-tertiary)]/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm border border-[var(--border-subtle)]">
                      {r.semester}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Semester {r.semester}</p>
                      <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wide mt-0.5">{r.credits} Credits Earned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{r.gpa.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider -mt-1">GPA</p>
                    </div>
                    <button onClick={() => onRemove(r.semester)} aria-label="Delete result" className="p-2 rounded-lg hover:bg-[var(--danger-subtle)] text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)] border border-dashed border-[var(--border-subtle)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Awaiting Academic History Integration</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Log Result */}
      <div className="lg:col-span-4 space-y-6">
        <div className="apple-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-subtle)] pb-3">
             <Plus className="w-4 h-4 text-[var(--text-secondary)]" />
             <h2 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Log Result</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block ml-1">Semester Level</label>
              <select
                value={editing.semester}
                onChange={e => setEditing(prev => ({ ...prev, semester: e.target.value }))}
                className="apple-select text-[13px] h-10 w-full font-bold focus:ring-0"
              >
                <option value="">Choose Semester</option>
                {COURSE_MAPPING.map((_, idx) => (
                  <option key={idx} value={idx + 1}>Semester {idx + 1}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block ml-1">GPA Score</label>
                <input
                  type="number" min="0" max="4" step="0.01"
                  value={editing.gpa}
                  onChange={e => setEditing(prev => ({ ...prev, gpa: e.target.value }))}
                  className="apple-input text-sm h-10 font-bold" placeholder="4.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block ml-1">Credits</label>
                <input
                  type="number" min="0" step="0.5"
                  value={editing.credits}
                  onChange={e => setEditing(prev => ({ ...prev, credits: e.target.value }))}
                  className="apple-input text-sm h-10 font-bold" placeholder="17.0"
                />
              </div>
            </div>

            <button 
              onClick={handleAdd} 
              className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[var(--text-primary)]/10 mt-2"
            >
              Save to Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
