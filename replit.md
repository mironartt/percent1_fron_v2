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

## Recent Changes (28 Nov 2025)

### Planning Module - 5-Day Workweek View
- **Redesigned calendar grid**: Changed from 7-column to 5-column layout (Mon-Fri)
- **Collapsible weekend section**: Sat-Sun now in separate section below workdays
- **Weekend toggle button**: Shows/hides weekend with task count badge
- New computed properties: `workDays` (Mon-Fri), `weekendDays` (Sat-Sun)
- `showWeekend` ref controls weekend visibility
- `weekendTasksCount` shows number of weekend tasks in toggle button
- **Wider task cards**: 5 columns = ~200px each vs ~140px with 7 columns
- Preserved drag & drop between all days (including weekends when visible)
- CSS: `.calendar-grid-5`, `.calendar-grid-2`, `.weekend-section`, `.weekend-toggle`
- Weekend days styled with subtle purple tint (weekend-day class)
- Design rationale: Most users work Mon-Fri, weekends are optional planning

### Text Overflow Utilities (Global)
- Added CSS text truncation utilities to `main.css`:
  - `.truncate-1` — single line with ellipsis (text-overflow: ellipsis)
  - `.line-clamp-1`, `.line-clamp-2`, `.line-clamp-3` — multi-line truncation with WebKit line-clamp
  - `.break-words` — word-break: break-word for long unbroken strings
  - `.break-all` — word-break: break-all for aggressive breaking
- Applied to all components with long text content:
  - **GoalEdit.vue**: Goal title limited to 2 lines with tooltip on hover
  - **Planning.vue**: Goal titles in accordion (1 line), step titles (1 line), task cards (1 line with tooltip)
  - **GoalsBank.vue**: Goal text in table (2 lines), goal names in rejected/work lists (1 line)
  - **Goals.vue**: Goal titles (2 lines), step titles (1 line with tooltip)
- All truncated elements now show full text on hover via `title` attribute

### Goals Bank Module - Edit Modal
- Added inline editing modal for validated goals on summary page
- Modal allows editing: goal text, "why important" field, sphere selection
- Delete functionality with confirmation dialog
- Link to full edit page (GoalEdit.vue) for goals transferred to work
- Edit button (Edit2 icon) added to table row actions
- Smooth fade-in animation for modal
- Sphere selector grid with color-coded buttons matching wheel colors
- Uses store.updateRawIdea() for reactive state updates
- CSS variables for consistent theming
- Auto-open modal via query parameter `?edit=<goalId>` for deep linking

### GoalEdit.vue - Separation of Concerns
- **Removed editing of goal metadata** (title, description, sphere) - now read-only display
- Added "Редактировать в Банке целей" link for goals from Goals Bank
- Link passes `?edit=sourceId` query param for direct modal opening
- **Kept deadline field editable** for planning purposes
- Steps management fully preserved (add/remove/complete/drag & drop)
- Removed unused dropdown code (toggleSphereDropdown, selectSphere, sphereDropdownRef)
- New CSS for read-only goal info card with sphere display
- **Design rationale**: Goals Bank = WHAT (goal definition), Decomposition = HOW (steps/execution)

## Changes (27 Nov 2025)

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

### Decomposition Module (Goals.vue) - Complete Cleanup
- **Removed AI Coach completely** from both lesson mode and goals list mode
- Removed all chat-related HTML, CSS, and JavaScript (~200+ lines of code)
- Removed unused Bot, User imports
- "Пройти урок заново" button: 📚 emoji replaced with RotateCcw icon
- "Из Банка целей" badge: 🏦 emoji replaced with Landmark icon
- Edit/Delete buttons: ✏️/🗑️ emojis replaced with Edit2/Trash2 Lucide icons with hover effects
- Sphere display: Emoji icons replaced with Lucide icons (Wallet, Palette, Users, Heart, Briefcase, HeartHandshake) with colored borders
- Modal close button: ✕ text replaced with X Lucide icon
- **Single-column layout** - removed step-2-layout and goals-layout sidebar grid
- Clean, focused interface without chat distractions

### Goal Edit Page (GoalEdit.vue) - Redesign
- **Removed AI coach sidebar** - cleaner, distraction-free editing experience
- **Moved action buttons to header** - "Сохранить", "Отмена", "Удалить" all in one row
- **Single-column layout** - form takes full width (max 900px), no sidebar
- Navigation: ArrowLeft icon in header
- Actions: Save, Trash2, Plus Lucide icons with hover effects
- Step completion checkboxes with Lucide icons (Square/CheckSquare)
- Completed steps show with green left border, strikethrough text, muted colors
- Added comment field for each step (textarea with placeholder)
- Step management: X icon, GripVertical drag handle
- Custom dropdown for sphere selection with Lucide icons
- **Date info relocated** - "Создана: дата" now at bottom of steps card

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