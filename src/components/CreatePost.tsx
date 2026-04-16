"use client";

import React, { useState, useRef } from 'react';
import { Plus, FileText, Send, X, Paperclip } from 'lucide-react';

interface CreatePostProps {
  onPost: (content: string, file: { name: string; type: string } | null) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPost }) => {
  const [newPost, setNewPost] = useState('');
  const [attachedFile, setAttachedFile] = useState<{name: string, type: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = () => {
    if (!newPost.trim() && !attachedFile) return;
    onPost(newPost, attachedFile);
    setNewPost('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setAttachedFile({ name: file.name, type: file.type });
        setIsUploading(false);
      }, 1000);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="apple-card p-5 mb-8 bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:shadow-2xl transition-all duration-500 animate-apple-in" style={{ animationDelay: '100ms' }}>
      <div className="flex gap-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shrink-0">
          <Plus className="w-6 h-6 text-[var(--bg-primary)]" />
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            placeholder="Share an academic resource or start a discussion..."
            value={newPost}
            onChange={handleInput}
            className="w-full bg-transparent border-none focus:ring-0 text-[18px] placeholder:text-[var(--text-tertiary)] resize-none min-h-[60px] py-2 font-medium text-[var(--text-primary)]"
            style={{ overflow: 'hidden' }}
          />

          {attachedFile && (
            <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] mt-5 animate-apple-in">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--text-primary)] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--bg-primary)]" />
                </div>
                <span className="text-[14px] font-bold text-[var(--text-primary)]">{attachedFile.name}</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="p-2.5 hover:bg-[var(--text-primary)]/5 rounded-full transition-colors text-[var(--text-tertiary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button
                onClick={handleFileClick}
                className="px-5 py-3 rounded-2xl text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] transition-all flex items-center gap-2.5"
              >
                <Paperclip className="w-4.5 h-4.5" />
                <span>Attach Document</span>
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPost.trim() && !attachedFile}
              className={`px-10 py-3.5 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all ${
                (!newPost.trim() && !attachedFile)
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
  );
};

export default CreatePost;
