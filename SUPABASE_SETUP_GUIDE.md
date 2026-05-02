# Supabase Setup Guide

This guide outlines the steps and SQL commands required to set up the Supabase database for Vortexa.

## 1. Initial Project Setup

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to **Project Settings -> API** to get your `Project URL` and `anon public` key.
3. Add these to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 2. Database Schema Creation

Run the following SQL commands in the Supabase SQL Editor to create the necessary tables, policies, and functions.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Profiles Table
-- ==========================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  student_id text unique,
  name text,
  avatar_url text,
  semester integer,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. Vault Results Table
-- ==========================================
create table public.vault_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  semester integer not null,
  gpa numeric(3,2) not null,
  credits numeric(3,1) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. Target Metrics Table
-- ==========================================
create table public.target_metrics (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  target_gpa numeric(3,2) not null,
  credits_remaining integer not null,
  honors_track text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. Chat Sessions Table
-- ==========================================
create table public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mode text not null, -- general/exam/planning/tma
  messages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mode)
);

-- ==========================================
-- 5. User Routines Table
-- ==========================================
create table public.user_routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  routine_data jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 6. Course Progress Table
-- ==========================================
create table public.course_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id text not null,
  progress_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- ==========================================
-- 7. Flashcards Table
-- ==========================================
create table public.flashcards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id text not null,
  cards_data jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);


-- ==========================================
-- 8. Feed Posts Table
-- ==========================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  media_type text,
  media_url text,
  media_title text,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- Storage Buckets & Policies
-- ==========================================

-- Insert buckets (run this in SQL or create via UI)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('feed-media', 'feed-media', true);

-- Avatars Policies
create policy "Avatar images are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');
create policy "Anyone can upload an avatar." on storage.objects for insert with check (bucket_id = 'avatars');
create policy "Anyone can update their avatar." on storage.objects for update with check (bucket_id = 'avatars');
create policy "Anyone can delete their avatar." on storage.objects for delete using (bucket_id = 'avatars');

-- Feed Media Policies
create policy "Feed media is publicly accessible." on storage.objects for select using (bucket_id = 'feed-media');
create policy "Anyone can upload feed media." on storage.objects for insert with check (bucket_id = 'feed-media');
create policy "Anyone can update feed media." on storage.objects for update with check (bucket_id = 'feed-media');
create policy "Anyone can delete feed media." on storage.objects for delete using (bucket_id = 'feed-media');

-- ==========================================
-- Functions & Triggers
-- ==========================================

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger updated_at on all tables
create trigger handle_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger handle_vault_results_updated_at before update on public.vault_results for each row execute procedure public.handle_updated_at();
create trigger handle_target_metrics_updated_at before update on public.target_metrics for each row execute procedure public.handle_updated_at();
create trigger handle_chat_sessions_updated_at before update on public.chat_sessions for each row execute procedure public.handle_updated_at();
create trigger handle_user_routines_updated_at before update on public.user_routines for each row execute procedure public.handle_updated_at();
create trigger handle_course_progress_updated_at before update on public.course_progress for each row execute procedure public.handle_updated_at();
create trigger handle_flashcards_updated_at before update on public.flashcards for each row execute procedure public.handle_updated_at();
create trigger handle_posts_updated_at before update on public.posts for each row execute procedure public.handle_updated_at();

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

alter table public.profiles enable row level security;
alter table public.vault_results enable row level security;
alter table public.target_metrics enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.user_routines enable row level security;
alter table public.course_progress enable row level security;
alter table public.flashcards enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Vault Results: Users can perform all operations on their own data
create policy "Users can manage own vault results" on public.vault_results for all using (auth.uid() = user_id);

-- Target Metrics: Users can perform all operations on their own data
create policy "Users can manage own target metrics" on public.target_metrics for all using (auth.uid() = user_id);

-- Chat Sessions: Users can perform all operations on their own data
create policy "Users can manage own chat sessions" on public.chat_sessions for all using (auth.uid() = user_id);

-- User Routines: Users can perform all operations on their own data
create policy "Users can manage own routines" on public.user_routines for all using (auth.uid() = user_id);

-- Course Progress: Users can perform all operations on their own data
create policy "Users can manage own course progress" on public.course_progress for all using (auth.uid() = user_id);

-- Flashcards: Users can perform all operations on their own data
create policy "Users can manage own flashcards" on public.flashcards for all using (auth.uid() = user_id);

-- Posts: Anyone can view posts, users can manage their own
alter table public.posts enable row level security;
create policy "Anyone can view posts" on public.posts for select using (true);
create policy "Users can insert own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = author_id);

```
-- In order to allow useSyncedData to work with vault results correctly as a JSON store
-- since all other places use useLocalStorage to store an array of objects
create table public.vault_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  results_data jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.vault_data enable row level security;
create policy "Users can manage own vault data" on public.vault_data for all using (auth.uid() = user_id);
create trigger handle_vault_data_updated_at before update on public.vault_data for each row execute procedure public.handle_updated_at();

-- also we need a table for syllabus progress
create table public.syllabus_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  progress_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.syllabus_progress enable row level security;
create policy "Users can manage own syllabus progress" on public.syllabus_progress for all using (auth.uid() = user_id);
create trigger handle_syllabus_progress_updated_at before update on public.syllabus_progress for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 9. Saved Summaries Table (Cheat Sheets)
-- ==========================================
create table public.saved_summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  module_id text not null,
  course_id text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.saved_summaries enable row level security;
create policy "Users can manage own saved summaries" on public.saved_summaries for all using (auth.uid() = user_id);
create trigger handle_saved_summaries_updated_at before update on public.saved_summaries for each row execute procedure public.handle_updated_at();
