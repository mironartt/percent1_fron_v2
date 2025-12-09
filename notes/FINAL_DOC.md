# OnePercent MVP — Полная техническая документация

**Версия:** 1.0  
**Дата:** Декабрь 2024  
**Назначение:** Передача проекта другому AI агенту для продолжения разработки

---

## Оглавление

1. [Обзор проекта](#1-обзор-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [Структура проекта](#3-структура-проекта)
4. [Конфигурация и окружение](#4-конфигурация-и-окружение)
5. [Архитектура приложения](#5-архитектура-приложения)
6. [Модули приложения](#6-модули-приложения)
7. [State Management (Pinia Stores)](#7-state-management-pinia-stores)
8. [API интеграция с Django](#8-api-интеграция-с-django)
9. [Маршрутизация](#9-маршрутизация)
10. [AI Ментор](#10-ai-ментор)
11. [Система геймификации](#11-система-геймификации)
12. [Критические паттерны и решения](#12-критические-паттерны-и-решения)
13. [Известные проблемы и решения](#13-известные-проблемы-и-решения)
14. [Важные файлы](#14-важные-файлы)
15. [Команды разработки](#15-команды-разработки)
16. [Контрольный список для нового разработчика](#16-контрольный-список-для-нового-разработчика)

---

## 1. Обзор проекта

### Философия
OnePercent MVP — веб-приложение для системного управления жизнью через философию **"1% улучшения каждый день"**. Вдохновлено книгой "Atomic Habits" Джеймса Клира.

### Целевая аудитория
- Люди, стремящиеся к личностному росту
- Пользователи, желающие структурировать свои цели
- Те, кто хочет отслеживать прогресс и формировать привычки

### Ключевые ценности продукта
1. **Простота** — минималистичный интерфейс без перегрузки
2. **Геймификация** — XP, достижения, награды за действия
3. **AI-помощь** — персональный ментор на каждой странице
4. **Целостность** — все модули связаны единой экосистемой

---

## 2. Технологический стек

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| Vue 3 | 3.x | UI Framework (Composition API, `<script setup>`) |
| Vite | 5.x | Build tool, Dev server, Hot reload |
| Pinia | 2.x | State management |
| Vue Router | 4.x | Маршрутизация с auth guards |
| Lucide Vue Next | - | Минималистичные иконки (line style) |

### Backend (внешний)
| Технология | Назначение |
|------------|------------|
| Django REST Framework | API сервер |
| PostgreSQL | База данных |
| Cookie-based auth | Авторизация через sessionid + csrftoken |
| Telegram OAuth | Альтернативный метод авторизации |

### Инфраструктура Replit
| Компонент | Порт | Назначение |
|-----------|------|------------|
| Vite Dev Server | 5000 | Frontend (обязательно этот порт!) |
| AI Proxy Server | 3001 | Прокси для OpenAI API |
| Django Backend | external | Через Vite proxy |

---

## 3. Структура проекта

```
onepercentmvp/
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   └── main.css              # Глобальные стили + utility классы
│   ├── components/
│   │   ├── OnboardingAI.vue      # 5-шаговый AI онбординг
│   │   ├── MentorPanel.vue       # AI Ментор (920 строк)
│   │   ├── HabitTracker.vue      # Виджет привычек для Dashboard
│   │   ├── HabitManagerModal.vue # Модальное окно управления привычками
│   │   ├── Sidebar.vue           # Боковое меню навигации
│   │   ├── WheelOfLife.vue       # Интерактивное "Колесо жизни"
│   │   ├── PlanReview.vue        # Обзор AI-целей после онбординга
│   │   ├── JournalEntry.vue      # Форма записи в дневник
│   │   ├── XpBadge.vue           # Отображение XP пользователя
│   │   ├── DailyProgressBar.vue  # Прогресс-бар дня
│   │   ├── RewardWishlist.vue    # Вишлист наград
│   │   └── ToastNotification.vue # Уведомления
│   ├── config/
│   │   ├── settings.js           # Главные настройки (экспорт флагов)
│   │   ├── local_settings.js     # Локальные настройки (git-ignored)
│   │   └── local_settings.example.js
│   ├── router/
│   │   └── index.js              # Vue Router + auth guards
│   ├── services/
│   │   ├── api.js                # Централизованный API клиент (870 строк)
│   │   ├── habitsApi.js          # API для модуля привычек
│   │   └── aiGoalService.js      # Сервис AI-генерации целей
│   ├── stores/
│   │   ├── app.js                # Главный Pinia store (3187 строк!)
│   │   ├── habits.js             # Store для привычек
│   │   ├── xp.js                 # Store для XP и достижений
│   │   └── toast.js              # Store для уведомлений
│   ├── views/
│   │   ├── Dashboard.vue         # Главная страница (1106 строк)
│   │   ├── BalancedScorecard.vue # ССП модуль
│   │   ├── GoalsBank.vue         # Банк целей
│   │   ├── GoalEdit.vue          # Редактирование/декомпозиция цели
│   │   ├── Planning.vue          # Планирование недели
│   │   ├── Habits.vue            # Полная страница привычек
│   │   ├── JournalHistory.vue    # История дневника
│   │   ├── Profile.vue           # Достижения (/app/achievements)
│   │   ├── LearningCenter.vue    # Обучающие материалы
│   │   ├── Settings.vue          # Настройки пользователя
│   │   ├── Landing.vue           # Маркетинговый лендинг
│   │   ├── Login.vue             # Страница входа
│   │   └── Register.vue          # Страница регистрации
│   ├── App.vue                   # Корневой компонент
│   └── main.js                   # Точка входа
├── server/
│   └── aiProxy.js                # AI Proxy сервер для OpenAI
├── docs/
│   ├── STYLE_GUIDE.md            # Дизайн-система (25 секций)
│   └── ai-mentor-master-spec.md  # Спецификация AI Ментора
├── notes/
│   ├── merge*.md                 # История изменений (merge 1-24)
│   ├── HABITS.md                 # Документация трекера привычек
│   ├── ACHIEVEMENTS.md           # Система XP и достижений
│   └── FINAL_DOC.md              # ЭТО ФАЙЛ
├── attached_assets/              # Прикреплённые файлы (API docs, images)
├── vite.config.js                # Конфигурация Vite с proxy
├── package.json                  # NPM зависимости
├── replit.md                     # История изменений Replit
└── README.md                     # Обзор проекта
```

---

## 4. Конфигурация и окружение

### Django-style конфигурация

Проект использует систему настроек, вдохновлённую Django:

**src/config/settings.js** — экспортирует константы:
```javascript
export const DEV_MODE = localSettings.DEV_MODE ?? import.meta.env.DEV ?? false
export const SKIP_AUTH_CHECK = localSettings.SKIP_AUTH_CHECK ?? false
export const API_BASE_URL = localSettings.API_BASE_URL ?? ''
export const MIN_REQUEST_INTERVAL = localSettings.MIN_REQUEST_INTERVAL ?? 500
export const DEBUG_MODE = localSettings.DEBUG_MODE ?? false
export const FORCE_SHOW_ONBOARDING = localSettings.FORCE_SHOW_ONBOARDING ?? false
export const FORCE_SHOW_MINITASK = localSettings.FORCE_SHOW_MINITASK ?? false
export const DEMO_PLANNING_MODE = localSettings.DEMO_PLANNING_MODE ?? false
export const CREDENTIALS_MODE = localSettings.CREDENTIALS_MODE ?? undefined
```

**src/config/local_settings.js** — локальные переопределения (git-ignored):
```javascript
export const SKIP_AUTH_CHECK = false  // true = демо без бэкенда
export const DEBUG_MODE = true        // Логирование в консоль
export const VITE_PROXY_TARGET = 'https://your-django-backend.com'
export const CREDENTIALS_MODE = 'include'  // Для cross-origin cookies
```

### Vite Proxy конфигурация

**vite.config.js** читает `VITE_PROXY_TARGET` из local_settings.js:

```javascript
proxy: {
  '/api/ai': {
    target: 'http://127.0.0.1:3001',  // AI Proxy
    changeOrigin: true
  },
  '/api': {
    target: API_BACKEND_URL,           // Django backend
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: ''
  }
}
```

### Replit Workflows

1. **Start application** — `npm run dev` (порт 5000, webview)
2. **AI Proxy Server** — `node server/aiProxy.js` (порт 3001, console)

**КРИТИЧНО:** Frontend ОБЯЗАН работать на порту 5000 для Replit webview!

---

## 5. Архитектура приложения

### Компонентная иерархия

```
App.vue
├── Sidebar (v-if="hasSidebar")
├── <router-view> → Views
│   ├── Dashboard.vue
│   │   ├── OnboardingAI (v-if="shouldShowOnboarding")
│   │   ├── HabitTracker
│   │   ├── JournalEntry
│   │   └── PlanReview (overlay)
│   ├── BalancedScorecard.vue
│   │   └── WheelOfLife
│   ├── GoalsBank.vue
│   ├── Planning.vue
│   ├── Habits.vue
│   └── ...
├── MentorPanel (v-if="showMentorPanel")
├── TelegramAuthModals
└── ToastNotification
```

### Слои приложения

```
┌─────────────────────────────────────────────────────┐
│                    Views (Pages)                     │
├─────────────────────────────────────────────────────┤
│                    Components                        │
├─────────────────────────────────────────────────────┤
│        Pinia Stores (app.js, habits.js, xp.js)      │
├─────────────────────────────────────────────────────┤
│              Services (api.js, habitsApi.js)         │
├─────────────────────────────────────────────────────┤
│            Django REST API (external)                │
└─────────────────────────────────────────────────────┘
```

---

## 6. Модули приложения

### 6.1 ССП (Сбалансированная система показателей)

**Путь:** `/app/ssp`  
**Файл:** `src/views/BalancedScorecard.vue`

**Функционал:**
- 4-шаговая диагностика баланса жизни
- 8 сфер жизни с цветокодировкой
- Интерактивное "Колесо жизни" (WheelOfLife.vue)
- История оценок с датами
- Рефлексия по каждой сфере

**8 сфер жизни:**
| ID | Название | Цвет | Иконка |
|----|----------|------|--------|
| health_sport | Здоровье | #10b981 | Heart |
| welfare | Финансы | #f59e0b | DollarSign |
| work | Карьера | #3b82f6 | Briefcase |
| family | Семья/Любовь | #ec4899 | Heart |
| environment | Окружение | #8b5cf6 | Users |
| hobby | Хобби | #06b6d4 | Palette |
| self_development | Саморазвитие | #6366f1 | BookOpen |
| spirituality | Духовность | #a855f7 | Sparkles |

### 6.2 Банк целей

**Путь:** `/app/goals-bank`  
**Файл:** `src/views/GoalsBank.vue`

**Функционал:**
- 3-шаговый воркфлоу для новых пользователей
- Проверка "3 Почему" для валидации целей
- Фильтры по статусу (в работе, идеи, завершённые)
- Фильтры по сфере жизни
- Пагинация (10 целей на страницу)
- Карточки целей с прогресс-барами
- Привязка к сферам ССП

**Статусы целей:**
- `idea` — Идея (ещё не в работе)
- `active` — В работе
- `completed` — Завершена
- `archived` — Архивирована

### 6.3 Декомпозиция целей

**Путь:** `/app/goals/:id`  
**Файл:** `src/views/GoalEdit.vue`

**Функционал:**
- Разбивка целей на конкретные шаги
- Drag&drop сортировка шагов
- 4 уровня приоритета (critical, important, desirable, optional)
- Оценка времени (15min, 30min, 1h, 2h, 3h, 4h)
- Установка дат выполнения
- Автосохранение с debounce
- Hash-based отслеживание изменений (для оптимизации sync)
- Мини-журнал для заметок

### 6.4 Планирование недели

**Путь:** `/app/planning`  
**Файл:** `src/views/Planning.vue`

**Функционал:**
- Недельный календарь (пн-вс)
- Week Bar с навигацией по неделям
- Drag&drop шагов между днями
- Двунаправленная синхронизация с блоком целей
- Цветовые индикаторы приоритетов
- Дневной бюджет времени
- Chip-фильтры по сферам/приоритетам
- Пагинация (10 целей, 6 шагов на цель)

### 6.5 Дневник

**Путь:** `/app/journal`  
**Файлы:** `src/views/JournalHistory.vue`, `src/components/JournalEntry.vue`

**Функционал:**
- Ежедневная рефлексия с 4 вопросами:
  1. Что хорошего произошло сегодня?
  2. Чему я научился?
  3. Что можно улучшить?
  4. За что я благодарен?
- Streak-трекинг (серия дней)
- AI-ответы ментора (демо-режим)
- Календарь с историей записей
- XP за записи (+5 XP)

### 6.6 Трекер привычек

**Пути:** Dashboard widget, `/app/habits`  
**Файлы:** `src/components/HabitTracker.vue`, `src/views/Habits.vue`, `src/stores/habits.js`

**Функционал:**
- 4 режима сложности:
  | Режим | weekly_amnesty_count | penalty_multiplier |
  |-------|---------------------|-------------------|
  | Мягкий | 7 | 0 |
  | Баланс | 3 | 0.5 |
  | Хардкор | 0 | 1 |
  | Свой | 0-7 | 0-1 |

- Система амнистий (пропуск без штрафа)
- Штрафы за пропуски (0-200 XP × penalty_multiplier)
- Soft-delete с возможностью восстановления
- Навигация по неделям
- 7 статусов дней:
  | Статус | Описание |
  |--------|----------|
  | completed | Выполнено |
  | missed | Пропущено |
  | excused | Оправдано |
  | amnestied | Амнистировано |
  | pending | Ожидает (сегодня) |
  | future | Будущее |
  | not-scheduled | Не запланировано |

- 32 иконки для привычек
- Аналитика и статистика

**API endpoints (habitsApi.js):**
- `GET /api/rest/front/app/habits/get/` — список привычек
- `POST /api/rest/front/app/habits/update/` — создание/обновление
- `DELETE /api/rest/front/app/habits/delete/` — удаление
- `GET /api/rest/front/app/habits/stats/` — статистика

### 6.7 Достижения и XP

**Путь:** `/app/achievements`  
**Файлы:** `src/views/Profile.vue`, `src/stores/xp.js`

**XP награды:**
| Действие | XP |
|----------|-----|
| Выполнение привычки | +5 |
| Запись в дневник | +5 |
| Фокус-задача дня | +10 |
| Выполнение шага цели | +25 |
| Достижение цели | +150 |

**19 достижений в 4 категориях:**
1. **Первые разы** — первая привычка, первая запись, первая цель
2. **Серии** — 3/7/14/30 дней подряд
3. **Количество** — 10/50/100 привычек, 25/100 записей
4. **Накопление** — 100/500/1000/5000 XP

**Вишлист наград:**
- Пользователь добавляет желаемые награды
- Указывает стоимость в XP
- При накоплении XP — "покупает" награду

---

## 7. State Management (Pinia Stores)

### 7.1 Главный Store (app.js) — 3187 строк

**Модули внутри:**
1. **user** — данные пользователя, авторизация
2. **onboarding** — состояние онбординга
3. **spheres** — сферы ССП с оценками
4. **goals** — банк целей
5. **goalsApi** — интеграция с API целей
6. **planning** — планирование недели
7. **journal** — записи дневника
8. **mentor** — сообщения AI Ментора
9. **dailyFocus** — фокус-задачи дня
10. **ui** — UI состояния (модалки, коллапсы)

**Ключевые computed:**
```javascript
const shouldShowOnboarding = computed(() => {
  if (FORCE_SHOW_ONBOARDING) return true
  if (!user.value.is_authenticated) return false
  const isCompleted = user.value.finish_onboarding || onboarding.value.completed
  return !isCompleted
})

const shouldShowMiniTask = computed(() => {
  if (FORCE_SHOW_MINITASK) return true
  if (!user.value.is_authenticated) return false
  if (!user.value.finish_onboarding && !onboarding.value.completed) return false
  return !user.value.finish_minitask
})
```

**Персистентность:**
- localStorage для офлайн-данных
- Синхронизация с backend при онлайне
- Optimistic UI updates

### 7.2 Habits Store (habits.js)

**Состояние:**
```javascript
const habits = ref([])           // Список привычек
const weekOffset = ref(0)        // Смещение недели для навигации
const loading = ref(false)
const statsPanel = ref({
  month_xp: 0,
  week_xp_by_day: [],
  streak_days: []
})
```

**Ключевые методы:**
- `loadHabits()` — загрузка с бэкенда
- `createHabit(data)` — создание привычки
- `updateHabit(id, data)` — обновление
- `deleteHabit(id, permanent)` — soft/hard delete
- `restoreHabit(id)` — восстановление
- `toggleHabitDay(habitId, date)` — отметка дня
- `navigateWeek(direction)` — навигация по неделям

### 7.3 XP Store (xp.js)

**Состояние:**
```javascript
const totalXp = ref(0)
const lifetimeXp = ref(0)
const achievements = ref([])
const wishlist = ref([])
const xpHistory = ref([])
```

**Методы:**
- `addXp(amount, reason)` — начисление XP
- `spendXp(amount, reward)` — "покупка" награды
- `checkAchievements()` — проверка достижений
- `addToWishlist(item)` — добавление награды

---

## 8. API интеграция с Django

### Архитектура запросов

**src/services/api.js** — централизованный клиент:

1. **CSRF Protection:**
   - `initCsrf()` — получение токена при загрузке
   - `refreshCsrf()` — обновление при навигации
   - Токен из cookie `csrftoken` или заголовка `X-CSRFToken`

2. **Cookie-based Auth:**
   - `credentials: 'include'` для cross-origin
   - `sessionid` cookie для сессии
   - Автоматический редирект при 401

3. **Rate Limiting:**
   - `MIN_REQUEST_INTERVAL = 500ms`
   - Защита от спама запросами
   - Exempt endpoints: csrf, login, logout, registration

### Основные endpoints

```javascript
// Авторизация
POST /api/rest/front/login/
POST /api/rest/front/logout/
POST /api/rest/front/registration/
GET  /api/rest/front/get-user-data/

// Онбординг
POST /api/rest/front/app/onboard/update/

// ССП
GET  /api/rest/front/app/ssp/get/
POST /api/rest/front/app/ssp/update/

// Цели
GET  /api/rest/front/app/goals/get/
POST /api/rest/front/app/goals/update/
POST /api/rest/front/app/goals/steps/update/

// Планирование
GET  /api/rest/front/app/planner/get/
POST /api/rest/front/app/planner/update/

// Дневник
GET  /api/rest/front/app/journal/get/
POST /api/rest/front/app/journal/update/

// Привычки
GET  /api/rest/front/app/habits/get/
POST /api/rest/front/app/habits/update/
DELETE /api/rest/front/app/habits/delete/
```

### Маппинг данных Frontend ↔ Backend

**КРИТИЧНО!** Различия в именовании:

**Категории (сферы):**
| Frontend | Backend |
|----------|---------|
| wealth | welfare |
| hobbies | hobby |
| friendship | environment |
| health | health_sport |
| career | work |
| love | family |

**Приоритеты:**
| Frontend | Backend |
|----------|---------|
| critical | critical |
| important | important |
| desirable | important |
| optional | optional |

**Время:**
| Frontend | Backend |
|----------|---------|
| 15min | quarter |
| 30min | half |
| 1h | one |
| 2h | two |
| 3h | three |
| 4h | four |

---

## 9. Маршрутизация

### Структура маршрутов

```javascript
// Публичные
/                    → Landing.vue (лендинг)
/auth/login          → Login.vue
/auth/register       → Register.vue
/auth/recovery       → Recovery.vue
/auth/logout         → Выход (beforeEnter hook)

// Защищённые (requiresAuth: true)
/app                 → Dashboard.vue (главная)
/app/ssp             → BalancedScorecard.vue
/app/goals           → Goals.vue (список целей)
/app/goals/new       → GoalNew.vue
/app/goals/:id       → GoalEdit.vue
/app/goals-bank      → GoalsBank.vue
/app/planning        → Planning.vue
/app/planner         → Planner.vue (старый)
/app/journal         → JournalHistory.vue
/app/habits          → Habits.vue
/app/achievements    → Profile.vue
/app/learning        → LearningCenter.vue
/app/settings        → Settings.vue
/app/club            → Club.vue
```

### Auth Guards

```javascript
router.beforeEach(async (to, from, next) => {
  // 1. Обновление CSRF
  await refreshCsrf()
  
  // 2. Проверка публичных маршрутов
  if (!to.meta.requiresAuth && !to.meta.guestOnly) {
    return next()
  }
  
  // 3. Проверка авторизации
  const { isAuthenticated, userData } = await checkUserAuth()
  
  // 4. Редирект авторизованных с guest-only страниц
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  // 5. Редирект неавторизованных с protected страниц
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  
  // 6. Блокировка навигации во время mini-task
  if (store.shouldShowMiniTask && !allowedDuringMiniTask.includes(to.name)) {
    return next({ name: 'dashboard' })
  }
  
  return next()
})
```

---

## 10. AI Ментор

### Архитектура

**Desktop (≥1024px):**
- Фиксированная панель справа (460px)
- Collapse/expand анимация
- Всегда видна на /app/* страницах

**Mobile (<1024px):**
- Floating button (правый нижний угол)
- Full-screen drawer при открытии
- Overlay с backdrop

### Компоненты

```
MentorPanel.vue (920 строк)
├── collapsed-content (свёрнутое состояние)
├── panel-content (развёрнутое)
│   ├── panel-header (аватар, статус, кнопки)
│   ├── chat-container
│   │   ├── welcome-message (если нет сообщений)
│   │   │   └── quick-prompts (быстрые вопросы)
│   │   └── messages-list
│   │       ├── message.user
│   │       └── message.assistant
│   └── input-container (textarea + send)
└── mobile-btn (для мобильных)
```

### Quick Prompts

```javascript
const quickPrompts = [
  { label: 'С чего начать?', text: 'С чего мне начать работу над целями?' },
  { label: 'Как ставить цели?', text: 'Как правильно формулировать цели?' },
  { label: 'Планирование', text: 'Как эффективно планировать неделю?' },
  { label: 'О методе 1%', text: 'Расскажи о методе 1% улучшений' },
  // Динамический: "До награды: N XP"
]
```

### Demo Mode

В демо-режиме (`SKIP_AUTH_CHECK=true`) AI Ментор использует предзаготовленные ответы из `demoResponses` объекта. При интеграции с OpenAI — запросы идут через `/api/ai/chat`.

### AI Proxy Server

**server/aiProxy.js** — Express сервер на порту 3001:
- Принимает POST `/api/ai/chat`
- Форвардит на OpenAI API
- Стриминг ответов
- Обработка ошибок

---

## 11. Система геймификации

### XP (Experience Points)

**Начисление:**
| Действие | XP | Код |
|----------|-----|-----|
| Выполнение привычки | +5 | `XP_REWARDS.habit` |
| Запись в дневник | +5 | `XP_REWARDS.journal` |
| Фокус-задача дня | +10 | `XP_REWARDS.focusTask` |
| Шаг цели | +25 | `XP_REWARDS.goalStep` |
| Цель достигнута | +150 | `XP_REWARDS.goalComplete` |

**Штрафы (привычки):**
```javascript
const penalty = basePenalty * habit.penalty_multiplier
// basePenalty зависит от серии пропусков (5-200 XP)
```

### Достижения (19 штук)

**Категория "Первые разы":**
- Первая привычка
- Первая запись в дневнике
- Первая цель
- Первый шаг выполнен

**Категория "Серии":**
- 3 дня подряд
- 7 дней подряд
- 14 дней подряд
- 30 дней подряд

**Категория "Количество":**
- 10 привычек выполнено
- 50 привычек выполнено
- 100 привычек выполнено
- 25 записей в дневнике
- 100 записей в дневнике

**Категория "Накопление":**
- 100 XP
- 500 XP
- 1000 XP
- 5000 XP

### Wishlist (Вишлист наград)

```javascript
const wishlist = [
  {
    id: 'uuid',
    name: 'Кино с друзьями',
    cost: 200,        // XP
    purchased: false,
    purchasedAt: null
  }
]
```

---

## 12. Критические паттерны и решения

### 12.1 Optimistic UI Updates

```javascript
// 1. Сразу обновляем UI
habit.completed = true

// 2. Отправляем на сервер
const result = await habitsApi.update(habit.id, { completed: true })

// 3. При ошибке — откатываем
if (result.status === 'error') {
  habit.completed = false
  toast.error('Не удалось сохранить')
}
```

### 12.2 Hash-based Change Tracking

Для оптимизации синхронизации шагов цели:

```javascript
function computeStepHash(step) {
  return JSON.stringify({
    title: step.title,
    priority: step.priority,
    estimated_time: step.estimated_time,
    date: step.date,
    completed: step.completed
  })
}

// При sync — отправляем только изменённые шаги
const changedSteps = steps.filter(s => s.hash !== computeStepHash(s))
```

### 12.3 Race Condition Prevention

```javascript
// Используем флаг isSyncing
const isSyncing = ref(false)

async function syncGoals() {
  if (isSyncing.value) return
  isSyncing.value = true
  
  try {
    await api.syncGoals(goals.value)
  } finally {
    isSyncing.value = false
  }
}
```

### 12.4 Debounced Auto-save

```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedSave = useDebounceFn(async () => {
  await api.saveGoal(currentGoal.value)
}, 1000)

watch(() => currentGoal.value, debouncedSave, { deep: true })
```

### 12.5 Pagination with Append

```javascript
async function loadGoals(page = 1, append = false) {
  const result = await api.getGoals({ page, per_page: 10 })
  
  if (append) {
    goals.value = [...goals.value, ...result.data]
  } else {
    goals.value = result.data
  }
  
  pagination.value = result.pagination
}
```

---

## 13. Известные проблемы и решения

### 13.1 Бесконечный цикл онбординга (РЕШЕНО в Merge 12)

**Проблема:** Пользователи застревали в бесконечном цикле онбординга после его завершения.

**Причина:**
1. OnboardingAI не отправлял `is_complete=true` на бэкенд
2. `finish_onboarding` из user data НЕ синхронизировался с `onboarding.completed`

**Решение:**
```javascript
// В setUser() — синхронизация флагов
if (userData.finish_onboarding) {
  onboarding.value.completed = true
}

// В loadOnboardingFromBackend() — early return
if (user.value.finish_onboarding) {
  onboarding.value.completed = true
  return
}

// В OnboardingAI — отправка на бэкенд
await store.completeOnboardingWithBackend({ is_complete: true })
```

### 13.2 Cross-origin cookies

**Проблема:** Django бэкенд не отправлял `Set-Cookie: sessionid` после login.

**Решение:**
1. `CREDENTIALS_MODE = 'include'` в настройках
2. `credentials: 'include'` в fetch запросах
3. CORS настройки на Django: `Access-Control-Allow-Credentials: true`

### 13.3 Vite proxy не работает

**Симптомы:** 404 на API запросы, CORS ошибки.

**Решение:**
1. Проверить `VITE_PROXY_TARGET` в local_settings.js
2. Перезапустить Vite (`npm run dev`)
3. Убедиться что Django доступен по указанному URL

### 13.4 MentorPanel не отображается

**Причина:** Условия отображения:
```javascript
const showMentorPanel = computed(() => {
  return hasSidebar.value && isAppPage.value && !isOnboarding.value
})
```

**Проверить:**
- Находитесь на `/app/*` странице
- Не в режиме онбординга
- Sidebar отображается

---

## 14. Важные файлы

### Обязательно изучить перед работой

| Файл | Строк | Описание |
|------|-------|----------|
| `src/stores/app.js` | 3187 | Главный store со всей логикой |
| `src/services/api.js` | 870 | API клиент с CSRF, auth, rate limiting |
| `src/router/index.js` | 319 | Маршрутизация + auth guards |
| `src/config/settings.js` | 66 | Конфигурация приложения |
| `vite.config.js` | 62 | Vite + proxy настройки |
| `docs/STYLE_GUIDE.md` | ~1000 | Дизайн-система (25 секций) |

### Документация модулей

| Файл | Описание |
|------|----------|
| `notes/HABITS.md` | Полная документация трекера привычек |
| `notes/ACHIEVEMENTS.md` | Система XP и достижений |
| `docs/ai-mentor-master-spec.md` | Спецификация AI Ментора |
| `notes/merge*.md` | История изменений (1-24) |

### API документация

| Файл | Описание |
|------|----------|
| `attached_assets/frontend_api_guide_*.md` | API guide для фронтенда |
| `attached_assets/HABITS_API_DOCUMENTATION_*.md` | REST API привычек |

---

## 15. Команды разработки

### Запуск

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (порт 5000)
npm run dev

# Запуск AI Proxy (порт 3001)
node server/aiProxy.js
```

### Replit Workflows

Проект на Replit использует Workflows вместо ручных команд:

1. **Start application** — автоматически при открытии
2. **AI Proxy Server** — запускать при необходимости AI

### Build

```bash
npm run build
# Output: dist/
```

---

## 16. Контрольный список для нового разработчика

### Перед началом работы

- [ ] Изучить `src/stores/app.js` — понять структуру state
- [ ] Изучить `src/services/api.js` — понять API паттерны
- [ ] Прочитать `docs/STYLE_GUIDE.md` — дизайн-система
- [ ] Настроить `src/config/local_settings.js` (скопировать из .example)
- [ ] Проверить что `VITE_PROXY_TARGET` указывает на рабочий backend
- [ ] Запустить `npm run dev` и убедиться что приложение работает

### При добавлении нового функционала

- [ ] Использовать Composition API (`<script setup>`)
- [ ] Следовать дизайн-системе (CSS переменные из main.css)
- [ ] Использовать Lucide иконки (line style, stroke-width 1.5)
- [ ] Добавлять типы к computed/ref где возможно
- [ ] Использовать существующие API методы из api.js
- [ ] Добавлять DEBUG_MODE логирование
- [ ] Тестировать в light/dark темах
- [ ] Тестировать на mobile (responsive design)

### При работе с API

- [ ] Помнить про маппинг категорий (wealth→welfare, etc.)
- [ ] Использовать `request()` из api.js
- [ ] Обрабатывать ошибки (`result.status === 'error'`)
- [ ] Применять optimistic updates где возможно
- [ ] Не забывать про rate limiting

### При работе с онбордингом

- [ ] Тестировать с `FORCE_SHOW_ONBOARDING=true`
- [ ] Проверять синхронизацию `finish_onboarding` и `onboarding.completed`
- [ ] Убедиться что `is_complete=true` отправляется на бэкенд

### Перед коммитом

- [ ] Проверить консоль на ошибки
- [ ] Проверить что Workflows работают
- [ ] Обновить документацию если нужно
- [ ] Добавить merge note если значительные изменения

---

## Заключение

OnePercent MVP — зрелый проект с продуманной архитектурой, но требующий внимания к деталям интеграции с Django бэкендом. Ключевые принципы:

1. **Всё через store** — не храните состояние в компонентах
2. **API через api.js** — не делайте fetch напрямую
3. **Следуйте дизайн-системе** — используйте CSS переменные
4. **Помните про маппинги** — frontend и backend используют разные имена
5. **Тестируйте оба режима** — с бэкендом и с `SKIP_AUTH_CHECK=true`

При возникновении вопросов — изучайте merge notes в `notes/merge*.md`, они содержат детальное описание всех изменений и решений.

---

*Документация создана: Декабрь 2024*  
*Последнее обновление: при передаче проекта*
