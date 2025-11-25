# Техническая документация OnePercent MVP

## Архитектура приложения

### Общая структура

```
OnePercent MVP
│
├── Frontend (Vue 3 + Vite)
│   ├── Компоненты (Components)
│   ├── Страницы (Views)
│   ├── Состояние (Stores - Pinia)
│   └── Маршрутизация (Vue Router)
│
└── Хранение (LocalStorage)
    ├── Данные ССП
    ├── Цели и шаги
    ├── Задачи
    └── Планы недель
```

### Выбор технологий

#### Vue 3 Composition API
**Почему:**
- Более простая организация логики
- Лучшая типизация
- Переиспользование кода через composables
- Меньший размер бандла

#### Pinia (State Management)
**Почему:**
- Официальная рекомендация Vue Team
- Простой API
- Отличная интеграция с Vue DevTools
- TypeScript из коробки
- Модульная архитектура

#### Vite (Build Tool)
**Почему:**
- Мгновенный запуск dev-сервера
- Быстрый Hot Module Replacement (HMR)
- Оптимизированная сборка
- Нативная поддержка ES modules

#### LocalStorage
**Почему для MVP:**
- Не требует backend
- Мгновенное сохранение
- Работает offline
- Простая реализация

**Ограничения:**
- Лимит ~5-10MB
- Нет синхронизации между устройствами
- Данные только в браузере

---

## Структура stores (Pinia)

### 1. SSP Store (`stores/ssp.js`)

**Состояние:**
```javascript
{
  lifeSpheres: [
    {
      id: 'health',
      name: 'Здоровье',
      icon: '💪',
      rating: 0-10,
      description: '',
      goals: [],
      notes: ''
    },
    // ... остальные сферы
  ]
}
```

**Computed:**
- `averageRating` - средняя оценка по всем сферам
- `balanceScore` - показатель баланса (низкая вариация = хороший баланс)
- `lowestRatedSphere` - сфера требующая внимания
- `highestRatedSphere` - сильная сторона

**Actions:**
- `updateRating(sphereId, rating)` - обновление оценки
- `updateNotes(sphereId, notes)` - сохранение заметок
- `saveToLocalStorage()` - персистентность
- `loadFromLocalStorage()` - восстановление

**Формула баланса:**
```javascript
// Стандартное отклонение от среднего
variance = ratings.reduce((sum, rating) => 
  sum + Math.pow(rating - avg, 2), 0) / ratings.length

stdDev = Math.sqrt(variance)

// Чем меньше отклонение, тем лучше баланс
balanceScore = Math.max(0, 100 - (stdDev * 10))
```

---

### 2. Goals Store (`stores/goals.js`)

**Состояние:**
```javascript
{
  goals: [
    {
      id: 'unique_id',
      title: 'Название цели',
      description: 'Описание',
      category: 'health|career|finance...',
      mvp: 'Минимальный результат',
      why: 'Почему важно',
      deadline: '2024-12-31',
      steps: [
        {
          id: 'step_id',
          title: 'Название шага',
          description: 'Детали',
          completed: false
        }
      ],
      progress: 0-100,
      status: 'active|completed',
      createdAt: 'ISO date',
      updatedAt: 'ISO date'
    }
  ]
}
```

**Computed:**
- `activeGoals` - активные цели
- `completedGoals` - завершённые
- `goalsByCategory` - группировка по категориям
- `totalProgress` - средний прогресс

**Actions:**
- `addGoal(goal)` - создание новой цели
- `updateGoal(goalId, updates)` - обновление
- `deleteGoal(goalId)` - удаление
- `addStep(goalId, step)` - добавление шага
- `toggleStep(goalId, stepId)` - переключение статуса шага
- `updateProgress(goalId)` - пересчёт прогресса
- `completeGoal(goalId)` - завершение цели

**Расчёт прогресса:**
```javascript
// Автоматический на основе шагов
progress = (completedSteps / totalSteps) * 100

// При 100% - автоматическое завершение
if (progress === 100) {
  goal.status = 'completed'
}
```

---

### 3. Planner Store (`stores/planner.js`)

**Состояние:**
```javascript
{
  tasks: [
    {
      id: 'unique_id',
      title: 'Название задачи',
      description: 'Описание',
      date: '2024-01-15',
      priority: 'high|medium|low',
      category: 'general',
      goalId: 'связанная_цель',
      completed: false,
      energy: 'high|medium|low',
      timeBlock: 'morning|afternoon|evening',
      createdAt: 'ISO date'
    }
  ],
  weeks: [
    {
      id: 'week_start_date',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      goals: [
        {
          id: 'goal_id',
          title: 'Цель недели',
          completed: false
        }
      ],
      focus: 'Главный фокус',
      reflection: 'Итоги'
    }
  ]
}
```

**Computed:**
- `todayTasks` - задачи сегодня
- `completedTodayTasks` - завершённые сегодня
- `upcomingTasks` - будущие задачи
- `overdueTasks` - просроченные
- `currentWeek` - текущая неделя (авто-создание)
- `weeklyProgress` - прогресс недельных целей

**Actions:**
- `addTask(task)` - создание задачи
- `updateTask(taskId, updates)` - обновление
- `toggleTask(taskId)` - переключение статуса
- `deleteTask(taskId)` - удаление
- `createWeek(startDate)` - создание недели
- `updateWeek(weekId, updates)` - обновление недели
- `addWeeklyGoal(weekId, goal)` - цель на неделю
- `getTasksByDate(date)` - задачи по дате

**Логика текущей недели:**
```javascript
// Понедельник как начало недели
const weekStart = new Date()
weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)

// Автоматическое создание если нет
if (!weeks.find(w => w.id === weekId)) {
  createWeek(weekStart)
}
```

---

## Компоненты

### Страницы (Views)

#### Dashboard.vue
**Функциональность:**
- Агрегированная статистика
- Быстрый доступ к модулям
- Задачи на сегодня
- Недельные цели
- Мотивационный блок

**Данные:**
- Данные из всех stores
- Вычисления в реальном времени

#### SSP.vue
**Функциональность:**
- Оценка сфер (слайдеры)
- Визуализация баланса
- Заметки по сферам
- Инсайты и рекомендации

**Интерактивность:**
- Range inputs для оценки
- Expandable заметки
- Динамические графики

#### Goals.vue
**Функциональность:**
- CRUD операции с целями
- Декомпозиция на шаги
- Отслеживание прогресса
- Фильтрация (активные/завершённые)

**Модальные окна:**
- Создание/редактирование цели
- Добавление шага

#### Planner.vue
**Функциональность:**
- Переключение день/неделя
- Создание задач с приоритетами
- Утренний фокус / вечерняя рефлексия
- Недельное планирование

**Виды:**
- Day view - детальное планирование дня
- Week view - обзор недели и цели

### Компоненты (Components)

#### TaskItem.vue
**Props:**
```javascript
{
  task: Object // объект задачи
}
```

**Events:**
```javascript
{
  toggle: () => void,  // переключение статуса
  edit: () => void,    // редактирование
  delete: () => void   // удаление
}
```

**Особенности:**
- Checkbox с кастомным стилем
- Badges приоритетов
- Hover действия
- Адаптивность

---

## Дизайн-система

### Цветовая палитра

```css
:root {
  --primary-color: #4F46E5;     /* Indigo */
  --secondary-color: #10B981;    /* Green */
  --accent-color: #F59E0B;       /* Amber */
  --danger-color: #EF4444;       /* Red */
  --text-primary: #1F2937;       /* Gray 800 */
  --text-secondary: #6B7280;     /* Gray 500 */
  --bg-primary: #FFFFFF;         /* White */
  --bg-secondary: #F9FAFB;       /* Gray 50 */
  --bg-accent: #F3F4F6;          /* Gray 100 */
  --border-color: #E5E7EB;       /* Gray 200 */
}
```

### Типографика

**Шрифты:**
- System fonts для оптимальной загрузки
- `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`

**Размеры:**
- h1: 2.5rem (40px)
- h2: 2rem (32px)
- h3: 1.5rem (24px)
- body: 1rem (16px)
- small: 0.875rem (14px)

### Spacing

**Система 8px:**
- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Border Radius

```css
--radius-sm: 6px;   /* Buttons, inputs */
--radius-md: 12px;  /* Cards */
--radius-lg: 16px;  /* Modals */
```

---

## Оптимизация и производительность

### Code Splitting

Vue Router автоматически разделяет страницы:
```javascript
const Dashboard = () => import('@/views/Dashboard.vue')
```

### Lazy Loading

Компоненты загружаются по требованию:
```javascript
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

### LocalStorage Optimization

**Debounce для сохранения:**
```javascript
// Сохраняем не сразу, а с задержкой
const debouncedSave = debounce(() => {
  localStorage.setItem(key, value)
}, 500)
```

**Compression (будущее улучшение):**
```javascript
// Сжатие данных для экономии места
import pako from 'pako'
const compressed = pako.deflate(JSON.stringify(data))
```

### Мемоизация

Вычисляемые свойства автоматически кэшируются:
```javascript
const averageRating = computed(() => {
  // Пересчитывается только при изменении lifeSpheres
  return calculateAverage(lifeSpheres.value)
})
```

---

## Будущие улучшения

### Backend интеграция

**API Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/user/profile
PUT    /api/user/profile

GET    /api/ssp
PUT    /api/ssp/:sphereId

GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/weeks/:weekId
PUT    /api/weeks/:weekId
```

### Синхронизация Telegram

**WebSocket или Polling:**
```javascript
// Синхронизация с Telegram ботом
const telegramSync = {
  sendDailyReminder() {
    // Отправка напоминания через бота
  },
  receiveUpdate(data) {
    // Получение обновлений от бота
    updateStore(data)
  }
}
```

### Аналитика

```javascript
// Трекинг метрик
const analytics = {
  trackGoalCreated(goal) {
    // Аналитика создания целей
  },
  trackTaskCompleted(task) {
    // Аналитика выполнения задач
  },
  generateWeeklyReport() {
    // Отчёт за неделю
  }
}
```

### PWA (Progressive Web App)

```javascript
// Service Worker для offline работы
// manifest.json для установки как приложение
// Push notifications
```

---

## Тестирование

### Unit Tests (Vitest)

```javascript
describe('SSP Store', () => {
  it('calculates average rating correctly', () => {
    const store = useSSPStore()
    store.updateRating('health', 8)
    store.updateRating('career', 6)
    expect(store.averageRating).toBe('7.0')
  })
})
```

### E2E Tests (Playwright/Cypress)

```javascript
describe('Goal Creation Flow', () => {
  it('creates a new goal successfully', () => {
    cy.visit('/goals')
    cy.get('[data-test="create-goal"]').click()
    cy.get('[data-test="goal-title"]').type('Test Goal')
    cy.get('[data-test="save-goal"]').click()
    cy.contains('Test Goal').should('be.visible')
  })
})
```

---

## Деплой

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Результат в dist/
```

### Deploy на Vercel/Netlify
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### Docker (опционально)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## Мониторинг

### Метрики производительности

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Error Tracking

```javascript
// Sentry integration
import * as Sentry from "@sentry/vue"

Sentry.init({
  app,
  dsn: "YOUR_DSN",
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
  ],
})
```

---

## Контрибьюция

### Code Style

- ESLint + Prettier
- Vue 3 Style Guide
- Composition API
- TypeScript (future)

### Git Workflow

```
feature/название-фичи
bugfix/название-бага
hotfix/критический-фикс
```

### Commit Convention

```
feat: добавлена новая функция
fix: исправлена ошибка
docs: обновлена документация
style: форматирование кода
refactor: рефакторинг
test: добавлены тесты
chore: обновление зависимостей
```

---

## Контакты разработчиков

**Email:** dev@onepercent.ru
**GitHub:** github.com/onepercent-mvp
**Документация:** docs.onepercent.ru
