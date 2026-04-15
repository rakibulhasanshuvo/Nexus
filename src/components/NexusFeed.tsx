/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Image as ImageIcon, Link as LinkIcon, MoreHorizontal, FileText, Loader2, Paperclip, X } from 'lucide-react';
import PostCard from './PostCard';
import { createClient } from '@/lib/supabase/client';

export default function NexusFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch initial posts
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          profiles ( name, avatar_url, semester )
        `)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
    };

    init();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
         // Fetch the profile for the new post
         const { data: profileData } = await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single();
         const newPost = { ...payload.new, profiles: profileData };
         setPosts((current) => [newPost, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);

    try {
      let file_url = null;
      let file_name = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);
        file_url = publicUrl;
        file_name = file.name;
      }

      const { error } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          content,
          link_url: linkUrl || null,
          file_url,
          file_name
        }
      ]);

      if (error) throw error;

      setContent('');
      setLinkUrl('');
      setShowLinkInput(false);
      setFile(null);
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-apple-in">
      {user ? (
        <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex-shrink-0 flex items-center justify-center font-bold">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full" />
              ) : (
                user.email?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share a resource, ask a question, or discuss an exam..."
                className="w-full bg-transparent border-none focus:ring-0 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none min-h-[60px]"
              />

              {showLinkInput && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                   <LinkIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                   <input
                     type="url"
                     value={linkUrl}
                     onChange={(e) => setLinkUrl(e.target.value)}
                     placeholder="Paste a link..."
                     className="flex-1 bg-transparent border-none text-[12px] text-[var(--text-primary)] focus:outline-none"
                   />
                   <button onClick={() => setShowLinkInput(false)}><X className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" /></button>
                </div>
              )}

              {file && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit">
                   {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-[var(--text-tertiary)]" /> : <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />}
                   <span className="text-[11px] font-bold text-[var(--text-primary)] max-w-[200px] truncate">{file.name}</span>
                   <button onClick={() => setFile(null)}><X className="w-3 h-3 text-[var(--text-tertiary)] hover:text-[var(--danger)]" /></button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowLinkInput(!showLinkInput)} className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[12px] font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] p-6 text-center">
           <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-2">Join the Discussion</h3>
           <p className="text-[11px] text-[var(--text-secondary)]">Sign in to post questions, share resources, and connect with other BOU students.</p>
        </div>
      )}

      {/* Feed Stream */}
      <div className="space-y-4">
        {posts.length === 0 ? (
           <div className="p-8 text-center text-[var(--text-tertiary)] text-[12px] font-bold uppercase tracking-widest border border-dashed border-[var(--border-subtle)] rounded-3xl">No posts yet. Be the first!</div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
