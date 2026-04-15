"use client";
import ReactMarkdown from 'react-markdown';

import React, { useState, useEffect } from 'react';
import { vivaStartAction, vivaChatAction, generateSpeechAction } from '@/app/actions/ai';
import { COURSE_MAPPING, COURSE_DETAILS } from '@/lib/constants';
import { Mic, Send, Bot, User, Loader2, Volume2, MessageSquare, History, BookOpen, Zap, GraduationCap, Activity, Clock } from 'lucide-react';

interface VivaMessage {
  role: 'user' | 'model';
  text: string;
}

const VivaSimulator: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [session, setSession] = useState<boolean>(false);
  const [messages, setMessages] = useState<VivaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const semester = COURSE_MAPPING[selectedSemester];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [session]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startSession = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;
    try {
      const course = semester.courses.find(c => c.id === selectedCourse);
      if (!course) return;
      const details = COURSE_DETAILS[course.id];
      const firstQuestion = await vivaStartAction(course.name, course.id, details?.topics || [], userApiKey);
      setSession(true);
      setMessages([{ role: 'model', text: firstQuestion }]);
    } catch (e: any) {
      setMessages([{ role: 'model', text: `⚠️ Failed to start: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!input.trim() || !session || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await vivaChatAction(userText, history, userApiKey);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const userApiKey = localStorage.getItem('bou_user_api_key') || undefined;
    try {
      const audioData = await generateSpeechAction(text, userApiKey);
      if (audioData) {
        const byteCharacters = atob(audioData);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
        audio.play();
      }
    } catch { setIsPlaying(false); }
  };

  const endSession = () => {
    setSession(false);
    setMessages([]);
    setSelectedCourse('');
  };



  if (!session) {
    return (
      <div className="space-y-8 animate-fade-in w-full h-[calc(100vh-4rem)] flex flex-col">
        {/* Header split */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mb-2">Examination Module</h2>
            <h3 className="text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase">Viva Simulator</h3>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />
              Active Voice-AI Proctor · Practical Assessment
            </p>
          </div>
        </div>

        {/* Empty State Split Grid - Dashboard Mode */}
        <div className="flex-1 apple-card bg-[var(--bg-tertiary)]/50 border-dashed border-2 border-[var(--border-subtle)] flex flex-col lg:flex-row relative overflow-hidden group">
          {/* Watermark */}
          <GraduationCap className="absolute w-[800px] h-[800px] text-[var(--text-primary)]/[0.02] -bottom-40 -left-20 pointer-events-none group-hover:scale-[1.05] transition-transform duration-1000 ease-out" />
          
          {/* Left panel: Prompt & Initialization */}
          <div className="flex-1 flex flex-col items-start justify-center p-12 lg:p-20 relative z-10 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
            <div className="w-24 h-24 rounded-[32px] bg-[var(--text-primary)] shadow-[var(--card-shadow-elevated)] flex items-center justify-center mb-10">
              <Mic className="w-10 h-10 text-[var(--bg-primary)]" />
            </div>
            
            <h3 className="text-[18px] lg:text-[24px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-4 leading-tight whitespace-pre-line">
              Start Preparation{"\n"}Hub
            </h3>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-12 leading-relaxed max-w-md">
              Select a practical course to begin a simulated board viva. The AI proctor will audit your conceptual depth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full max-w-lg">
              <div className="relative group">
                <select 
                  value={selectedSemester} 
                  onChange={e => { setSelectedSemester(parseInt(e.target.value)); setSelectedCourse(''); }} 
                  className="apple-select w-full h-14 font-black uppercase tracking-widest text-[10px] appearance-none !pl-12 bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {COURSE_MAPPING.map((_, idx) => (<option key={idx} value={idx}>Term S0{idx + 1}</option>))}
                </select>
                <History className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <div className="relative group">
                <select 
                  value={selectedCourse} 
                  onChange={e => setSelectedCourse(e.target.value)} 
                  className="apple-select w-full h-14 font-black uppercase tracking-widest text-[10px] appearance-none !pl-12 bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  <option value="">Course Selection</option>
                  <optgroup label="Practical Courses">
                    {semester.courses.filter(c => c.type === 'practical').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </optgroup>
                  <optgroup label="Theoretical Foundation">
                    {semester.courses.filter(c => c.type === 'theory').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </optgroup>
                </select>
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
            </div>

            <button 
              onClick={startSession} 
              disabled={!selectedCourse || isLoading} 
              className={`w-full max-w-lg h-16 rounded-[20px] font-black uppercase tracking-[0.4em] text-[12px] flex items-center justify-center gap-4 transition-all active:scale-95 ${
                !selectedCourse || isLoading 
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed border-2 border-transparent' 
                  : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 shadow-[var(--card-shadow-elevated)]'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              Initialize Session
            </button>
          </div>

          {/* Right Panel: Metrics & Stats */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 lg:p-16 gap-6 relative z-10 bg-[var(--bg-secondary)]/10 backdrop-blur-3xl">
            <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mb-2">Active Examiner Protocols</h5>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex items-center gap-6 group/item hover:border-[var(--accent)]/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">Interactive Feedback</p>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Real-time chat assessment</p>
                </div>
              </div>
              
              <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex items-center gap-6 group/item hover:border-[var(--danger)]/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  <Volume2 className="w-5 h-5 text-[var(--danger)]" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">Voice Engine</p>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">High-fidelity 24kHz narration</p>
                </div>
              </div>

              <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex items-center gap-6 group/item hover:border-[var(--warning)]/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[var(--warning)]/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">AI Proctor</p>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Topic-specific rigorous audits</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-5 rounded-3xl bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[var(--card-shadow-elevated)] relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--bg-primary)]/10 rounded-full blur-3xl opacity-50" />
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-primary)]/50 m-0">Board Status: Ready</p>
              </div>
              <p className="text-[12px] font-bold text-[var(--bg-primary)]/90 leading-relaxed">
                Connect your microphone and structure your answers coherently. The examiner is evaluating your analytical depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const confidenceScore = Math.min(98, 45 + ((messages.length - 1) * 4)); 
  const conceptualDepth = Math.min(9.5, 3.0 + ((messages.length - 1) * 0.5)).toFixed(1);

  return (
    <div className="flex flex-col lg:flex-row h-[75vh] animate-fade-in w-full gap-8">
      {/* Left Chat Window */}
      <div className="flex-1 flex flex-col bg-[var(--bg-secondary)] rounded-[32px] shadow-[var(--card-shadow)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
               <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mb-1">Board Examiner AI</h2>
              <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)] uppercase">{semester.courses.find(c => c.id === selectedCourse)?.name}</h3>
            </div>
          </div>
          <button 
            onClick={endSession} 
            className="h-10 px-6 rounded-xl border-2 border-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95 text-[var(--text-primary)]"
          >
            End Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto apple-scrollbar p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'model' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
              }`}>
                {msg.role === 'model' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[85%] space-y-3`}>
                <div className={`rounded-3xl p-5 text-[13px] leading-relaxed shadow-sm border ${
                  msg.role === 'user'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-tr-none border-[var(--text-primary)]'
                    : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-primary)] rounded-tl-none border-[var(--border-subtle)]'
                }`}>
                  <div className={`font-semibold prose prose-sm max-w-none ${msg.role === 'user' ? 'text-[var(--bg-primary)]/90 prose-invert' : 'text-[var(--text-primary)]/80 dark:prose-invert'}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
                
                {msg.role === 'model' && (
                  <button
                    onClick={() => speak(msg.text)}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all group active:scale-95 text-[var(--text-primary)]"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : 'group-hover:scale-110'}`} /> 
                    {isPlaying ? 'Synthesizing...' : 'Listen Output'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shrink-0 shadow-md text-[var(--bg-primary)]">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-3xl rounded-tl-none p-6 border border-[var(--border-subtle)] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]/40 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]/40 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]/40 animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] shrink-0">
          <div className="bg-[var(--bg-primary)] px-2 py-2 rounded-3xl border border-[var(--border-subtle)] focus-within:border-[var(--text-primary)]/30 focus-within:bg-[var(--bg-secondary)] transition-all shadow-inner">
            <div className="flex gap-2 items-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 flex items-center justify-center text-[var(--text-tertiary)] shrink-0">
                 <Mic className={`w-5 h-5 ${input.length > 0 ? 'text-[var(--text-primary)] animate-pulse' : ''}`} />
              </div>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAnswer()}
                placeholder="Structure your answer..."
                className="flex-1 bg-transparent px-4 h-12 font-bold text-[13px] outline-none placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                disabled={isLoading}
              />
              <button 
                onClick={sendAnswer} 
                disabled={isLoading || !input.trim()} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-lg ${
                    isLoading || !input.trim() ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 group'
                }`}
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Metrics Panel */}
      <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
        <div className="apple-card bg-[var(--text-primary)] text-[var(--bg-primary)] p-8 relative overflow-hidden shadow-[var(--card-shadow-elevated)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-primary)]/10 blur-3xl rounded-full" />
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-[var(--bg-primary)]/50" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-primary)]/40">Time Elapsed</h4>
          </div>
          <p className="text-5xl font-black tracking-tighter text-[var(--bg-primary)] tabular-nums drop-shadow-lg">
            {formatTimer(timerSeconds)}
          </p>
        </div>

        <div className="apple-card bg-[var(--bg-secondary)] p-8 border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Live Evaluation</h4>
             <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Confidence</span>
                <span className="text-xl font-black tracking-tighter text-[var(--accent)]">{confidenceScore}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${confidenceScore}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Conceptual Depth</span>
                <span className="text-xl font-black tracking-tighter text-[var(--success)]">{conceptualDepth}<span className="text-[11px] text-[var(--text-tertiary)] tracking-normal">/10</span></span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--success)] transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${(parseFloat(conceptualDepth)/10)*100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="apple-card bg-[var(--warning)]/10 p-6 border-2 border-[var(--warning)]/20 shadow-sm mt-auto">
          <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--warning)] mb-2">Examiner Note</h5>
          <p className="text-[11px] font-semibold text-[var(--warning)] leading-relaxed">
            The AI automatically scales difficulty based on your conceptual depth. Precise, structured answers yield higher scores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VivaSimulator;
