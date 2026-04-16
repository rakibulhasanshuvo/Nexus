"use client";

import React, { useState, useCallback } from 'react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

interface PostMedia {
  type: 'document' | 'video';
  url: string;
  title: string;
  thumbnail?: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  media?: PostMedia;
  stats: {
    likes: number;
    comments: number;
  };
}

const VortexaFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: { name: 'Dr. Rafiqul Islam', role: 'Faculty Advisor', avatar: '' },
      content: "Welcome to the BOU Vortexa! This is your space to share study materials and help each other. I've uploaded the new TMA guidelines for this semester.",
      timestamp: '2h ago',
      media: {
        type: 'document' as const,
        url: '#',
        title: 'TMA_Guidelines_Spring_2026.pdf'
      },
      stats: { likes: 24, comments: 8 }
    },
    {
      id: '2',
      author: {
        name: 'Saiful Islam',
        role: 'Senior Student',
        avatar: ''
      },
      content: "Found this incredible tutorial on Pointers in C. The visual explanations really helped me get through the SPL lab report!",
      timestamp: '5h ago',
      media: {
        type: 'video' as const,
        url: 'https://www.youtube.com/watch?v=KJgs26ucDzg',
        title: 'C Pointers - Visual Guide',
        thumbnail: 'https://img.youtube.com/vi/KJgs26ucDzg/maxresdefault.jpg'
      },
      stats: { likes: 56, comments: 12 }
    }
  ]);

  const handlePostCreated = useCallback((content: string, file: { name: string; type: string } | null) => {
    const postToAdd = {
      id: Date.now().toString(),
      author: { name: 'My Profile', role: 'Student', avatar: '' },
      content: content,
      timestamp: 'Just now',
      media: file ? {
        type: 'document' as const,
        url: '#',
        title: file.name
      } : undefined,
      stats: { likes: 0, comments: 0 }
    };

    setPosts(currentPosts => [postToAdd, ...currentPosts]);
  }, []);

  return (
    <div className="w-full pb-20">
      {/* Semester Quick Recap */}
      <div className="mb-8 animate-apple-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[32px] font-extrabold text-[var(--text-primary)] tracking-tight">Community Feed</h1>
            <p className="text-[14px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2">Semester 1 • Spring 2026</p>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] shadow-[var(--success-glow)] animate-pulse" />
            <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest">342 online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="apple-card p-6 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none shadow-[var(--card-shadow-elevated)] group hover:scale-[1.02] transition-all duration-500">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--bg-primary)]/40 mb-2">Academic Vibe</p>
            <p className="text-3xl font-black tracking-tight leading-none">Target 4.0</p>
            <div className="mt-6 h-1.5 bg-[var(--bg-primary)]/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--bg-primary)] shadow-[var(--success-glow)]" style={{ width: '85%' }} />
            </div>
            <p className="text-[10px] font-bold text-[var(--success)] uppercase tracking-widest mt-5">Steady Progress</p>
          </div>
          <div className="apple-card p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-[var(--card-shadow)] text-[var(--text-primary)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Exams Remaining</p>
            <p className="text-3xl font-black tracking-tight text-[var(--text-primary)]">04</p>
            <p className="text-[12px] font-bold text-[var(--danger)] uppercase tracking-tight mt-4">Next: Physics I (20 Apr)</p>
          </div>
          <div className="apple-card p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-[var(--card-shadow)] text-[var(--text-primary)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Credits Done</p>
            <p className="text-3xl font-black tracking-tight text-[var(--text-primary)]">14.0</p>
            <p className="text-[12px] font-bold text-[var(--success)] uppercase tracking-tight mt-4">126.0 Credits to go</p>
          </div>
        </div>
      </div>

      <CreatePost onPost={handlePostCreated} />

      {/* Feed Stream */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={post.id} className="animate-apple-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
             <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VortexaFeed;
