# Supabase Setup Guide for BOU Study Pilot

Welcome! Since you mentioned you are new to Supabase, this guide will walk you through exactly what buttons to click in your dashboard to make everything we just built work perfectly.

## Step 1: Run the Database Setup Script

This script creates all the tables (Profiles, Vault, Chat, Posts), sets up the security rules so users can't steal each other's data, and creates the file storage bucket.

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project (`dkxhpfnisfywsaxpuefl`).
2. On the left-hand menu, click on **SQL Editor** (the icon looks like a terminal `>_`).
3. Click the **"+ New Query"** button.
4. **Copy the massive block of code below and paste it into the editor:**

```sql
-- ==============================================================================
-- BOU STUDY PILOT - FULL SUPABASE SETUP SCRIPT
-- ==============================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  semester INTEGER DEFAULT 1,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.vault_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL,
  gpa NUMERIC(3,2) NOT NULL,
  credits NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.vault_results ADD CONSTRAINT unique_user_semester UNIQUE (user_id, semester);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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

-- 2. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Security (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. Set Security Rules (Who can see/edit what)
-- Profiles
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vault
CREATE POLICY "Users can select own vault results." ON public.vault_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault results." ON public.vault_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault results." ON public.vault_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault results." ON public.vault_results FOR DELETE USING (auth.uid() = user_id);

-- Chat
CREATE POLICY "Users can select own chat sessions." ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions." ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions." ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions." ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Posts
CREATE POLICY "Anyone can view posts." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Authenticated users can upload resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own resources" ON storage.objects FOR UPDATE USING (bucket_id = 'resources' AND auth.uid() = owner);
CREATE POLICY "Users can delete own resources" ON storage.objects FOR DELETE USING (bucket_id = 'resources' AND auth.uid() = owner);

-- 5. Automations
-- Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

5. Click the green **"Run"** button in the bottom right corner of the editor. You should see a "Success" message.

---

## Step 2: Configure Authentication

Right now, the database exists, but we need to tell Supabase how users are allowed to log in.

1. On the left-hand menu, click on **Authentication** (the icon looks like two people).
2. Look for **Providers** under the Configuration section in the menu.
3. **For Email/Magic Link:**
   * Click on **Email**.
   * Make sure **Enable Email Provider** is toggled ON.
   * Make sure **Confirm email** is toggled OFF (for easier testing right now, you can turn this back on before launching).
   * Click **Save**.
4. **For Google Login:**
   * Click on **Google**.
   * Toggle it ON.
   * You will notice it asks for a "Client ID" and "Client Secret". You will need to go to the [Google Cloud Console](https://console.cloud.google.com/), create a project, and generate these keys. There are many tutorials online on how to get these two keys. Once you have them, paste them here and click **Save**.

---

## Step 3: Enable Realtime for the Feed

For the Nexus Feed to update instantly when someone posts without refreshing the page, we need to flip one switch.

1. On the left-hand menu, click on **Database** (the icon looks like a server rack).
2. Click on **Replication** in the menu.
3. Under "Source", you will see `supabase_realtime`. Click the **0 tables** button next to it.
4. Toggle the switch next to the **`posts`** table to turn it ON.

---

### You are done! 🎉

Now, run your app locally using `npm run dev`. Go to `http://localhost:3000/login` and try to sign in using the Email Magic Link. Check your email, click the link, and you should be logged in with a fully functional database backing your actions!
