# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. The project provides a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI Mentor for user engagement, integrating with a Django REST API backend for authentication. The business vision is to empower users with tools for self-improvement, fostering consistent growth and offering a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules. It features an interactive "Wheel of Life," a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system. Lucide Vue Next provides minimalist line icons.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment with a redesigned Wheel of Life, color-coded reflection accordions, and inline editing.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence, ID-based tracking, backend pagination for steps, and inline goal editing with backend sync.
- **Planning Module**: Includes a 5-day workweek view, week navigation, color-coded priority tasks, drag & drop task management, weekly statistics, quick-add functionality, undo for task deletion, comprehensive filters (text, sphere, status, week), pagination, and URL parameter syncing.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, supporting Telegram authentication.
- **Onboarding (AI-Powered)**: A 5-step onboarding process with integrated SSP diagnosis, AI analysis, and auto-generated 7-day plans targeting weak spheres.
- **AI Mentor**: A personalized coach providing contextual help and analysis via a Dashboard Widget (full chat interface) and a Floating Button (contextual hints). Features a demo mode with planned OpenAI integration and user settings for interaction style.
- **First Steps**: A 7-step checklist guiding users through initial actions, with auto-completion triggers and personalized AI Mentor encouragement.
- **Learning Center**: A dedicated page containing all tutorial content, with progress tracking for lessons.
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," compact habit tracker (Journal, Balance score), evening reflection, AI Mentor CTA, and quick navigation links.
- **Journal/Diary Module**: Daily reflection feature with 4 questions, AI coach responses (demo mode), streak tracking, calendar history view, and full backend synchronization with optimistic UI updates.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. Pinia manages state with persistence and reactivity. The system prioritizes user guidance, visual feedback, and a clean interface. The AI Mentor is a central value proposition. Backend synchronization provides immediate UI feedback and reliable data persistence.

### Backend Sync Patterns (Dec 2025)
- **Goal Routing with backendId**: URL `/app/goals/<backendId>` uses backend ID directly
  - GoalsBank.vue `goToDecompose()` navigates with `backendId` from rawIdeas
  - GoalEdit.vue uses `goalBackendId = route.params.id` for all API calls
  - Goal data found by matching `backendId` in store.goals or rawIdeas
- **Race Condition Prevention**: Components capture current ID before async calls and verify it hasn't changed before applying response data (GoalEdit.vue uses `currentBackendId` check)
- **Steps Loading Protection**: `stepsLoadedFromBackend` flag prevents `loadGoalData()` from overwriting backend-loaded steps with empty store data
- **Journal Today Entry Tracking**: `hasTodayEntryFromBackend` tracks actual backend state separately from filtered UI display
- **Optimistic UI Updates**: UI updates immediately, then syncs with backend; errors logged without blocking user flow
- **API Pagination with Append**: 
  - `store.loadGoalsFromBackend(params, append)` accepts `append` flag
  - When `append=true`: new goals added to existing list (deduplicated by backendId)
  - When `append=false`: data replaced (for filters/initial load)
  - `remainingGoalsCount` computed from `totalFilteredItems - rawIdeas.length`
- **Optimized Step Sync (GoalEdit)**:
  - `stepsSnapshot` tracks step state after load
  - `getChangedSteps()` compares and identifies changed steps/fields
  - `syncStepsToBackend()` sends only changed steps with changed fields
  - Priority mapping: frontend 'desirable' ↔ backend 'important'
- **API Field Naming**:
  - Goals: `category_filter`, `status_filter`, `query_filter`
  - Steps: `result_filter` (complete/uncomplete), `priority_filter`, `query_filter`
  - Sort: backend supports `order`, `date_created`, `priority`

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, and journal services.
- **Lucide Vue Next**: Used for minimalist line icons.
- **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
- **Telegram OAuth**: Integrated for user registration and login.