-- ==============================================================================
-- BOU Study Pilot - Phase 5 Supabase Schema Updates
-- Instructions: Copy and paste this script into the Supabase SQL Editor and run it.
-- ==============================================================================

-- 1. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  file_url TEXT,
  file_name TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Setup Storage Bucket for Resources
-- NOTE: In the Supabase Dashboard, you may need to manually create the bucket 'resources' if this fails,
-- but this script attempts to create it via the storage.buckets table.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts: Anyone can read posts
CREATE POLICY "Anyone can view posts." ON public.posts FOR SELECT USING (true);

-- Posts: Users can insert their own posts
CREATE POLICY "Users can insert own posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts: Users can update their own posts
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id);

-- Posts: Users can delete their own posts
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Storage: Anyone can view public resources
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resources');

-- Storage: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload resources" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resources' AND auth.role() = 'authenticated'
);

-- Storage: Users can update and delete their own files
CREATE POLICY "Users can update own resources" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resources' AND auth.uid() = owner
);

CREATE POLICY "Users can delete own resources" ON storage.objects FOR DELETE USING (
  bucket_id = 'resources' AND auth.uid() = owner
);

-- ==============================================================================
-- Triggers for Automation
-- ==============================================================================
CREATE TRIGGER update_posts_modtime BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
