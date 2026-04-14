"use client";

import React, { useState, useEffect } from 'react';
import { generateFlashcardsAction } from '@/app/actions/ai';
import { 
  Sparkles, RotateCcw, CheckCircle2, 
  Circle, ChevronLeft, ChevronRight, 
  Brain, Loader2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isMastered: boolean;
}

interface FlashcardForgeProps {
  courseId: string;
  courseName: string;
  topics: string[];
}

const FlashcardForge: React.FC<FlashcardForgeProps> = ({ courseId, courseName, topics }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [masteryCount, setMasteryCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`bou_flashcards_${courseId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCards(parsed);
      setMasteryCount(parsed.filter((c: Flashcard) => c.isMastered).length);
    }
  }, [courseId]);

  const saveCards = (newCards: Flashcard[]) => {
    setCards(newCards);
    localStorage.setItem(`bou_flashcards_${courseId}`, JSON.stringify(newCards));
    setMasteryCount(newCards.filter(c => c.isMastered).length);
  };

  const generateCards = async () => {
    setIsGenerating(true);
    try {
      const raw = await generateFlashcardsAction(courseName, courseId, topics);
      const newCards = raw.map((c: any) => ({
        id: crypto.randomUUID(),
        question: c.question,
        answer: c.answer,
        isMastered: false
      }));

      saveCards(newCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Failed to generate flashcards", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMastery = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCards = [...cards];
    newCards[currentIndex].isMastered = !newCards[currentIndex].isMastered;
    saveCards(newCards);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6  bg-[var(--bg-secondary)]/50 backdrop-blur-xl rounded-[40px] border border-[var(--border-subtle)] shadow-2xl">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--text-primary)] animate-spin" />
          <Brain className="absolute inset-0 m-auto w-8 h-8 text-[var(--text-primary)] animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Forging Your Flashcards</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-2 font-medium">Gemini 1.5 Flash is analyzing your syllabus...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="apple-card p-12 text-center bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-[var(--border-subtle)] shadow-2xl flex flex-col items-center">
        <div className="w-20 h-20 rounded-[30px] bg-[var(--text-primary)] flex items-center justify-center mb-8 shadow-[var(--card-shadow-elevated)]">
          <Sparkles className="w-10 h-10 text-[var(--bg-primary)]" />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-4">No Study Cards Yet</h3>
        <p className="text-sm text-[var(--text-tertiary)] max-w-sm mx-auto mb-10 font-medium leading-relaxed">
          Transform your course syllabus into interactive 3D flashcards using AI for high-intensity active recall.
        </p>
        <button 
          onClick={generateCards}
          className="apple-btn-primary px-10 py-4 flex items-center justify-center gap-3 shadow-[var(--card-shadow-elevated)]"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Study Deck</span>
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-8 animate-apple-in">
      {/* Cards Display Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[11px] font-bold uppercase tracking-widest shadow-lg">
            Card {currentIndex + 1} of {cards.length}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-widest text-[var(--success)] shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {masteryCount} Mastered
          </div>
        </div>
        <button 
          onClick={generateCards}
          className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:shadow-[var(--card-shadow-hover)] transition-all"
          title="Regenerate Deck"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 3D Card Container */}
      <div className="perspective-1000 h-[400px] w-full relative group">
        <motion.div
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full preserve-3d cursor-pointer relative"
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden apple-card bg-[var(--bg-secondary)] p-12 flex flex-col items-center justify-center text-center shadow-2xl border-[var(--border-subtle)] group-hover:shadow-[var(--card-shadow-elevated)] transition-all">
            <div className="absolute top-8 left-8 text-[var(--text-primary)]/10">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-[12px] font-bold text-[var(--accent)] uppercase tracking-widest mb-6">Question</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              {currentCard.question}
            </h2>
            <p className="mt-12 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] animate-pulse">
              Click to Reveal Answer
            </p>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 apple-card bg-[var(--text-primary)] p-12 flex flex-col items-center justify-center text-center shadow-2xl border-none">
            <p className="text-[12px] font-bold text-[var(--bg-primary)]/40 uppercase tracking-widest mb-6">The Answer</p>
            <div className="max-w-md mx-auto">
              <p className="text-xl font-medium text-[var(--bg-primary)] leading-relaxed tracking-tight">
                {currentCard.answer}
              </p>
            </div>
            
            <button 
              onClick={toggleMastery}
              className={`mt-10 px-8 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all border ${
                currentCard.isMastered 
                  ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30' 
                  : 'bg-[var(--bg-primary)]/5 text-[var(--bg-primary)]/40 border-[var(--bg-primary)]/10 hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {currentCard.isMastered ? 'Mastered ✓' : 'Mark as Mastered'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <button 
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="w-16 h-16 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20 transition-all text-[var(--text-primary)]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="h-2 flex-1 max-w-[200px] bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--text-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <button 
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          className="w-16 h-16 rounded-[24px] bg-[var(--text-primary)] flex items-center justify-center shadow-[var(--card-shadow-elevated)] hover:scale-105 active:scale-95 disabled:opacity-20 transition-all text-[var(--bg-primary)]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardForge;
