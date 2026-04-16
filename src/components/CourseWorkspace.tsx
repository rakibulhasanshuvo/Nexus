"use client";

import React, { useState, useEffect } from 'react';
import { COURSE_MAPPING, COURSE_DETAILS, STATIC_RESOURCES } from '@/lib/constants';
import { courseTutorChatAction } from '@/app/actions/ai';
import { useSyncedData } from '@/hooks/useSyncedData';
import { 
  Bot, User, Send, Loader2, BookOpen, 
  FileText, ExternalLink, ChevronLeft, Sparkles, MessageCircle,
  CheckCircle2, Circle, Play
} from 'lucide-react';
import Link from 'next/link';
import FlashcardForge from './FlashcardForge';

interface CourseWorkspaceProps {
  courseId: string;
}

const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({ courseId }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syllabusProgress, setSyllabusProgress] = useSyncedData<Record<number, boolean>>(
    `bou_progress_${courseId}`,
    {},
    'course_progress',
    'course_id',
    courseId,
    'progress_data'
  );
  const [activeTab, setActiveTab] = useState<'tutor' | 'flashcards'>('tutor');

  const course = COURSE_MAPPING.flatMap(s => s.courses).find(c => c.id === courseId);
  const details = COURSE_DETAILS[courseId];
  const resources = STATIC_RESOURCES.filter(r => r.courseId === courseId);

  useEffect(() => {
    // Initial AI greeting
    if (course && messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        text: `Welcome to the ${course.name} Study Circle. I am your AI Tutor. How can I help you master this course today?` 
      }]);
    }
  }, [courseId, course, messages.length]);

  const toggleTopic = (weekIdx: number) => {
    const next = { ...syllabusProgress, [weekIdx]: !syllabusProgress[weekIdx] };
    setSyllabusProgress(next);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;

    try {
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await courseTutorChatAction(
        userMsg,
        course?.name || '',
        courseId,
        details?.overview || '',
        chatHistory,
        userApiKey
      );
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to AI Tutor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return (
    <div className="p-12 text-center">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Course not found</h1>
      <Link href="/" className="text-[var(--accent)] font-bold mt-4 inline-block hover:underline">Return Home</Link>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-apple-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-3 rounded-2xl bg-[var(--bg-secondary)] shadow-[var(--card-shadow)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all border border-[var(--border-subtle)]">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{course.name}</h1>
            <p className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1.5 font-bold">
              Workspace • {courseId} • {course.credits} Credits
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl shadow-[var(--card-shadow-elevated)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] shadow-[var(--success-glow)] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Active Focus Session</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-0">
        {/* Left Area: AI Tutor or Flashcards */}
        <div className="flex flex-col bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-subtle)] p-8 shadow-[var(--card-shadow)] overflow-hidden">
          {/* Internal Tab Switcher */}
          <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-2xl w-fit mb-8">
            <button 
              onClick={() => setActiveTab('tutor')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest ${activeTab === 'tutor' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              AI Subject Tutor
            </button>
            <button 
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest ${activeTab === 'flashcards' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Flashcard Forge
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'tutor' ? (
              <div className="flex-1 flex flex-col min-h-0 animate-apple-in">
                <div className="flex-1 overflow-y-auto apple-scrollbar space-y-6 mb-8 pr-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-[16px] leading-relaxed tracking-tight font-medium ${
                        msg.role === 'user' 
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-br-none shadow-[var(--card-shadow)]' 
                          : 'bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-5 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-3">
                        <div className="animate-pulse flex space-x-2">
                          <div className="h-2 w-2 bg-[var(--text-tertiary)] rounded-full"></div>
                          <div className="h-2 w-2 bg-[var(--text-tertiary)] rounded-full"></div>
                          <div className="h-2 w-2 bg-[var(--text-tertiary)] rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask about equations, concepts, or assignments..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full h-16 pl-8 pr-16 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-secondary)] transition-all outline-none font-bold text-[16px] text-[var(--text-primary)]"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-[var(--text-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-20"
                    >
                      <Send className="w-5 h-5 text-[var(--bg-primary)]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto apple-scrollbar pr-2 animate-apple-in">
                <FlashcardForge 
                  courseId={courseId} 
                  courseName={course.name} 
                  topics={details?.topics || []} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Resources & Syllabus */}
        <div className="flex flex-col gap-8 overflow-y-auto apple-scrollbar pr-2">
          {/* Syllabus Roadmap */}
          <div className="apple-card p-8 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Curriculum Roadmap</h3>
            </div>
            <div className="space-y-3">
              {details?.syllabus_roadmap?.map((item, idx) => {
                const isDone = syllabusProgress[idx];
                return (
                  <button 
                    key={idx}
                    onClick={() => toggleTopic(idx)}
                    className="w-full flex items-center gap-5 p-5 rounded-2xl hover:bg-[var(--text-primary)] transition-all group text-left border border-[var(--border-subtle)] hover:border-[var(--text-primary)] shadow-sm"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-[var(--text-primary)] group-hover:text-[var(--bg-primary)]" />
                    ) : (
                      <Circle className="w-6 h-6 text-[var(--text-primary)] opacity-20 group-hover:text-[var(--bg-primary)] group-hover:opacity-100" />
                    )}
                    <span className={`text-[15px] font-bold tracking-tight group-hover:text-[var(--bg-primary)] transition-all ${isDone ? 'line-through opacity-30' : 'text-[var(--text-primary)]'}`}>
                      Week {item.week}: {item.topic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Resources */}
          <div className="apple-card p-8 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-inner">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)] font-bold">Verified Resources</h3>
            </div>
            <div className="space-y-4">
              {resources.map(res => (
                <a 
                  key={res.id}
                  href={res.direct_url}
                  target="_blank"
                  className="block p-5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all group shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-extrabold tracking-tight leading-tight text-[var(--text-primary)] group-hover:text-[var(--bg-primary)]">{res.title}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] group-hover:text-[var(--bg-primary)]/40 font-bold uppercase tracking-widest mt-2">{res.source_name}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </a>
              ))}
              {resources.length === 0 && (
                <p className="text-[13px] text-[var(--text-tertiary)] italic font-medium px-2">No specific resources found for this course yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CourseWorkspace;
