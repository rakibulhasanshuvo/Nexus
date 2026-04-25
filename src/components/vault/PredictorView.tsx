"use client";

import React, { useState } from 'react';
import { Calculator, RotateCw, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { COURSE_MAPPING, ACADEMIC_RULES, GRADING_BRACKETS } from '@/lib/constants';

export const PredictorView: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState(0);
  const [caMarks, setCaMarks] = useState<Record<string, string>>({});
  const [finalMarks, setFinalMarks] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<{ gpa: number; courseResults: { name: string; total: number; grade: string; gradePoint: number }[] } | null>(null);

  const getGrade = (mark: number) => {
    for (const b of GRADING_BRACKETS) {
      if (mark >= b.min && mark <= b.max) return { grade: b.grade, point: b.point };
    }
    return { grade: 'F', point: 0 };
  };

  const calculatePrediction = () => {
    const semester = COURSE_MAPPING[selectedSemester];
    const courseResults: { name: string; total: number; grade: string; gradePoint: number }[] = [];
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of semester.courses) {
      const caWeight = course.type === 'theory' 
        ? ACADEMIC_RULES.marking_distribution.theory_courses.continuous_assessment_weight 
        : ACADEMIC_RULES.marking_distribution.practical_courses.continuous_assessment_weight;
      
      const finalWeight = course.type === 'theory' 
        ? ACADEMIC_RULES.marking_distribution.theory_courses.final_exam_weight 
        : ACADEMIC_RULES.marking_distribution.practical_courses.final_exam_weight;

      const ca = parseFloat(caMarks[course.id] || '0');
      const final_ = parseFloat(finalMarks[course.id] || '0');
      const total = (ca * caWeight) + (final_ * finalWeight);
      const { grade, point } = getGrade(total);

      courseResults.push({ name: course.name, total: Math.round(total * 100) / 100, grade, gradePoint: point });
      totalPoints += point * course.credits;
      totalCredits += course.credits;
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setPrediction({ gpa, courseResults });
  };

  return (
    <div className="space-y-6">
      {/* Semester Selector */}
      <div className="flex gap-2 flex-wrap p-2 bg-[var(--bg-tertiary)] rounded-2xl w-fit border border-[var(--border-subtle)]">
        {COURSE_MAPPING.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedSemester(idx); setPrediction(null); }}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${
              selectedSemester === idx
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sem {idx + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 px-1">
             <h2 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Marks Input Matrix: S{selectedSemester + 1}</h2>
             <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Scale: 0 - 100</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COURSE_MAPPING[selectedSemester].courses.map(course => (
              <div key={course.id} className="apple-card p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] group hover:border-[var(--text-primary)] transition-all shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">{course.name}</p>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] tracking-wider uppercase mt-0.5">{course.credits} Cr · {course.type}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase ml-1 text-center block" htmlFor={`ca-${course.id}`}>CA (30/40%)</label>
                    <input
                      id={`ca-${course.id}`}
                      type="number"
                      value={caMarks[course.id] || ''}
                      onChange={e => setCaMarks(prev => ({ ...prev, [course.id]: e.target.value }))}
                      className="apple-input bg-[var(--bg-tertiary)]/50 text-sm h-9 border-[var(--border-subtle)] focus:bg-[var(--bg-secondary)] font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase ml-1 text-center block" htmlFor={`final-${course.id}`}>Final (70/60%)</label>
                    <input
                      id={`final-${course.id}`}
                      type="number"
                      value={finalMarks[course.id] || ''}
                      onChange={e => setFinalMarks(prev => ({ ...prev, [course.id]: e.target.value }))}
                      className="apple-input bg-[var(--bg-tertiary)]/50 text-sm h-9 border-[var(--border-subtle)] focus:bg-[var(--bg-secondary)] font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="apple-card p-6 bg-[var(--text-primary)] text-[var(--bg-primary)] h-[200px] flex flex-col justify-between overflow-hidden relative group shadow-2xl shadow-[var(--text-primary)]/10">
             <div className="z-10">
               <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 mb-3">Projected Term GPA</p>
               <p className="text-7xl font-bold tracking-tighter group-hover:scale-105 transition-transform origin-left">{prediction?.gpa.toFixed(2) || '0.00'}</p>
             </div>
             
             <div className="flex gap-3 z-10">
               <button onClick={calculatePrediction} className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] h-11 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg">
                 <Calculator className="w-4 h-4" /> Run Analytics
               </button>
               <button aria-label="Reset Predictor" onClick={() => { setCaMarks({}); setFinalMarks({}); setPrediction(null); }} className="w-11 h-11 rounded-xl bg-[var(--bg-primary)]/10 text-[var(--bg-primary)] flex items-center justify-center hover:bg-[var(--bg-primary)]/20 transition-all border border-[var(--bg-primary)]/5">
                 <RotateCw className="w-4 h-4" />
               </button>
             </div>

             <Calculator className="absolute right-[-10px] bottom-[-10px] w-28 h-28 opacity-5 rotate-12 transition-transform duration-700" />
          </div>

          {prediction && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="apple-card bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-[var(--card-shadow)]"
             >
               <div className="px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Expected Grades</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--success)]">Analysis Complete</span>
               </div>
               <div className="divide-y divide-[var(--border-subtle)]">
                  {prediction.courseResults.map((cr, idx) => (
                    <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                      <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[180px]">{cr.name}</span>
                      <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${cr.grade === 'F' ? 'bg-[var(--danger-subtle)] text-[var(--danger)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}`}>{cr.grade}</span>
                         <span className="text-sm font-bold text-[var(--text-primary)] text-right min-w-[35px]">{cr.gradePoint.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
               </div>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
