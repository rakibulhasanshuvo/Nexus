"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, MessageSquare, Calculator, BookOpen, Calendar, Mic, Home,
  Library, Clock, LayoutDashboard, MapPin, Menu, X, ChevronRight, UserCircle
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { APIKeyManager } from '../../components/APIKeyManager';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, href: '/' },
    { id: 'chat', label: 'Counselor', icon: MessageSquare, href: '/chat' },
    { id: 'vault', label: 'Academic Vault', icon: LayoutDashboard, href: '/vault' },
    { id: 'resources', label: 'Resources', icon: Library, href: '/resources' },
    { id: 'viva', label: 'Viva Simulator', icon: Mic, href: '/viva' },
    { id: 'profile', label: 'Profile', icon: UserCircle, href: '/profile' },
  ];

  const toolsItems = [
    { id: 'routine', label: 'Routine Analyzer', icon: Clock, href: '/routine' },
    { id: 'syllabus', label: 'Syllabus Browser', icon: BookOpen, href: '/syllabus' },
  ];

  const activeTab = [...navItems, ...toolsItems].find(item => 
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  )?.id || 'dashboard';

  // Handle mobile menu overflow
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    // AUTH BYPASS: Don't redirect to login
    /*
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
    */
  }, [user, isLoading, pathname, router]);

  // If we're on the login page, render full screen without shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show a blank or loading state while checking auth to prevent flash of content
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--text-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-[240px] flex-col bg-[var(--bg-secondary)]/40 backdrop-blur-2xl z-50 shrink-0 border-r border-[var(--border-subtle)]">
        {/* Logo */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shadow-lg shadow-black/10">
              <GraduationCap className="w-5 h-5 text-[var(--bg-primary)]" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] tracking-tight text-[var(--text-primary)] leading-none">Vortexa</h1>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] mt-1.5 uppercase tracking-widest opacity-60">Study Pilot</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 space-y-1 overflow-y-auto apple-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg shadow-black/5' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:shadow-sm'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Tools Submenu */}
          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
            >
              <span>Utility Tools</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isToolsOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {(isToolsOpen || toolsItems.some(i => i.id === activeTab)) && (
              <div className="mt-2 space-y-1 animate-apple-in">
                {toolsItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                      activeTab === item.id 
                        ? 'text-[var(--text-primary)] bg-[var(--bg-primary)] shadow-sm' 
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 opacity-60" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings & Tools */}
        <div className="px-4 pb-2">
          <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
             <APIKeyManager />
             <ThemeToggle />
          </div>
        </div>

        {/* User Profile Footer Hidden For Single User Mode */}
      </nav>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Content - No Header */}
        <div className="flex-1 overflow-y-auto apple-scrollbar bg-studio">
          <div className="max-w-[1700px] mx-auto p-3 lg:p-6 animate-apple-in">
            {/* Mobile Nav Trigger */}
            <button
              className="lg:hidden mb-6 p-3 rounded-2xl bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)] inline-flex items-center gap-2 font-bold text-xs"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-4 h-4" /> Menu
            </button>
            
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Simplified) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-secondary)] p-6 shadow-2xl flex flex-col animate-slide-in-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-bold text-lg text-[var(--text-primary)]">Vortexa</span>
              <button aria-label="Close mobile menu" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-[var(--text-primary)]" />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {[...navItems, ...toolsItems].map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold ${
                    activeTab === item.id 
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-8 border-t border-[var(--border-subtle)] pt-4 space-y-4">
              <APIKeyManager />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutShell;
