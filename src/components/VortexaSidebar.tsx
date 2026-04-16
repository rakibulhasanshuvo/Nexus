"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, TrendingUp, Award, Calendar, 
  ChevronRight, MessageSquare, BookOpen,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VortexaSidebarProps {
  stats: {
    cgpa: number;
    credits: number;
  };
}

const VortexaSidebar: React.FC<VortexaSidebarProps> = ({ stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allCircles = [
    { id: '0533-101', name: 'Physics I', active: 12, color: 'from-orange-400 to-red-500' },
    { id: '0613-101', name: 'SPL Circle', active: 28, color: 'from-blue-400 to-indigo-500' },
    { id: '0541-101', name: 'Calculus Hub', active: 15, color: 'from-emerald-400 to-teal-500' },
    { id: '0231-101', name: 'English Lab', active: 9, color: 'from-purple-400 to-pink-500' },
    { id: '0522-101', name: 'Discrete Math', active: 21, color: 'from-cyan-400 to-blue-600' },
    { id: '0611-101', name: 'Comp. Design', active: 14, color: 'from-rose-400 to-orange-500' },
  ];

  const displayedCircles = isExpanded ? allCircles : allCircles.slice(0, 4);

  return (
    <div className="space-y-6 animate-apple-in pb-20">
      {/* Mini Progress Widget */}
      <div className="apple-card p-5 overflow-hidden relative border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--card-shadow)]">
        <div className="absolute top-0 right-0 p-5 opacity-5 dark:opacity-[0.02]">
          <Award className="w-20 h-20 text-[var(--text-primary)]" />
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-6 flex items-center gap-2">
          Academic Overview
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              {stats.cgpa > 0 ? stats.cgpa.toFixed(2) : '—'}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1.5">CGPA</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              {stats.credits.toFixed(0)}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1.5">Credits</p>
          </div>
        </div>
        <div className="mt-8 apple-progress h-1.5 bg-[var(--bg-tertiary)]">
          <div 
            className="apple-progress-fill bg-[var(--text-primary)]" 
            style={{ width: `${(stats.credits / 148) * 100}%` }}
          />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="apple-card p-5 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none shadow-[var(--card-shadow-elevated)] transition-all hover:scale-[1.02] duration-500">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--bg-primary)]/50 mb-8 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Deadlines
        </h2>
        <div className="space-y-6">
          <div className="flex gap-5">
            <div className="h-12 w-1.5 bg-[var(--danger)] rounded-full shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
            <div>
              <p className="text-[14px] font-bold tracking-tight">TMA 1: Physics I</p>
              <p className="text-[11px] text-[var(--danger)] font-bold uppercase tracking-widest mt-1.5">Due in 3 days</p>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="h-12 w-1.5 bg-[var(--bg-primary)]/20 rounded-full" />
            <div>
              <p className="text-[14px] font-bold tracking-tight">Lab Report: SPL</p>
              <p className="text-[11px] text-[var(--bg-primary)]/40 font-bold uppercase tracking-widest mt-1.5">Due in 1 week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Circles Widget */}
      <div className="apple-card p-5 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] flex items-center gap-2">
            <Users className="w-4 h-4" /> Study Circles
          </h2>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--success-subtle)] border border-[var(--success)]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[var(--success-glow)]" />
            <span className="text-[10px] font-bold text-[var(--success)] uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {displayedCircles.map(circle => (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Link 
                  href={`/course/${circle.id}`}
                  className="w-full text-left p-4 rounded-2xl hover:bg-[var(--text-primary)] transition-all group flex items-center gap-5 border border-[var(--border-subtle)] hover:border-[var(--text-primary)] shadow-sm"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${circle.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/10 transition-transform group-hover:scale-105`}>
                    <span className="text-[11px] font-bold text-[var(--bg-primary)] uppercase tracking-tighter">{circle.id.split('-')[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--bg-primary)] transition-colors">
                      {circle.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] group-hover:bg-[var(--bg-primary)] animate-pulse" />
                      <p className="text-[11px] text-[var(--text-tertiary)] group-hover:text-[var(--bg-primary)]/60 font-bold uppercase tracking-tight">
                        {circle.active} online
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--bg-primary)] transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {allCircles.length > 4 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 mt-2 text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
            >
              {isExpanded ? (
                <>Collapse Topics <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>+{allCircles.length - 4} More Subjects <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



export default VortexaSidebar;
