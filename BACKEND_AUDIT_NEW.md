# Backend & Architecture Audit (New)

## Executive Summary
This document provides a fresh assessment of the Vortexa Study Pilot's backend and architecture. The focus is to highlight current state, missing configurations, technical debt, and bugs specifically related to the Server Actions, database integrations, type safety, and context hooks.

## 1. Current State of the Backend

### Next.js Server Actions
- **AI Integration:** The migration to Next.js Server Actions (`src/app/actions/ai.ts`) has been successfully completed.
- **Security:** The `GEMINI_API_KEY` is completely hidden from the client.
- **Failover Logic:** The client initialization properly includes random failover among multiple `GEMINI_API_KEY` variables if provided, which adds robustness against rate limits.
- **Issues:** The file still has several typed `any` catch clauses (e.g., `catch (e: any)`) and `any` usages in `.map` which break strict TypeScript compilation and should be typed as `Error` or `unknown`.

### Database & Authentication
- **Supabase Hook (`useSyncedData.ts`):** A custom hook exists to synchronize data between React state, `localStorage`, and Supabase.
  - **Issue:** It contains untyped payloads (`any`) which need typing to prevent future schema mismatches.
- **Authentication Context (`AuthContext.tsx`):**
  - Uses Supabase Auth heavily.
  - **Bug:** `setIsLoading(false)` is being called synchronously within `useEffect` when the Supabase client is not initialized. This causes a React error: `Calling setState synchronously within an effect can trigger cascading renders`.
- **Login Component (`src/app/login/page.tsx`):**
  - Login logic relies on Supabase magic links and Google OAuth.
  - **Issue:** The error catching logic falls back to `error: any`. It should properly cast to the expected Supabase error type.

## 2. General Architecture & Frontend Handshake

### Components & State
- Most components that interact with the backend (`ChatBot`, `VivaSimulator`, `SyllabusExplorer`, `RoutineAnalyzer`, `FlashcardForge`) properly call Server Actions instead of calling the Gemini APIs directly.
- **Issue:** Many of these components use `try...catch (error: any)` which bypasses Next.js / TypeScript strict mode.

### Performance & Web Vitals
- **Images:** Several components (`CreatePost`, `PostCard`, `VortexaFeed`, `profile/page.tsx`) are using raw `<img>` tags. While primarily a frontend concern, this affects performance and triggers Next.js warnings that could fail strict CI builds. They must be migrated to `next/image` (`<Image />`).
- **Quotes and Entities:** Unescaped entities (`'`, `"`) in React components (`ChatBot`, `login`) trigger ESLint errors.

## 3. Migration Roadmap Status
Comparing the current state against `BACKEND.md`:

- **Phase 1 (Server Action Migration):** Complete.
- **Phase 2 (Frontend Hardening):** Incomplete. We are still missing global `error.tsx` handling for when AI fails, and comprehensive `loading.tsx` skeleton files across all routes.
- **Phase 3 (Database Integration):** In progress. `useSyncedData` exists but requires careful roll-out and schema validation.
- **Phase 4 (Authentication):** In progress. `AuthContext` is set up but needs bug fixes.

## 4. Immediate Action Items (Bug Fixes)
1.  **TypeScript Strictness:** Replace all instances of `any` in catch blocks (`e: any`) with `e: unknown` or strongly type them as `Error`.
2.  **React Hook Fixes:** Refactor the `AuthContext` to avoid synchronous state updates in the `useEffect` body. Use a `setTimeout` or move the logic to state initialization if possible.
3.  **UI Linting:** Fix unescaped entities in text nodes.
4.  **Image Optimization:** Swap `<img>` tags with `next/image` to comply with Next.js standards.