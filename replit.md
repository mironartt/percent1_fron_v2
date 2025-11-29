# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. The project aims to provide a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI coach for user engagement, integrating with a Django REST API backend for authentication. The business vision is to empower users with tools for self-improvement, fostering consistent growth and offering a market-leading platform for personal development.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules (SSP, Goals Bank, Decomposition, Planning) with a 3-state design: empty, lesson, and summary. Key visual components include an interactive "Wheel of Life" with curved text labels and progress bars. The UI features a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system (red, orange, blue, gray). Lucide Vue Next provides minimalist line icons, replacing emojis for a cleaner aesthetic.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used for environment-specific settings. Authentication is cookie-based with CSRF protection.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment, featuring a redesigned Wheel of Life and color-coded reflection accordions with inline editing. Backend integration allows for loading and saving SSP data, including ratings and reflections, with auto-save triggers on step transitions and edits.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer, including an inline editing modal for validated goals. Stat cards and action buttons utilize Lucide icons and color-coded badges.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence and ID-based tracking. The AI Coach has been removed from this module, resulting in a single-column, focused interface.
- **Planning Module**: Includes a 5-day workweek view with collapsible weekends, week navigation, color-coded priority tasks, drag & drop task management, and weekly statistics. Quick-add functionality and undo for task deletion are supported. The AI Coach has been removed.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout. Supports Telegram authentication with dedicated modals for error handling and new user registration flow (email/password setup).
- **Onboarding**: A streamlined 3-step process (Philosophy → Points A/B → Rules) with optional fields and skip functionality. Utilizes Lucide icons and ensures proper navigation upon completion.
- **AI Curator**: Currently in demo mode without live API calls.
- **Mini-Task Module**: Implemented with a layered backend sync, preserving local UX while synchronizing task categories and progress. Tasks are hardcoded on the frontend with backend mapping. The system ensures fresh user data is fetched on every navigation to reflect real-time onboarding and mini-task completion status.
- **Adaptive Dashboard**: A 4-stage progressive system that guides users through the app setup:
  - Stage 1: Invite to complete SSP (shown when life spheres not rated)
  - Stage 2: Prompt to create goals (shown after SSP completion)
  - Stage 3: Encourage weekly planning (shown after goals exist)
  - Stage 4: Full dashboard with Journal widget and quick actions
- **Journal/Diary Module**: Daily reflection feature with 4 questions (accomplishments, incomplete tasks, reflection, tomorrow's plans). Includes AI coach responses (currently demo mode), streak tracking, calendar history view, and modal entry form. Accessible via sidebar menu and dashboard widget.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. State management by Pinia ensures data persistence and reactivity. The system prioritizes user guidance, visual feedback, and a clean, distraction-free interface, especially after the removal of the AI Coach from several modules. Backend synchronization is designed to provide immediate UI feedback while persisting data reliably.

## External Dependencies
- **Django REST API Backend**: Provides user authentication, profile management, SSP data, goals bank, decomposition, planning, onboarding, and mini-task services.
- **Lucide Vue Next**: Used for a comprehensive set of minimalist line icons throughout the UI.
- **Vite**: Serves as the frontend build tool, offering fast development and a proxy for seamless communication with the Django backend.
- **Telegram OAuth**: Integrated for user registration and login via Telegram.