# BOU Study Pilot - QA Audit Report (BUG_REPORT.md)

## Critical / Show-Stoppers

### 1. Concurrency Race Condition in `useSyncedData`
**File:** `src/hooks/useSyncedData.ts`
**Line:** 76-100 (inside `setValue`)
**Issue:** The `setValue` callback triggers an asynchronous fire-and-forget `supabase.upsert` every time it is called. If tied to rapid state updates (e.g., text inputs or rapid toggling), it triggers multiple simultaneous network requests. Because there is no debounce or locking mechanism, the responses can resolve out of order, leading to database state corruption and severe performance degradation (or hitting API rate limits).
**Proposed Fix:** Extract the Supabase update into a debounced utility function, or use a synchronization queue that prevents multiple requests from firing simultaneously.

### 2. Unhandled QuotaExceededError in `useSyncedData`
**File:** `src/hooks/useSyncedData.ts`
**Line:** 76-81
**Issue:** `window.localStorage.setItem(key, JSON.stringify(valueToStore));` is inside the top-level `try`, but if a user is at their storage quota or is in strict incognito mode (Safari), `setItem` throws a DOMException. While there is a `catch` block wrapping the entire `setValue` logic, if it throws during `setItem`, the subsequent Supabase network request is completely skipped. Thus, a local storage error breaks remote database syncing.
**Proposed Fix:** Isolate the localStorage block in its own `try/catch` within `setValue` so that a failure in local storage does not abort the Supabase synchronization.

### 3. Missing Component Unmount Cleanup for Timeouts
**File:** `src/components/ResourceFinder.tsx`
**Line:** 199-201 (`handleGenerateTutorials`)
**Issue:** The `handleGenerateTutorials` function uses a `setTimeout` to artificially update the loading phase:
```typescript
const timerId = setTimeout(() => {
  setLoadingPhase('AI is curating the best links...');
}, 1500);
```
If the user navigates away from the `ResourceFinder` before the 1.5 seconds elapse, the callback fires on an unmounted component, causing React hydration/state warnings and potential memory leaks. Additionally, if the API call succeeds before 1.5 seconds, the `finally` block clears `timerId`, which is good, but if it takes *longer*, the unmount issue remains.
**Proposed Fix:** Move the artificial delay to a `useEffect` that listens to `loadingActionId`, or maintain a mutable ref array of timeouts that are strictly cleared in a cleanup `useEffect()`.

---

## Warning / API Resilience

### 4. Unhandled Empty Context from Tavily in AI Curation
**File:** `src/app/actions/ai.ts`
**Line:** 160-179 (`findStructuredTutorialsAction`)
**Issue:** If the Tavily API fails (e.g., rate limit, down), the code catches the error and continues with `searchContext = ""`. It then passes this empty context to the LLM and commands it: "DO NOT invent links. ONLY use the provided URLs." Since the provided URLs are empty, the LLM may hallucinate links, return a malformed JSON, or throw a 400 Bad Request error.
**Proposed Fix:** If `searchContext` is empty or parsing fails, short-circuit and throw an error to the user before burning a Gemini API call, or return a predefined empty state. Additionally, `tavilyResponse.ok` is not checked; `.json()` could throw unexpectedly if the response is an HTML error page.

### 5. Silent Type Failures via `as any` and Missing Validation
**File:** `src/hooks/useSyncedData.ts`
**Line:** 50 (`const rowData = data as any;`)
**Issue:** Forcing the Supabase response `data as any` and then casting `rowData[dataColumn] as T` completely bypasses TypeScript safety. If the cloud database schema is altered (or legacy data is malformed), React state is initialized with corrupt data, leading to cryptic runtime crashes in components that map over the data (e.g., calling `.map()` on `undefined`).
**Proposed Fix:** Implement a type guard or runtime validation (e.g., checking if the parsed object is an Array before setting it if `T` is expected to be an Array).

---

## Optimization / Next.js Anti-Patterns

### 6. Suboptimal Dependency Arrays and Stale Closures
**File:** `src/hooks/useLocalStorage.ts`
**Line:** 39 (`setValue` useCallback)
**Issue:** The `setValue` hook includes `storedValue` in its dependency array. Because `setValue` is commonly passed as a prop to child components, updating the state causes `setValue`'s reference to change on every render, triggering unnecessary re-renders in optimized child components (breaking `React.memo`).
**Proposed Fix:** Remove `storedValue` from the dependency array and rely entirely on the functional update pattern (which is already implemented correctly: `value instanceof Function ? value(storedValue) : value`). Wait, actually, functional updates need `setStoredValue((prev) => ...)` to be fully independent of `storedValue`. Update `setStoredValue` to use the functional state updater properly.

### 7. Explicit "use client" Directives Clutter
**File:** `src/hooks/useSyncedData.ts`, `src/hooks/useAcademicStats.ts`, etc.
**Issue:** While not technically a bug, placing `"use client"` in individual hooks is a Next.js anti-pattern. `"use client"` is a boundary directive meant for components. Custom hooks inherently run wherever their importing component runs. Placing it in hooks can cause confusion about the React Server Components boundary.
**Proposed Fix:** Remove `"use client"` from custom hooks. Ensure the boundary is set at the Component level (e.g., `ResourceFinder.tsx`).
