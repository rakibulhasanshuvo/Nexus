"use client";

import React, { useState } from 'react';
import { 
  Heart, MessageSquare, Share2, MoreHorizontal, 
  Play, FileText, Download 
} from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      avatar?: string;
      role: string;
    };
    content: string;
    timestamp: string;
    media?: {
      type: 'video' | 'document' | 'image';
      url: string;
      title?: string;
      thumbnail?: string;
    };
    stats: {
      likes: number;
      comments: number;
    };
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="apple-card p-5 mb-5 bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:shadow-2xl transition-all duration-500 animate-apple-in">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center font-bold text-[var(--text-primary)] border border-[var(--border-subtle)]">
            {post.author.name[0]}
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[var(--text-primary)] leading-none">{post.author.name}</h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{post.author.role}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-primary)]" />
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{post.timestamp}</span>
            </div>
          </div>
        </div>
        <button className="p-2.5 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-[16px] text-[var(--text-primary)] leading-relaxed mb-4 font-medium">
        {post.content}
      </p>

      {/* Media Rendering */}
      {post.media && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-sm group cursor-pointer relative">
          {post.media.type === 'video' ? (
            <div className="aspect-video bg-[var(--bg-tertiary)] relative">
              {post.media.thumbnail ? (
                <img src={post.media.thumbnail} alt={post.media.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[var(--text-primary)]/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform border border-[var(--text-primary)]/30">
                  <Play className="w-6 h-6 text-[var(--text-primary)] fill-current" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[13px] font-bold text-[var(--bg-primary)] tracking-tight drop-shadow-md">{post.media.title || 'Watch Video'}</p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-[var(--bg-primary)] flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--text-primary)] flex items-center justify-center shadow-lg shadow-[var(--text-primary)]/5">
                  <FileText className="w-5 h-5 text-[var(--bg-primary)]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight">{post.media.title}</p>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Academic Resource • PDF</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-[var(--text-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--text-primary)]/10">
                <Download className="w-4 h-4 text-[var(--bg-primary)]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interaction Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)]/50">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 group text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <div className="p-2 rounded-xl group-hover:bg-[var(--bg-tertiary)] transition-all">
              <Heart className="w-4.5 h-4.5 group-hover:fill-[var(--danger)] group-hover:text-[var(--danger)]" />
            </div>
            <span className="text-[12px] font-bold">{post.stats.likes}</span>
          </button>
          <button className="flex items-center gap-2 group text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <div className="p-2 rounded-xl group-hover:bg-[var(--bg-tertiary)] transition-all">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <span className="text-[12px] font-bold">{post.stats.comments}</span>
          </button>
        </div>
        <button className="flex items-center gap-2 group text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Share2 className="w-4.5 h-4.5" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
