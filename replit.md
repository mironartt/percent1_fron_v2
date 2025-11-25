# OnePercent MVP

## Project Overview
Vue 3 + Vite application for personal life management and goal tracking through daily 1% improvements (OnePercent system). Features SSP (Сбалансированная система показателей / Balanced Scorecard) module and Банк целей (Goals Bank) for systematic life balance assessment and goal setting.

## Tech Stack
- **Frontend**: Vue 3 (Composition API with script setup), Vite, Vue Router, Pinia (state management)
- **Language**: JavaScript/ES modules
- **Build System**: Vite
- **Integrations**: Replit AI Integrations (OpenAI)
- **Persistence**: localStorage via Pinia persistence

## Project Structure
```
src/
  ├── components/
  │   ├── WheelOfLife.vue       # Interactive life balance wheel (drag-n-drop, 1-10 scale)
  │   ├── GoalsBank.vue          # Goal management with true/priority filters (SSP step 3)
  │   └── AICurator.vue          # AI assistant (demo mode, no API calls)
  ├── views/
  │   ├── BalancedScorecard.vue  # SSP module main view (4-step flow)
  │   └── GoalsBank.vue          # Standalone Goals Bank page (4-step process)
  ├── router/                    # Vue Router config
  ├── stores/
  │   └── app.js                 # Pinia store with SSP + Goals Bank state + localStorage persistence
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

## Goals Bank Module Architecture (/goals-bank)
3-step guided workflow with validation guards:
1. **Банк идей** - Raw ideas collection with table (sphere, goal, why important)
2. **Проверка** - Goals validation via "3 Why" rule (истинные/ложные classification)
3. **Ключевые цели** - Select 1-3 validated goals for immediate focus

### Step Progression Rules
- Step 2: Requires at least 1 idea in bank
- Step 3: Requires at least 1 validated goal
- Completion: Requires 1-3 selected goals from validated list

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

## Module State Patterns
Both SSP and Goals Bank modules follow a 3-state pattern:
1. **Empty State** - Welcome message with lesson overview for first-time visitors
2. **Lesson Mode** - Multi-step guided workflow
3. **Summary State** - Completion stats and navigation to next module

### SSP Summary View
- Average score across all spheres
- Strongest and weakest spheres
- Visual score bars for each sphere
- Navigation to Goals Bank

### Goals Bank Summary View
- Ideas count, validated/rejected counts
- Transferred goals count
- List of key goals in progress
- Navigation to Decomposition

## Recent Changes

### November 25, 2025 (Latest Session)

#### Goals Bank Page Comprehensive Improvements
**Summary Page:**
- Accordion for validated goals showing "3 Почему" answers (read-only)
- Sphere distribution visualization with progress bars (validated/rejected breakdown)
- Rejected goals section with rejection reasons displayed

**Step 1 (Банк идей):**
- Goals grouped by spheres with collapsible sections
- Weak spheres highlighted based on SSP scores (yellow indicator + badge)
- "Нужны идеи?" modal with example goals for each sphere

**Step 2 (Проверка):**
- Two-column layout with AI Coach sidebar (matching SSP design pattern)
- AI Coach has persistent chat interface: header, messages area, input field
- Chat logic: goalsChatMessages, goalsUserMessage, sendGoalsMessage() with simulated responses
- Validation progress bar under "Правило 3 Почему" block

**Step 3 (Ключевые цели):**
- Recommendations block highlighting goals from weak SSP spheres
- "Что дальше" preview explaining handoff to Decomposition module
- Selected goals show visual indicator for weak spheres

**New Computed Properties:**
- `weakSpheres` - identifies low-scoring SSP spheres
- `ideasBySphere` - groups raw ideas by life sphere
- `sphereDistribution` - calculates validated/rejected per sphere
- `weakSphereGoals` - filters validated goals from weak spheres
- `checkedCount`, `validatedPercent`, `rejectedPercent` - progress tracking

#### Earlier SSP Improvements
- SSP Summary: Increased wheel size (max-width 500px → 700px) for better readability
- SSP Summary: Added "Ваша рефлексия" section with read-only accordion showing saved reflection answers
- SSP Summary: Renamed "Ваше колесо баланса" → "Система сбалансированных показателей"
- SSP Summary: Replaced progress bars with actual WheelOfLife component visualization
- SSP Progress Bar: Fixed connecting lines between steps (changed from left: 50% to right: 50%)
- WheelOfLife: Added `readonly` prop to disable drag handles and hover effects for summary view
- SSP Theory: Removed video placeholder, kept only text content
- Collapsible accordion for SSP Step 3 (Рефлексия): spheres now expand/collapse on click, reducing page length
- Accordion features: expand/collapse toggle, "Заполнено" badge for completed spheres, smooth animations
- AICurator component now supports `embedded` prop for inline placement in sidebar
- Embedded AI curator integrated into GoalEdit.vue (/goals/:id) sidebar for contextual help
- Unlocked 4 menu items (Главная, ССП, Банк целей, Декомпозиция) without payment restriction
- Implemented empty state + lesson + summary pattern for /ssp module
- Implemented empty state + lesson + summary pattern for /goals-bank module
- Created GoalNew.vue page for adding new goals (/goals/new route)
- SSP summary shows: average score, strongest/weakest sphere, visual score bars
- Goals Bank summary shows: idea count, validated goals, transferred goals list
- Added "Restart lesson" functionality with store.resetGoalsBank() and store.resetSSPModule()
- Removed modal-based forms, now using dedicated pages for goal creation/editing

### November 25, 2025 (Earlier)
- Created standalone GoalsBank.vue page with 3-step guided workflow
- Added goalsBank state to Pinia store (rawIdeas, keyGoals, sphereAnalysis, currentStep)
- Implemented step progression validation (canProceedToStep function)
- Step 1: Simple table with sphere, goal, why important fields
- Step 2: Redesigned with expandable goal cards - click to expand and answer 3 questions
- Step 2: Added required notice about истинная/ложная classification
- Step 3: Select 1-3 validated goals for immediate focus with click selection
- Goals transfer: Selected goals from /goals-bank automatically transfer to /goals page on completion
- User redirected to /goals after completing Goals Bank workflow
- Renamed sidebar "Цели" to "Декомпозиция"
- Added AI coach chat to Goals/Decomposition page with context-specific prompts
- AICurator component now supports context prop for different page prompts
- Added /goals-bank route and sidebar navigation
- Fixed AI coach chat display on SSP step
- Created dedicated GoalEdit.vue page for goal editing (replaces modal)
- Added /goals/:id route for individual goal editing
- Edit page includes: goal details form, steps management with checkboxes, progress bar, save/delete actions
- Clicking "Редактировать" button now navigates to dedicated edit page instead of modal

### November 24, 2025
- Fixed all props mutation issues across WheelOfLife, GoalsBank components
- Removed v-model on props, replaced with :value/@input pattern
- Ensured all state updates flow through Pinia store actions
- Secured AICurator (demo mode only, no client-side API calls)
- Removed VITE_ env vars that would expose secrets
- All data properly persists to localStorage via Pinia
- Dev server stable on port 5000 with strictPort configuration
