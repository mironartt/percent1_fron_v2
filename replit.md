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
