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

### Goals Bank Module (Summary Page)
- Added Lucide icons to stat cards (Lightbulb, CheckCircle, XCircle, PlayCircle) with color-coded backgrounds
- Replaced sphere emojis with Lucide icons matching SSP module (Wallet, Palette, Users, Heart, Briefcase, HeartHandshake)
- Color-coded sphere badges using CSS custom properties for sphere-specific colors
- Action buttons now use Lucide icons (Plus, Check, X, RotateCcw) instead of text/emoji
- Updated "Цели в работе" section with sphere icons
- Added styling for empty "Почему важно" cells
- Helper functions: getSphereIcon(), getSphereColor(), getSphereNameOnly()

### Decomposition Module (Goals.vue)
- AI Coach header: 🤖 emoji replaced with Bot icon in purple circular wrapper
- Chat avatars: 🤖/👤 replaced with Bot/User icons with color-coded circular backgrounds
- "Пройти урок заново" button: 📚 emoji replaced with RotateCcw icon
- "Из Банка целей" badge: 🏦 emoji replaced with Landmark icon
- Edit/Delete buttons: ✏️/🗑️ emojis replaced with Edit2/Trash2 Lucide icons with hover effects
- Sphere display: Emoji icons replaced with Lucide icons (Wallet, Palette, Users, Heart, Briefcase, HeartHandshake) with colored borders
- Added helper functions: getSphereIconComponent(), getSphereColor()

### Goal Edit Page (GoalEdit.vue)
- AI Coach header: Bot icon in purple circular wrapper
- Chat avatars: Bot/User icons with color-coded circular backgrounds
- Navigation: ArrowLeft icon
- Actions: Save, Trash2, Plus icons
- Step management: X icon, GripVertical drag handle
- Custom dropdown for sphere selection with Lucide icons

### Onboarding Component (Onboarding.vue)
- Philosophy icon: Gamepad2 icon in large purple circular wrapper
- Key ideas section: Target, BarChart3, RefreshCcw icons in colored wrappers
- Highlight block: Lightbulb icon in amber wrapper
- Step 3 journey visual: MapPin and Target icons for points A and B
- Form labels: MapPin, Target, Gem icons in small wrappers
- Completion section: CheckCircle2 icon in large green wrapper
- Summary checkmarks: Check icons in small green wrappers
- Final button: Rocket icon with text
- CSS icon-wrapper system with size variants (xs, sm, md, lg) and color classes
- Arrow line using CSS gradients instead of text arrow

### Planning Module (Planning.vue) - Cleanup
- Removed all 4 GuidancePanel components with AI coach from lesson steps and planner mode
- Removed planningCoachResponses array and related tips arrays (theoryTips, practiceTips, telegramTips, plannerTips)
- Removed unused imports (GuidancePanel, ChevronLeft, ChevronRight from Lucide)
- Clean, focused planning interface without AI coach distractions

## External Dependencies
- **Django REST API Backend**: Provides authentication, user data, onboarding, and goal management services.
- **Lucide Vue Next**: Used for minimalist line icons across the UI.
- **Vite**: Frontend build tool with proxy capabilities for seamless backend integration.