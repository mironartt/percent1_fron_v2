# OnePercent MVP

## Overview
<<<<<<< HEAD
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

### Authentication
Cookie-based session auth with CSRF protection. Auth guards in router check user status with caching (30s). SKIP_AUTH_CHECK flag bypasses auth for UI development.

### Technical Stack
- Vue 3 (Composition API, script setup)
- Vite with proxy to Django backend
- Vue Router with auth guards
- Pinia with localStorage persistence

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
- Added Vite proxy for Django backend (localhost:8017)
- Created Django-style configuration system (settings.js + local_settings.js)
- Created API client with CSRF, rate limiting, cookie-based auth
- Restructured routes: /app/* (protected), /auth/* (public)
- Added auth guards with SKIP_AUTH_CHECK flag
- Created Landing.vue and Recovery.vue pages
- Updated Login.vue and Register.vue with API integration
- Updated Sidebar navigation for new routes
- Added user management to Pinia store (setUser, clearUser, isAuthenticated)
- **Bidirectional auth redirects**: authenticated users on /auth/* (except logout) redirect to /app/, unauthenticated on /app/* redirect to /auth/login
- **Comprehensive DEBUG_MODE logging**: Router navigation, auth checks, store user operations logged when DEBUG_MODE=true
- **Fixed SKIP_AUTH_CHECK**: Returns mock authenticated user to allow protected route access during UI development

### Onboarding Backend Integration
- Added `FORCE_SHOW_ONBOARDING` and `FORCE_SHOW_MINITASK` flags in local_settings.js for testing
- Added `finish_onboarding` and `finish_minitask` fields to user in store
- Added API methods: `getOnboardingData()`, `updateOnboardingData()`
- Store methods: `loadOnboardingFromBackend()`, `saveOnboardingToBackend()`, `updateOnboardingStep()`, `completeOnboardingWithBackend()`
- Computed properties: `shouldShowOnboarding`, `shouldShowMiniTask`
- Refactored Onboarding.vue:
  - Loads onboarding data from backend on mount
  - Pre-fills forms when resuming incomplete onboarding
  - Saves data to backend after each step
  - Dynamic button text ("Продолжить создание своей игры" when resuming)
  - Loading and saving states with visual feedback

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
=======
This project is a Vue 3 + Vite application designed for personal life management and goal tracking, centered around the "OnePercent" system for daily incremental improvements. Its core purpose is to help users assess life balance, set systematic goals, and plan for their achievement through modules like the Balanced Scorecard (SSP) and Goals Bank. The application aims to provide a structured approach to personal development, offering guided workflows for goal identification, decomposition, and weekly planning.

## User Preferences
I prefer that the agent adheres strictly to the Vue Architecture Rules (CRITICAL) outlined in the `replit.md` file, especially regarding one-way data flow and the avoidance of direct props mutation. All state updates must be handled via emit events leading to store actions. The Pinia store (`app.js`) is the single source of truth. I want to maintain the current project structure and component architecture, particularly the 3-state pattern (Empty State, Lesson Mode, Summary State) for modules. For AI features, the agent should only operate in DEMO MODE and not make real OpenAI API calls from the client, nor should it expose any API keys or secrets. The agent should prioritize the existing UI/UX decisions, including color schemes, templates, and design approaches.

## System Architecture

### UI/UX Decisions
The application utilizes a guided, multi-step workflow pattern for key modules (SSP, Goals Bank, Decomposition, Planning), often featuring a 3-state design: an empty state for first-time users, a lesson mode for education and guided input, and a summary state for progress overview. Visual components like the interactive "Wheel of Life" and progress bars are central to user engagement. Contextual help is provided via a reusable `GuidancePanel` component, which includes tips, checklists, and an integrated AI coach (in demo mode).

### Technical Implementations
-   **Frontend Framework**: Vue 3 with Composition API (`<script setup>`).
-   **State Management**: Pinia, with a single central store (`app.js`) serving as the source of truth.
-   **Routing**: Vue Router manages navigation and module-specific views.
-   **Data Flow**: Strict one-way data flow is enforced; components receive data via props and emit events for all state updates, which are then processed by Pinia store actions. Direct props mutation is prohibited.
-   **Persistence**: Pinia state is persisted to `localStorage` via a Pinia plugin.
-   **Modularity**: Core modules (SSP, Goals Bank, Decomposition, Planning) are designed with a consistent 3-state pattern (Empty State, Lesson Mode, Summary State) to guide users through structured workflows.
-   **Goal Management**: Features include goal creation, categorization, validation (e.g., "3 Why" rule), decomposition into actionable steps with time estimates and priorities, and weekly scheduling.
-   **Interactive Components**: `WheelOfLife.vue` provides an interactive balance assessment tool. `GuidancePanel.vue` offers reusable contextual help and an AI coach interface.

### Feature Specifications
-   **Balanced Scorecard (SSP) Module**: A 4-step sequential flow (Theory, Wheel of Life, Goals Bank, Results Summary) for life balance assessment across 6 defined spheres.
-   **Goals Bank Module**: A 3-step guided workflow (Ideas, Validation via "3 Why" rule, Key Goals selection) for collecting, validating, and prioritizing personal goals.
-   **Decomposition Module**: Guides users through breaking down selected goals into smaller, manageable steps, adhering to rules for specificity and measurability.
-   **Planning Module**: Facilitates weekly planning by scheduling decomposed goal steps into a 7-day calendar grid, supporting task completion tracking.
-   **AI Curator/Coach**: An integrated AI assistant (`AICurator.vue`) provides contextual guidance and support within various modules, operating in demo mode.

### System Design Choices
The project is built with a focus on structured guidance and user progression, ensuring that users move through logical steps in their personal development journey. The use of Pinia for state management and strict data flow rules ensures maintainability and predictability. The architecture is designed for local development and testing, with considerations for future backend integration for production AI features.

## External Dependencies
-   **Build Tool**: Vite
-   **State Management**: Pinia (with `localStorage` persistence)
-   **Routing**: Vue Router
-   **AI Integration**: Replit AI Integrations (OpenAI - currently in DEMO MODE ONLY, no actual API calls from client-side)
>>>>>>> origin/main
