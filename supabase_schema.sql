-- ==============================================================================
-- BOU Study Pilot - Supabase Schema
-- Instructions: Copy and paste this script into the Supabase SQL Editor and run it.
-- ==============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  semester INTEGER DEFAULT 1,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Vault Results Table
CREATE TABLE IF NOT EXISTS public.vault_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL,
  gpa NUMERIC(3,2) NOT NULL,
  credits NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure a user only has one result per semester
ALTER TABLE public.vault_results ADD CONSTRAINT unique_user_semester UNIQUE (user_id, semester);

-- 3. Create Target Metrics Table
CREATE TABLE IF NOT EXISTS public.target_metrics (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_gpa NUMERIC(3,2),
  credits_remaining INTEGER,
  honors_track TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vault Results: Users can manage their own academic data
CREATE POLICY "Users can select own vault results." ON public.vault_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault results." ON public.vault_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault results." ON public.vault_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault results." ON public.vault_results FOR DELETE USING (auth.uid() = user_id);

-- Target Metrics: Users can manage their own target metrics
CREATE POLICY "Users can select own target metrics." ON public.target_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own target metrics." ON public.target_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own target metrics." ON public.target_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own target metrics." ON public.target_metrics FOR DELETE USING (auth.uid() = user_id);

-- Chat Sessions: Users can manage their own chat history
CREATE POLICY "Users can select own chat sessions." ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions." ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions." ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions." ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- Triggers for Automation
-- ==============================================================================

-- Automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_target_metrics_modtime BEFORE UPDATE ON public.target_metrics FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_chat_sessions_modtime BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
