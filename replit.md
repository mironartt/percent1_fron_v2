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
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button. Features conversational post-onboarding activation with spotlight mode (dimmed overlay highlighting mentor chat), personalized welcome messages, and step-by-step guidance through first-week tasks (select focus, create habit, view goals, write reflection). Now integrated with backend chat API via REST (message history) and WebSocket (real-time messaging). Key files: `src/stores/chat.js` (Pinia store), `src/services/chatWebSocket.js` (WebSocket service), `src/components/MentorPanel.vue` (UI component).
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with 4 questions, AI coach responses, streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings, including analytics and habit suggestions.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.
-   **Year Review 2025 (Итоги года)**: Single-page flow at `/land/newyear` with test → results workflow. Results page now includes AI-generated 2026 plan with loading animation, confetti effect, and CTA block for app registration. AI plan generation uses `/api/ai/year-plan` with demo fallback.
-   **Achievements Page**: Improved UX with grouped XP history, filterable transactions, and pagination.
-   **Settings Page**: Redesigned with profile management (email for Telegram users), Telegram bot integration, and an "Мой старт" section displaying onboarding data.
-   **Subscription Page** (`/app/subscription`): Dedicated pricing page with 3 tiers (Free, Pro 990₽/mo, Pro+ 2,990₽/mo), period selector (1/3/6/12 months) with progressive discounts (0%/10%/20%/30%), trial status indicator, and 7-day money-back guarantee.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and Pinia stores. It emphasizes user guidance, visual feedback, and a clean interface. The AI Mentor is a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

## Telegram Bot Integration (NEW - December 2025)

### Overview
A standalone Telegram bot that mirrors core OnePercent functionality for improved user engagement and retention metrics.

### Technical Stack
- **Framework**: Telegraf (Node.js Telegram Bot API wrapper)
- **Scheduling**: node-cron for timed reminders
- **AI**: OpenAI integration (optional, with fallback responses)
- **File**: `server/telegramBot.js`

### Features Implemented
1. **Authentication**: Deep link `/start?auth=TOKEN` for account linking
2. **Main Menu**: Keyboard with Tasks, Habits, Journal, Mentor, Progress, Settings
3. **Task Management**: View and toggle tasks with inline buttons
4. **Habit Tracking**: View and mark habits complete
5. **Journal**: 4-question conversation flow for evening reflection
6. **AI Mentor Chat**: GPT-powered coaching (fallback to preset responses if OpenAI unavailable)
7. **Progress Summary**: Weekly stats display
8. **Settings**: Reminder toggles, timezone selection
9. **Scheduled Reminders**:
   - Morning (8:00 MSK): Daily tasks and habits
   - Evening (21:00 MSK): Journal reminder
   - Streak warnings (22:00 MSK)
   - Weekly report (Sunday 20:00 MSK)

### Environment Variables
- `TELEGRAM_BOT_TOKEN` (required): Bot token from @BotFather
- `WEBAPP_URL` (optional): Web app URL for deep links
- `AI_INTEGRATIONS_OPENAI_API_KEY` (optional): For AI mentor functionality

### Exported Functions (for backend integration)
- `sendMorningReminder(userId, userName)`
- `sendEveningReminder(userId, userName)`
- `sendStreakWarning(userId, userName, streakDays)`
- `sendXPNotification(userId, amount, reason)`
- `sendAchievementUnlocked(userId, achievementName, achievementIcon)`

### Pending Features
- Telegram Payments integration
- Real backend API data (currently uses demo data)
- Token validation for secure account linking
- User preference persistence

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, SSP data, goals bank, planning, onboarding, journal, habits, and XP history services.
-   **Lucide Vue Next**: Used for minimalist line icons.
-   **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
-   **Telegram OAuth**: Integrated for user registration and login.
-   **Telegraf**: Telegram Bot API framework for Node.js.
-   **node-cron**: Task scheduling for timed bot reminders.