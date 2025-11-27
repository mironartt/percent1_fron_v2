# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application designed for personal life management and goal tracking, inspired by the "1% improvement" philosophy. It incorporates a Balanced Scorecard (SSP) module for life balance assessment and a Goals Bank for structured goal setting. Integrates with Django REST API backend for authentication.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## Project Structure
```
src/
  ├── config/
  │   ├── settings.js            # Application settings (loads local_settings.js)
  │   ├── local_settings.js      # Local development settings (NOT in git)
  │   └── local_settings.example.js # Template for local settings
  ├── components/
  │   ├── Sidebar.vue            # Navigation sidebar with Lucide icons
  │   ├── WheelOfLife.vue        # Interactive balance assessment
  │   ├── GuidancePanel.vue      # Contextual help and AI coach
  │   └── ...
  ├── services/
  │   └── api.js                 # API client for Django backend
  ├── views/
  │   ├── Landing.vue            # Public landing page (/)
  │   ├── Login.vue              # Auth page (/auth/login)
  │   ├── Register.vue           # Registration (/auth/register)
  │   ├── Recovery.vue           # Password recovery (/auth/recovery)
  │   └── ...                    # Protected app views (/app/*)
  ├── router/index.js            # Vue Router with auth guards
  └── stores/app.js              # Pinia store with user management
```

## Route Structure
- `/` - Public landing page
- `/auth/login`, `/auth/register`, `/auth/recovery`, `/auth/logout` - Auth routes
- `/app`, `/app/ssp`, `/app/goals-bank`, `/app/goals/*` - Protected routes

## Django Backend Integration

### API Endpoints (via Vite proxy → localhost:8017)
- `POST /api/rest/front/csrf/` - Get CSRF token
- `POST /api/rest/front/login/` - User login
- `POST /api/rest/front/registration/` - User registration
- `POST /api/rest/front/logout/` - User logout
- `POST /api/rest/front/get-user-data/` - Get current user data

### Configuration (Django-style local_settings)
```javascript
// src/config/local_settings.js (NOT in git)
export const DEV_MODE = true
export const SKIP_AUTH_CHECK = true  // Bypass auth for UI development
export const DEBUG_MODE = true
```

## System Architecture

### UI/UX Decisions
The application utilizes a guided, multi-step workflow pattern for key modules (SSP, Goals Bank, Decomposition, Planning), often featuring a 3-state design: an empty state for first-time users, a lesson mode for education and guided input, and a summary state for progress overview. Visual components like the interactive "Wheel of Life" and progress bars are central to user engagement.

### Technical Stack
- Vue 3 (Composition API, script setup)
- Vite with proxy to Django backend
- Vue Router with auth guards
- Pinia with localStorage persistence
- **Lucide Vue Next** - Minimalist line icons for UI

### Feature Modules
- **SSP Module**: 4-step guided flow for life balance assessment
- **Goals Bank Module**: 3-step workflow for goal validation
- **Decomposition Module**: Breaking goals into actionable steps
- **AI Curator**: Demo mode only (no real API calls)

## Setup for Development
1. Copy `src/config/local_settings.example.js` to `src/config/local_settings.js`
2. Set `SKIP_AUTH_CHECK = true` to bypass auth during UI development
3. Start Django backend on localhost:8017
4. Run `npm run dev`

## Recent Changes (November 26, 2025)

### Icon Library Migration
- Replaced emoji icons with Lucide Vue minimalist line icons
- Sidebar.vue now uses: BarChart3, Compass, Target, Landmark, Trophy, Calendar, Zap, Gem, Users, Award, User, Settings, LogOut, Lock
- Icons styled with gray (#9ca3af) color, hover and active state transitions

### Django Backend Integration
- Added Vite proxy for Django backend (localhost:8017)
- Created Django-style configuration system (settings.js + local_settings.js)
- Created API client with CSRF, rate limiting, cookie-based auth
- Restructured routes: /app/* (protected), /auth/* (public)
- Added auth guards with SKIP_AUTH_CHECK flag
- Created Landing.vue and Recovery.vue pages
- Updated Login.vue and Register.vue with API integration
- **Bidirectional auth redirects**: authenticated users on /auth/* redirect to /app/
- **Comprehensive DEBUG_MODE logging**: Router navigation, auth checks logged when DEBUG_MODE=true

### Onboarding Backend Integration
- Added `FORCE_SHOW_ONBOARDING` and `FORCE_SHOW_MINITASK` flags in local_settings.js for testing
- Added `finish_onboarding` and `finish_minitask` fields to user in store
- Added API methods: `getOnboardingData()`, `updateOnboardingData()`

### Backend API Endpoints (Onboarding)
- `POST /api/rest/front/app/onboard/get/` - Get onboarding data
- `POST /api/rest/front/app/onboard/update/` - Update onboarding progress

### Field Mapping (Frontend → Backend)
| Frontend | Backend |
|----------|---------|
| whyHere | reason_joined |
| whatToChange | desired_changes |
| growthVsComfort | growth_comfort_zones |
| pointA | current_state |
| pointB | goal_state |
| whyImportant | why_important |

### Development Flags (local_settings.js)
```javascript
export const FORCE_SHOW_ONBOARDING = false  // Show onboarding even if completed
export const FORCE_SHOW_MINITASK = false    // Show mini task even if completed
```

### Goals Bank Improvements (November 26, 2025)

#### Filters and Indicators
- Added sphere filter dropdown in "Банк идей и целей" block
- Added status filter (Доступные, В работе, Завершённые)
- Added weak sphere indicator (⚠️) next to goals in weak spheres
- Filter state managed via filterSphere and filterStatus refs

#### Goal Workflow Fixes
- Fixed reactivity issue: `allGoals` now uses spread operator `[...store.goals]` to ensure proper re-render on array mutations
- Fixed "Завершить и сохранить" button: added `sourceId` to link created goals back to original ideas
- Goals created via lesson completion now properly show as "В работе" in the bank
- Removed from work goals correctly return to bank with "Взять в работу" button

#### Data Model
- Goals in store.goals now have `sourceId` field linking to original idea in goalsBank.rawIdeas
- `isGoalTransferred(ideaId)` checks if any goal has matching sourceId
- Remove from work deletes goal from store.goals; original idea remains in rawIdeas

#### Lesson Reset Behavior
- `startLesson()` clears rawIdeas, resets currentStep to 1, clears completedAt, and saves to localStorage
- Each new lesson starts with a clean slate (no previously saved goals)

### UI Customization (November 26, 2025)

#### Collapsible Sidebar
- Sidebar can collapse from 280px to 72px (icons only)
- ChevronLeft button rotates 180° when collapsed
- Collapse state persisted in localStorage (`sidebar-collapsed`)
- App.vue uses `has-sidebar` class for clean CSS specificity

#### Dark/Light Theme Toggle
- Theme toggle in sidebar footer with Sun/Moon icons (Lucide)
- Dark theme via `:root.dark` CSS variables in main.css
- System preference detected on first load (`prefers-color-scheme: dark`)
- Theme choice saved to localStorage (`theme`)

#### CSS Architecture
- `#app.has-sidebar` applies sidebar margins only when sidebar exists
- `#app.has-sidebar.sidebar-collapsed` reduces margin to 72px
- Auth pages (login/register) have no sidebar, no margins
- Mobile breakpoint (≤768px) removes all sidebar margins

### Decomposition Module Fixes (November 26, 2025)

#### Step Persistence During Practice
- `practiceSteps` changed from string array to object array: `[{id, title, completed}]`
- Steps now persist when switching between goals during practice phase
- `saveCurrentPracticeSteps()` saves current steps before goal switch

#### ID-based Step Tracking
| Prefix | Purpose | Created when |
|--------|---------|--------------|
| `new-*` | New empty step | Starting practice or adding step |
| `temp-*` | Saved temporary | saveCurrentPracticeSteps() without existing ID |
| `legacy-*` | Old data migration | Loading steps without ID |

- Temporary IDs replaced with permanent (timestamp + random) only in `completeLesson()`
- Null checks for `step.id` to support legacy data

#### Progress Bar Visibility Fix
- Renamed `.progress-bar` → `.lesson-progress-bar` for lesson step indicator
- Fixed CSS conflict: goal progress bar (height: 8px, overflow: hidden) was overriding lesson steps

#### Content Centering
- Lesson preview section (`text-align: center`)
- Step content h2, intro-text, rules h3 — all centered
- Preview steps use `inline-flex` for block centering with left-aligned text inside

### Planning Module Enhancements (November 27, 2025)

#### Week Navigation
- Arrow buttons (← →) to switch between weeks
- Week range display (e.g., "24 ноября — 30 ноября")
- "Сегодня" button to return to current week
- Uses `weekOffset` ref to shift date calculations
- Lucide icons: ChevronLeft, ChevronRight

#### Color Priority System
| Priority | Color | CSS Class | Use Case |
|----------|-------|-----------|----------|
| critical | 🔴 Red (#dc2626) | priority-critical | Важно - критически важные задачи |
| desirable | 🟠 Orange (#ea580c) | priority-desirable | Желательно - желательные задачи |
| attention | 🔵 Blue (#2563eb) | priority-attention | Внимание - требуют внимания |
| optional | ⚪ Gray (#9ca3af) | priority-optional | Опционально - можно отложить |

#### Task Card Styling
- `border-left: 3px solid` with priority color
- Light background tint matching priority color
- Priority selector dropdown with emoji indicators
- Completed tasks: opacity 0.6, strikethrough title

#### Development Flags (local_settings.js)
```javascript
export const DEMO_PLANNING_MODE = true  // Show planner with demo tasks
```

#### Demo Mode Features
- Auto-populates 3 demo goals with steps
- Creates 7 scheduled tasks across the week
- Shows all priority types in action
- Skips lesson requirement for UI testing

#### Telegram Integration (Step 3)
- Bot setup UI with connection status indicator
- Notification preferences: daily plan, Friday review, Sunday planning
- Store: `telegramSettings` with connected, chatId, username, notifications
- Methods: `connectTelegram()`, `disconnectTelegram()`, `updateTelegramNotifications()`
- Settings persisted in localStorage

#### Drag & Drop Task Management
- HTML5 native drag & drop API
- Visual feedback: `.dragging` opacity, `.drag-over` highlight
- `draggedTask` ref for planner mode state management
- Tasks can be moved between calendar days

#### Drag & Drop on Lesson Step 2 (Practice)
- Steps can be dragged to calendar days during lesson practice
- `draggedStep` ref tracks goalId, stepId, stepTitle
- Calendar days show "📥 Сюда" hint when dragging
- Uses same `scheduleStep()` function as dropdown selects
- CSS classes: `.drag-handle-lesson`, `.drag-over-day`

#### Weekly Statistics Section
- Stats grid: completed tasks, total tasks, completion rate, streak days
- Progress bar visualization
- Computed from `scheduledTasks` completion status
- `currentStreak` calculates consecutive days with all tasks completed

#### Responsive Design Enhancements
| Breakpoint | Changes |
|------------|---------|
| ≤1024px | Planner layout single column, stats grid 2-col, calendar 3-col |
| ≤768px | Stats grid 2-col, calendar 1-col, step labels hidden, task cards stacked |

#### Settings Page Updates
- Telegram settings link navigates to Planning module
- Uses vue-router for navigation
