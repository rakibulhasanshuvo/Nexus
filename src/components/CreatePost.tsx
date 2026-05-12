"use client";

import React, { useState, useRef } from 'react';
import { Plus, FileText, Send, X, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateFile, getSafeExtension } from '@/lib/file-validation';

interface CreatePostProps {
  onPost: (content: string, file: { name: string; type: string; url: string; path?: string } | null) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPost }) => {
  const [newPost, setNewPost] = useState('');
  const [attachedFile, setAttachedFile] = useState<{name: string, type: string, url: string, file?: File} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!newPost.trim() && !attachedFile) return;

    setIsUploading(true);
    try {
      let fileData = null;

      if (attachedFile?.file && supabase) {
        const fileExt = getSafeExtension(attachedFile.file.type);
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('feed-media')
          .upload(filePath, attachedFile.file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('feed-media')
          .getPublicUrl(filePath);

        fileData = {
          name: attachedFile.name,
          type: attachedFile.type,
          url: publicUrl,
          path: filePath
        };
      } else if (attachedFile) {
         fileData = {
           name: attachedFile.name,
           type: attachedFile.type,
           url: attachedFile.url
         };
      }

      onPost(newPost, fileData);
      setNewPost('');
      setAttachedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to upload file or create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
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

      const { valid, error } = validateFile(file);
      if (!valid) {
        alert(error || 'Invalid file type or extension.');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setAttachedFile({ name: file.name, type: file.type, url: objectUrl, file: file });
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
  );
};

export default CreatePost;
