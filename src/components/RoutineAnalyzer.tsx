"use client";

import React, { useState, useEffect } from 'react';
import { extractRoutineAction } from '@/app/actions/ai';
import { ExamRoutineItem } from '@/lib/types';
import { Image as ImageIcon, Upload, Calendar, Loader2, Trash2, Clock } from 'lucide-react';

const RoutineAnalyzer: React.FC = () => {
  const [routine, setRoutine] = useState<ExamRoutineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bou_exam_routine');
    if (saved) { try { setRoutine(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  useEffect(() => {
    if (routine.length > 0) {
      localStorage.setItem('bou_exam_routine', JSON.stringify(routine));
    }
  }, [routine]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);

    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const items = await extractRoutineAction(base64, file.type, userApiKey);
        if (items.length === 0) {
          setError('No exam schedule found in the image. Please try a different image.');
        } else {
          setRoutine(items);
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const clearRoutine = () => {
    setRoutine([]);
    localStorage.removeItem('bou_exam_routine');
  };

  const getCountdown = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff < 0) return 'Past';
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Routine Analyzer</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Upload your exam routine image to extract the schedule</p>
      </div>

      {/* Upload Card */}
      <div className="apple-card p-8 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-6 shadow-xl shadow-[var(--accent)]/20">
            <ImageIcon className="w-8 h-8 text-[var(--bg-primary)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Upload Exam Routine</h2>
          <p className="text-sm text-[var(--text-tertiary)] max-w-sm mb-6 font-medium">
            Upload a photo or screenshot of your BOU exam routine. AI will extract dates and courses automatically.
          </p>
          <label className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-xl font-bold text-[13px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-[var(--text-primary)]/10">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Upload className="w-4 h-4" /> Choose Image</>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isLoading} />
          </label>
          {error && <p className="text-xs text-[var(--danger)] mt-3 font-bold">{error}</p>}
        </div>
      </div>

      {/* Routine List */}
      {routine.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Extracted Schedule</h2>
            <button onClick={clearRoutine} className="apple-btn-secondary text-xs flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="space-y-3">
            {routine.map((item, idx) => (
              <div key={idx} className="apple-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex flex-col items-center justify-center">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{item.code}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{item.date} {item.time && `· ${item.time}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{getCountdown(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineAnalyzer;
