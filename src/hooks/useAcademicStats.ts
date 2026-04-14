"use client";

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { SemesterResult } from '@/lib/types';
import { COURSE_MAPPING } from '@/lib/constants';

const TOTAL_REQUIRED_CREDITS = 148;

/**
 * Hook to manage and calculate BOU academic stats.
 * Centralizes results, CGPA calculation, and progress tracking.
 */
export function useAcademicStats() {
  const [results, setResults] = useLocalStorage<SemesterResult[]>('bou_cgpa_vault', []);

  const stats = useMemo(() => {
    const totalCredits = results.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0);
    const totalPoints = results.reduce((acc, curr) => acc + ((Number(curr.gpa) || 0) * (Number(curr.credits) || 0)), 0);
    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const progress = (totalCredits / TOTAL_REQUIRED_CREDITS) * 100;

    // Honors Standing Logic
    let standing = { label: 'Pass Standing', color: 'text-[var(--danger)]' };
    if (cgpa >= 3.75) standing = { label: 'First Class Honors with Distinction', color: 'text-[var(--success)]' };
    else if (cgpa >= 3.0) standing = { label: 'First Class Honors', color: 'text-[var(--success)]' };
    else if (cgpa >= 2.25) standing = { label: 'Second Class Honors', color: 'text-[var(--accent)]' };

    // Credit Categorization logic moved from CGPAVault
    let core = 0, math = 0, gen = 0;
    results.forEach(sem => {
      const semCourses = COURSE_MAPPING[sem.semester - 1]?.courses || [];
      semCourses.forEach(c => {
        const id = c.id.toLowerCase();
        if (id.startsWith('0613') || id.startsWith('cse')) core += c.credits;
        else if (id.startsWith('0533') || id.startsWith('0541') || id.startsWith('mat') || id.startsWith('che') || id.startsWith('phy')) math += c.credits;
        else gen += c.credits;
      });
    });

    return {
      results,
      cgpa,
      totalCredits,
      progress,
      standing,
      categories: { core, math, gen },
      setResults
    };
  }, [results, setResults]);

  return stats;
}
