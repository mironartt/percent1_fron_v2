# OnePercent MVP

## Overview
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