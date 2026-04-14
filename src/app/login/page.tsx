"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the magic link!' });
      setEmail('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
      <div className="w-full max-w-md p-8 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] shadow-xl animate-apple-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shadow-lg shadow-black/10 mb-6">
            <GraduationCap className="w-8 h-8 text-[var(--bg-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Nexus Study Pilot</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2">Sign in to access your Academic Vault and AI Counselor.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
              : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--bg-primary)] transition-all shadow-sm disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
             <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Or</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bou.ac.bd"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] transition-all font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
