# OnePercent MVP — Полная техническая документация

Исчерпывающая документация по архитектуре, компонентам и интеграциям проекта.

---

## 1. Технологический стек

### 1.1 Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| Vue 3 | 3.x | UI Framework (Composition API, script setup) |
| Vite | 5.x | Build tool, dev server |
| Vue Router | 4.x | Маршрутизация с auth guards |
| Pinia | 2.x | State management с localStorage persistence |
| Lucide Vue Next | — | Иконки (minimalist style) |
| @unhead/vue | — | SEO meta tags |
| canvas-confetti | — | Анимация конфетти |
| html2canvas | — | Скриншоты для шеринга |

### 1.2 Backend (Django REST API)

| Компонент | Описание |
|-----------|----------|
| Django REST Framework | REST API |
| PostgreSQL | База данных |
| OpenAI API | AI-функции (через AI_INTEGRATIONS_OPENAI_API_KEY) |
| Robokassa | Платёжный шлюз |
| Telegram Bot API | Уведомления и бот |

### 1.3 Сервисные модули (Node.js)

| Файл | Назначение |
|------|------------|
| `server/aiProxy.js` | Проксирование AI-запросов |
| `server/telegramBot.js` | Telegram бот (Telegraf + node-cron) |

---

## 2. Структура проекта

```
src/
├── assets/                 # Статические ресурсы
│   ├── legal/             # Юридические документы (md)
│   ├── logo.png
│   └── main.css           # Глобальные стили
├── components/            # Vue-компоненты
│   ├── catalog/           # SEO-каталог
│   └── newyear/           # Итоги года
├── composables/           # Vue composables
├── config/                # Конфигурация
│   ├── settings.js        # Экспорт настроек
│   ├── local_settings.js  # Локальные override
│   └── local_settings.example.js
├── data/                  # Моковые данные
├── router/                # Vue Router
├── services/              # API-клиенты
├── stores/                # Pinia stores
├── utils/                 # Утилиты
├── views/                 # Страницы
│   ├── catalog/           # SEO-страницы каталога
│   └── land/              # Лендинги
├── App.vue                # Root component
└── main.js                # Entry point
```

---

## 3. Конфигурация (src/config/)

### 3.1 settings.js

```javascript
export const DEV_MODE              // Режим разработки
export const SKIP_AUTH_CHECK       // Пропуск авторизации (dev)
export const SKIP_POLICY_CHECK     // Пропуск политик (dev)
export const API_BASE_URL          // Базовый URL API ('' = proxy)
export const WS_BASE_URL           // WebSocket URL
export const MIN_REQUEST_INTERVAL  // Rate limiting (500ms)
export const DEBUG_MODE            // Логирование в консоль
export const FORCE_SHOW_ONBOARDING // Принудительный онбординг
export const FORCE_SHOW_MINITASK   // Принудительное мини-задание
export const DEMO_PLANNING_MODE    // Демо-режим планировщика
export const CREDENTIALS_MODE      // Режим credentials для fetch
export const SITE_DOMAIN           // Домен для ссылок
export const YANDEX_METRIKA_ID     // ID Яндекс.Метрики
```

### 3.2 local_settings.js

Переопределяет значения из `settings.js` для локальной разработки:
```javascript
export const SKIP_AUTH_CHECK = true  // Пропустить авторизацию
export const DEBUG_MODE = true       // Включить логи
```

---

## 4. Маршрутизация (src/router/index.js)

### 4.1 Публичные роуты

| Path | Name | Component | Описание |
|------|------|-----------|----------|
| `/` | landing | LandingVersion5 | Главный лендинг |
| `/land/version6` | landing-version6 | LandingVersion6 | Bento-дизайн лендинг |
| `/land/version2-4` | — | — | Альтернативные лендинги |
| `/land/newyear/*` | — | — | Итоги года |
| `/catalog/*` | — | — | SEO-каталог |
| `/auth/login` | login | Login | Вход (guestOnly) |
| `/auth/register` | register | Register | Регистрация (guestOnly) |
| `/auth/recovery` | recovery | Recovery | Восстановление пароля |
| `/privacy` | privacy | LegalPage | Политика конфиденциальности |
| `/termspolicy` | terms | LegalPage | Условия использования |
| `/ref/:code` | referral-redirect | — | Реферальная ссылка → register |

### 4.2 Защищённые роуты (requiresAuth: true)

| Path | Name | Component | Описание |
|------|------|-----------|----------|
| `/app` | dashboard | Dashboard | Главная (День пользователя) |
| `/app/ssp` | ssp | BalancedScorecard | Колесо баланса |
| `/app/goals` | goals | Goals | Цели и декомпозиция |
| `/app/goals/new` | goal-new | GoalNew | Создание цели |
| `/app/goals/:id` | goal-edit | GoalEdit | Редактирование цели |
| `/app/goals-bank` | goals-bank | GoalsBank | Банк целей |
| `/app/planning` | planning | Planning | Недельное планирование |
| `/app/planner` | planner | Planner | Расширенный планировщик |
| `/app/habits` | habits | Habits | Привычки |
| `/app/journal` | journal | JournalHistory | Дневник |
| `/app/settings` | settings | Settings | Настройки |
| `/app/settings/notifications` | notification-settings | NotificationSettings | Уведомления |
| `/app/subscription` | subscription | Subscription | Тарифы |
| `/app/referral` | referral | Referral | Реферальная программа |
| `/app/achievements` | achievements | Profile | Достижения и XP |
| `/app/club` | club | Club | Клуб 1% |
| `/app/learning` | learning | LearningCenter | Обучение |
| `/onboarding` | onboarding | OnboardingAI | AI-онбординг |

### 4.3 Navigation Guards

```javascript
router.beforeEach(async (to, from, next) => {
  // 1. Обработка реферального кода (?ref=XXX)
  // 2. Проверка авторизации (checkUserAuth)
  // 3. Редирект guestOnly → /app если авторизован
  // 4. Редирект requiresAuth → /auth/login если не авторизован
  // 5. Блокировка навигации во время mini-task
  // 6. Редирект на онбординг если не пройден
})
```

---

## 5. Stores (Pinia)

### 5.1 app.js — Главный store

**Размер:** ~3700 строк

#### Основные секции:

| Секция | Описание |
|--------|----------|
| Global Data | Справочники с бэкенда (категории, приоритеты, время) |
| User | Данные пользователя, авторизация |
| SSP | Сбалансированная система показателей |
| Goals | Цели, шаги, пагинация |
| Onboarding | Состояние онбординга |
| MiniTask | Мини-задание после онбординга |
| Journal | Дневник |
| Planning | Недельные планы |
| Theme | Тема оформления |

#### Ключевые computed:

```javascript
const isAuthenticated = computed(() => !!user.value?.id)
const hasCompletedOnboarding = computed(() => user.value?.finish_onboarding)
const shouldShowOnboarding = computed(() => 
  isAuthenticated.value && !hasCompletedOnboarding.value
)
const needsPolicyAcceptance = computed(() => 
  !user.value?.is_terms_accepted || !user.value?.is_privacy_accepted
)
```

#### Маппинг категорий:

```javascript
// Backend → Frontend
const categoryBackendToFrontend = {
  'welfare': 'wealth',
  'hobby': 'hobbies',
  'environment': 'friendship',
  'health_sport': 'health',
  'work': 'career',
  'family': 'love'
}
```

### 5.2 Другие stores

| Store | Файл | Назначение |
|-------|------|------------|
| xp | xp.js | XP-система, начисление, история |
| habits | habits.js | Привычки |
| chat | chat.js | AI-ментор чат |
| subscription | subscription.js | Подписки, тарифы |
| toast | toast.js | Уведомления |
| aiTasks | aiTasks.js | AI-задачи (WebSocket) |
| newyear | newyear.js | Итоги года |
| landingSSP | landingSSP.js | SSP для лендинга |
| activation | activation.js | Активация аккаунта |

---

## 6. API-клиент (src/services/api.js)

### 6.1 Архитектура

```javascript
// Централизованный fetch с CSRF
export async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken()
  }
  return fetch(url, { ...options, headers, credentials })
}

// Rate limiting
const MIN_REQUEST_INTERVAL = 500
const RATE_LIMIT_EXEMPT = ['/api/rest/front/csrf/', ...]
```

### 6.2 Основные эндпоинты

#### Авторизация
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `login` | /api/rest/front/login/ | POST |
| `register` | /api/rest/front/registration/ | POST |
| `logout` | /api/rest/front/logout/ | POST |
| `checkAuth` | /api/rest/front/get-user-data/ | GET |
| `telegramWebAppAuth` | /api/rest/front/telegram-webapp-auth/ | POST |

#### Данные
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `getGlobalData` | /api/rest/front/get-global-data/ | GET |
| `getOnboardingData` | /api/rest/front/onboarding/ | GET |
| `updateOnboardingData` | /api/rest/front/onboarding/ | POST |
| `getSSPData` | /api/rest/front/ssp/ | GET |
| `updateSSPData` | /api/rest/front/ssp/ | POST |

#### Цели и шаги
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `getGoals` | /api/rest/front/goals/ | GET |
| `getGoalSteps` | /api/rest/front/goals/steps/ | GET |
| `createGoal` | /api/rest/front/goals/ | POST |
| `updateGoal` | /api/rest/front/goals/{id}/ | PATCH |
| `deleteGoal` | /api/rest/front/goals/{id}/ | DELETE |
| `updateGoalSteps` | /api/rest/front/goals/steps/ | PATCH |
| `getPlannedSteps` | /api/rest/front/goals/steps/planned/ | GET |

#### Привычки и дневник
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `getDiaryEntries` | /api/rest/front/diary/ | GET |
| `createDiaryEntry` | /api/rest/front/diary/ | POST |

#### XP и награды
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `getXPStats` | /api/rest/front/xp/stats/ | GET |
| `getRewards` | /api/rest/front/rewards/ | GET |
| `redeemReward` | /api/rest/front/rewards/{id}/redeem/ | POST |

#### Чат
| Функция | Endpoint | Метод |
|---------|----------|-------|
| `getChatConversations` | /api/rest/front/chat/conversations/ | GET |
| `sendChatMessage` | /api/rest/front/chat/messages/ | POST |

### 6.3 Обработка ошибок

```javascript
// 403 policy_acceptance_required → показать модалку
if (response.status === 403 && result.error_code === 'policy_acceptance_required') {
  appStore.showPolicyModal()
}

// 401 → редирект на login
if (response.status === 401) {
  router.push({ name: 'login' })
}
```

---

## 7. Компоненты

### 7.1 Layout компоненты

| Компонент | Описание |
|-----------|----------|
| Sidebar.vue | Боковая навигация (сворачиваемая) |
| ImpersonateBanner.vue | Баннер имперсонации |
| ToastNotification.vue | Toast-уведомления |
| PolicyAcceptanceModal.vue | Модалка принятия политик |

### 7.2 Онбординг

| Компонент | Описание |
|-----------|----------|
| OnboardingAI.vue | AI-онбординг (5 шагов) |
| Onboarding.vue | Старый онбординг |
| WheelOfLife.vue | Интерактивное колесо баланса |
| MiniTask.vue | Мини-задание после онбординга |
| MiniTaskWelcome.vue | Приветствие мини-задания |

### 7.3 Цели

| Компонент | Описание |
|-----------|----------|
| GoalsBank.vue (component) | Компонент банка целей |
| PlanReview.vue | Обзор плана |

### 7.4 AI-ментор

| Компонент | Описание |
|-----------|----------|
| MentorPanel.vue | Панель чата с ментором |
| MentorWidget.vue | Виджет ментора на Dashboard |
| MentorFloatingButton.vue | Плавающая кнопка ментора |
| MentorGoalSuggestionsModal.vue | Модалка AI-предложений целей |
| AICurator.vue | AI-куратор |

### 7.5 Привычки и XP

| Компонент | Описание |
|-----------|----------|
| HabitTracker.vue | Трекер привычек |
| HabitManagerModal.vue | Модалка управления привычками |
| XpBadge.vue | Бейдж XP |
| XPNotification.vue | Уведомление о начислении XP |
| RewardWishlist.vue | Wishlist наград |

### 7.6 Дневник

| Компонент | Описание |
|-----------|----------|
| JournalEntry.vue | Запись дневника |
| JournalWidget.vue | Виджет дневника на Dashboard |

### 7.7 Прочие

| Компонент | Описание |
|-----------|----------|
| DailyProgressBar.vue | Прогресс-бар дня |
| FirstSteps.vue | Первые шаги |
| GuidancePanel.vue | Панель подсказок |
| TelegramAuthModals.vue | Модалки Telegram-авторизации |
| PaymentModal.vue | Модалка оплаты |
| UpgradeModal.vue | Модалка апгрейда тарифа |

---

## 8. Views (Страницы)

### 8.1 Основные страницы приложения

| View | Описание |
|------|----------|
| Dashboard.vue | "День пользователя" — главная страница |
| BalancedScorecard.vue | Колесо баланса (SSP) |
| Goals.vue | Список целей |
| GoalNew.vue | Создание цели |
| GoalEdit.vue | Редактирование цели и шагов |
| GoalsBank.vue | Банк целей (карточки) |
| Planning.vue | Недельное планирование |
| Planner.vue | Расширенный планировщик |
| Habits.vue | Страница привычек |
| JournalHistory.vue | История дневника |
| Settings.vue | Настройки профиля |
| NotificationSettings.vue | Настройки уведомлений |
| Subscription.vue | Тарифы и подписка |
| Referral.vue | Реферальная программа |
| Profile.vue | Достижения и XP |
| Club.vue | Клуб 1% |
| LearningCenter.vue | Обучение |

### 8.2 Лендинги (views/land/)

| View | URL | Описание |
|------|-----|----------|
| LandingVersion5.vue | / | Главный лендинг (v5) |
| LandingVersion6.vue | /land/version6 | Bento-дизайн |
| LandingVersion4.vue | /land/version4 | Product journey |
| LandingVersion3.vue | /land/version3 | Pain-driven |
| LandingVersion2.vue | /land/version2 | Persona-driven |
| Landing.vue | /land/old_v1 | Старый лендинг |
| NewYearLanding.vue | /land/newyear | Итоги года |
| NewYearTest.vue | /land/newyear/test | Тест итогов |
| NewYearResults.vue | /land/newyear/results | Результаты |

### 8.3 SEO-каталог (views/catalog/)

| View | URL | Описание |
|------|-----|----------|
| CatalogHome.vue | /catalog | Главная каталога |
| CatalogGoals.vue | /catalog/goals | Каталог целей |
| CatalogHabits.vue | /catalog/habits | Каталог привычек |
| CatalogBundles.vue | /catalog/bundles | Готовые наборы |

---

## 9. Бизнес-логика

### 9.1 Авторизация

1. Cookie-based auth с CSRF-токеном
2. Telegram OAuth через `t_auth_link`
3. Telegram WebApp авторизация
4. Проверка авторизации: `api.checkAuth()` → `store.setUser()`

### 9.2 Онбординг (5 шагов)

1. Приветствие и выбор времени на развитие
2. SSP-диагностика (Колесо баланса)
3. AI-анализ результатов
4. Автогенерация целей
5. Принятие/редактирование целей

### 9.3 Цели и декомпозиция

1. Создание цели → привязка к сфере жизни
2. Декомпозиция на шаги
3. Планирование шагов на даты
4. Отметка выполнения → начисление XP

### 9.4 XP-система

```javascript
// Источники XP
const XP_AMOUNTS = {
  step_complete: 10,
  habit_complete: 5,
  journal_entry: 15,
  goal_complete: 50
}

// Начисление
await xpStore.grantXP('step_complete', stepId)
```

### 9.5 AI-ментор

1. Контекст пользователя (цели, прогресс, SSP)
2. REST API для сообщений
3. WebSocket для streaming
4. Интеграция с дневником

### 9.6 Биллинг

1. Тарифы: Free / Starter / Pro / Premium
2. Периоды: 1 / 3 / 6 / 12 месяцев
3. Оплата через Robokassa
4. Callback: `/app/billing/success` или `/fail`

---

## 10. Паттерны разработки

### 10.1 Composition API (script setup)

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const loading = ref(false)

const filteredData = computed(() => {
  return store.data.filter(...)
})

onMounted(async () => {
  await store.loadData()
})
</script>
```

### 10.2 Optimistic UI

```javascript
// 1. Мгновенное обновление UI
task.completed = true

// 2. Запрос к API
try {
  await api.updateTask(task.id, { completed: true })
} catch {
  // 3. Откат при ошибке
  task.completed = false
}
```

### 10.3 Debounced поиск

```javascript
let searchTimer = null

watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  if (val.length >= 3) {
    searchTimer = setTimeout(() => {
      loadData({ query: val })
    }, 300)
  }
})
```

### 10.4 Lazy loading компонентов

```javascript
// router/index.js
const Dashboard = () => import('@/views/Dashboard.vue')
const GoalEdit = () => import('@/views/GoalEdit.vue')
```

### 10.5 LocalStorage persistence

```javascript
// Сохранение
function saveToLocalStorage() {
  localStorage.setItem('onepercent-app', JSON.stringify({
    goals: goals.value,
    theme: theme.value
  }))
}

// Восстановление
function loadFromLocalStorage() {
  const saved = localStorage.getItem('onepercent-app')
  if (saved) {
    const data = JSON.parse(saved)
    goals.value = data.goals || []
  }
}
```

### 10.6 Маппинг Backend ↔ Frontend

```javascript
// Трансформация при загрузке
function transformGoalFromBackend(apiGoal) {
  return {
    id: apiGoal.goal_id,
    backendId: apiGoal.goal_id,
    title: apiGoal.title,
    sphereId: categoryBackendToFrontend[apiGoal.category]
  }
}

// Трансформация при отправке
function transformGoalToBackend(goal) {
  return {
    title: goal.title,
    category: categoryFrontendToBackend[goal.sphereId]
  }
}
```

---

## 11. WebSocket (AI Tasks)

### 11.1 Подключение

```javascript
// stores/aiTasks.js
const WS_URL = `${WS_BASE_URL}/ws/ai-tasks/`

function connect() {
  ws = new WebSocket(WS_URL)
  ws.onmessage = handleMessage
}
```

### 11.2 Типы задач

| Type | Описание |
|------|----------|
| `week_planning_help` | AI-планирование недели |
| `goal_suggestions` | Предложения целей |
| `ssp_analysis` | Анализ SSP |

### 11.3 Протокол

```javascript
// Запрос
{ type: 'start_task', task_type: 'week_planning_help', context: {...} }

// Прогресс
{ type: 'progress', percent: 50, text: 'Анализ задач...' }

// Результат
{ type: 'completed', result: {...} }
```

---

## 12. Важные нюансы

### 12.1 CSRF

- Токен получается через `GET /api/rest/front/csrf/`
- Передаётся в заголовке `X-CSRFToken`
- Хранится в cookie `csrftoken` и в памяти

### 12.2 Rate Limiting

- Минимальный интервал: 500ms
- Исключения: login, register, csrf, get-user-data

### 12.3 Приоритетная цель

- Передаётся через `?first_goal_id=` в URL
- Сохраняется на время сессии
- Обеспечивает консистентный порядок при редактировании

### 12.4 Двойные ID

- Локальный ID: `goal.id` (временный, для нового)
- Backend ID: `goal.backendId` (постоянный)
- Используется: `goal.backendId || goal.id`

### 12.5 Telegram Mini App

```javascript
// composables/useTelegram.js
const tg = window.Telegram?.WebApp

if (tg) {
  tg.ready()
  tg.expand()
}
```

### 12.6 Версионирование localStorage

```javascript
// При изменении структуры данных бэкенд присылает localstorage_version
// Если версия изменилась → очистка localStorage
checkLocalStorageVersion(serverVersion)
```

### 12.7 Policy Acceptance

- Блокирующая модалка если `!is_terms_accepted || !is_privacy_accepted`
- 403 от API → показ модалки
- Принятие → `PATCH /api/rest/front/update-user-data/`

### 12.8 Реферальная система

- Код в URL: `/ref/:code` или `?ref=XXX`
- Сохраняется в localStorage: `onepercent_referral_code`
- Передаётся при регистрации

### 12.9 UTM-трекинг

```javascript
// utils/tracking.js
captureUTMParams() // utm_source, utm_medium, utm_campaign, ...
captureReferrer()  // document.referrer
getTrackingData()  // для отправки при регистрации
```

---

## 13. Тестовый режим (Development)

### 13.1 Пропуск авторизации

```javascript
// local_settings.js
export const SKIP_AUTH_CHECK = true
```

Создаётся dev-пользователь:
```javascript
{ id: 'dev-user', email: 'dev@example.com', finish_onboarding: true }
```

### 13.2 Debug-режим

```javascript
export const DEBUG_MODE = true
```

Включает:
- Логирование API-запросов
- Логирование навигации
- Логирование состояния store

### 13.3 Принудительные флаги

```javascript
export const FORCE_SHOW_ONBOARDING = true  // Всегда показывать онбординг
export const FORCE_SHOW_MINITASK = true    // Всегда показывать мини-задание
export const DEMO_PLANNING_MODE = true     // Демо-данные в планировщике
```

---

## 14. Vite конфигурация

```javascript
// vite.config.js
export default {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/attached_assets'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': 'https://percent1.ru'
    }
  }
}
```

---

## 15. Workflows

| Workflow | Команда | Порт |
|----------|---------|------|
| Start application | `npm run dev` | 5000 |
| AI Proxy Server | `node server/aiProxy.js` | — |
| Telegram Bot | `node server/telegramBot.js` | — |

---

## 16. Связанная документация

- [PLANNING_MODULE.md](./PLANNING_MODULE.md) — Детальная документация модуля планирования
- [replit.md](../replit.md) — Обзор проекта и архитектуры
