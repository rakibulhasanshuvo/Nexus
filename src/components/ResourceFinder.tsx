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
    updateUrlParams('course', val);

    // Auto-select first module if available
    const detail = COURSE_DETAILS[val];
    if (detail && detail.topics.length > 0) {
      const firstId = `${val}-unit-1`;
      setSelectedModuleId(firstId);
      setActiveTool('tma');
    } else {
      setSelectedModuleId(null);
      setActiveTool(null);
    }
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

    <div className="animate-fade-in w-full flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden gap-0 bg-[var(--bg-primary)]">
      {/* Left Column (Sidebar) */}
      <aside className="w-full lg:w-[320px] lg:min-w-[320px] bg-[var(--bg-secondary)]/50 border-r border-[var(--border-subtle)] flex flex-col h-full overflow-y-auto z-10">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-6">Assignment Context</h2>

          <div className="space-y-4">
            {/* Term Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Academic Term</label>
              <div className="relative group">
                <select
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="apple-select w-full h-12 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer hover:bg-[var(--bg-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
                >
                  {COURSE_MAPPING.map((s, idx) => (
                    <option key={idx} value={idx}>{s.semester}</option>
                  ))}
                </select>
                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Subject</label>
              <div className="relative group">
                <select
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="apple-select w-full h-12 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer hover:bg-[var(--bg-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  disabled={!semester}
                >
                  <option value="">Select Target Course</option>
                  {semester && semester.courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Library className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Modules List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {selectedCourse && courseDetail ? (
            <>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-4 flex items-center gap-2 px-2">
                <Library className="w-4 h-4" /> Related Units
              </h3>
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => {
                     setSelectedModuleId(module.id);
                     if (!activeTool) setActiveTool('tma');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all group flex items-start gap-3 ${selectedModuleId === module.id ? 'bg-[var(--bg-tertiary)] border-[var(--text-primary)]/20 shadow-sm' : 'bg-transparent border-transparent hover:bg-[var(--bg-tertiary)]/50 hover:border-[var(--border-subtle)]'}`}
                >
                  <div className="mt-0.5">
                    {selectedModuleId === module.id ? (
                      <CheckCircle className="w-4 h-4 text-[var(--accent)]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--border-subtle)] group-hover:border-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-[13px] leading-tight transition-colors ${selectedModuleId === module.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                      Unit {module.unit}: {module.title}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--text-tertiary)] mt-1 flex items-center gap-2">
                       {module.isHighYield && <span className="text-[var(--danger)] flex items-center gap-0.5"><Flame className="w-3 h-3" /> High-Yield</span>}
                       Target Unit
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mt-4">Select a course to view units</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Column (Main Workspace) */}
      <section className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {(!selectedCourse || !courseDetail || !selectedModuleId) ? (
          /* Empty State */
          <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <BookA className="absolute w-[600px] h-[600px] text-[var(--text-primary)]/[0.02] -bottom-40 -right-20 pointer-events-none group-hover:scale-[1.05] transition-transform duration-1000 ease-out" />
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
        ) : (
          /* Workspace Content */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Tool Tabs Navbar */}
            <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] px-8 py-4 flex items-center justify-center sm:justify-start gap-4 sm:gap-8">
              <button
                onClick={() => setActiveTool('tma')}
                className={`font-bold text-[12px] uppercase tracking-widest pb-1 transition-all ${activeTool === 'tma' ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                📝 TMA Expert
              </button>
              <button
                onClick={() => setActiveTool('cheat')}
                className={`font-bold text-[12px] uppercase tracking-widest pb-1 transition-all ${activeTool === 'cheat' ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                ⚡ Cheat Sheet
              </button>
              <button
                onClick={() => setActiveTool('tutorial')}
                className={`font-bold text-[12px] uppercase tracking-widest pb-1 transition-all ${activeTool === 'tutorial' ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                ▶️ Curated Resources
              </button>
            </div>

            {/* Active Tool Content */}
            <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
              <div className="max-w-full mx-auto">
                 {/* This is where the tool content goes. I'll replace it with a marker for now to inject the rest of the code. */}

                {activeTool === 'tma' && modules.filter(m => m.id === selectedModuleId).map(module => (
                  <div key={module.id} className="animate-fade-in space-y-8">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Assignment Input</h1>
                      <p className="text-sm font-medium text-[var(--text-tertiary)]">Construct your TMA question to generate an AI-architected response framework.</p>
                    </div>

                    {/* Glassmorphic Input Container */}
                    <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-transparent"></div>

                      <div className="mb-6">
                        <label className="flex items-center justify-between text-sm font-bold text-[var(--text-primary)] mb-4">
                          <span>Prompt Formulation</span>
                          <span className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                            <PenTool className="w-3 h-3" /> AI Assisted
                          </span>
                        </label>
                        <textarea
                          placeholder="Paste or type your specific Tutor-Marked Assignment question here. Include any specific constraints, required references, or structural requirements..."
                          value={userContexts[module.id] || ''}
                          onChange={(e) => handleContextChange(module.id, e.target.value)}
                          className="w-full h-[200px] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl p-4 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none resize-none text-[14px] leading-relaxed shadow-inner"
                        />
                      </div>

                      <div className="flex items-center gap-3 mb-8">
                        <button className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors">
                          <FileText className="w-3.5 h-3.5" /> Attach Rubric
                        </button>
                        <button className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors">
                          <Library className="w-3.5 h-3.5" /> Insert Code Snippet
                        </button>
                      </div>

                      {/* Primary Action Button Area */}
                      <div className="flex justify-end border-t border-[var(--border-subtle)] pt-6 mt-6">
                         {loadingActionId === `tma-${module.id}` ? (
                            <SkeletonLoader />
                         ) : (
                            <button
                              onClick={(e) => handleGenerateTMAOutline(e, module.id, module.title)}
                              disabled={loadingActionId !== null}
                              className="bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl px-8 py-4 text-[14px] font-black tracking-wide flex items-center gap-3 hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-50"
                            >
                              <ArrowRight className="w-5 h-5" /> Architect TMA Answer
                            </button>
                         )}
                      </div>
                    </div>

                    {/* Result Area */}
                    {tmaOutlines[module.id] && (
                       <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--accent)]/30 p-8 shadow-lg relative">
                         <div className="absolute top-4 right-4 flex items-center gap-2">
                           <button onClick={() => clearModuleCache('tma', module.id)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                             <RotateCcw className="w-4 h-4" />
                           </button>
                         </div>
                         <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--accent)] mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Generated Outline
                         </h3>
                         <div className="style-markdown text-[var(--text-primary)] max-h-[800px] overflow-y-auto pr-4">
                           <ReactMarkdown>{tmaOutlines[module.id]}</ReactMarkdown>
                         </div>
                       </div>
                    )}

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1 bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 transition-colors">
                        <Flame className="w-6 h-6 text-[var(--accent)] mb-3" />
                        <h4 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">Context is Key</h4>
                        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">Ensure you've selected the correct academic term and unit in the sidebar for accurate references.</p>
                      </div>
                      <div className="col-span-1 md:col-span-2 bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                          <BookOpen className="w-[120px] h-[120px]" />
                        </div>
                        <div className="flex-1 relative z-10">
                          <h4 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">Advanced Mode Available</h4>
                          <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">Enable advanced parameters to control output verbosity, citation style, and critical analysis depth.</p>
                          <button className="text-[var(--accent)] text-[12px] font-bold flex items-center gap-1 hover:underline">
                            Configure Settings <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {activeTool === 'cheat' && modules.filter(m => m.id === selectedModuleId).map(module => (
                  <div key={module.id} className="animate-fade-in space-y-8">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Unit Cheat Sheet</h1>
                      <p className="text-sm font-medium text-[var(--text-tertiary)]">Distill this BOU unit into a high-octane summary of core concepts and top exam tips.</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffaa00] to-transparent"></div>
                      <div className="flex justify-end pt-2">
                        {loadingActionId === `cheat-${module.id}` ? (
                          <SkeletonLoader />
                        ) : cheatSheets[module.id] ? null : (
                          <button
                            onClick={(e) => handleGenerateCheatSheet(e, module.id, module.title, module.topics)}
                            disabled={loadingActionId !== null}
                            className="bg-[#ffaa00] text-black rounded-xl px-8 py-4 text-[14px] font-black tracking-wide flex items-center gap-3 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 w-full justify-center"
                          >
                            <Flame className="w-5 h-5" /> Generate Exam Summary
                          </button>
                        )}
                      </div>

                      {/* Result Area */}
                      {cheatSheets[module.id] && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[14px] font-black uppercase tracking-widest text-[#ffaa00] flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" /> 1-Page Summary
                            </h3>
                            <button onClick={() => clearModuleCache('cheat', module.id)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="style-markdown text-[var(--text-primary)] max-h-[800px] overflow-y-auto pr-4">
                            <ReactMarkdown>{cheatSheets[module.id]}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {activeTool === 'tutorial' && modules.filter(m => m.id === selectedModuleId).map(module => (
                  <div key={module.id} className="animate-fade-in space-y-8">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Curated Resources</h1>
                      <p className="text-sm font-medium text-[var(--text-tertiary)]">Discover the best external tutorials, videos, and articles for this specific unit.</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--danger)] to-transparent"></div>

                      <div className="mb-6">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Resource Preference</label>
                        <select
                          value={tutorialPref[module.id] || "Best Bangla Tutorials from any platform"}
                          onChange={(e) => setTutorialPref(prev => ({ ...prev, [module.id]: e.target.value }))}
                          className="w-full h-14 px-4 rounded-xl text-[13px] font-bold text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--danger)]/50 appearance-none cursor-pointer"
                        >
                          <option value="Best Bangla Tutorials from any platform">🇧🇩 Bangla Tutorials (Any Platform)</option>
                          <option value="Best English Tutorials with animations from any platform">🇬🇧 English Tutorials (Any Platform)</option>
                          <option value="High quality written articles (GeeksforGeeks, etc)">📝 Written Articles</option>
                          <option value="University courses (MIT OCW, NPTEL, Coursera)">🎓 University Courses</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        {loadingActionId === `tutorial-${module.id}` ? (
                          <SkeletonLoader />
                        ) : tutorials[module.id] ? (
                          <div className="mt-2 flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--danger)] flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Results
                              </h3>
                              <button onClick={() => clearModuleCache('tutorial', module.id)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                              {tutorials[module.id].map((tut, i) => (
                                <a
                                  key={i}
                                  href={tut.url || (tut.type === 'video'
                                    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(tut.searchQuery)}`
                                    : `https://www.google.com/search?q=${encodeURIComponent(tut.searchQuery)}`)
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block p-5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--danger)]/40 hover:shadow-lg bg-[var(--bg-primary)] transition-all group/card"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                      {tut.type === 'video' ? <Video className="w-5 h-5 text-[var(--danger)]" /> : <FileText className="w-5 h-5 text-[var(--accent)]" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                          {tut.provider}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                                          {tut.language}
                                        </span>
                                      </div>
                                      <h5 className="text-[15px] font-bold leading-tight mb-2 text-[var(--text-primary)] group-hover/card:text-[var(--danger)] transition-colors">
                                        {tut.title}
                                      </h5>
                                      <p className="text-[12px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                                        {tut.reason}
                                      </p>
                                    </div>
                                  </div>
                                </a>
                              ))}

                              <button
                                onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics, true)}
                                disabled={loadingActionId !== null}
                                className="mt-4 h-12 w-full rounded-xl border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-tertiary)] text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-50"
                              >
                                <Search className="w-4 h-4" /> Find More
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics)}
                            disabled={loadingActionId !== null}
                            className="bg-[var(--danger)] text-white rounded-xl px-8 py-4 text-[14px] font-black tracking-wide flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 w-full"
                          >
                            <PlayCircle className="w-5 h-5" /> Find Best Resources
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        )}
      </section>
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
