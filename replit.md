# OnePercent MVP

## Project Overview
Vue 3 + Vite application for personal life management and goal tracking through daily 1% improvements (OnePercent system). Currently implementing the SSP (Сбалансированная система показателей / Balanced Scorecard) module for systematic life balance assessment and goal setting.

## Tech Stack
- **Frontend**: Vue 3 (Composition API with script setup), Vite, Vue Router, Pinia (state management)
- **Language**: JavaScript/ES modules
- **Build System**: Vite
- **Integrations**: Replit AI Integrations (OpenAI)
- **Persistence**: localStorage via Pinia persistence

## Design System (November 25, 2025)
- **Style**: Professional, business-like design inspired by Intelinvest
- **Primary Color**: Blue (#2563eb) - professional and trustworthy
- **Typography**: Inter font, clean sans-serif, smaller font sizes (13-14px base)
- **Icons**: SVG line icons instead of emojis (cleaner, more professional)
- **Cards**: Subtle borders, minimal shadows, clean spacing
- **Sidebar**: 240px width, SVG icons, section dividers, MVP badge

## Project Structure
```
src/
  ├── components/
  │   ├── WheelOfLife.vue       # Interactive life balance wheel (drag-n-drop, 1-10 scale)
  │   ├── GoalsBank.vue          # Goal management with true/priority filters
  │   └── AICurator.vue          # AI assistant (demo mode, no API calls)
  ├── views/
  │   └── BalancedScorecard.vue  # SSP module main view (4-step flow)
  ├── router/                    # Vue Router config
  ├── stores/
  │   └── app.js                 # Pinia store with SSP state + localStorage persistence
  ├── assets/                    # Styles and static assets
  ├── App.vue                    # Root component
  └── main.js                    # Entry point
```

## SSP Module Architecture
4-step sequential flow:
1. **Теория** - Educational content about balanced scorecard methodology
2. **Колесо баланса** - Interactive Wheel of Life exercise with 6 life spheres
3. **Банк целей** - Goals bank creation and categorization (истинные/приоритетные)
4. **Фиксация результатов** - Results summary and completion

### Life Spheres (6)
- Благосостояние (Wealth)
- Хобби и отдых (Hobbies & Recreation)
- Дружба и окружение (Friends & Environment)
- Здоровье и спорт (Health & Sports)
- Работа и карьера (Work & Career)
- Любовь/семья/отношения (Love/Family/Relationships)

## Vue Architecture Rules (CRITICAL)
All components follow strict one-way data flow:
- ❌ NO direct props mutation (no v-model on props)
- ✅ All updates via emit events → store actions
- ✅ Components receive data via props, emit changes up
- ✅ Store (app.js) is single source of truth
- ✅ Persistence handled via Pinia plugin to localStorage

## Security
- AI Curator runs in DEMO MODE ONLY (no real OpenAI API calls from client)
- No API keys/secrets exposed to client bundle
- For production AI features: backend proxy required

## Setup Instructions
The project is configured to run on `0.0.0.0:5000` for Replit compatibility.

## Running the Project
```bash
npm run dev      # Start development server on port 5000
npm run build    # Build for production
npm run preview  # Preview production build
```

## Recent Changes (November 24, 2025)
- Fixed all props mutation issues across WheelOfLife, GoalsBank components
- Removed v-model on props, replaced with :value/@input pattern
- Ensured all state updates flow through Pinia store actions
- Secured AICurator (demo mode only, no client-side API calls)
- Removed VITE_ env vars that would expose secrets
- All data properly persists to localStorage via Pinia
- Dev server stable on port 5000 with strictPort configuration
