# OnePercent MVP

## Overview
The OnePercent MVP is a Vue 3 + Vite application for personal life management and goal tracking, embodying the "1% improvement" philosophy. It provides tools for self-improvement and consistent growth through a Balanced Scorecard (SSP) for life balance assessment, a Goals Bank for structured goal setting, and an AI Mentor for user engagement. The project aims to be a market-leading platform for personal development, supported by a Django REST API backend.

## User Preferences
I prefer simple language and iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a guided, multi-step workflow, an interactive "Wheel of Life," a collapsible sidebar, and dark/light themes. It uses Lucide Vue Next for minimalist icons and prioritizes mobile responsiveness, consistent color priority, and visual feedback.

### Technical Implementations
The frontend is built with Vue 3 (Composition API, script setup), Vite (with proxy to Django backend), Vue Router (with authentication guards), and Pinia for state management (with localStorage persistence). Authentication is cookie-based with CSRF protection, and a custom Django-style configuration system (`settings.js` + `local_settings.js`) is used.

### Feature Specifications
-   **Core Modules**: SSP Module (life balance assessment), Goals Bank (goal management), Goal Details Page (mobile-first design, inline step addition, mini-journal, auto-save), Planning Module (mobile-first, single-page planner, Week Bar, card-based step grid).
-   **Authentication**: Integrates with Django backend for user login, registration, and Telegram authentication.
-   **Onboarding (AI-Powered)**: A 5-step process including SSP diagnosis, AI analysis, auto-generated goals, and a post-onboarding Goals Review System. SSP diagnosis is skipped if user completed a New Year landing test.
-   **AI Mentor**: Provides contextual help and analysis via a Dashboard Widget and Floating Button. Features conversational post-onboarding activation, personalized welcome messages, and first-week task guidance. Integrated with backend chat API via REST and WebSocket.
-   **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring a context-aware header, "Focus of the Day," habit tracker, and evening reflection.
-   **Journal/Diary Module**: Daily reflection with AI mentor integration (responses appear in mentor chat panel), streak tracking, and calendar history.
-   **XP/Gamification System**: Extrinsic motivation system with XP for habits, focus tasks, and goals, including a reward wishlist and animated XP notifications. XP balance is the single source of truth, synchronized from the backend, with optimistic UI updates for granting actions.
-   **Habit Tracker**: Dashboard-integrated widget and a dedicated Habits Page for management, scheduling, and gamification settings.
-   **Bidirectional Calendar ↔ Goals Block Sync**: Synchronizes step dates, completion, priority, and time estimates.
-   **Marketing Landing Page**: Conversion-focused landing page with an interactive 1% effect slider, app preview, feature cards, and calls to action.
-   **Landing Version 3 (/land/version3)**: Pain-driven interactive landing with 3 clickable situation cards, 90-day user journey visualization (Day 1/30/90), "How it works" section, comparison table vs courses/coaches, and CTA with Telegram bot + demo modal.
-   **Landing Version 4 (/land/version4)**: Full product journey landing with 8 blocks (Wheel of Balance, Goals, Decomposition, Planning, Habits, Rewards, AI Mentor, Final CTA). Features unified #F5F3FF background, transition phrases between blocks, accordions for blocks 1-2, tabs with sub-tabs for AI Mentor block, and comprehensive mobile responsiveness.
-   **Landing Version 5 (/land/old_v5)**: Combined version with version4's 5-step user journey plus main landing's trust-building elements: hero with animated compound growth chart, header with login/register, "Проверено временем" legends section (Franklin, Clear, Buffett, da Vinci), dynamic pricing section with term selector, and enhanced footer with legal links and company info.
-   **Landing Version 6 (/land/version6)**: React-to-Vue adaptation with modern bento-style design. Features: interactive 1% compound growth slider, math section comparing linear vs exponential thinking, 5-step user journey with alternating layouts and mock UI previews (Wheel of Life, AI chat, planning timeline, focus card, XP system), AI Mentor showcase with animated Telegram phone mockup, testimonials from historical figures (Franklin, Clear, Buffett, da Vinci), pricing section with 4 billing periods (1/3/6/12 months) and automatic discount calculation, and responsive mobile-first design with blur/gradient effects.
-   **Landing Version 7 (now main `/`)**: Enhanced React-to-Vue conversion with Tailwind CSS (via CDN). Features 9 sections: Header with scroll-aware styling and mobile menu, Hero with 1% compound growth calculator, ProblemSolution comparing traditional vs systematic approaches, Math section with linear vs exponential visualization, 6-step Features journey (Wheel of Life, AI Goals, Decomposition, Planning, Habits, XP Rewards), AI Mentor showcase with Telegram bot preview, Final CTA, historical figure Testimonials, and dynamic Pricing with backend API integration (subscriptionStore). Uses lucide-vue-next for icons and Inter font from Google Fonts. Previous version moved to `/land/old_v5`.
-   **Year Review 2025 (Итоги года)**: Single-page flow with test → results, including AI-generated 2026 plan with loading animation and confetti.
-   **Achievements Page**: Improved UX with grouped XP history, filterable transactions, and AI Reward Mentor feature for personalized reward suggestions.
-   **Settings Page**: Redesigned with profile management, Telegram bot integration, and an "Мой старт" section.
-   **Notification Settings Page**: Dedicated page for Telegram notification preferences including global toggle, daily reminders, event notifications, weekly report settings, and timezone selection.
-   **Subscription Page**: Dynamic pricing page integrated with backend API, displaying tariffs, current status, promocode activation, and payment history.
-   **Billing System**: Complete billing integration with Robokassa payments, supporting tariff limits for free vs. paid tiers, and controlling feature access based on effective tariff.
-   **Policy Acceptance Modal**: Mandatory modal for users who haven't accepted Terms & Privacy Policy, blocking app usage until confirmed.
-   **Referral System**: Complete referral program with earnings and withdrawal management, including referral link parsing, registration integration, earnings calculator, and withdrawal system.
-   **UTM Tracking & HTTP Referer**: Marketing attribution system that captures UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content, ga_client_id) and http_referer at first visit, stores in localStorage, and sends with registration request. Utility: `src/utils/tracking.js`.
-   **SEO Catalog (Django Templates)**: Complete SEO-optimized Django templates for server-side rendered catalog pages, located in `django_templates/catalog/`. Contains 21 templates: 4 main pages (home, goals, habits, bundles), complete goal hierarchy (category, subcategory, detail, step pages), habit hierarchy (category, subcategory, detail), tag systems (goals_tags, goals_tag, habits_tags, habits_tag), bundle_detail, and 6 filter pages (difficulty, duration, frequency). Design system: Purple #6366f1 (goals), Orange #f59e0b (habits), Green #10b981 (bundles). Uses emoji icons, proper breadcrumbs, SEO meta tags, Open Graph blocks, and Russian language throughout. CSS ~3000 lines covering all elements with responsive breakpoints.

### Reusable Components
-   **AddGoalModal.vue**: Universal modal for adding new goals, used across GoalsBank, Dashboard, and Planning. Props: `modelValue` (Boolean for v-model). Events: `update:modelValue`, `created` (with goal data), `open-mentor`. Features: goal templates by life sphere, AI mentor helper button, optional reflection section with 2 accordion questions, sphere selection grid, optimistic UI with backend sync.
-   **QuickAddTask.vue**: Quick task creation modal with required goal selection. Features: combobox goal selector (input+dropdown with filtering), day selector (today/tomorrow/custom date), pill-style priority buttons (Критично, Важно, В поле внимания, По возможности, Без приоритета), pill-style time estimation buttons (30 минут - 4 часа, Без оценки). Uses createStep() and scheduleStep() API for backend sync.
-   **FloatingActionButton.vue**: FAB positioned left of AI mentor panel with dynamic positioning based on mentor panel state.
-   **MentorGoalSuggestionsModal.vue**: AI-powered goal suggestions modal.

### System Design Choices
The application uses a modular structure. It emphasizes user guidance, visual feedback, and a clean interface, with the AI Mentor as a core value proposition. Backend synchronization includes immediate UI feedback, goal routing with `backendId`, race condition prevention, optimized step synchronization, and API pagination.

### Telegram Bot Integration
A standalone Telegram bot mirrors core OnePercent functionality for improved user engagement. It uses Telegraf (Node.js), node-cron for scheduling, and OpenAI for AI (with fallback). Features include authentication, main menu, task management, habit tracking, journal, AI mentor chat, progress summary, settings, and scheduled reminders.

## Documentation
-   **Marketing Brief**: `docs/marketing-brief.md` — маркетинговое описание продукта: ЦА, сегменты, позиционирование, конкурентное сравнение, ценностное предложение.
-   **Product Documentation**: `docs/product-documentation.md` — техническая документация продукта.
-   **Landing Guide**: `attached_assets/onepercent-landing-complete-guide_1766675161780.md` — руководство по лендингу.

## External Dependencies
-   **Django REST API Backend**: Provides user authentication, SSP data, goals bank, planning, onboarding, journal, habits, XP history, AI services, billing, and referral management.
-   **Lucide Vue Next**: Icons library.
-   **Vite**: Frontend build tool.
-   **Telegram OAuth**: For user authentication and linking.
-   **Telegraf**: Node.js framework for Telegram Bot API.
-   **node-cron**: For scheduling tasks in the Telegram bot.
-   **OpenAI**: For AI mentor functionality in the Telegram bot.
-   **Robokassa**: Payment gateway for billing system.