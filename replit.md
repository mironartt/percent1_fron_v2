# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It features a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting, integrating with a Django REST API backend for authentication. The project aims to provide a guided, multi-step workflow for personal development, leveraging interactive UI components and an AI coach for user engagement.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application employs a guided, multi-step workflow for core modules (SSP, Goals Bank, Decomposition, Planning) with a 3-state design: empty state, lesson mode for education, and summary state for overview. Key visual components include an interactive "Wheel of Life" and progress bars. The UI features a collapsible sidebar, a dark/light theme toggle, and responsive design for various screen sizes. UI elements are styled with a consistent color priority system (red for critical, orange for desirable, blue for attention, gray for optional) and utilize Lucide Vue Next for minimalist line icons.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite with a proxy to the Django backend, Vue Router for navigation with authentication guards, and Pinia for state management with localStorage persistence. A custom Django-style configuration system (`settings.js` + `local_settings.js`) is used for environment-specific settings.

### Feature Specifications
- **SSP Module**: A 4-step guided flow for life balance assessment.
- **Goals Bank Module**: A 3-step workflow for goal validation, allowing filtering by sphere and status, with mechanisms to transfer ideas to actionable goals.
- **Decomposition Module**: Facilitates breaking down goals into actionable steps, with step persistence and ID-based tracking.
- **Planning Module**: Includes week navigation, color-coded priority tasks, drag & drop task management, a daily time budget indicator, and weekly statistics. It supports quick-add functionality for unscheduled steps and an undo feature for task deletion. Goals are presented in an accordion layout within the planner.
- **Authentication**: Integrates with the Django backend for user login, registration, and logout, featuring bidirectional redirects and auth guards.
- **Onboarding**: A guided onboarding process for new users, with fields mapping to backend data.
- **AI Curator**: Currently in demo mode without live API calls.

### System Design Choices
The application uses a modular structure with dedicated components, services, views, router, and stores. State management is handled by Pinia, ensuring data persistence and reactivity. Authentication is cookie-based with CSRF protection. The application prioritizes user guidance and visual feedback throughout the various modules.

## Recent Changes (27 Nov 2025)

### WheelOfLife Component
- Redesigned to match reference image with curved text labels using SVG `<textPath>`
- Labels positioned in outer ring (between grid and wheel boundary)
- Auto-flip text for bottom sectors for left-to-right readability
- Increased font size to 14px with letter-spacing: 2px

### Reflection Accordion (SSP Module)
- Replaced emoji icons with Lucide icons (Wallet, Palette, Users, Heart, Briefcase, HeartHandshake)
- Added color-coded left border matching wheel colors for each sphere
- Neutral score badge styling (gray background instead of green)
- ChevronDown icon replacing text arrow
- Hover effects with background and shadow transitions
- Icon wrapper with semi-transparent color-matched background
- Applied consistent design to both Summary and Step 3 (Рефлексия) accordions

## External Dependencies
- **Django REST API Backend**: Provides authentication, user data, onboarding, and goal management services.
- **Lucide Vue Next**: Used for minimalist line icons across the UI.
- **Vite**: Frontend build tool with proxy capabilities for seamless backend integration.