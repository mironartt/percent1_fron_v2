# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. Its core purpose is to empower users with tools for self-improvement, fostering consistent growth. Key capabilities include a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting, offering a guided, multi-step workflow. The project integrates an AI Mentor for user engagement and leverages a Django REST API backend for data persistence and authentication. The business vision is to establish a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, dark/light themes, and responsive design, emphasizing a consistent color priority system. Lucide Vue Next provides minimalist line icons. Mobile responsiveness is achieved with a primary breakpoint at 768px, including a hamburger menu sidebar, vertical layouts for smaller screens, and full-width modals. A Global MentorPanel is available across all app pages, offering a fixed right panel on desktop and a floating button/drawer overlay on mobile, managing its state and displaying unread message badges.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment, featuring a redesigned Wheel of Life, color-coded reflection accordions, and inline editing.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal. It supports batch-saving goals to the backend.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with persistence, ID-based tracking, backend pagination, and inline goal editing with backend sync.
- **Planning Module**: Offers a simplified design with goal-level accordion view, comprehensive filters (text, sphere, status), and week navigation. It synchronizes with the Dashboard's scheduled tasks. Pagination for steps now uses a fixed-height scrollable container.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, including Telegram authentication.
- **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, and auto-generated personalized goals with steps based on weak life spheres. It includes a post-onboarding Goals Review System (PlanReview component) and ensures AI onboarding goals are synced to the backend.
- **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget (full chat interface) and a Floating Button (contextual hints), with a demo mode and planned OpenAI integration.
- **First Steps**: A 7-step checklist guiding users through initial actions, with auto-completion triggers and AI Mentor encouragement.
- **Learning Center**: A dedicated page for tutorial content with progress tracking.
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," compact habit tracker, evening reflection, AI Mentor CTA, and quick navigation.
- **Journal/Diary Module**: Daily reflection feature with 4 questions, AI coach responses (demo mode), streak tracking, calendar history view, and full backend synchronization with optimistic UI updates.
- **Goal Details Page**: Provides full step management with drag & drop, step parameters (priority, estimate, date, status), filtering, sorting, and pagination. Includes modal editing for goal details and `onBeforeRouteLeave` guard for saving changes.
- **XP/Gamification System**: Complete extrinsic motivation system with an XP economy, reward wishlist, daily progress tracking, and a profile statistics page.
- **Profile Page**: Displays user statistics, XP balance, streaks, XP history, and reward wishlist management.
- **Habit Tracker**: Dashboard-integrated habit completion widget with micro-feedback animations and customizable habits.
- **Bidirectional Calendar ↔ Goals Block Sync**: Enables full synchronization of step dates, statuses, priorities, and time estimates between the weekly calendar and the "Goals and Steps" block.
- **Planning Date Timezone Fix**: Implemented `formatDateLocal()` to ensure accurate day display in the day selector by formatting dates in the local timezone.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. Pinia manages state with persistence and reactivity. The system prioritizes user guidance, visual feedback, and a clean interface, with the AI Mentor as a central value proposition. Backend synchronization provides immediate UI feedback and reliable data persistence. Backend synchronization patterns include goal routing with `backendId`, race condition prevention, steps loading protection, optimistic UI updates, API pagination with append functionality, and optimized step synchronization.

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, and journal services.
- **Lucide Vue Next**: Used for minimalist line icons.
- **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
- **Telegram OAuth**: Integrated for user registration and login.