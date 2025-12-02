# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. The project aims to provide a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI Mentor for user engagement. The business vision is to empower users with tools for self-improvement, fostering consistent growth and offering a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules. Key visual components include an interactive "Wheel of Life." The UI features a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system. Lucide Vue Next provides minimalist line icons.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used for environment-specific settings. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment, featuring a redesigned Wheel of Life and color-coded reflection accordions with inline editing.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence and ID-based tracking.
- **Planning Module**: Includes a 5-day workweek view, week navigation, color-coded priority tasks, drag & drop task management, quick-add functionality, and undo for task deletion. Features comprehensive filters (text search, sphere, status, week) and pagination. **Synchronized with Dashboard** via `todayScheduledTasks` computed getter - changes in either view reflect immediately in the other (December 2025 update).
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, including Telegram authentication.
- **Onboarding (AI-Powered)**: A 5-step onboarding process with integrated SSP diagnosis and AI analysis, leading to a personalized 7-day plan.
- **AI Mentor**: A personalized coach guiding users with contextual help and analysis, featuring a dashboard widget, floating button, and configurable modes. Supports demo responses with planned OpenAI integration. Includes a post-onboarding AI Plan Review System.
- **First Steps**: A 7-step checklist for new users, with auto-completion and personalized AI encouragement.
- **Learning Center**: A dedicated page for tutorial content on the project's philosophy and module usage.
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, evening reflection, and AI Mentor call-to-action.
- **Journal/Diary Module**: Daily reflection feature with 4 questions, AI coach responses (demo mode), streak tracking, and calendar history view.
- **Goal Details Page**: Provides full step management with drag & drop, step parameters (priority, estimate, date, status), filtering, sorting, and pagination. Includes modal editing for goal details. Uses `onBeforeRouteLeave` guard and `flushSave()` to ensure step changes are saved before navigation (fix: December 2025).
- **XP/Gamification System**: Complete extrinsic motivation system with XP economy (habits +5, focus tasks +10, goal steps +25, goals +150 XP), reward wishlist, daily progress tracking, profile statistics page. Uses separate `xp.js` Pinia store for decoupled state management.
- **Profile Page**: User statistics with XP balance, lifetime earned, habit/journal streaks, XP history timeline, and integrated reward wishlist management.
- **Habit Tracker**: Dashboard-integrated habit completion widget with "+X XP" micro-feedback animations and customizable habits via modal manager.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. Pinia handles state management. The system prioritizes user guidance, visual feedback, and a clean, distraction-free interface. The AI Mentor is a central value proposition.

## External Dependencies
- **Django REST API Backend**: Used for user authentication, data management (SSP, goals, planning), and onboarding services.
- **Lucide Vue Next**: Provides minimalist line icons.
- **Vite**: Frontend build tool.
- **Telegram OAuth**: Integrated for user authentication.