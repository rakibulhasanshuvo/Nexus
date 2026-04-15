"use client";

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const APIKeyManager: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const storedKey = localStorage.getItem('bou_user_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem('bou_user_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('bou_user_api_key');
      }
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Failed to save API key:', e);
      setSaveStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center justify-between w-full px-4 py-2 text-[12px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 opacity-60" />
            <span>BYO API Key</span>
          </div>
          {apiKey ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--success-subtle)] border border-[var(--success)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[var(--success-glow)]" />
              <span className="text-[9px] font-bold text-[var(--success)] uppercase tracking-widest">Active</span>
            </div>
          ) : (
            <span className="text-[10px] uppercase tracking-widest opacity-50">Setup</span>
          )}
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Gemini API Key</span>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AI Studio Key..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[12px] font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors pr-8"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors border border-[var(--border-subtle)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {saveStatus === 'saved' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--success-subtle)] border border-[var(--success)]/20"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
          <span className="text-[10px] font-bold text-[var(--success)] uppercase tracking-widest">Saved locally</span>
        </motion.div>
      )}
    </div>
  );
};
