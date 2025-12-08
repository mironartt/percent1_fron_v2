# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. Its core purpose is to empower users with tools for self-improvement and consistent growth. Key capabilities include a Balanced Scorecard (SSP) module for life balance assessment, a Goals Bank for structured goal setting with a guided workflow, and an AI Mentor for user engagement. The project aims to establish a market-leading platform for personal development, leveraging a Django REST API backend for data persistence and authentication.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow for core modules, an interactive "Wheel of Life," a collapsible sidebar, dark/light theme, and responsive design with a consistent color priority system. Lucide Vue Next provides minimalist line icons. Mobile responsiveness is a primary consideration, with adaptive layouts, hamburger menus for navigation, and a global MentorPanel for a unified experience across devices.

### Technical Implementations
The frontend uses Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is employed.

### Feature Specifications
- **SSP Module**: Tab-based interface for life balance assessment with "Колесо", "Рефлексия", and "История" sections. Includes a Bottom Sheet for reassessment and a GoalEdit modal for goal creation.
- **Goals Bank Module**: Enhanced goal management with visual cards, templates, inline editing, and a simplified two-status system ("В работе", "Завершена").
- **Goal Details Page (GoalEdit)**: Mobile-first design with inline step addition, step checklists, a mini-journal, and auto-save functionality.
- **Planning Module**: Mobile-first, single-page planner with a Week Bar, chip filters, card-based step grid, and inline step completion.
- **Authentication**: Integrates with Django backend for user login, registration, logout, and Telegram authentication.
- **Onboarding (AI-Powered)**: A 5-step process with SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System.
- **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button.
- **First Steps**: A 7-step checklist with auto-completion triggers and AI Mentor encouragement.
- **Learning Center**: Dedicated page for tutorial content with progress tracking.
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
- **Journal/Diary Module**: Daily reflection with 4 questions, AI coach responses, streak tracking, and calendar history.
- **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
- **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings. Includes redesigned analytics (Выполнение, Календарь, Достижения) and habit suggestions.
- **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
- **Marketing Landing Page** (`/` route): Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and Pinia stores for state management. It prioritizes user guidance, visual feedback, and a clean interface. The AI Mentor is a central value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, journal, and habits services.
- **Lucide Vue Next**: Used for minimalist line icons.
- **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
- **Telegram OAuth**: Integrated for user registration and login.

## Recent Changes (December 2024)

### Habits API Integration
- API response format: `{ "status": "ok", "data": {...} }` (not wrapped in "response")
- Error format: `{ "status": "error", "error_data": {...} }`

### Schedule Display Fix (December 8, 2024)
Fixed issue where days with `is_scheduled: false` were displayed as scheduled:
- Created `isScheduledFromWeekSchedule(habit, dateStr)` that checks `is_scheduled` from `week_schedule`
- Updated `getDayStatus()` to prioritize `is_scheduled === false` before status check
- Backend may return `status: 'future'` for days with `is_scheduled: false` - must check `is_scheduled` first

**Key functions:**
```javascript
// Check schedule from week_schedule (priority) or schedule_days (fallback)
isScheduledFromWeekSchedule(habit, dateStr)

// Get day status - returns: completed, missed, excused, amnestied, today, future, not-scheduled
getDayStatus(habit, dateStr)

// Get raw week_schedule data
getDayScheduleData(habit, dateStr)
```

**week_schedule fields from backend:**
- `date`, `weekday`, `status`, `is_scheduled`, `note`, `excuse_reason`
- `xp_earned`, `xp_penalty`, `is_amnestied`

### Completion Status Fix (December 8, 2024)
Fixed error when saving notes for future dates - backend only accepts 3 statuses:
- `completed`, `missed`, `excused` - valid statuses for saving
- `future`, `pending`, `not-scheduled` - display-only statuses, must NOT be sent

**Implementation:**
- `updateCompletionNote()` now omits `status` field for future dates
- Only sends: `{ habit_id, date, note }` for future dates
- Uses local date (not UTC) to determine if date is in future

### Week Navigation API Loading (December 8, 2024)
Fixed issue where week navigation in calendar didn't fetch data from backend:

**Implementation:**
- Added `formatLocalDate()` helper for timezone-safe date formatting
- Updated `weekDays` computed to use local date components instead of `toISOString()`
- Added `watch(weekOffset)` that calls `habitsStore.loadHabits()` with `date_from`, `date_to`, `include_deleted`
- Added `pendingWeekLoad` + loading watcher for retry on rapid navigation

**API call on week change:**
```javascript
habitsStore.loadHabits({
  date_from: '2024-12-02',  // Monday of selected week
  date_to: '2024-12-08',    // Sunday of selected week
  include_deleted: true
})
```