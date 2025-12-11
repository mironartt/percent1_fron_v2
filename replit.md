# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, embodying the "1% improvement" philosophy. It provides tools for self-improvement and consistent growth through a Balanced Scorecard (SSP) for life balance assessment, a Goals Bank for structured goal setting, and an AI Mentor for user engagement. The project aims to be a market-leading platform for personal development, supported by a Django REST API backend.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, and dark/light themes. It uses Lucide Vue Next for minimalist icons and prioritizes mobile responsiveness. Key design elements include a consistent color priority system and an emphasis on visual feedback.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is used.

### Feature Specifications
-   **SSP Module**: Tab-based interface for life balance assessment with "Колесо", "Рефлексия", and "История" sections.
-   **Goals Bank Module**: Enhanced goal management with visual cards, templates, inline editing, and pagination.
-   **Goal Details Page (GoalEdit)**: Mobile-first design with inline step addition, checklists, a mini-journal, and auto-save.
-   **Planning Module**: Mobile-first, single-page planner with a Week Bar, chip filters, card-based step grid, and inline step completion.
-   **Authentication**: Integrates with Django backend for user login, registration, and Telegram authentication.
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button. Features conversational post-onboarding activation with spotlight mode (dimmed overlay highlighting mentor chat), personalized welcome messages, and step-by-step guidance through first-week tasks (select focus, create habit, view goals, write reflection). State persisted in localStorage via activation.js store.
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with 4 questions, AI coach responses, streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings, including analytics and habit suggestions.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.
-   **Achievements Page**: Improved UX with grouped XP history, filterable transactions, and pagination.
-   **Settings Page**: Redesigned with profile management (email for Telegram users), Telegram bot integration, and an "Мой старт" section displaying onboarding data.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and Pinia stores. It emphasizes user guidance, visual feedback, and a clean interface. The AI Mentor is a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, SSP data, goals bank, planning, onboarding, journal, habits, and XP history services.
-   **Lucide Vue Next**: Used for minimalist line icons.
-   **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
-   **Telegram OAuth**: Integrated for user registration and login.