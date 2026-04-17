"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              name,
              avatar_url,
              bio
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedPosts: Post[] = data.map((post: Record<string, unknown>) => ({
            id: post.id as string,
            author: {
              name: (post.profiles as Record<string, string>)?.name || 'Unknown Student',
              role: (post.profiles as Record<string, string>)?.bio || 'Student',
              avatar: (post.profiles as Record<string, string>)?.avatar_url || ''
            },
            content: post.content as string,
            timestamp: new Date(post.created_at as string).toLocaleDateString() + ' ' + new Date(post.created_at as string).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            media: post.media_url ? {
              type: post.media_type as 'document' | 'video' | 'image',
              url: post.media_url as string,
              title: (post.media_title as string) || 'Attached File'
            } : undefined,
            stats: { likes: (post.likes as number) || 0, comments: 0 }
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostCreated = useCallback(async (content: string, file: { name: string; type: string; url: string; path?: string } | null) => {
    if (!user || !supabase) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      const mediaType = file ? (file.type.startsWith('image/') ? 'image' : 'document') : null;

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content,
          media_type: mediaType,
          media_url: file?.url || null,
          media_title: file?.name || null
        })
        .select(`
          *,
          profiles (
            name,
            avatar_url,
            bio
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        const postToAdd: Post = {
          id: data.id,
          author: {
            name: data.profiles?.name || 'Unknown Student',
            role: data.profiles?.bio || 'Student',
            avatar: data.profiles?.avatar_url || ''
          },
          content: data.content,
          timestamp: 'Just now',
          media: data.media_url ? {
            type: data.media_type as 'document' | 'video' | 'image',
            url: data.media_url,
            title: data.media_title || 'Attached File'
          } : undefined,
          stats: { likes: 0, comments: 0 }
        };

        setPosts(currentPosts => [postToAdd, ...currentPosts]);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    }
  }, [user]);

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
      {user && <CreatePost onPost={handlePostCreated} />}

      {/* Feed Stream */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 text-[var(--text-tertiary)] animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id} className="animate-apple-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
               <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="text-center p-10 text-[var(--text-tertiary)] font-medium">
             No posts yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
};

export default VortexaFeed;
