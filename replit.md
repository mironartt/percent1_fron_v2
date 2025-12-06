# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. Its core purpose is to empower users with tools for self-improvement, fostering consistent growth. Key capabilities include a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting, offering a guided, multi-step workflow. The project integrates an AI Mentor for user engagement and leverages a Django REST API backend for data persistence and authentication. The business vision is to establish a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules. It features an interactive "Wheel of Life," a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system. Lucide Vue Next provides minimalist line icons. Mobile responsiveness is a key design consideration, with a primary breakpoint at 768px, hamburger menus for mobile navigation, and adaptive layouts for components like the MentorWidget and modals. A global MentorPanel ensures a unified experience across devices, with independent state management for desktop and mobile views.


### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment with a redesigned Wheel of Life, color-coded reflection accordions, and inline editing.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence, ID-based tracking, backend pagination for steps, and inline goal editing with backend sync.
- **Planning Module**: Complete mobile-first redesign with single-page planner (no wizard). Features include: Week Bar with day tabs, chip filters for spheres/statuses (All/Unscheduled/Scheduled), card-based step grid, FAB button for adding steps, Bottom Sheet for task actions (complete, reschedule, priority, time, remove), compact weekly stats (steps count, completed, total time), infinite scroll for goals list. Loads step data via dedicated API endpoint.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, supporting Telegram authentication.
- **Onboarding (AI-Powered)**: A 5-step process with integrated SSP diagnosis, AI analysis, and auto-generated personalized goals and steps. Includes a post-onboarding Goals Review System.
- **AI Mentor**: A personalized coach providing contextual help and analysis via a Dashboard Widget (full chat interface) and a Floating Button (contextual hints). Features a demo mode with planned OpenAI integration.
- **First Steps**: A 7-step checklist guiding users through initial actions, with auto-completion triggers and personalized AI Mentor encouragement.
- **Learning Center**: A dedicated page containing all tutorial content, with progress tracking for lessons.
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," compact habit tracker, evening reflection, AI Mentor CTA, and quick navigation links.
- **Journal/Diary Module**: Daily reflection feature with 4 questions, AI coach responses (demo mode), streak tracking, calendar history view, and full backend synchronization with optimistic UI updates.
- **Goal Details Page**: Provides full step management with drag & drop, step parameters (priority, estimate, date, status), filtering, sorting, and pagination. Includes modal editing for goal details and ensures changes are saved before navigation.
- **XP/Gamification System**: Complete extrinsic motivation system with XP economy for habits, focus tasks, goal steps, and goals. Includes a reward wishlist, daily progress tracking, and a profile statistics page.
- **Habit Tracker**: Dashboard-integrated habit completion widget with "+X XP" micro-feedback animations and customizable habits via a modal manager. The dedicated Habits Page offers full habit management with scheduling, gamification settings (soft/balanced/hardcore/custom modes), XP penalties (0-200), and per-habit analytics. **Analytics Tab redesign**: Three main blocks (Выполнение, Календарь, Достижения) with compact view + "expand" buttons opening detailed modals. "Выполнение" modal: 8-week trend chart, per-habit distribution bars, best/worst week stats. "Календарь" modal: yearly heatmap (GitHub-style), monthly breakdown with rates. "Достижения" modal: 19 badges across 4 categories (Серии, Выполнение, Объём, Разнообразие) with progress bars for locked badges. Redesigned habits modal: 8 icons + "..." in single row (nowrap), always-visible XP slider (1-100), always-visible 4-row description textarea, schedule presets auto-highlight days (daily→all, weekdays→Mon-Fri, weekends→Sat-Sun), manual day selection switches to custom mode. Icons stored as names (e.g., 'fire', 'strength') for DB compatibility; habitIconsData contains 32 unique icons with {emoji, name} structure; normalizeIconName() provides backward compatibility for legacy emoji-based habits. Settings modal: removed AI-coach section, right-aligned footer, amnesty slider for non-soft modes with description, inline penalty sliders (0-100) for planning/journal toggles. Today modal: interactive habit checkboxes with XP display for quick completion. Top bar: compact mode button "режим: {название}" with settings icon, grid 1fr 1fr 1fr 1.5fr (4th block wider). Amnesty banner: appears on main page when amnestiesRemaining > 0 and missedDaysForAmnesty.length > 0; shows missed days from last 7 days with penalty XP; user can select specific day to forgive; amnestied dates stored in gameSettings.amnestiedDates; pink gradient styling. Habit suggestions modal: "Подобрать привычку" button opens modal with 5 categories (Здоровье, Продуктивность, Саморазвитие, Ментальное здоровье, Режим), each with 5 pre-configured habits; selecting fills formData automatically.
- **Bidirectional Calendar ↔ Goals Block Sync**: Enables synchronization of step dates, completion status, priority, and time estimates between the weekly calendar and the "Goals and Steps" block.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. Pinia manages state with persistence and reactivity. The system prioritizes user guidance, visual feedback, and a clean interface. The AI Mentor is a central value proposition. Backend synchronization provides immediate UI feedback and reliable data persistence, employing patterns like goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination with append functionality.

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, and journal services.
- **Lucide Vue Next**: Used for minimalist line icons.
- **Vite**: Frontend build tool providing fast development and a proxy to the Django backend.
- **Telegram OAuth**: Integrated for user registration and login.