# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. The project aims to provide a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI coach for user engagement, integrating with a Django REST API backend for authentication.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules (SSP, Goals Bank, Decomposition, Planning) with a 3-state design: empty, lesson, and summary. Key visual components include an interactive "Wheel of Life" and progress bars. The UI features a collapsible sidebar, dark/light theme, responsive design, and a consistent color priority system (red, orange, blue, gray). Lucide Vue Next provides minimalist line icons.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used for environment-specific settings.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment, with a redesigned Wheel of Life and color-coded reflection accordions. Summary page features compact stat blocks with Lucide icons (replacing emojis) for average score, strongest sphere, and growth zone. Reflection editing is available directly in the summary accordion with inline edit/save/cancel functionality.
- **Goals Bank Module**: A 3-step workflow for goal validation, filtering, and transfer to actionable goals, including an inline editing modal for validated goals.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence and ID-based tracking. The AI Coach has been removed from this module.
- **Planning Module**: Includes 5-day workweek view with collapsible weekends, week navigation, color-coded priority tasks, drag & drop task management, a daily time budget indicator, and weekly statistics. Quick-add functionality and undo for task deletion are supported. The AI Coach has been removed from this module. Task cards combine sphere icons with checkboxes and display both step and goal titles.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, featuring bidirectional redirects and auth guards. Authentication pages use Lucide icons.
- **Onboarding**: A streamlined 3-step onboarding process (Philosophy → Points A/B → Rules) with optional fields and skip functionality. Lucide icons are used for visual elements.
- **AI Curator**: Currently in demo mode without live API calls.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. Pinia handles state management, ensuring data persistence and reactivity. Authentication is cookie-based with CSRF protection. The application prioritizes user guidance and visual feedback. Global CSS utilities for text overflow have been added.

## External Dependencies
- **Django REST API Backend**: Provides authentication, user data, onboarding, and goal management services.
- **Lucide Vue Next**: Used for minimalist line icons across the UI.
- **Vite**: Frontend build tool with proxy capabilities for seamless backend integration.