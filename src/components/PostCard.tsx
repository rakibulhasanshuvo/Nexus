/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { Share2, Image as ImageIcon, Link as LinkIcon, MoreHorizontal, MessageSquare, ThumbsUp, FileText, Download } from 'lucide-react';
import { fetchOpenGraphData } from '@/app/actions/og';

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const [ogData, setOgData] = useState<any>(null);
  const [isOgLoading, setIsOgLoading] = useState(false);

  useEffect(() => {
    if (post.link_url) {
      setIsOgLoading(true);
      fetchOpenGraphData(post.link_url).then((data) => {
        setOgData(data);
        setIsOgLoading(false);
      });
    }
  }, [post.link_url]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex-shrink-0 flex items-center justify-center font-bold">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Profile" className="w-full h-full rounded-full" />
            ) : (
              post.profiles?.name?.charAt(0).toUpperCase() || 'S'
            )}
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[var(--text-primary)]">{post.profiles?.name || 'Anonymous Student'}</h3>
            <p className="text-[10px] font-medium text-[var(--text-secondary)]">
              {post.profiles?.semester ? `Semester ${post.profiles.semester}` : 'BOU CSE'} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button aria-label="More options" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-[13px] text-[var(--text-primary)] leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Attachments */}
      {post.file_url && (
        <div className="mb-4">
           {post.file_name?.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
              <img src={post.file_url} alt="Attached" className="rounded-2xl border border-[var(--border-subtle)] max-h-96 w-auto object-cover" />
           ) : (
             <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--text-tertiary)] transition-colors group">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                   <div>
                     <p className="text-[12px] font-bold text-[var(--text-primary)] group-hover:underline">{post.file_name || 'Attached File'}</p>
                     <p className="text-[10px] text-[var(--text-secondary)]">Click to view/download</p>
                   </div>
                </div>
                <Download className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
             </a>
           )}
        </div>
      )}

      {/* Link Preview */}
      {post.link_url && (
         <div className="mb-4 rounded-2xl border border-[var(--border-subtle)] overflow-hidden hover:bg-[var(--bg-tertiary)] transition-colors">
            {isOgLoading ? (
               <div className="p-4 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--text-primary)] animate-spin" />
                  <span className="text-[11px] text-[var(--text-secondary)]">Loading preview...</span>
               </div>
            ) : ogData ? (
               <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="block">
                  {ogData.image && <img src={ogData.image} alt="Preview" className="w-full h-48 object-cover border-b border-[var(--border-subtle)]" />}
                  <div className="p-4">
                     <p className="text-[12px] font-bold text-[var(--text-primary)] line-clamp-1 mb-1">{ogData.title || post.link_url}</p>
                     {ogData.description && <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{ogData.description}</p>}
                     <p className="text-[10px] text-[var(--text-tertiary)] mt-2 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {new URL(post.link_url).hostname}</p>
                  </div>
               </a>
            ) : (
               <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="p-4 flex items-center gap-2 text-[12px] text-[var(--text-primary)] hover:underline">
                  <LinkIcon className="w-4 h-4 text-[var(--text-tertiary)]" /> {post.link_url}
               </a>
            )}
         </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-subtle)]">
        <button className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ThumbsUp className="w-4 h-4" /> {post.likes}
        </button>
        <button className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <MessageSquare className="w-4 h-4" /> Reply
        </button>
        <button aria-label="Share post" className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
