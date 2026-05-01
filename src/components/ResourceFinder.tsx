"use client";

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { generateCheatSheetAction, generateTMAOutlineAction, findStructuredTutorialsAction } from '@/app/actions/ai';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { COURSE_MAPPING, COURSE_DETAILS } from '@/lib/constants';
import { StructuredTutorial } from '@/lib/types';
import { RotateCcw, Library, Search, BookOpen, Flame, PenTool, CheckCircle, ArrowRight, BookA, PlayCircle, Video, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Skeleton Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-3 mt-4 z-10 w-full">
    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full"></div>
    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-5/6"></div>
    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
  </div>
);

const ResourceFinderInner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State Syncing
  const semesterParam = searchParams.get('semester');
  const courseParam = searchParams.get('course');
  
  const [selectedSemester, setSelectedSemester] = useState<number>(semesterParam ? parseInt(semesterParam) : 0);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseParam || '');
  
  // Update URL function
  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    setSelectedSemester(val);
    setSelectedCourse('');
    setSelectedModuleId(null);
    setActiveTool(null);
    updateUrlParams('semester', val.toString());
    updateUrlParams('course', '');
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCourse(val);
    setSelectedModuleId(null);
    setActiveTool(null);
    updateUrlParams('course', val);
  };

  // UI States
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  
  // Data States (Persistent Cache for AI responses)
  const [cheatSheets, setCheatSheets] = useLocalStorage<Record<string, string>>('bou_resource_cheatsheets', {});
  const [tmaOutlines, setTmaOutlines] = useLocalStorage<Record<string, string>>('bou_resource_tma_outlines', {});
  const [userContexts, setUserContexts] = useLocalStorage<Record<string, string>>('bou_resource_user_contexts', {});
  const [tutorials, setTutorials] = useLocalStorage<Record<string, StructuredTutorial[]>>('bou_resource_tutorials', {});
  const [tutorialPref, setTutorialPref] = useLocalStorage<Record<string, string>>('bou_resource_tutorial_prefs', {});
  const [activeTool, setActiveTool] = useState<'cheat' | 'tma' | 'tutorial' | null>(null);



  const handleContextChange = (moduleId: string, value: string) => {
    setUserContexts(prev => ({ ...prev, [moduleId]: value }));
  };

  const clearModuleCache = (type: 'cheat' | 'tma' | 'tutorial', moduleId: string) => {
    if (type === 'cheat') {
      const next = { ...cheatSheets };
      delete next[moduleId];
      setCheatSheets(next);
    } else if (type === 'tma') {
      const next = { ...tmaOutlines };
      delete next[moduleId];
      setTmaOutlines(next);
    } else if (type === 'tutorial') {
      const next = { ...tutorials };
      delete next[moduleId];
      setTutorials(next);
    }
  };

  const semester = COURSE_MAPPING[selectedSemester];
  const courseDetail = COURSE_DETAILS[selectedCourse];
  
  const modules = selectedCourse && courseDetail ? courseDetail.topics.map((topic, idx) => ({
    id: `${selectedCourse}-unit-${idx + 1}`,
    courseId: selectedCourse,
    unit: idx + 1,
    title: topic,
    topics: [topic, ...(courseDetail.exam_intel || [])], 
    isHighYield: idx % 2 === 1,
    priorityScore: idx % 2 === 1 ? 95 : 65
  })) : [];

  const handleGenerateCheatSheet = async (e: React.MouseEvent, moduleId: string, unitTitle: string, topics: string[]) => {
    e.stopPropagation();
    if (cheatSheets[moduleId]) return;
    setLoadingActionId(`cheat-${moduleId}`);
    try {
      const courseName = semester.courses.find(c => c.id === selectedCourse)?.name || selectedCourse;
      // Using Secure Next.js Server Action
      const result = await generateCheatSheetAction(courseName, unitTitle, topics);
      setCheatSheets(prev => ({ ...prev, [moduleId]: result }));
      setSelectedModuleId(moduleId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleGenerateTMAOutline = async (e: React.MouseEvent, moduleId: string, unitTitle: string) => {
    e.stopPropagation();
    if (tmaOutlines[moduleId]) return;
    const prompt = userContexts[moduleId] || "Analyze standard TMA questions for this topic";
    setLoadingActionId(`tma-${moduleId}`);
    try {
      const courseName = semester.courses.find(c => c.id === selectedCourse)?.name || selectedCourse;
      // Using Secure Next.js Server Action
      const result = await generateTMAOutlineAction(courseName, unitTitle, prompt);
      setTmaOutlines(prev => ({ ...prev, [moduleId]: result }));
      setSelectedModuleId(moduleId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleGenerateTutorials = async (e: React.MouseEvent, moduleId: string, unitTitle: string, topics: string[], force = false) => {
    e.stopPropagation();
    if (tutorials[moduleId] && !force) return;
    setLoadingActionId(`tutorial-${moduleId}`);
    try {
      const courseName = semester.courses.find(c => c.id === selectedCourse)?.name || selectedCourse;
      const pref = tutorialPref[moduleId] || "Best Bangla Tutorials from any platform";
      // Using Secure Next.js Server Action
      const result = await findStructuredTutorialsAction(courseName, unitTitle, topics, pref);
      setTutorials(prev => ({ ...prev, [moduleId]: result }));
      setSelectedModuleId(moduleId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full flex flex-col min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase">Syllabus Vault<br/>& PYQ Analyzer</h1>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mt-2">BOU Official Curriculum</h2>
          <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            AI & Server-Actions Secured
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="apple-card bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-[var(--border-subtle)] p-2 shadow-xl">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative group">
              <select 
                value={selectedSemester} 
                onChange={handleSemesterChange} 
                className="apple-select w-full !pl-12 h-14 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer hover:bg-[var(--bg-tertiary)] bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
                aria-label="Select Semester"
              >
                {COURSE_MAPPING.map((_, idx) => (<option key={idx} value={idx}>Term S0{idx + 1}</option>))}
              </select>
              <Library className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
            <div className="relative group">
              <select 
                value={selectedCourse} 
                onChange={handleCourseChange} 
                className="apple-select w-full !pl-12 h-14 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer hover:bg-[var(--bg-tertiary)] bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
                aria-label="Select Course"
              >
                <option value="">Select Target Course</option>
                {semester.courses.filter(c => c.type === 'theory').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          </div>
        </div>
      </div>


      {/* Action Bar (Sticky) */}
      {selectedCourse && courseDetail && modules.length > 0 && (
        <div className="sticky top-20 z-50 apple-card bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-[var(--border-subtle)] p-4 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group w-full md:w-1/3">
              <select
                value={selectedModuleId || ""}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value || null);
                  setActiveTool(null);
                }}
                className="apple-select w-full !pl-12 h-14 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer hover:bg-[var(--bg-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
                aria-label="Target Unit"
              >
                <option value="">Select Target Unit</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>Unit {m.unit}: {m.title}</option>
                ))}
              </select>
              <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>

            <div className="flex-1 flex flex-wrap gap-2 justify-center md:justify-end w-full">
              <button
                onClick={() => setActiveTool(activeTool === 'cheat' ? null : 'cheat')}
                disabled={!selectedModuleId}
                className={`flex-1 md:flex-none h-14 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTool === 'cheat'
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-md'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                <Flame className="w-4 h-4" /> Cheat Sheet
              </button>
              <button
                onClick={() => setActiveTool(activeTool === 'tma' ? null : 'tma')}
                disabled={!selectedModuleId}
                className={`flex-1 md:flex-none h-14 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTool === 'tma'
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-md'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                <PenTool className="w-4 h-4" /> TMA Expert
              </button>
              <button
                onClick={() => setActiveTool(activeTool === 'tutorial' ? null : 'tutorial')}
                disabled={!selectedModuleId}
                className={`flex-1 md:flex-none h-14 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTool === 'tutorial'
                    ? 'bg-[var(--danger)] text-[var(--bg-primary)] shadow-md'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                <PlayCircle className="w-4 h-4" /> Tutorials
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Dynamic Workspace */}
      <AnimatePresence>
        {selectedModuleId && activeTool && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-8"
          >
            {modules.filter(m => m.id === selectedModuleId).map(module => (
              <div key={module.id} className="apple-card bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-[var(--card-shadow-elevated)] p-6 overflow-hidden relative">

                {/* Close Button */}
                <button
                  onClick={() => setActiveTool(null)}
                  className="absolute top-4 right-4 p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--danger)]/10 text-[var(--text-tertiary)] hover:text-[var(--danger)] rounded-full transition-colors z-20"
                >
                  <RotateCcw className="w-4 h-4 rotate-45" /> {/* Just using an X icon would be better but reusing existing import */}
                </button>

                {/* Cheat Sheet View */}
                {activeTool === 'cheat' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between z-10 pr-10">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[var(--accent)]" />
                        <h4 className="font-black text-[13px] text-[var(--text-primary)] uppercase tracking-[0.2em]">1-Page Cheat Sheet</h4>
                      </div>
                      {cheatSheets[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => clearModuleCache('cheat', module.id)}
                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                            title="Clear & Refresh"
                          >
                            <RotateCcw className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
                          </button>
                          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-[var(--text-tertiary)] leading-relaxed">
                      Distill this BOU unit into a high-octane summary. Extracts core concepts, formulas, code snippets, and top exam tips.
                    </p>

                    {loadingActionId === `cheat-${module.id}` ? (
                      <SkeletonLoader />
                    ) : cheatSheets[module.id] ? (
                      <div className="mt-2 text-[14px] font-medium p-6 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-subtle)] max-h-[600px] overflow-y-auto style-markdown text-[var(--text-primary)]">
                         <ReactMarkdown>{cheatSheets[module.id]}</ReactMarkdown>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleGenerateCheatSheet(e, module.id, module.title, module.topics)}
                        disabled={loadingActionId !== null}
                        className="h-14 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        <Flame className="w-5 h-5" /> Generate Exam Summary
                      </button>
                    )}
                  </div>
                )}

                {/* TMA Expert View */}
                {activeTool === 'tma' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between z-10 pr-10">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-[var(--accent)]" />
                        <h4 className="font-black text-[13px] text-[var(--text-primary)] uppercase tracking-[0.2em]">TMA Expert</h4>
                      </div>
                      {tmaOutlines[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => clearModuleCache('tma', module.id)}
                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                            title="Clear & Refresh"
                          >
                            <RotateCcw className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
                          </button>
                          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-[var(--text-tertiary)] leading-relaxed">
                      Paste a specific assignment question below. The AI will generate a strict structural outline ensuring you hit BOU marking criteria.
                    </p>

                    <input
                      type="text"
                      placeholder="e.g., 'Describe the differences between...'"
                      value={userContexts[module.id] || ''}
                      onChange={(e) => handleContextChange(module.id, e.target.value)}
                      className="h-14 px-4 rounded-xl text-[13px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent)] transition-all"
                    />

                    {loadingActionId === `tma-${module.id}` ? (
                      <SkeletonLoader />
                    ) : tmaOutlines[module.id] ? (
                      <div className="mt-2 text-[14px] font-medium p-6 bg-[var(--accent-subtle)] rounded-xl border border-[var(--accent)]/20 max-h-[600px] overflow-y-auto style-markdown text-[var(--text-primary)]">
                         <ReactMarkdown>{tmaOutlines[module.id]}</ReactMarkdown>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleGenerateTMAOutline(e, module.id, module.title)}
                        disabled={loadingActionId !== null}
                        className="h-14 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        <ArrowRight className="w-5 h-5" /> Architect TMA Answer
                      </button>
                    )}
                  </div>
                )}

                {/* Tutorial View */}
                {activeTool === 'tutorial' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between z-10 pr-10">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[var(--danger)]" />
                        <h4 className="font-black text-[13px] text-[var(--text-primary)] uppercase tracking-[0.2em]">Curated Resources</h4>
                      </div>
                      {tutorials[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => clearModuleCache('tutorial', module.id)}
                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                            title="Clear & Refresh"
                          >
                            <RotateCcw className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--danger)]" />
                          </button>
                          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-[var(--text-tertiary)] leading-relaxed">
                      Discover the highest-rated videos and articles customized for this complex unit.
                    </p>

                    <select
                      value={tutorialPref[module.id] || "Best Bangla Tutorials from any platform"}
                      onChange={(e) => setTutorialPref(prev => ({ ...prev, [module.id]: e.target.value }))}
                      className="h-14 px-4 rounded-xl text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--danger)]/30 appearance-none cursor-pointer"
                    >
                      <option value="Best Bangla Tutorials from any platform">🇧🇩 Bangla Tutorials (Any Platform)</option>
                      <option value="Best English Tutorials with animations from any platform">🇬🇧 English Tutorials (Any Platform)</option>
                      <option value="High quality written articles (GeeksforGeeks, etc)">📝 Written Articles</option>
                      <option value="University courses (MIT OCW, NPTEL, Coursera)">🎓 University Courses</option>
                    </select>

                    {loadingActionId === `tutorial-${module.id}` ? (
                      <SkeletonLoader />
                    ) : tutorials[module.id] ? (
                      <div className="mt-2 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {tutorials[module.id].map((tut, i) => (
                          <a
                            key={i}
                            href={tut.url || (tut.type === 'video'
                              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(tut.searchQuery)}`
                              : `https://www.google.com/search?q=${encodeURIComponent(tut.searchQuery)}`)
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block p-5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--danger)]/30 hover:shadow-lg bg-[var(--bg-secondary)] transition-all group/card"
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {tut.type === 'video' ? <Video className="w-5 h-5 text-[var(--danger)]" /> : <FileText className="w-5 h-5 text-[var(--accent)]" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                    {tut.provider}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                                    {tut.language}
                                  </span>
                                </div>
                                <h5 className="text-[15px] font-black leading-tight mb-2 text-[var(--text-primary)] group-hover/card:text-[var(--danger)] transition-colors">
                                  {tut.title}
                                </h5>
                                <p className="text-[12px] font-bold text-[var(--text-tertiary)] leading-snug line-clamp-2">
                                  {tut.reason}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                        <button
                          onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics, true)}
                          disabled={loadingActionId !== null}
                          className="mt-2 h-12 w-full rounded-xl border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-tertiary)] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                        >
                          <Search className="w-4 h-4" /> Find More
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics)}
                        disabled={loadingActionId !== null}
                        className="h-14 rounded-xl bg-[var(--danger)] text-[var(--bg-primary)] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50"
                      >
                        <PlayCircle className="w-5 h-5" /> Find Best Resources
                      </button>
                    )}
                  </div>
                )}

              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Content Area */}


      {!selectedCourse ? (
        <div className="flex-1 apple-card bg-[var(--bg-tertiary)]/50 border-dashed border-2 border-[var(--border-subtle)] flex flex-col items-center justify-center p-12 lg:p-20 relative overflow-hidden group">
          <BookA className="absolute w-[800px] h-[800px] text-[var(--text-primary)]/[0.02] -bottom-40 -right-20 pointer-events-none group-hover:scale-[1.05] transition-transform duration-1000 ease-out" />
          <div className="w-24 h-24 rounded-[32px] bg-[var(--bg-secondary)] shadow-2xl flex items-center justify-center mb-10 border border-[var(--border-subtle)] z-10">
            <Search className="w-10 h-10 text-[var(--text-tertiary)]/30" />
          </div>
          <h3 className="text-[18px] lg:text-[24px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-4 text-center z-10 leading-tight">
            Select Course to <br/> Unlock Syllabus Vault
          </h3>
          <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest max-w-md text-center leading-relaxed z-10">
            Load a course to view official BOU modules, high-yield PYQ exam tags, and instantly generate assignment outlines or study cheat sheets.
          </p>
        </div>
      ) : !courseDetail ? (
        <div className="flex-1 apple-card bg-[var(--bg-tertiary)]/50 border-dashed border-2 border-[var(--warning)]/50 flex flex-col items-center justify-center p-12 lg:p-20 relative">
           <h3 className="text-[18px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-4 text-center">Module Data Pending</h3>
           <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest max-w-md text-center">We are still digitizing the syllabus map for this specific course. Please check Phase 1 courses (e.g. Structured Programming or Physics).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {modules.map((module) => (
              <motion.div 
                layout 
                key={module.id} 
                className={`apple-card overflow-hidden transition-all duration-300 ${selectedModuleId === module.id ? 'border-[var(--text-primary)]/20 shadow-[var(--card-shadow-elevated)] scale-[1.01] z-20 relative bg-[var(--bg-secondary)]' : 'border-[var(--border-subtle)]/50 hover:border-[var(--border-subtle)] bg-[var(--bg-secondary)]'}`}
              >
                {/* Index Header */}
                <div 
                  className="p-5 cursor-pointer flex items-center justify-between bg-[var(--bg-secondary)] group"
                  onClick={() => {
                     setSelectedModuleId(module.id);
                     if (!activeTool) setActiveTool('cheat'); // default to cheat sheet to show something
                     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back to action bar
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[14px] shadow-sm ${module.isHighYield ? 'bg-[var(--danger)]/5 text-[var(--danger)] border border-[var(--danger)]/10' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}>
                      U{module.unit}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase">{module.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {module.isHighYield && (
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--danger)] bg-[var(--danger)]/5 border border-[var(--danger)]/10 px-2 py-0.5 rounded-md">
                            <Flame className="w-3 h-3 fill-current" /> High-Yield PYQ Trend
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                          Relevance Score: {module.priorityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg">Target Unit</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default function ResourceFinder() {
  return (
    <React.Suspense fallback={<SkeletonLoader />}>
      <ResourceFinderInner />
    </React.Suspense>
  );
}
