# Vortexa Feature Roadmap & Brainstorming

This document outlines potential features and improvements for Vortexa, an AI-powered academic companion for Bangladesh Open University CSE students. It is categorized to help prioritize development efforts.

## 1. General User & Profile Features
*   **Profile Management with Avatar Upload:** A dedicated `/profile` or settings area where students can edit their name, bio, current semester, and upload a profile picture. Images should be securely stored using Supabase Storage.
*   **Settings/Preferences Page:** A centralized hub to manage BYOK (Bring Your Own Key) API keys, toggle dark/light themes, and configure notification preferences.
*   **Authentication Flow (Supabase):** Full implementation of Google Auth (Gmail) and Passwordless/Magic Link authentication methods.

## 2. Social & Feed Enhancements
*   **Image Support in Home Share Feed:** Allow users to attach images (e.g., screenshots of lecture notes, complex math problems, or study setups) to their posts in the VortexaFeed. Images should be stored in Supabase Storage (`feed-images` bucket).
*   **Study Groups / Forums:** Evolve the feed into dedicated channels or groups based on specific courses or semesters, allowing for more focused collaboration and resource sharing.
*   **Upvoting & Comments:** Add interaction layers to the feed to highlight the most useful resources and foster discussion.

## 3. ChatBot Enhancements
*   **Image Support in Chat (Vision):** Allow users to upload images into the chat so the Gemini Vision model can analyze and explain the contents (e.g., diagrams, code snippets).
*   **Export Chat History:** Provide options to export useful chat threads as PDF or Markdown documents for future reference.
*   **Pre-defined Academic Prompts:** Add a quick-select menu in the chat interface for common student queries (e.g., "Explain this concept simply," "Create a study plan for this," "Summarize this lecture").

## 4. Academic Utility Features
*   **Assignment/TMA Deadline Tracker:** A visual tracker for upcoming Tutor Marked Assignments (TMAs) and practical exams, complete with impending deadline alerts.
*   **PDF Parsing & Document Q&A:** A dedicated feature allowing students to upload lecture PDFs or course materials (via Supabase Storage) and "chat" specifically with that document to extract key summaries or find answers.
*   **Pomodoro Timer / Study Session Tracker:** A built-in timer to help students manage their study sessions and track time spent on specific subjects.
*   **Mock Exam Generator:** Extend the Viva Simulator to generate written mock exam questions based on specific syllabus topics, which the student can answer and receive AI grading/feedback.

## 5. UI/UX Improvements
*   **Enhanced Loading States:** Implement high-quality skeleton screens (`loading.tsx` with shimmer animations) across all routes to improve perceived performance.
*   **Mobile Responsiveness Audit:** Ensure complex UI elements, such as the CGPA Vault and Syllabus Explorer, function flawlessly on mobile devices.
*   **Accessibility Polish:** Ensure all interactive elements have proper `aria-labels`, focus traps for modals, and appropriate ARIA roles.
