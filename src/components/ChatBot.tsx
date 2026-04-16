"use client";
import ReactMarkdown from 'react-markdown';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { counselorChatAction } from '@/app/actions/ai';
import { ChatMessage, SemesterResult } from '@/lib/types';
import { useSyncedData } from '@/hooks/useSyncedData';
import { 
  Send, RotateCw, Bot, User, Loader2, Sparkles, 
  ExternalLink, Calendar, Target, Award,
  BookOpen, BrainCircuit, LayoutList, History,
  Trash2, MessageSquare, Plus, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CounselorMode = 'general' | 'exam' | 'planning' | 'tma';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useSyncedData<ChatMessage[]>(
    'bou_chat_history',
    [],
    'chat_sessions',
    'mode',
    'general',
    'messages'
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<CounselorMode>('general');
  const [stats, setStats] = useState({ cgpa: 0, credits: 0, target: 4.0 });
  const [history, setHistory] = useState<{id: string, title: string, date: string}[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load User Context
  const loadContext = useCallback(() => {
    const saved = localStorage.getItem('bou_cgpa_vault');
    if (saved) {
      try {
        const results: SemesterResult[] = JSON.parse(saved);
        const totalCredits = results.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0);
        const totalPoints = results.reduce((acc, curr) => acc + ((Number(curr.gpa) || 0) * (Number(curr.credits) || 0)), 0);
        setStats(prev => ({ 
          ...prev, 
          cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0, 
          credits: totalCredits 
        }));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    loadContext();
    
    // Fake history for demo
    setHistory([
      { id: '1', title: 'Calculus Exam Strategy', date: '2 days ago' },
      { id: '2', title: 'TMA 1 English Outline', date: 'Yesterday' }
    ]);
  }, [loadContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;

    try {
      const context = `Student has ${stats.credits} credits done with a CGPA of ${stats.cgpa.toFixed(2)}. Target is ${stats.target}. Priority: ${mode.toUpperCase()} mode.`;
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await counselorChatAction(userMsg.text, mode, context, chatHistory, userApiKey);
      const botMsg: ChatMessage = {
        role: 'model', 
        text: response.text, 
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ Counselor Error: ${error.message}`, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const resetChat = () => {
    setMessages([]);
    localStorage.removeItem('bou_chat_history');
    // Supabase state is updated via setMessages([]), which handles the backend delete/overwrite implicitly if hooked up
  };



  const modeThemes = {
    general: { icon: Sparkles, label: 'General', color: 'from-blue-500 to-cyan-400' },
    exam: { icon: BrainCircuit, label: 'Exam Prep', color: 'from-orange-500 to-red-400' },
    planning: { icon: LayoutList, label: 'Academic Planning', color: 'from-emerald-500 to-teal-400' },
    tma: { icon: BookOpen, label: 'TMA Expert', color: 'from-purple-500 to-pink-400' }
  };

  return (
    <div className="flex bg-[var(--bg-tertiary)]/50 rounded-3xl overflow-hidden border border-[var(--border-subtle)] h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)] shadow-[var(--card-shadow-elevated)] transition-all animate-apple-in">
      
      {/* 1. Left Sidebar: History & Modes (Hidden on small screens) */}
      <div className="hidden xl:flex w-[220px] flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] p-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 px-2">Knowledge Modes</h3>
        <div className="space-y-1 mb-8">
          {(Object.keys(modeThemes) as CounselorMode[]).map((m) => {
            const Theme = modeThemes[m];
            return (
              <button
                key={m}
                onClick={() => { setMode(m); resetChat(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  mode === m 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[var(--card-shadow)]' 
                    : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Theme.icon className={`w-4 h-4 ${mode === m ? 'text-[var(--bg-primary)]' : 'text-[var(--text-tertiary)]'}`} />
                <span className="text-[13px] font-bold">{Theme.label}</span>
              </button>
            );
          })}
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 px-2">Past Advice</h3>
        <div className="flex-1 overflow-y-auto space-y-1 apple-scrollbar">
          {history.map(item => (
            <button key={item.id} className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-tertiary)] group flex flex-col gap-1">
              <span className="text-[12px] font-bold text-[var(--text-secondary)] truncate">{item.title}</span>
              <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{item.date}</span>
            </button>
          ))}
        </div>

        <button onClick={resetChat} className="mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-all text-[11px] font-black uppercase tracking-widest">
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* 2. Center: Chat Interface */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden shadow-inner">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${modeThemes[mode].color} flex items-center justify-center shadow-[var(--card-shadow)] animate-pulse`}>
              <Bot className="w-5 h-5 text-[var(--bg-primary)]" />
            </div>
            <div>
              <h2 className="text-[15px] font-black tracking-tight text-[var(--text-primary)] leading-none">AI Academic Counselor</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--success)]">Counselor Online</span>
                <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{modeThemes[mode].label} Mode</span>
              </div>
            </div>
          </div>
          <button onClick={resetChat} className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all">
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Region */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 apple-scrollbar bg-[var(--bg-primary)]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-6 animate-apple-in">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${modeThemes[mode].color} flex items-center justify-center mb-6 shadow-[var(--card-shadow-elevated)] scale-110`}>
                <Sparkles className="w-10 h-10 text-[var(--bg-primary)]" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-3">Welcome to Vortexa AI</h3>
              <p className="text-[13px] font-medium text-[var(--text-tertiary)] leading-relaxed mb-10">
                I assist BOU students with exam strategy, degree planning, and assignments. How can I help you today?
              </p>
              <div className="grid grid-cols-1 gap-2 w-full">
                {[
                  "What are my first semester courses?",
                  "Analyze my GPA and suggest targets",
                  "Help me outline my next TMA"
                ].map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="p-4 text-left rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all text-xs font-bold leading-none shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${modeThemes[mode].color} flex items-center justify-center shrink-0 shadow-[var(--card-shadow)] mt-1`}>
                  <Bot className="w-4.5 h-4.5 text-[var(--bg-primary)]" />
                </div>
              )}
              <div className={`max-w-[80%] overflow-hidden ${
                msg.role === 'user'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-[var(--card-shadow)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-3xl rounded-tl-sm px-6 py-4 border border-[var(--border-subtle)] shadow-sm'
              }`}>
                <div className="text-[14.5px] leading-relaxed font-medium prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]/10 space-y-2">
                    {msg.groundingUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] hover:underline transition-colors uppercase tracking-widest">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">View Source {i+1}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${modeThemes[mode].color} flex items-center justify-center shrink-0 shadow-[var(--card-shadow)]`}>
                <Bot className="w-4.5 h-4.5 text-[var(--bg-primary)]" />
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-3xl rounded-tl-sm px-6 py-4 border border-[var(--border-subtle)]">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Chat Input Area */}
        <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
          <div className="relative flex items-center gap-3 bg-[var(--bg-tertiary)] p-2 rounded-[24px] focus-within:ring-2 focus-within:ring-[var(--text-primary)]/10 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Ask the counselor about ${modeThemes[mode].label.toLowerCase()}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] font-medium px-4 h-11 text-[var(--text-primary)]"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isLoading || !input.trim() 
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]' 
                  : 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[var(--card-shadow)] hover:scale-105 active:scale-95'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar: Academic Lens (Desktop Focus) */}
      <div className="hidden 2xl:flex w-[260px] flex-col bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] p-5 animate-apple-in">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4">Academic Lens</h3>
        
        {/* Real-time Stats */}
        <div className="space-y-3 mb-8">
          <div className="p-4 rounded-[24px] bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[var(--card-shadow-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-4 h-4 text-[var(--warning)]" />
              <div className="px-2 py-0.5 rounded-full bg-[var(--bg-primary)]/10 text-[8px] font-bold uppercase tracking-widest text-[var(--success)]">Target: {stats.target.toFixed(1)}</div>
            </div>
            <p className="text-2xl font-black tracking-tight">{stats.cgpa > 0 ? stats.cgpa.toFixed(2) : '—'}</p>
            <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Current CGPA</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3.5 rounded-[20px] bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)]">
              <p className="text-lg font-black text-[var(--text-primary)]">{stats.credits}</p>
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">Credits</p>
            </div>
            <div className="p-3.5 rounded-[20px] bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)]">
              <p className="text-lg font-black text-[var(--text-primary)]">1.0</p>
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">Semester</p>
            </div>
          </div>
        </div>

        {/* Smart Actions */}
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4">Smart Actions</h3>
        <div className="space-y-2">
          {[
            { label: 'Analyze my GPA', icon: Target },
            { label: 'How to write TMA 1?', icon: BookOpen },
            { label: 'Degree Requirements', icon: LayoutList }
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => sendMessage(action.label)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                <span className="text-[11px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{action.label}</span>
              </div>
              <Plus className="w-3 h-3 text-[var(--border-subtle)] group-hover:text-[var(--text-primary)]" />
            </button>
          ))}
        </div>

        {/* Quote/Motivation */}
        <div className="mt-auto pt-10">
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <p className="text-[11px] font-medium text-[var(--accent)] italic leading-relaxed text-center">
              "Focus on the process, and the result will take care of itself."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatBot;
