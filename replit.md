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

### Completion History Integration (December 8, 2024)
Integrated completion_history from Analytics API v3 into "По привычкам" block:
- Added `getHabitDayStatus()` function to get status from API completion_history with fallback
- Added `getStatusLabel()` and `getStatusTooltip()` helper functions for localization
- Updated template to show different icons for each status (Check, X, CircleAlert, Shield)
- Added CSS styles for 5 statuses: completed (green), missed (red), excused (orange), amnestied (purple), not_scheduled (gray)
- Fixed habit ID matching to use `habit.habit_id` instead of `habit.backendId` for correct API data lookup

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

### Mini Heatmap Calendar Data Fix (December 8, 2024)
Fixed issue where mini heatmap "Календарь - последние 4 недели" showed empty cells despite data being visible in modal:
- Updated `getCompletionForDate()` to check `habitsStore.analytics.calendar_data` from API
- Added `useCountLevel` flag to distinguish between API-driven and local-calculated data
- Updated `getHeatmapClass()` to use count-based levels (like modal) when API data available
- Fixed `total` calculation to use `Math.max(scheduledTotal, count)` for correct percentages
- Now mini heatmap and yearly modal use consistent data sources and level calculations

### Analytics "По привычкам" Block Extended to 30 Days (December 8, 2024)
Extended habit analytics block from 14 days to 30 days display:
- Added `last30Days` computed property (30-day history)
- Updated template to use `last30Days` in "По привычкам" block
- New CSS classes `.habit-month-view` and `.habit-day-cell-small` for compact 30-cell display
- Cells are 8x8px with horizontal scroll for narrow screens
- Updated header to show "(30 дней)" period indicator

### HabitTracker Dashboard Backend Integration (December 8, 2024)
Integrated HabitTracker component on Dashboard with backend data:
- Added `habitsStore` import and data loading on mount
- `allHabits` computed: prioritizes `habitsStore.habits`, falls back to `appStore.todayHabits`
- `isScheduledForToday()` supports `schedule_days` array from backend
- `isCompletedToday()` checks `completions` array from API
- `getHabitIcon()` converts string icon names to emojis
- `habitStreak` uses `statsPanel.streak` from backend if available
- `handleToggle()` calls `habitsStore.markCompleted/unmarkCompleted` for backend habits
- XP awarded only on API success (`result?.success` check)

### Goals Bank Filter Bar Redesign (December 8, 2024)
Replaced horizontal sphere chips with unified filter bar:
- Unified filter-bar with dropdown (left) + status tabs (right)
- Sphere dropdown with Filter icon, shows "Все сферы" or selected sphere name
- ChevronDown icon rotates on open/close
- Status tabs: "Все", "В работе", "Завершены"
- Dropdown menu with sphere icons and smooth fade transition

### Goals Bank Pagination Redesign (December 8, 2024)
Replaced infinite scroll with page-based pagination:
- 10 goals per page (GOALS_PER_PAGE constant)
- Navigation with ChevronLeft/ChevronRight arrows
- Visible page numbers with ellipsis for long lists
- Active page highlighted with primary color
- Smooth scroll to top on page change
- Reset to page 1 when filters change