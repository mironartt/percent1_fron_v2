# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. The project aims to provide a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI Mentor for user engagement, integrating with a Django REST API backend for authentication. The business vision is to empower users with tools for self-improvement, fostering consistent growth and offering a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules (SSP, Goals Bank, Decomposition, Planning). Modules now show working interface directly without introductory lessons (lessons moved to Learning Center). Key visual components include an interactive "Wheel of Life" with curved text labels and progress bars. The UI features a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system (red, orange, blue, gray). Lucide Vue Next provides minimalist line icons, replacing emojis for a cleaner aesthetic.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used for environment-specific settings. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment, featuring a redesigned Wheel of Life and color-coded reflection accordions with inline editing. Backend integration allows for loading and saving SSP data, including ratings and reflections, with auto-save triggers on step transitions and edits. Empty state lesson removed - shows working interface directly.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal for validated goals. Stat cards and action buttons utilize Lucide icons and color-coded badges. Empty state lesson removed - shows working interface directly.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence and ID-based tracking. The AI Coach has been removed from this module, resulting in a single-column, focused interface.
- **Planning Module**: Includes a 5-day workweek view with collapsible weekends, week navigation, color-coded priority tasks, drag & drop task management, and weekly statistics. Quick-add functionality and undo for task deletion are supported. The AI Coach has been removed.
  - **Filters**: Text search (goal/step titles), sphere dropdown, status filter (scheduled/unscheduled/partial/full), week filter (show only goals with steps in current week), clear all button
  - **Pagination**: 10 goals per page with "load more" button, 6 steps per goal with individual "load more" buttons
  - **Step Date Display**: Each scheduled step shows weekday + date (e.g., "Пн 15 дек")
  - **URL Parameters**: Filters sync to URL query params (?search=...&sphere=...&status=...&week=1) and restore on page load
  - **Empty State**: "Перейти к декомпозиции" button navigates to /app/goals-bank
- **Authentication**: Integrates with the Django backend for user login, registration, and logout. Supports Telegram authentication with dedicated modals for error handling and new user registration flow (email/password setup).
- **Onboarding**: A streamlined 3-step process (Philosophy → Points A/B → Rules) with optional fields and skip functionality. Utilizes Lucide icons and ensures proper navigation upon completion.
- **AI Mentor**: Central product value - a personalized coach that guides users through all modules with contextual help and analysis. Features:
  - Dashboard Widget (MentorWidget.vue): Full chat interface with welcome message, quick prompts, and demo responses
  - Floating Button (MentorFloatingButton.vue): Available on all pages except dashboard, with contextual hints per page
  - Demo mode with pre-written responses (OpenAI integration planned)
  - Settings: Mode selection (proactive/on-request/off), chat history clearing
  - State persisted in localStorage via Pinia store
- **First Steps**: Replaced complex mini-tasks with simple 7-step checklist:
  1. Evaluate life balance (SSP)
  2. Add an idea (Goals Bank)
  3. Validate a goal
  4. Select a key goal
  5. Plan a task
  6. Write in journal
  7. Chat with mentor
  Auto-completion triggers when user performs corresponding actions. Toast notifications with CTA appear on step completion, suggesting next step. AI Mentor adds personalized encouragement message when each step is completed.
- **Learning Center**: New page (/app/learning) containing all tutorial content moved from modules:
  - Philosophy of 1% improvements
  - Balanced Scorecard guide
  - Goal setting methodology
  - Decomposition techniques
  - Weekly planning tips
  - Journal benefits
  - Working with AI Mentor
  Lessons can be marked as completed with progress tracking.
- **Dashboard**: Full-featured dashboard shown immediately after onboarding, featuring:
  - First Steps widget (7-step checklist guiding user progression)
  - AI Mentor widget (central value - chat with personalized coach)
  - Journal widget for daily reflections
  - Stats (balance score, active goals, completed goals)
  - Today's tasks list
  - Quick actions (update SSP, new goal, journal history)
- **Journal/Diary Module**: Daily reflection feature with 4 questions (accomplishments, incomplete tasks, reflection, tomorrow's plans). Includes AI coach responses (currently demo mode), streak tracking, calendar history view, and modal entry form. Accessible via sidebar menu and dashboard widget.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. State management by Pinia ensures data persistence and reactivity. The system prioritizes user guidance, visual feedback, and a clean, distraction-free interface. The AI Mentor is positioned as the central value proposition. Backend synchronization is designed to provide immediate UI feedback while persisting data reliably.

## Recent Changes (November 2025)
- Simplified Dashboard: removed 4-stage system, now shows full dashboard with all widgets immediately after onboarding
- First Steps widget guides users (instead of intermediate dashboard stages)
- Added AI Mentor system with dashboard widget and floating button
- Created 7-step First Steps checklist to replace complex mini-tasks
- Added Learning Center page with all tutorial content
- Removed empty state lessons from SSP and Goals Bank modules
- Added mentor settings section in Settings page
- Added auto-completion triggers for first steps in store actions
- Deleted DashboardStage1/2/3.vue components (no longer needed)
- **Planning Module Enhancements (Late November 2025)**:
  - Added comprehensive filters: text search, sphere, status, week-related goals
  - Implemented pagination (10 goals with load more, 6 steps per goal with load more)
  - Added step date display alongside weekday in goal cards
  - Implemented URL parameter sync for filter state persistence
  - Fixed "Перейти к декомпозиции" button navigation to /app/goals-bank
  - Added similar URL parameter support to Goals Bank module
  - **Step-level filters and sorting per goal card**: Each expanded goal shows filter panel with:
    - Text search for steps
    - Status filter (scheduled/unscheduled)
    - Priority filter (critical/desirable/attention/optional/none)
    - Sorting by order, priority, date, status with asc/desc toggle
    - "Показано X из Y" counter when filters active
  - Steps list scroll threshold changed from 6 to 5 visible steps (`max-height: calc(5 * 44px + 50px)`)
- **Goal Details Page (GoalEdit.vue) - Late November 2025**:
  - Full step management with drag & drop reordering (disabled when filters/pagination active)
  - Step parameters: priority (4 levels), time estimate, scheduled date (calendar picker), status
  - Step filtering: text search, status, priority filters with visual feedback
  - Pagination: 10 steps per page with "load more" button
  - Auto-save with debounce (500ms) and hash-based change detection to prevent duplicate toasts
  - Modal editing for goal details (3 Whys system), deadline field removed
  - Auto-resizing comment textarea (max 7 lines with scroll)
  - Navigation preserves Goals Bank filters via localStorage
  - **Priority highlighting**: Steps show colored left border and background matching Planning page (red/orange/blue/gray)
  - **Completed steps override**: CSS uses `:not(.step-completed)` to ensure completed steps show green instead of priority colors
  - **Optimized header**: Status badge and sphere category stack in top-right; goal title truncates with ellipsis
  - **Delete button**: Styled as icon-only btn-icon-danger matching GoalsBank "remove from work" action
  - **Unified modal**: Includes "3 Whys" divider, validation section, footer with "Delete" in left and "Cancel/Save" in right
  - **Quick navigation**: "Planner" button in header for seamless transition to Planning module
  - **Edit button alignment**: "Редактировать цель" button aligned to left edge via flex-start
  - **Multiline comments on load**: adjustAllCommentHeights() auto-adjusts textarea height for saved comments (up to 7 lines, then scroll)
  - **Step sorting**: Dropdown for sorting by order, priority, status, time estimate, scheduled date with asc/desc toggle; drag & drop disabled during non-default sorts
  - **Pagination expansion**: New steps appear immediately by increasing stepsDisplayLimit to full list length
  - **Empty step filtering**: Steps without titles are excluded from save operations and hash calculations

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, and mini-task services.
- **Lucide Vue Next**: Used for a comprehensive set of minimalist line icons throughout the UI.
- **Vite**: Serves as the frontend build tool, offering fast development and a proxy for seamless communication with the Django backend.
- **Telegram OAuth**: Integrated for user registration and login via Telegram.
