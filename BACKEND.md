# BOU Study Pilot: Backend & Migration Roadmap

This document outlines the complete backend architecture and the phased migration plan from the current frontend-only prototype to a full-stack production application.

---

## Phase 1: Server Action Migration ✅ COMPLETE

> **Goal:** Eliminate the exposed `NEXT_PUBLIC_GEMINI_API_KEY` by moving ALL remaining client-side Gemini calls to Next.js Server Actions.

### Tasks

- [x] **Rename env var**: `.env.local` → `GEMINI_API_KEY` (remove `NEXT_PUBLIC_` prefix)
- [x] **Migrate ChatBot AI calls**: `counselorChatAction()` — stateless with history replay
- [x] **Migrate VivaSimulator AI calls**: `vivaStartAction()` + `vivaChatAction()` + `generateSpeechAction()`
- [x] **Migrate SyllabusExplorer AI calls**: `explainTopicAction()` + `generateQuizAction()`
- [x] **Migrate RoutineAnalyzer AI calls**: `extractRoutineAction()`
- [x] **Migrate CourseWorkspace AI calls**: `courseTutorChatAction()`
- [x] **Migrate FlashcardForge AI calls**: `generateFlashcardsAction()`
- [x] **Delete `geminiService.ts`**: File removed — zero consumers remain
- [x] **Verify build**: `npx tsc --noEmit` passes clean ✅

### Cleanup Done
- [x] **XSS fix**: Replaced `dangerouslySetInnerHTML` with `ReactMarkdown` in ChatBot + VivaSimulator
- [x] **Added `--danger-subtle` CSS token**: Light + dark mode for delete buttons and F-grade badges
- [x] **Fixed invalid Tailwind**: `col-span-8.5` → `col-span-8` in Dashboard
- [x] **SEO metadata**: Added `title` + `description` to all 6 routes
- [x] **Removed dead imports**: VortexaFeed (3 icons), FlashcardForge, CourseWorkspace
- [x] **Removed dead CSS**: Unused `shimmer` keyframe
- [x] **Deleted stale files**: `__old_backup/`, `migrated_prompt_history/`, `CLAUDE.md`

---

## Phase 2: Frontend Hardening (Next Session)

- [ ] **Error Boundaries**: Add `error.tsx` in `src/app/` (global) + per-route (`/chat`, `/vault`, `/viva`, `/resources`, `/syllabus`, `/routine`)
- [ ] **Loading States**: Add `loading.tsx` skeleton UIs per route for smooth navigation
- [ ] **Split CGPAVault.tsx** (704 lines) into: `VaultView.tsx`, `PredictorView.tsx`, `TranscriptView.tsx`, `CGPAVault.tsx` (thin orchestrator)
- [ ] **Create `useAcademicStats` hook**: Deduplicate CGPA calculation from Dashboard, ChatBot, CGPAVault
- [ ] **Create `useLocalStorage` hook**: Safe SSR-guarded localStorage access for vault, chat history, syllabus progress
- [ ] **Accessibility pass**: Add `aria-label` to all icon-only buttons, focus traps for modals, `role="dialog"` for quiz overlays

---

## Phase 3: Database Integration (Supabase/Neon PostgreSQL)

> **Goal:** Replace `localStorage` with a persistent, synced database.

### Database Schema

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `student_id` | text (Unique) | BOU Student ID |
| `name` | text | |
| `avatar_url` | text | |
| `semester` | integer | |
| `bio` | text | |

#### `vault_results`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → profiles) | |
| `semester` | integer | |
| `gpa` | numeric(3,2) | |
| `credits` | numeric(3,1) | |
| `updated_at` | timestamp | |

#### `target_metrics`
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid (FK → profiles) | |
| `target_gpa` | numeric(3,2) | |
| `credits_remaining` | integer | |
| `honors_track` | text | e.g., 'Distinction' |

#### `chat_sessions` (new)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → profiles) | |
| `mode` | text | general/exam/planning/tma |
| `messages` | jsonb | Full chat history |
| `created_at` | timestamp | |

### Migration Tasks
- [ ] Create Supabase project (or Neon database)
- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`
- [ ] Install `@supabase/supabase-js`
- [ ] Create `src/lib/supabase.ts` client
- [ ] Migrate vault data: `localStorage('bou_cgpa_vault')` → `vault_results` table
- [ ] Migrate chat history: `localStorage('bou_chat_history')` → `chat_sessions` table
- [ ] Replace hardcoded dashboard demo data with real queries

---

## Phase 4: Authentication

- [ ] **BOU ID Verification**: Integrate mock/real student portal auth
- [ ] **Supabase Auth**: Email + password or magic link for student login
- [ ] **Protected Routes**: Add middleware to guard `/vault`, `/chat`, `/resources`
- [ ] **Profile System**: Student profile page with editable info

---

## Phase 5: Storage & Advanced Features

- [ ] **Supabase Storage**: Student-uploaded PDF notes, assignment templates, lab reports
- [ ] **Edge Functions**: Parse tutorial links → generate OpenGraph metadata previews
- [ ] **Supabase Realtime**: Instant feed updates for study circles (future social feature)

---

## Pending Decisions

### **Supabase vs Neon**
- **Question**: Use Supabase (auth + DB + storage bundle) or Neon (pure Postgres) + separate auth?
- **Status**: Pending User Decision

### **AI Insight Trigger**
- **Question**: Auto-summarize every resource with Gemini (higher cost) or button-triggered "Analyze this Source"?
- **Status**: Pending User Decision
