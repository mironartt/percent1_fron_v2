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