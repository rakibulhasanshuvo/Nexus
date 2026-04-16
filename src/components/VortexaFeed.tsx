"use client";

import React, { useState, useRef } from 'react';
import { Plus, FileText, Send, X, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react';
import PostCard from './PostCard';

interface PostMedia {
  type: 'document' | 'video' | 'image';
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

  const [newPost, setNewPost] = useState('');
  const [attachedFile, setAttachedFile] = useState<{name: string, type: string, url: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!newPost.trim() && !attachedFile) return;

    const postToAdd = {
      id: Date.now().toString(),
      author: { name: 'My Profile', role: 'Student', avatar: '' },
      content: newPost,
      timestamp: 'Just now',
      media: attachedFile ? {
        type: attachedFile.type.startsWith('image/') ? 'image' as const : 'document' as const,
        url: attachedFile.url,
        title: attachedFile.name
      } : undefined,
      stats: { likes: 0, comments: 0 }
    };

    setPosts([postToAdd, ...posts]);
    setNewPost('');
    setAttachedFile(null);
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleImageClick = () => imageInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         alert('File size must be less than 5MB.');
         return;
      }
      setIsUploading(true);
      // Mock upload
      setTimeout(() => {
        const objectUrl = URL.createObjectURL(file);
        setAttachedFile({ name: file.name, type: file.type, url: objectUrl });
        setIsUploading(false);
      }, 1000);
    }
  };

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

      {/* Post Creator */}
      <div className="apple-card p-5 mb-8 bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:shadow-2xl transition-all duration-500 animate-apple-in" style={{ animationDelay: '100ms' }}>
        <div className="flex gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6 text-[var(--bg-primary)]" />
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share an academic resource or start a discussion..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-[18px] placeholder:text-[var(--text-tertiary)] resize-none min-h-[60px] py-2 font-medium text-[var(--text-primary)]"
            />
            
            {isUploading && (
              <div className="flex items-center justify-center p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] mt-5">
                 <Loader2 className="w-6 h-6 text-[var(--text-tertiary)] animate-spin" />
              </div>
            )}

            {!isUploading && attachedFile && (
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] mt-5 animate-apple-in">
                <div className="flex items-center gap-4">
                  {attachedFile.type.startsWith('image/') ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center">
                       <img src={attachedFile.url} alt={attachedFile.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[var(--text-primary)] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[var(--bg-primary)]" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                    <span className="text-[14px] font-bold text-[var(--text-primary)] truncate">{attachedFile.name}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">{attachedFile.type.startsWith('image/') ? 'Image' : 'Document'}</span>
                  </div>
                </div>
                <button aria-label="Remove Attachment" onClick={() => setAttachedFile(null)} className="p-2.5 hover:bg-[var(--text-primary)]/5 rounded-full transition-colors text-[var(--text-tertiary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-[var(--border-subtle)] gap-4 sm:gap-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                <input type="file" ref={imageInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button 
                  onClick={handleFileClick}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none justify-center px-4 py-3 rounded-2xl text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">Attach Document</span>
                  <span className="sm:hidden">Doc</span>
                </button>
                <button
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none justify-center px-4 py-3 rounded-2xl text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <ImageIcon className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">Add Image</span>
                  <span className="sm:hidden">Image</span>
                </button>
              </div>
              <button 
                onClick={handlePost}
                disabled={(!newPost.trim() && !attachedFile) || isUploading}
                className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all ${
                  ((!newPost.trim() && !attachedFile) || isUploading)
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border-subtle)]' 
                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 shadow-[var(--card-shadow-elevated)]'
                }`}
              >
                Share to Feed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};


export default VortexaFeed;
