"use client";

import React, { useState } from 'react';
import { 
  History, Calculator, FileText, ChevronRight, Binary, Target, Globe, Cpu, BookOpen, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAcademicStats } from '@/hooks/useAcademicStats';
import { VaultView } from './vault/VaultView';
import { PredictorView } from './vault/PredictorView';
import { TranscriptView } from './vault/TranscriptView';

const CGPAVault: React.FC = () => {
  const [view, setView] = useState<'vault' | 'predictor' | 'transcript'>('vault');
  const { results, cgpa, totalCredits, progress, standing, categories, setResults } = useAcademicStats();

  const handleAddResult = (semester: number, gpa: number, credits: number) => {
    const existing = results.filter(r => r.semester !== semester);
    setResults([...existing, { semester, gpa, credits }].sort((a, b) => a.semester - b.semester));
  };

  const handleRemoveResult = (semester: number) => {
    setResults(results.filter(r => r.semester !== semester));
  };

  return (
    <div className="w-full space-y-6 animate-apple-in pb-12">
      {/* Integrated Header System */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            <span>Academic</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-[var(--text-primary)]">Vault & Predictor</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Academic Central</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">v3.5 Refactor</span>
          </div>
        </div>

        {/* Dense Tab Controller */}
        <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-2xl w-fit border border-[var(--border-subtle)]">
          {[
            { id: 'vault', label: 'Vault', icon: History },
            { id: 'predictor', label: 'Predictor', icon: Calculator },
            { id: 'transcript', label: 'Transcript', icon: FileText }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                view === tab.id 
                  ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'vault' && (
          <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <VaultView 
              results={results}
              cgpa={cgpa}
              totalCredits={totalCredits}
              progress={progress}
              standing={standing}
              onAdd={handleAddResult}
              onRemove={handleRemoveResult}
            />
            
            {/* Milestones & Profile (Kept in orchestrator as they are shared/layout features) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
               <div className="lg:col-span-8">
                  <div className="apple-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
                    <h2 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest mb-10">BSc CSE Degree Milestones</h2>
                    <div className="relative pt-6 pb-2 px-4">
                        <div className="absolute top-[28px] left-10 right-10 h-[2px] bg-[var(--border-subtle)]" />
                        <div className="relative flex justify-between">
                            {[
                              { label: 'Foundation', credits: 36, icon: BookOpen },
                              { label: 'Core Professional', credits: 74, icon: Cpu },
                              { label: 'Specialization', credits: 110, icon: Binary },
                              { label: 'Degree Award', credits: 148, icon: Flag }
                            ].map((m, i) => (
                              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${totalCredits >= m.credits ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl shadow-[var(--text-primary)]/20' : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-tertiary)]'}`}>
                                    <m.icon className="w-4 h-4" />
                                </div>
                                <div className="text-center w-24">
                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${totalCredits >= m.credits ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>{m.label}</p>
                                  <p className="text-[11px] font-bold text-[var(--text-secondary)]">{m.credits} Cr Need</p>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                  </div>
               </div>
               <div className="lg:col-span-4 space-y-6">
                  <div className="apple-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-subtle)] pb-3">
                      <Cpu className="w-4 h-4 text-[var(--text-primary)]" />
                      <h2 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Engineer Profile</h2>
                    </div>
                    
                    <div className="space-y-6">
                        {[
                        { label: 'Core Programming', val: categories.core, color: 'bg-[var(--text-primary)]', icon: Binary },
                        { label: 'Math & Sciences', val: categories.math, color: 'bg-[var(--accent)]', icon: Target },
                        { label: 'General Arts', val: categories.gen, color: 'bg-[var(--text-tertiary)]', icon: Globe }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between px-0.5">
                                <div className="flex items-center gap-2">
                                    <item.icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">{item.label}</span>
                                </div>
                                <span className="text-[11px] font-bold text-[var(--text-primary)]">{item.val.toFixed(1)} Cr</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.val / Math.max(categories.core + categories.math + categories.gen, 1)) * 100}%` }}
                                  className={`h-full ${item.color}`}
                                />
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'predictor' && (
          <motion.div key="predictor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <PredictorView />
          </motion.div>
        )}

        {view === 'transcript' && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TranscriptView 
              results={results}
              cgpa={cgpa}
              totalCredits={totalCredits}
              standing={standing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CGPAVault;
