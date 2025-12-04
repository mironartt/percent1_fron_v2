# OnePercent MVP — Полная документация продукта

**Версия:** 1.0  
**Дата:** Декабрь 2025  
**Платформа:** Web (Vue 3 + Vite)

---

## Содержание

1. [Концепция продукта](#1-концепция-продукта)
2. [Технический стек](#2-технический-стек)
3. [Архитектура приложения](#3-архитектура-приложения)
4. [Модули и функционал](#4-модули-и-функционал)
5. [Система маршрутизации](#5-система-маршрутизации)
6. [Управление состоянием](#6-управление-состоянием)
7. [API и бэкенд интеграция](#7-api-и-бэкенд-интеграция)
8. [UI/UX решения](#8-uiux-решения)
9. [Мобильная адаптация](#9-мобильная-адаптация)
10. [Геймификация и XP система](#10-геймификация-и-xp-система)

---

## 1. Концепция продукта

### 1.1 Философия
OnePercent — это система управления жизнью, основанная на философии "1% улучшения каждый день". Продукт помогает пользователям:
- Оценивать баланс жизни по ключевым сферам
- Ставить и декомпозировать цели
- Планировать и выполнять ежедневные задачи
- Рефлексировать через ведение дневника
- Получать поддержку от AI-ментора

### 1.2 Целевая аудитория
Люди, стремящиеся к личностному росту и системному подходу к саморазвитию.

### 1.3 Ключевое ценностное предложение
- **AI Ментор** — персональный коуч, доступный на всех страницах
- **Колесо жизни (SSP)** — визуальная диагностика баланса жизни
- **Система целей** — от идеи до конкретных шагов
- **Геймификация** — XP за действия, награды за прогресс

---

## 2. Технический стек

### 2.1 Frontend
| Технология | Назначение |
|------------|------------|
| **Vue 3** | Основной фреймворк (Composition API, script setup) |
| **Vite** | Сборщик с HMR и proxy к бэкенду |
| **Vue Router** | Навигация с auth guards |
| **Pinia** | State management с localStorage persistence |
| **Lucide Vue Next** | Иконки (минималистичный линейный стиль) |

### 2.2 Backend
| Технология | Назначение |
|------------|------------|
| **Django REST API** | Основной бэкенд |
| **Cookie-based Auth** | Аутентификация с CSRF защитой |
| **Telegram OAuth** | Авторизация через Telegram |

### 2.3 Конфигурация
```
src/config/
├── settings.js          # Основные настройки (API URL, флаги)
├── local_settings.js    # Локальные переопределения (gitignored)
└── local_settings.example.js  # Пример локальных настроек
```

Флаги конфигурации:
- `SKIP_AUTH_CHECK` — пропустить проверку авторизации (dev mode)
- `DEBUG_MODE` — включить логирование
- `FORCE_SHOW_ONBOARDING` — принудительно показать онбординг

---

## 3. Архитектура приложения

### 3.1 Структура проекта
```
src/
├── assets/              # Статические ресурсы (CSS, изображения)
├── components/          # Переиспользуемые компоненты
├── config/              # Конфигурация приложения
├── router/              # Маршрутизация
├── services/            # API сервисы
├── stores/              # Pinia stores (состояние)
├── views/               # Страницы (роуты)
├── App.vue              # Корневой компонент
└── main.js              # Точка входа
```

### 3.2 Компоненты
| Компонент | Описание |
|-----------|----------|
| `Sidebar.vue` | Боковое меню с навигацией |
| `MentorPanel.vue` | Глобальная панель AI Ментора |
| `WheelOfLife.vue` | Интерактивное колесо жизни |
| `OnboardingAI.vue` | 5-шаговый онбординг с AI |
| `PlanReview.vue` | Ревью сгенерированных целей |
| `FirstSteps.vue` | Чеклист первых шагов |
| `JournalEntry.vue` | Форма записи в дневник |
| `HabitTracker.vue` | Трекер привычек |
| `XpBadge.vue` | Бейдж с XP пользователя |
| `DailyProgressBar.vue` | Прогресс дня |
| `ToastNotification.vue` | Уведомления |

### 3.3 Страницы (Views)
| View | Путь | Описание |
|------|------|----------|
| `Landing.vue` | `/` | Публичный лендинг |
| `Login.vue` | `/auth/login` | Вход в систему |
| `Register.vue` | `/auth/register` | Регистрация |
| `Dashboard.vue` | `/app` | Главная (день пользователя) |
| `BalancedScorecard.vue` | `/app/ssp` | Колесо жизни (SSP) |
| `GoalsBank.vue` | `/app/goals-bank` | Банк целей |
| `GoalEdit.vue` | `/app/goals/:id` | Редактирование цели |
| `Planning.vue` | `/app/planning` | Планирование недели |
| `JournalHistory.vue` | `/app/journal` | Дневник |
| `LearningCenter.vue` | `/app/learning` | Обучение |
| `Profile.vue` | `/app/achievements` | Профиль и достижения |
| `Settings.vue` | `/app/settings` | Настройки |

---

## 4. Модули и функционал

### 4.1 SSP Module (Сбалансированная система показателей)
**Путь:** `/app/ssp`

**Функционал:**
- 4-шаговый guided flow для оценки жизненного баланса
- Интерактивное "Колесо жизни" с 6 сферами
- Цветовая кодировка оценок (1-3 красный, 4-6 жёлтый, 7-10 зелёный)
- Рефлексия по каждой сфере с аккордеонами
- Inline редактирование оценок

**Сферы жизни:**
| ID | Название | Backend ID |
|----|----------|------------|
| wealth | Благосостояние | welfare |
| hobbies | Хобби | hobby |
| friendship | Окружение | environment |
| health | Здоровье и спорт | health_sport |
| career | Карьера | work |
| love | Семья | family |

### 4.2 Goals Bank (Банк целей)
**Путь:** `/app/goals-bank`

**Функционал:**
- 3-шаговый workflow: валидация → фильтрация → трансфер
- Создание целей с привязкой к сфере
- Фильтры: категория, статус, текстовый поиск
- Пагинация с подгрузкой
- Inline модальное редактирование

**Статусы целей:**
| Статус | Описание |
|--------|----------|
| `work` | В работе |
| `complete` | Завершена |
| `unstatus` | Без статуса |

### 4.3 Goal Decomposition (Декомпозиция)
**Путь:** `/app/goals/:id`

**Функционал:**
- Разбивка целей на шаги
- Drag & drop сортировка шагов
- Параметры шага: приоритет, оценка времени, дата, статус
- Фильтрация и сортировка шагов
- Пагинация с сохранением высоты контейнера
- Автосохранение при уходе со страницы

**Приоритеты шагов:**
| Frontend | Backend | Цвет |
|----------|---------|------|
| critical | critical | Красный |
| desirable | important | Оранжевый |
| attention | attention | Жёлтый |
| optional | optional | Серый |

**Оценка времени:**
| Frontend | Backend | Описание |
|----------|---------|----------|
| 30min | half | 30 минут |
| 1h | one | 1 час |
| 2h | two | 2 часа |
| 3h | three | 3 часа |
| 4h | four | 4 часа |

### 4.4 Planning Module (Планирование)
**Путь:** `/app/planning`

**Функционал:**
- Недельный календарь с выбором дня
- Аккордеон по целям с шагами
- Drag & drop шагов между днями
- Двунаправленная синхронизация календарь ↔ блок целей
- Фильтры: текст, сфера
- Подгрузка шагов по API

**Синхронизация:**
- Перетаскивание шага → обновление даты в блоке целей
- Удаление из календаря → очистка даты
- Изменение приоритета → обновление цвета в календаре
- Чекбокс выполнения → синхронизация статуса

### 4.5 Journal Module (Дневник)
**Путь:** `/app/journal`

**Функционал:**
- Ежедневная рефлексия с 4 вопросами
- AI-ответы коуча (demo mode)
- Streak tracking (серии записей)
- Календарь истории
- Backend синхронизация с optimistic UI

**Вопросы дневника:**
1. Что сегодня получилось?
2. Что можно улучшить?
3. За что благодарен?
4. Планы на завтра?

### 4.6 AI Mentor (AI Ментор)
**Глобальный компонент:** `MentorPanel.vue`

**Функционал:**
- Доступен на всех `/app/*` страницах
- Desktop (≥1024px): фиксированная панель справа с toggle
- Mobile (<1024px): floating button → drawer overlay
- Контекстная помощь и анализ
- Demo mode с запланированной OpenAI интеграцией
- Quick prompts для быстрого старта

**Состояния:**
- `mentorPanelCollapsed` — свёрнутость на десктопе
- `mentorMobileOpen` — открытость drawer на мобильных

### 4.7 Onboarding (Онбординг)
**Компонент:** `OnboardingAI.vue`

**5 шагов:**
1. Приветствие и объяснение системы
2. Оценка сфер жизни (SSP)
3. AI анализ слабых мест
4. Автогенерация целей на основе анализа
5. Review и подтверждение целей (PlanReview)

**Логика:**
- `finish_onboarding` flag в backend
- После завершения — переход на Dashboard
- Goals Bank 3-step lesson для доработки целей

### 4.8 First Steps (Первые шаги)
**Компонент:** `FirstSteps.vue`

**7 шагов:**
1. Заполнить колесо жизни
2. Создать первую цель
3. Декомпозировать цель на шаги
4. Запланировать шаг на сегодня
5. Выполнить первый шаг
6. Написать в дневник
7. Настроить привычки

**Особенности:**
- Auto-completion triggers
- AI Mentor encouragement
- Прогресс сохраняется

### 4.9 Dashboard (День пользователя)
**Путь:** `/app`

**Виджеты:**
- Context-aware header (время суток, приветствие)
- Daily Progress Bar
- Focus of the Day (1-3 важных задачи)
- My Goals (топ-3 активных)
- Habit Tracker
- Journal widget (вечерняя рефлексия)
- XP Badge
- Streak Badge

**Layout:** 2-column grid

### 4.10 Learning Center (Обучение)
**Путь:** `/app/learning`

**Функционал:**
- Все tutorial материалы
- Progress tracking для уроков
- Пошаговые инструкции по модулям

---

## 5. Система маршрутизации

### 5.1 Публичные роуты
| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | Landing | Лендинг |
| `/auth/login` | Login | Вход |
| `/auth/register` | Register | Регистрация |
| `/auth/recovery` | Recovery | Восстановление |
| `/auth/logout` | — | Выход (redirect) |

### 5.2 Защищённые роуты (`requiresAuth: true`)
| Путь | Компонент |
|------|-----------|
| `/app` | Dashboard |
| `/app/ssp` | BalancedScorecard |
| `/app/goals` | Goals |
| `/app/goals/new` | GoalNew |
| `/app/goals/:id` | GoalEdit |
| `/app/goals-bank` | GoalsBank |
| `/app/planning` | Planning |
| `/app/journal` | JournalHistory |
| `/app/learning` | LearningCenter |
| `/app/achievements` | Profile |
| `/app/settings` | Settings |
| `/app/club` | Club |

### 5.3 Navigation Guards
```javascript
router.beforeEach(async (to, from, next) => {
  // 1. Обновить CSRF token
  // 2. Проверить авторизацию если requiresAuth
  // 3. Redirect неавторизованных на /auth/login
  // 4. Redirect авторизованных с guestOnly на /app
  // 5. Block navigation если mini-task не завершён
})
```

### 5.4 Редиректы для совместимости
Старые URL автоматически перенаправляются:
- `/login` → `/auth/login`
- `/ssp` → `/app/ssp`
- `/goals/:id` → `/app/goals/:id`

---

## 6. Управление состоянием

### 6.1 Stores

#### `app.js` — Основной store
**Размер:** ~3000 строк

**Секции:**
- Global Data (справочники из бэкенда)
- User State (профиль, настройки)
- Onboarding State
- SSP State (сферы, оценки)
- Goals State (цели, шаги)
- Journal State (записи, streak)
- Mentor State (сообщения, настройки)
- Habits State

**Ключевые computed:**
```javascript
shouldShowOnboarding  // Показать онбординг?
shouldShowMiniTask    // Показать mini-task?
todayScheduledTasks   // Задачи на сегодня (для Dashboard)
```

#### `xp.js` — XP и геймификация
**Состояние:**
- `xpBalance` — текущий баланс XP
- `lifetimeEarned` — всего заработано
- `xpHistory` — история начислений
- `wishlist` — список желаний (награды)
- `redeemedRewards` — полученные награды

**Методы:**
```javascript
awardXP(amount, source, metadata)  // Начислить XP
revokeXP(eventId)                  // Отменить начисление
spendXP(rewardId)                  // Потратить на награду
```

#### `toast.js` — Уведомления
```javascript
showToast(message, type, duration)
// types: 'success', 'error', 'info', 'warning'
```

### 6.2 Persistence
- localStorage для XP store
- Cookie-based auth session
- Backend sync для данных пользователя

---

## 7. API и бэкенд интеграция

### 7.1 API Service
**Файл:** `src/services/api.js`

**Базовые методы:**
```javascript
api.get(url)
api.post(url, data)
api.checkAuth()
api.login(email, password)
api.register(data)
api.logout()
```

**Domain-specific методы:**
```javascript
// SSP
getSSPData()
updateSSPData(spheres)

// Goals
getGoals(params)
createGoal(data)
updateGoal(id, data)
deleteGoal(id)
completeGoal(id)

// Steps
getGoalSteps(goalId, params)
createStep(goalId, data)
updateStep(stepId, data)
deleteStep(stepId)
toggleStepComplete(stepId)
scheduleStep(stepId, date)

// Journal
getDiaryEntries(params)
createDiaryEntry(data)
updateDiaryEntry(id, data)

// Onboarding
getOnboardingData()
updateOnboardingData(data)
```

### 7.2 API Endpoints
| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/rest/front/app/check/` | GET | Проверка авторизации |
| `/api/rest/front/app/global-data/` | GET | Справочники |
| `/api/rest/front/app/ssp/get/` | GET | Данные SSP |
| `/api/rest/front/app/ssp/update/` | POST | Обновить SSP |
| `/api/rest/front/app/goals/get/` | POST | Список целей |
| `/api/rest/front/app/goals/update/` | POST | CRUD целей |
| `/api/rest/front/app/goals/steps/get/` | POST | Шаги цели |
| `/api/rest/front/app/goals/steps/update/` | POST | CRUD шагов |
| `/api/rest/front/app/diary/get/` | POST | Записи дневника |
| `/api/rest/front/app/diary/update/` | POST | CRUD дневника |

### 7.3 Паттерны синхронизации
1. **Optimistic UI** — UI обновляется сразу, потом sync с backend
2. **Race Condition Prevention** — проверка ID перед применением response
3. **Pagination with Append** — `append` flag для подгрузки
4. **Batch Updates** — отправка только изменённых полей

---

## 8. UI/UX решения

### 8.1 Дизайн система
- **Тема:** Light/Dark с toggle
- **Цвета приоритетов:** Red → Orange → Yellow → Gray
- **Иконки:** Lucide Vue Next (линейный стиль)
- **Типографика:** System fonts

### 8.2 Компоненты интерфейса
- Collapsible Sidebar (280px → 72px)
- Аккордеоны для групп данных
- Модальные окна для редактирования
- Toast notifications
- Progress bars и badges

### 8.3 Guided Workflows
Все ключевые модули используют multi-step guided flow:
- SSP: 4 шага
- Goals Bank: 3 шага
- Onboarding: 5 шагов
- First Steps: 7 чекпоинтов

---

## 9. Мобильная адаптация

### 9.1 Breakpoints
| Breakpoint | Применение |
|------------|------------|
| 480px | FirstSteps vertical layout |
| 640px | PlanReview full-width modals |
| 768px | Primary mobile/desktop switch |
| 1024px | MentorPanel desktop/mobile switch |

### 9.2 Sidebar на мобильных
- Hamburger menu button
- Overlay при открытии
- Auto-close при смене роута
- Always expanded (never collapsed)

### 9.3 MentorPanel на мобильных
- Floating button (Bot icon) в правом нижнем углу
- Drawer overlay справа при нажатии
- Auto-close drawer при открытии Sidebar
- Auto-close drawer при смене роута

### 9.4 Адаптивные компоненты
- Dashboard: 1 колонка на мобильных
- Focus cards: вертикальный stack
- Quick prompts: stacked layout
- Modals: full-width below 640px

---

## 10. Геймификация и XP система

### 10.1 XP Economy
| Действие | XP |
|----------|-----|
| Привычка выполнена | +5 |
| Focus task выполнен | +10 |
| Запись в дневник | +10 |
| Шаг цели выполнен | +25 |
| Цель завершена | +150 |
| 7-дневный streak | +30 |
| 30-дневный streak | +100 |

### 10.2 Wishlist (Награды)
- Пользователь создаёт список желаний
- Каждой награде назначается стоимость в XP
- При накоплении XP — reward unlock
- Micro-feedback "+X XP" анимации

### 10.3 Profile Stats
- XP Balance (текущий)
- Lifetime Earned (всего)
- Habit Streak
- Journal Streak
- XP History Timeline

### 10.4 Хранение
- localStorage для persistence
- Отдельный Pinia store (`xp.js`)
- Revoke mechanism для отмены XP

---

## Приложения

### A. Маппинг категорий
```javascript
const categoryBackendToFrontend = {
  'welfare': 'wealth',
  'hobby': 'hobbies',
  'environment': 'friendship',
  'health_sport': 'health',
  'work': 'career',
  'family': 'love'
}
```

### B. Маппинг приоритетов
```javascript
const priorityBackendToFrontend = {
  'critical': 'critical',
  'important': 'desirable',  // Единственное отличие!
  'attention': 'attention',
  'optional': 'optional'
}
```

### C. Маппинг времени
```javascript
const timeDurationMap = {
  'half': '30min',
  'one': '1h',
  'two': '2h',
  'three': '3h',
  'four': '4h'
}
```

---

## Changelog

### Декабрь 2025
- Исправлен infinite onboarding loop
- Goals Bank backend sync
- Planning module step data fix
- Bidirectional calendar sync
- Global MentorPanel на всех страницах
- Mobile UI improvements
- XP/Gamification system

---

*Документация подготовлена для OnePercent MVP v1.0*
