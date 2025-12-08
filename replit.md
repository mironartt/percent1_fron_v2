# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application designed for personal life management and goal tracking, embodying the "1% improvement" philosophy. It offers tools for self-improvement and consistent growth through a Balanced Scorecard (SSP) for life balance assessment, a Goals Bank for structured goal setting, and an AI Mentor for user engagement. The project's vision is to become a market-leading platform for personal development, supported by a Django REST API backend.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, and dark/light themes. It utilizes Lucide Vue Next for minimalist icons and prioritizes mobile responsiveness with adaptive layouts and a global MentorPanel. Key design elements include a consistent color priority system and an emphasis on visual feedback.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is used.

### Feature Specifications
-   **SSP Module**: Tab-based interface for life balance assessment with "Колесо", "Рефлексия", and "История" sections, including a Bottom Sheet for reassessment and a GoalEdit modal.
-   **Goals Bank Module**: Enhanced goal management with visual cards, templates, inline editing, a two-status system, and pagination.
-   **Goal Details Page (GoalEdit)**: Mobile-first design with inline step addition, checklists, a mini-journal, and auto-save.
-   **Planning Module**: Mobile-first, single-page planner with a Week Bar, chip filters, card-based step grid, and inline step completion.
-   **Authentication**: Integrates with Django backend for user login, registration, and Telegram authentication.
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and a Floating Button.
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with 4 questions, AI coach responses, streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for full management, scheduling, and gamification settings, including redesigned analytics and habit suggestions.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and Pinia stores. It emphasizes user guidance, visual feedback, and a clean interface. The AI Mentor is a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, journal, and habits services.
-   **Lucide Vue Next**: Used for minimalist line icons.
-   **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
-   **Telegram OAuth**: Integrated for user registration and login.

## Recent Changes (December 2024)

### Style Guide / Brand Pack Created (December 8, 2024)
Created comprehensive design system documentation at `docs/STYLE_GUIDE.md`:
- 25 sections covering all UI components and patterns
- Color palette with CSS variables for Light/Dark themes
- Typography, buttons, cards, forms, tabs specifications
- Component patterns: Week Bar, Empty States, Stats Panel, Modals
- AI Mentor panel and Sidebar structure
- SSP life spheres color coding (8 spheres)
- Lucide icons usage rules, accessibility guidelines
- Do's and Don'ts with visual examples
- References to source files for each pattern

Added global utility CSS classes to `src/assets/main.css`:
- .btn-ghost, .page-container, .page-header, .page-title, .page-subtitle
- .section-card, .status-chip (success/warning/danger/info/purple)
- .chip-filter, .count-badge, .tab-container, .tab-btn
- .empty-state, .stats-panel, .stat-chip, .modal-* components
- .progress-bar, .toast (success/error/info/warning), .skeleton-* loading

### Stats Panel API v2 Integration for Modals (December 8, 2024)
Integrated new Stats Panel API fields for "XP за привычки" and "Серия выполнений" modals:
- Added `month_xp`, `week_xp_by_day`, `streak_days` fields to `statsPanel` in habits store
- Added `monthXp`, `weekXpByDay`, `streakDays` computed properties with export
- Updated `monthXpFromHabits` to use `habitsStore.monthXp` from API with fallback
- Updated `xpByDay` to use `habitsStore.weekXpByDay` array from API
- Updated `streakCalendar` to use `habitsStore.streakDays` with Map for fast lookup
- Added `.not-scheduled` class for days without scheduled habits

### Comprehensive Dark Theme Audit (December 8, 2024)
Complete audit and fix of dark theme across all pages:
- **main.css**: Added CSS variables (--bg-hover, status colors), form focus/hover states, button hover states
- **GoalsBank.vue**: Replaced hardcoded colors with CSS variables for status chips and badges
- **Habits.vue**: Extended dark theme for containers, habit-card hover, day-cell states, heatmap, analytics
- **Dashboard.vue**: Dark theme overrides for habit colors and section cards
- **BalancedScorecard.vue**: Full dark theme for containers, tabs, history items, sliders, sphere hints
- **Planning.vue**: Dark theme for step-card, day-tab, priority badges, chip filters
- **Settings.vue**: Dark theme for settings cards, labels, price cards
- **Sidebar.vue**: Dark theme for navigation, active states, footer
- **MentorPanel.vue**: Dark theme for panel, chat messages, input

### Landing Page "Goals" Preview Tab (December 8, 2024)
Added new "Цели" (Goals) tab to landing page preview section:
- New previewTabs entry with icon 🏦, title "Банк целей", description and 4 features
- Sidebar mockup shows new "Цели" menu item with active state
- Preview screen displays goal cards with sphere icons, titles, progress bars
- AI decomposition hint at bottom of preview
- CSS styles for .goals-preview, .goal-card, .goal-header, .goal-progress, .ai-hint
- Updated indices: ССП=0, Цели=1, Планирование=2, Привычки=3, Достижения=4

### Habit Icons Sync with Backend (December 8, 2024)
Synchronized icon names between frontend and backend API (32 icons):
- Updated `habitIconsData` array with all 32 backend-compatible icon names
- Updated `habitSuggestions` templates to use valid icon names
- Updated `iconMap` in HabitTracker.vue to match backend icon list
- Valid icons: fire, strength, brain, heart, book, run, water, sleep, meditation, target, money, graph, sun, moon, shield, palette, smile, apple, weight, calendar, trophy, star, rocket, leaf, coffee, music, camera, laptop, dumbbell, yoga, bicycle, swimmer

### Achievements Page UX Improvements (December 8, 2024)
Improved Profile.vue (/app/achievements) UX based on user feedback:
- Removed duplicate "Следующая награда" block (was confusing)
- Renamed "Пользователь" to "Мой прогресс" with clear explanation
- Split Stats Panel into logical groups:
  - "Серии" section with "Непрерывные дни активности" hint (дней привычек, записей дневника)
  - XP metrics inside "Мой прогресс" card (сегодня, за неделю, всего заработано)
- Added explanatory text: "Зарабатывайте XP за привычки, задачи и дневник. Обменивайте на награды из списка желаний."
- Compact reward progress inside progress card
- All CSS uses Style Guide variables for dark/light theme support
