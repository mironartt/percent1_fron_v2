# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It provides tools for self-improvement and consistent growth through a Balanced Scorecard (SSP) module for life balance assessment, a Goals Bank for structured goal setting, and an AI Mentor for user engagement. The project aims to be a market-leading platform for personal development, supported by a Django REST API backend.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, dark/light themes, and responsive design with a consistent color priority system. It utilizes Lucide Vue Next for minimalist icons and prioritizes mobile responsiveness with adaptive layouts and a global MentorPanel.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is used.

### Feature Specifications
-   **SSP Module**: Tab-based interface for life balance assessment with "Колесо", "Рефлексия", and "История" sections, including a Bottom Sheet for reassessment and a GoalEdit modal.
-   **Goals Bank Module**: Enhanced goal management with visual cards, templates, inline editing, and a two-status system.
-   **Goal Details Page (GoalEdit)**: Mobile-first design with inline step addition, checklists, a mini-journal, and auto-save.
-   **Planning Module**: Mobile-first, single-page planner with a Week Bar, chip filters, card-based step grid, and inline step completion.
-   **Authentication**: Integrates with Django backend for user login, registration, logout, and Telegram authentication.
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button.
-   **First Steps**: A 7-step checklist with auto-completion triggers and AI Mentor encouragement.
-   **Learning Center**: Dedicated page for tutorial content with progress tracking.
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with 4 questions, AI coach responses, streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings, including redesigned analytics and habit suggestions.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page** (`/` route): Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and Pinia stores. It emphasizes user guidance, visual feedback, and a clean interface. The AI Mentor is a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, journal, and habits services.
-   **Lucide Vue Next**: Used for minimalist line icons.
-   **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
-   **Telegram OAuth**: Integrated for user registration and login.

## Recent Changes (December 2024)

### Analytics API Integration for Habits (December 8, 2024)
Integrated new Analytics API v2 with 8+ computed properties:
- Added MONTH_NAMES_RU constant and translateMonth() function for Russian localization
- Updated weekCompletionRate/monthCompletionRate to use completion_rate_7/30 from API
- Updated weeklyCompletionData to use weekly_trend array (8 elements) with labels
- Added bestWeekRate, worstHabitName, worstHabitRate computed properties
- Updated habitCompletionDistribution to use habits_data with habit_id, completion_rate_30, streak
- Updated yearlyHeatmapData to use calendar_data (sparse object) with getHeatmapLevel()
- Updated yearTotalCompletions/yearActiveDays/bestMonthName/bestMonthRate for API
- Updated monthlyStats to use monthly_stats with localization
- Modal "Выполнение" now shows worstHabitName/worstHabitRate instead of worstWeekRate
- Modal "Годовой календарь" now shows bestMonthRate in percentage
- All computed properties have fallback to local calculations when API data unavailable

### Analytics Block "По привычкам" Data Source Fix (December 8, 2024)
Fixed issue where analytics block showed 0% for habits with past completions:
- Updated `isCompletedOnDay()` to check `habitsStore.habits[].completions` from backend first
- Updated `getHabitStreak()` to use `habitsStore.analytics.habits_data[].streak` from API
- Updated `getHabitCompletionRate()` to use `completion_rate_7/30` from `habits_data`
- All functions now have fallback to `appStore.habitLog` (localStorage) when API data unavailable
- 14-day circles in analytics now correctly display completions from backend data

### Habit Icon Field Name Fix (December 8, 2024)
Fixed incorrect field name when creating/updating habits:
- Changed `icon_name` to `icon` in `backendHabitData` object
- Now habits correctly save with the selected icon

### Past Week Day Details Modal Fix (December 8, 2024)
Removed restriction that prevented opening day details modal on past weeks:
- Removed `if (isPastWeek.value)` check from `openDayEditModal()` function
- Users can now open and edit day details for any scheduled day regardless of week

### Habit Schedule Display Fix in Edit Modal (December 8, 2024)
Fixed issue where all days were highlighted when editing a habit:
- Added `determineFrequencyType(existingType, scheduleDays)` helper function
- Analyzes `schedule_days` array to determine actual frequency type:
  - `[0,1,2,3,4,5,6]` → `'daily'`
  - `[1,2,3,4,5]` → `'weekdays'`
  - `[0,6]` → `'weekends'`
  - Any other combination → `'custom'`
- Now correctly highlights only the scheduled days in edit modal

### Stats Panel Blocks Data Source Fix (December 8, 2024)
Fixed synchronization issues in the top stats panel blocks (streak, today, XP, amnesty, mode):
- Added `amnestyDataWasLoaded` computed to check if data was loaded from backend
- `maxAmnesties` now checks API data first, then falls back to `gameSettings.weeklyAmnestyCount`
- `saveGameSettings()` now syncs values from `habitsStore.settings` after successful save
- Fixed card highlighting on past weeks by checking `weekOffset !== 0`