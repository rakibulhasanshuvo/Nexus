/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { COURSE_MAPPING, COURSE_DETAILS } from '@/lib/constants';
import { explainTopicAction, generateQuizAction } from '@/app/actions/ai';
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, Lightbulb, Loader2, HelpCircle } from 'lucide-react';

interface TopicProgress {
  [courseId: string]: { [weekIdx: number]: boolean };
}

const SyllabusExplorer: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState(0);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [progress, setProgress] = useState<TopicProgress>({});
  const [explanation, setExplanation] = useState<{ courseId: string; topic: string; text: string } | null>(null);
  const [quiz, setQuiz] = useState<{ question: string; options: string[]; correctAnswer: number; explanation: string; selectedAnswer?: number } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);

  const semester = COURSE_MAPPING[selectedSemester];

  useEffect(() => {
    const saved = localStorage.getItem('bou_syllabus_progress');
    if (saved) { try { setProgress(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  useEffect(() => {
    localStorage.setItem('bou_syllabus_progress', JSON.stringify(progress));
  }, [progress]);

  const toggleTopic = (courseId: string, weekIdx: number) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [weekIdx]: !(prev[courseId]?.[weekIdx] || false)
      }
    }));
  };

  const getCompletion = (courseId: string, roadmapLength: number) => {
    if (!progress[courseId] || roadmapLength === 0) return 0;
    const completed = Object.values(progress[courseId]).filter(Boolean).length;
    return Math.round((completed / roadmapLength) * 100);
  };

  const explain = async (courseName: string, topic: string, courseId: string) => {
    setIsExplaining(true);
    setExplanation(null);
    try {
      const text = await explainTopicAction(courseName, topic);
      setExplanation({ courseId, topic, text });
    } catch (e: any) {
      setExplanation({ courseId, topic, text: `⚠️ ${e.message}` });
    } finally {
      setIsExplaining(false);
    }
  };

  const startQuiz = async (courseName: string, topic: string) => {
    setIsQuizzing(true);
    setQuiz(null);
    try {
      const result = await generateQuizAction(courseName, topic);
      if (result) setQuiz(result);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsQuizzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Syllabus Explorer</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Track your progress through the BOU CSE syllabus</p>
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 flex-wrap">
        {COURSE_MAPPING.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedSemester(idx); setExpandedCourse(null); setExplanation(null); setQuiz(null); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedSemester === idx
                ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Sem {idx + 1}
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {semester.courses.map(course => {
          const details = COURSE_DETAILS[course.id];
          const isExpanded = expandedCourse === course.id;
          const roadmap = details?.syllabus_roadmap || [];
          const completion = getCompletion(course.id, roadmap.length);

          return (
            <div key={course.id} className="apple-card overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{course.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{course.id} · {course.credits} credits</p>
                </div>
                {roadmap.length > 0 && (
                  <div className="flex items-center gap-2 mr-2">
                    <div className="w-16 apple-progress">
                      <div className="apple-progress-fill bg-[var(--success)]" style={{ width: `${completion}%` }} />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-tertiary)] w-8">{completion}%</span>
                  </div>
                )}
                {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
              </button>

              {/* Expanded Content */}
              {isExpanded && details && (
                <div className="border-t border-[var(--border-subtle)]">
                  {/* Overview */}
                  <div className="px-5 py-4 bg-[var(--bg-tertiary)]">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{details.overview}</p>
                  </div>

                  {/* Topics */}
                  {details.topics && details.topics.length > 0 && (
                    <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
                      <h4 className="section-header mb-3">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {details.topics.map(topic => (
                          <span key={topic} className="apple-badge apple-badge-blue">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Books */}
                  {details.books && details.books.length > 0 && (
                    <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
                      <h4 className="section-header mb-3">Reference Books</h4>
                      <div className="space-y-2">
                        {details.books.map((book, idx) => (
                          <p key={idx} className="text-sm text-[var(--text-secondary)]">
                            <span className="font-semibold text-[var(--text-primary)]">{book.title}</span>
                            <span className="text-[var(--text-tertiary)]"> — {book.author}, {book.edition} Edition</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roadmap */}
                  {roadmap.length > 0 && (
                    <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
                      <h4 className="section-header mb-3">Syllabus Roadmap</h4>
                      <div className="space-y-2">
                        {roadmap.map((item, idx) => {
                          const done = progress[course.id]?.[idx] || false;
                          return (
                            <div key={idx}>
                              <div className="flex items-center gap-3 py-2 group">
                                <button onClick={() => toggleTopic(course.id, idx)}>
                                  {done ? (
                                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-[var(--text-tertiary)]" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className={`text-sm ${done ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)] font-medium'}`}>
                                    Week {item.week}: {item.topic}
                                  </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => explain(course.name, item.topic, course.id)}
                                    className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-tertiary)] hover:text-[var(--warning)] transition-colors"
                                    title="Explain"
                                  >
                                    <Lightbulb className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => startQuiz(course.name, item.topic)}
                                    className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                                    title="Quiz"
                                  >
                                    <HelpCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Explanation */}
                              {explanation && explanation.courseId === course.id && explanation.topic === item.topic && (
                                <div className="ml-8 mb-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] shadow-sm">
                                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{explanation.text}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Exam Intel */}
                  {details.exam_intel && details.exam_intel.length > 0 && (
                    <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50">
                      <h4 className="section-header mb-3 text-[var(--danger)]">🔥 Exam Intel</h4>
                      <ul className="space-y-1">
                        {details.exam_intel.map((tip, idx) => (
                          <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--danger)] mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!isExpanded && !details && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-[var(--text-tertiary)]">No detailed syllabus data available yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading States */}
      {isExplaining && (
        <div className="fixed bottom-6 right-6 apple-card p-4 flex items-center gap-3 shadow-lg z-50 animate-scale-in">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Getting explanation...</span>
        </div>
      )}

      {/* Quiz Modal */}
      {quiz && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setQuiz(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative apple-card max-w-md w-full p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Quiz</h3>
            <p className="text-sm text-[var(--text-primary)] mb-4">{quiz.question}</p>
            <div className="space-y-2 mb-4">
              {quiz.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuiz(prev => prev ? { ...prev, selectedAnswer: idx } : null)}
                  className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-colors border ${
                    quiz.selectedAnswer !== undefined
                      ? idx === quiz.correctAnswer
                        ? 'bg-[var(--success-subtle)] border-[var(--success)] text-[var(--success)]'
                        : idx === quiz.selectedAnswer
                          ? 'bg-[var(--danger)]/10 border-[var(--danger)] text-[var(--danger)]'
                          : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent)]'
                  }`}
                  disabled={quiz.selectedAnswer !== undefined}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quiz.selectedAnswer !== undefined && quiz.explanation && (
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] mb-4 shadow-sm">
                <p className="text-sm text-[var(--text-primary)]">{quiz.explanation}</p>
              </div>
            )}
            <button onClick={() => setQuiz(null)} className="apple-btn-secondary w-full">Close</button>
          </div>
        </div>
      )}

      {isQuizzing && (
        <div className="fixed bottom-6 right-6 apple-card p-4 flex items-center gap-3 shadow-lg z-50 animate-scale-in">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Generating quiz...</span>
        </div>
      )}
    </div>
  );
};

export default SyllabusExplorer;
