# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, embodying the "1% improvement" philosophy. It provides tools for self-improvement and consistent growth through a Balanced Scorecard (SSP) for life balance assessment, a Goals Bank for structured goal setting, and an AI Mentor for user engagement. The project aims to be a market-leading platform for personal development, supported by a Django REST API backend.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, and dark/light themes. It uses Lucide Vue Next for minimalist icons and prioritizes mobile responsiveness, consistent color priority, and visual feedback.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is used.

### Feature Specifications
-   **Core Modules**: SSP Module (life balance assessment), Goals Bank (goal management), Goal Details Page (mobile-first design, inline step addition, mini-journal, auto-save), Planning Module (mobile-first, single-page planner, Week Bar, card-based step grid).
-   **Authentication**: Integrates with Django backend for user login, registration, and Telegram authentication.
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System. SSP diagnosis is skipped if user completed a New Year landing test.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and Floating Button. Features conversational post-onboarding activation, personalized welcome messages, and first-week task guidance. Integrated with backend chat API via REST and WebSocket.
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with AI mentor integration (responses appear in mentor chat panel), streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist and animated XP notifications. XP balance is the single source of truth, synchronized from the backend, with optimistic UI updates for granting actions.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for management, scheduling, and gamification settings.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.
-   **Year Review 2025 (Итоги года)**: Single-page flow with test → results, including AI-generated 2026 plan with loading animation and confetti.
-   **Achievements Page**: Improved UX with grouped XP history, filterable transactions, and AI Reward Mentor feature for personalized reward suggestions.
-   **Settings Page**: Redesigned with profile management, Telegram bot integration, and an "Мой старт" section.
-   **Notification Settings Page**: Dedicated page for Telegram notification preferences including global toggle, daily reminders, event notifications, weekly report settings, and timezone selection.
-   **Subscription Page**: Dynamic pricing page integrated with backend API, displaying tariffs, current status, promocode activation, and payment history.
-   **Billing System**: Complete billing integration with Robokassa payments, supporting tariff limits for free vs. paid tiers, and controlling feature access based on effective tariff.
-   **Policy Acceptance Modal**: Mandatory modal for users who haven't accepted Terms & Privacy Policy, blocking app usage until confirmed.
-   **Referral System**: Complete referral program with earnings and withdrawal management, including referral link parsing, registration integration, earnings calculator, and withdrawal system.
-   **UTM Tracking & HTTP Referer**: Marketing attribution system that captures UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content, ga_client_id) and http_referer at first visit, stores in localStorage, and sends with registration request. Utility: `src/utils/tracking.js`.

### System Design Choices
The application uses a modular structure. It emphasizes user guidance, visual feedback, and a clean interface, with the AI Mentor as a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

### Telegram Bot Integration
A standalone Telegram bot mirrors core OnePercent functionality for improved user engagement. It uses Telegraf (Node.js), node-cron for scheduling, and OpenAI for AI (with fallback). Features include authentication, main menu, task management, habit tracking, journal, AI mentor chat, progress summary, settings, and scheduled reminders.

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, SSP data, goals bank, planning, onboarding, journal, habits, XP history, AI services, billing, and referral management.
-   **Lucide Vue Next**: Icons library.
-   **Vite**: Frontend build tool.
-   **Telegram OAuth**: For user authentication and linking.
-   **Telegraf**: Node.js framework for Telegram Bot API.
-   **node-cron**: For scheduling tasks in the Telegram bot.
-   **OpenAI**: For AI mentor functionality in the Telegram bot.
-   **Robokassa**: Payment gateway for billing system.