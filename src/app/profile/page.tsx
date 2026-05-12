"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, BookOpen, UserCircle, Loader2 } from 'lucide-react';
import { validateFile, getSafeExtension } from '@/lib/file-validation';

// For now we'll mock the Supabase client until auth is fully implemented in a later phase.
// In a real implementation we would import the initialized client.
// import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Local state for profile details
  const [profile, setProfile] = useState({
    name: 'Dr. Rafiqul Islam', // Mock data
    studentId: '19-0-52-120-001',
    semester: 6,
    bio: 'Computer Science student at Bangladesh Open University. Interested in AI and Web Development.',
    avatarUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // We are mocking auth and profile fetching for now since Supabase integration is not fully wired up.
  // We'll just manage the local state and simulate a save and an upload.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate file type and size
    const { valid, error } = validateFile(file);
    if (!valid || !file.type.startsWith('image/')) {
      alert(error || 'Please upload a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);

    // MOCK UPLOAD
    // Real implementation would look something like this:
    /*
      const fileExt = getSafeExtension(file.type);
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile({ ...profile, avatarUrl: data.publicUrl });
    */

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const objectUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatarUrl: objectUrl });

    setIsUploading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call to save profile details to Supabase `profiles` table
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Profile saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Manage your academic profile and personal information.</p>
      </div>

      <div className="apple-card p-8 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-8">

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--bg-tertiary)] border-4 border-[var(--bg-primary)] shadow-lg flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[var(--text-tertiary)] animate-spin" />
              ) : profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-20 h-20 text-[var(--text-tertiary)]" />
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full shadow-lg hover:scale-105 transition-transform"
              title="Change Avatar"
              disabled={isUploading}
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h2>
            <p className="text-[14px] text-[var(--text-secondary)] font-medium flex items-center justify-center sm:justify-start gap-2">
              <User className="w-4 h-4 opacity-70" /> {profile.studentId}
            </p>
            <p className="text-[14px] text-[var(--text-secondary)] font-medium flex items-center justify-center sm:justify-start gap-2">
              <BookOpen className="w-4 h-4 opacity-70" /> Semester {profile.semester}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-4 max-w-md">
              Upload a recognizable photo. Recommended size is 256x256px. Max file size is 5MB.
            </p>
          </div>
        </div>

        <hr className="border-[var(--border-subtle)]" />

        {/* Profile Details Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Student ID</label>
              <input
                type="text"
                value={profile.studentId}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-70 cursor-not-allowed"
                placeholder="E.g., 19-0-52-120-001"
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Student ID cannot be changed.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Current Semester</label>
            <select
              value={profile.semester}
              onChange={(e) => setProfile({...profile, semester: Number(e.target.value)})}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors appearance-none"
            >
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Bio / Academic Interests</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors resize-none"
              placeholder="Tell your study circle about your interests..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
