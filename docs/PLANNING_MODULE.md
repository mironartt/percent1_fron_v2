# Модуль Планирования (/app/planning)

Техническая документация по странице недельного планирования.

---

## 1. Обзор

**Файл:** `src/views/Planning.vue`  
**Роут:** `/app/planning`  
**Название:** Планирование недели  
**Доступ:** Требует авторизации (`requiresAuth: true`)

Страница предоставляет интерфейс для планирования шагов целей на неделю с возможностью AI-автопланирования, управления приоритетами, временем и статусами выполнения.

### Используемый стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| Vue 3 | 3.x | Composition API, `<script setup>`, реактивность |
| Pinia | 2.x | State management (useAppStore, useAITasksStore, useXpStore) |
| Vue Router | 4.x | Навигация, query-параметры |
| Lucide Vue Next | — | Иконки (Calendar, Check, Filter, Sparkles и др.) |
| JavaScript ES2020+ | — | async/await, optional chaining, nullish coalescing |
| CSS3 (Scoped) | — | Flexbox, Grid, CSS Variables, анимации |
| WebSocket | — | AI-планирование через aiTasksStore |
| REST API | — | Django backend (getPlannedSteps, updateGoalSteps) |

---

## 2. Архитектура компонента

### 2.1 Зависимости

```javascript
// Stores
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import { useXpStore } from '@/stores/xp'

// Composables
import { useXPNotification } from '@/composables/useXPNotification.js'

// Router
import { useRouter, useRoute } from 'vue-router'

// Icons (Lucide Vue Next)
import { 
  Calendar, ChevronLeft, ChevronRight, ChevronDown, Check,
  CheckCircle, Clock, Plus, Target, Filter, Search, Flag,
  Trash2, AlertCircle, Sparkles, Zap, Brain, ListChecks,
  ListTodo, X, Square, CheckSquare, BarChart3, CalendarDays
} from 'lucide-vue-next'
```

### 2.2 Реактивные переменные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `weekOffset` | `ref(0)` | Смещение недели относительно текущей |
| `selectedDay` | `ref(null)` | Выбранный день (YYYY-MM-DD) |
| `filterSphere` | `ref('')` | Фильтр по сфере жизни |
| `filterStatus` | `ref('')` | Фильтр шагов: '' / 'scheduled' / 'unscheduled' |
| `queryFilter` | `ref('')` | Текстовый поиск целей |
| `currentPage` | `ref(1)` | Текущая страница пагинации |
| `expandedGoals` | `ref({})` | Развёрнутые цели {goalId: boolean} |
| `collapsedGoalGroups` | `ref({})` | Свёрнутые группы задач в таймлайне |
| `weeklyStepsData` | `ref([])` | Данные шагов недели от API |
| `overdueStepsData` | `ref([])` | Просроченные шаги |
| `showBottomSheet` | `ref(false)` | Показ нижней панели |
| `bottomSheetMode` | `ref('task')` | Режим: task/step/reschedule/priority/time/add |
| `selectedTask` | `ref(null)` | Выбранная задача для редактирования |
| `showAIPlannerModal` | `ref(false)` | Показ модалки AI-планирования |
| `aiPlannerStep` | `ref('intro')` | Шаг AI-планирования: intro/loading/result |
| `priorityGoalId` | `ref(null)` | ID приоритетной цели (из query ?first_goal_id=) |

### 2.3 Константы

```javascript
// Приоритеты (frontend → backend)
const priorityFrontendToBackend = {
  'critical': 'critical',
  'desirable': 'important', 
  'attention': 'attention',
  'optional': 'optional'
}

// Время (frontend → backend)  
const timeDurationFrontendToBackend = {
  '30min': 'half',
  '1h': 'one',
  '2h': 'two',
  '3h': 'three',
  '4h': 'four'
}

// Порядок сортировки по приоритету
const priorityOrder = {
  critical: 0, 
  important: 0, 
  desirable: 1, 
  attention: 2, 
  optional: 3, 
  '': 4
}
```

---

## 3. Структура страницы

### 3.1 Header

- Кнопки навигации (← / →) между неделями
- Заголовок "Планирование"
- Диапазон недели (например "23-29 дек")
- Кнопка "Сегодня" (если не текущая неделя)

### 3.2 Week Stats (Статистика недели)

Три чипа:
- **Шагов** — `weeklyTotalTasks` (общее количество)
- **Выполнено** — `weeklyCompletedTasks`
- **Всего** — `weeklyTotalTime` (сумма времени)

### 3.3 Week Bar (Панель дней)

Горизонтальная панель с 7 кнопками (Пн-Вс):
- Короткое название дня
- Число месяца
- Счётчик задач (если >0)
- Классы: `active`, `today`, `has-tasks`, `weekend`

### 3.4 Day Content (Содержимое дня)

#### Заголовок дня
- Полное название (`selectedDayTitle`)
- Общее время (`getTotalTimeForDay`)

#### Группы задач (по целям)
Computed: `selectedDayGroupedTasks`
- Сворачиваемый заголовок группы
- Счётчик выполнения (N/M)
- Время группы

#### Карточка задачи
- Priority stripe (цветная полоска)
- Чекбокс выполнения
- Название шага
- Название цели
- Бейджи: время, приоритет
- Click → открывает Bottom Sheet
- Long press → быстрые действия (touch)

### 3.5 Overdue Section (Просроченные)

Показывается если `isToday(selectedDay) && overdueTasks.length > 0`:
- Сворачиваемая группа
- Задачи с красным priority-critical
- Дата просрочки ("вчера", "2 дня назад" и т.д.)

### 3.6 Goals Section (Цели и шаги)

#### Filters Row
- Поиск (сворачиваемый, debounce 300ms, min 3 символа)
- Dropdown статуса шагов (Все / Незапл. / Запл.)
- Кнопка сброса фильтров
- Кнопка AI-планирования
- Счётчик "Найдено: N целей"

#### Баннер "Цели без шагов"
`goalsWithoutSteps` > 0:
- Предупреждение
- Список первых 3 целей с кнопкой перехода к декомпозиции
- Кнопка "Показать все"

#### Список целей (аккордеон)
- Заголовок: сфера + название + прогресс + chevron
- Раскрытие: сетка шагов
  - Карточка шага с чекбоксом
  - Бейджи: дата, время
  - Priority stripe
  - Пагинация шагов (если много)

#### Пагинация целей
- Номера страниц
- API: `store.loadGoalsFromBackend({ page, ... })`

---

## 4. Bottom Sheet

### 4.1 Режимы

| Mode | Описание |
|------|----------|
| `task` | Редактирование задачи из таймлайна |
| `step` | Планирование шага из списка целей |
| `reschedule` | Быстрый перенос на другой день |
| `priority` | Выбор приоритета |
| `time` | Выбор времени |
| `add` | Добавление шага на день |

### 4.2 Элементы управления

#### День (7 чипов + календарь)
```javascript
const next7Days = computed(() => { /* 7 дней от сегодня */ })
```
- Чипы с коротким названием и числом
- Кнопка календаря для произвольной даты

#### Приоритет
```javascript
const priorities = [
  { value: 'critical', label: 'Критично' },
  { value: 'desirable', label: 'Важно' },
  { value: 'attention', label: 'В поле внимания' },
  { value: 'optional', label: 'По возможности' },
  { value: '', label: 'Без приоритета' }
]
```

#### Время
```javascript
const timeOptions = [
  { value: '30min', label: '30 минут' },
  { value: '1h', label: '1 час' },
  { value: '2h', label: '2 часа' },
  { value: '3h', label: '3 часа' },
  { value: '4h', label: '4 часа' },
  { value: '', label: 'Без оценки' }
]
```

### 4.3 Буферизация изменений

Изменения сохраняются в буфер и отправляются только по кнопке "Сохранить":
```javascript
const pendingTaskChanges = ref({})
const originalTaskState = ref(null)
```

---

## 5. AI Планирование

### 5.1 Состояния модалки

1. **intro** — вступление с описанием
2. **loading** — ожидание результата
3. **result** — предпросмотр плана

### 5.2 Интеграция с AITasksStore

```javascript
const PLANNING_TASK_TYPE = 'week_planning_help'

async function startAIPlanning() {
  const context = {
    week_start: weekDays.value[0]?.date,
    week_end: weekDays.value[6]?.date,
    include_overdue: aiPlannerIncludeOverdue.value
  }
  
  const result = await aiTasksStore.startTaskAndWait(
    'week_planning_help', 
    context, 
    120000 // timeout
  )
  
  handleAIPlanningResult(result)
}
```

### 5.3 Формат результата от API

```javascript
{
  plan: [
    { stepId: 123, date: '2024-12-25', goal_id: 456, step_title: '...' }
  ],
  not_this_week: [...],
  summary: { ... },
  reasoning: '...'
}
```

### 5.4 Применение плана

```javascript
async function applyAIPlan() {
  const stepsData = tasksToApply.map(task => ({
    goal_id: task.goalId,
    step_id: task.stepId,
    dt: task.date,
    time_duration: backendTime // optional
  }))
  
  await updateGoalSteps({ goals_steps_data: stepsData })
  await loadWeeklySteps()
}
```

---

## 6. Интеграция с Backend

### 6.1 Загрузка данных недели

```javascript
async function loadWeeklySteps() {
  const { getPlannedSteps } = await import('@/services/api.js')
  const response = await getPlannedSteps({
    date_from: startDate,
    date_to: endDate
  })
  
  // Response structure:
  // {
  //   status: 'ok',
  //   data: {
  //     result_week_data: [{ date, steps_data: [...] }],
  //     overdue_steps_data: [...],
  //     total_overdue_steps: N
  //   }
  // }
}
```

### 6.2 Загрузка целей с фильтрами

```javascript
async function loadGoalsWithFilters() {
  const params = {
    with_steps_data: true,
    page: currentPage.value,
    status_filter: 'work',
    first_goal_id: priorityGoalId.value, // приоритетная цель
    query_filter: queryFilter.value,      // поиск (min 3 символа)
    steps_planning_filter: 'has_unplanned' // или 'all_planned'
  }
  
  await store.loadGoalsFromBackend(params)
}
```

### 6.3 Обновление шага

```javascript
async function toggleTaskComplete(task) {
  const { updateGoalSteps } = await import('@/services/api.js')
  
  await updateGoalSteps({
    goals_steps_data: [{
      goal_id: task.goalId,
      step_id: task.stepId,
      is_complete: newCompleted
    }]
  })
  
  // Начисление XP при выполнении
  if (newCompleted) {
    await xpStore.grantXP('step_complete', stepId)
    showStepCompletedXP()
  }
}
```

### 6.4 Планирование шага

```javascript
async function scheduleNewStep() {
  const { updateGoalSteps } = await import('@/services/api.js')
  
  await updateGoalSteps({
    goals_steps_data: [{
      goal_id: goalId,
      step_id: stepId,
      dt: newStepDay.value,
      priority: priorityFrontendToBackend[newStepPriority.value],
      time_duration: timeDurationFrontendToBackend[newStepTime.value]
    }]
  })
}
```

---

## 7. Реактивность и оптимизация

### 7.1 Триггеры обновления

```javascript
const localUpdateTrigger = ref(0)

// Computed зависит от триггера для ручного обновления
const selectedDayTasks = computed(() => {
  void localUpdateTrigger.value
  void weeklyStepsData.value
  return getTasksForDay(selectedDay.value)
})

// Принудительное обновление
localUpdateTrigger.value++
```

### 7.2 Watch-эффекты

```javascript
// Фильтр статуса → перезагрузка с бэкенда
watch(filterStatus, async () => {
  currentPage.value = 1
  await loadGoalsWithFilters()
})

// Текстовый поиск с debounce
watch(queryFilter, (newVal) => {
  if (newVal.length === 0 || newVal.length >= 3) {
    setTimeout(() => loadGoalsWithFilters(), 300)
  }
})

// Навигация по неделям
watch(weekOffset, () => loadWeeklySteps())
```

### 7.3 localStorage

```javascript
// Сохранение свёрнутых групп
collapsedGoalGroups.value = JSON.parse(
  localStorage.getItem('planning_collapsed_groups') || '{}'
)

// AI planner: пропуск intro
localStorage.setItem('ai_planner_skip_intro', 'true')

// Просмотренные AI результаты
localStorage.setItem('planning_ai_results_viewed', JSON.stringify([...]))
```

---

## 8. Touch-события

### 8.1 Long Press

```javascript
let touchTimer = null
const longPressDelay = 500

function handleTouchStart(task, event) {
  touchTimer = setTimeout(() => {
    openTaskActions(task)
  }, longPressDelay)
}

function handleTouchEnd() {
  clearTimeout(touchTimer)
}

function handleTouchMove() {
  clearTimeout(touchTimer)
}
```

---

## 9. Query параметры

| Параметр | Описание |
|----------|----------|
| `first_goal_id` | ID цели для приоритетного отображения вверху списка |

```javascript
// При монтировании
const routeGoalId = route.query.first_goal_id
if (routeGoalId) {
  priorityGoalId.value = routeGoalId
}
```

---

## 10. Lifecycle

```javascript
onMounted(async () => {
  // 1. Захват приоритетной цели из query
  if (route.query.first_goal_id) {
    priorityGoalId.value = route.query.first_goal_id
  }
  
  // 2. Инициализация выбранного дня
  initSelectedDay()
  
  // 3. Загрузка данных
  await Promise.all([
    loadWeeklySteps(),
    reloadGoalsWithPriority()
  ])
  
  // 4. Загрузка просроченных
  await loadOverdueSteps()
})

onUnmounted(() => {
  // Отключение observer для infinite scroll
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
})
```

---

## 11. Связанные компоненты

| Компонент | Связь |
|-----------|-------|
| `GoalEdit.vue` | Редактирование цели и шагов |
| `GoalsBank.vue` | Банк целей (источник данных) |
| `Dashboard.vue` | Отображение задач на сегодня |

---

## 12. Стили

~4600 строк scoped CSS включая:
- Mobile-first responsive design
- Priority stripes (цветовая индикация)
- Анимации переходов
- Dark/light theme support (через CSS variables)
- Bottom sheet с drag handle
- Week bar с горизонтальным скроллом

---

## 13. Известные нюансы

1. **Приоритетная цель** — сохраняется в `priorityGoalId` на всю сессию для консистентного порядка при редактировании шагов

2. **Маппинг ID** — использует `backendId || id` для совместимости локальных и серверных данных

3. **Optimistic UI** — чекбокс выполнения обновляется мгновенно, затем синхронизируется с бэкендом

4. **AI-результаты** — кэшируются в `aiTasksStore` и отображаются при повторном открытии модалки

5. **Просроченные задачи** — показываются только при просмотре "Сегодня"

6. **Пагинация шагов** — работает внутри развёрнутой карточки цели, не сбрасывается при сворачивании
