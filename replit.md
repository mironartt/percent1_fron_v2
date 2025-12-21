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
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System. **Step 2 (SSP Diagnosis) is automatically skipped** if user already completed the New Year landing test (`/land/newyear`), with SSP data pre-loaded from the linked test.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button. Features conversational post-onboarding activation with spotlight mode (dimmed overlay highlighting mentor chat), personalized welcome messages, and step-by-step guidance through first-week tasks (select focus, create habit, view goals, write reflection). Now integrated with backend chat API via REST (message history) and WebSocket (real-time messaging). Key files: `src/stores/chat.js` (Pinia store), `src/services/chatWebSocket.js` (WebSocket service), `src/components/MentorPanel.vue` (UI component).
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with 3 questions (removed "Планы на завтра"), AI mentor integration (responses appear in mentor chat panel instead of inline), streak tracking, and calendar history. Button: "Сохранить и получить ответ от AI ментора" opens mentor panel with personalized AI analysis.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings, including analytics and habit suggestions.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.
-   **Year Review 2025 (Итоги года)**: Single-page flow at `/land/newyear` with test → results workflow. Results page now includes AI-generated 2026 plan with loading animation, confetti effect, and CTA block for app registration. AI plan generation uses `/api/ai/year-plan` with demo fallback.
-   **Achievements Page**: Improved UX with grouped XP history, filterable transactions, and pagination. Includes AI Reward Mentor feature for personalized reward suggestions.
    - **AI Reward Generation**: Uses `aiTasksStore` with `task_type: "reward_mentor_help"` for backend AI task integration.
    - **Key File**: `src/components/RewardWishlist.vue` - handles reward wishlist, AI suggestions modal, and reward creation.
    - **API Flow**: Start task → WebSocket progress updates → Receive 3 AI-generated rewards → User selects → Create rewards via `/app/habits/rewards/create/`
-   **Settings Page**: Redesigned with profile management (email for Telegram users), Telegram bot integration, and an "Мой старт" section displaying onboarding data.
-   **Notification Settings Page** (`/app/settings/notifications`): Dedicated page for Telegram notification preferences. Includes global toggle, daily reminders (morning/evening with time picker), event notifications (streak warning, achievements, level up, deadlines), weekly report settings (day/time), additional options (XP rewards, SSP reassessment), and timezone selection. Settings stored in localStorage with API integration placeholder. See `notes/telegram-notifications.md` for full specification.
-   **Subscription Page** (`/app/subscription`): Dynamic pricing page integrated with backend API. Displays real tariffs, terms with discounts, current subscription status, promocode activation, and payment history.
-   **Billing System (NEW - December 2025)**: Complete billing integration with Robokassa payments.
    - **Key Files**: `src/services/billing.js` (API service), `src/stores/subscription.js` (Pinia store), `src/components/PaymentModal.vue`, `src/components/UpgradeModal.vue`, `src/views/BillingSuccess.vue`, `src/views/BillingFail.vue`
    - **API Endpoints**: `/app/subscription/get/`, `/app/tariffs/`, `/app/promocode/activate/`, `/app/payment/calculate/`, `/app/payment/create/`, `/app/payment/history/`
    - **Feature Access Control**: Uses `effective_tariff` (not `tariff`) to account for trial expiration. `hasFeature()` and `checkLimit()` helpers in subscription store.
    - **Tariff Limits**: Free tier limits - 3 goals, 5 habits, 10 diary entries/month. Pro/Basic - unlimited.
    - **Payment Flow**: calculate → PaymentModal → create → redirect to Robokassa → callback to `/app/billing/success` or `/app/billing/fail`
    - **AI Access Control**: MentorPanel and AICurator check `hasAIAccess()` before sending messages. Shows UpgradeModal for Free users.
-   **Policy Acceptance Modal**: Mandatory modal for users who haven't accepted Terms & Privacy Policy. Blocks app usage until both checkboxes are confirmed. Triggered on login (if user.is_terms_accepted/is_privacy_accepted is false), on 403 policy_acceptance_required API error, or on WebSocket close code 4004. Key files: `src/components/PolicyAcceptanceModal.vue`, store flags in `src/stores/app.js` (needsPolicyAcceptance, setPolicyAccepted, showPolicyModal).
-   **Referral System (NEW - December 2025)**: Complete referral program with earnings and withdrawal management.
    - **Key Files**: `src/views/Referral.vue` (main page), `src/views/Register.vue` (code integration), `src/router/index.js` (referral routes)
    - **Referral Link Formats**: Direct `/ref/{CODE}` and Query `/?ref={CODE}` - both save code to `onepercent_referral_code` localStorage key
    - **API Endpoints**: `/app/referral/get/` (stats, links, calculator, referrals), `/app/referral/transactions/get/`, `/app/referral/withdrawal/create/`, `/app/referral/withdrawal/get/`
    - **Registration Flow**: Referral code from localStorage is sent to backend during registration, cleared after success
    - **Earnings Calculator**: Dynamic grid showing commission (30%) for each tariff/term combination
    - **Withdrawal System**: Modal with amount/comment input, minimum amount from API (default 3000 RUB), withdrawal requests list with statuses (pending/approved/rejected/completed)
    - **Settings Widget**: Compact stats display (invited, earned, balance) with link to full referral page
    - **SITE_DOMAIN Config**: New config variable in `local_settings.js` (default: `https://percent1.ru`) for absolute URL generation

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