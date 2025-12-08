# Habits Analytics API - Документация для Frontend

## Обзор

API `/api/rest/front/app/habits/analytics/get/` предоставляет расширенные данные аналитики для отображения трех блоков:
1. **Основной экран аналитики** - общие метрики
2. **Модальное окно "Статистика выполнения"** - детальная статистика за недели
3. **Модальное окно "Годовой календарь"** - годовой heatmap и статистика по месяцам

## Endpoint

```
POST /api/rest/front/app/habits/analytics/get/
```

## Request

```json
{
  "date_from": "2024-11-06",  // опционально, по умолчанию 30 дней назад
  "date_to": "2024-12-06"     // опционально, по умолчанию сегодня
}
```

## Response Structure

```json
{
  "status": "ok",
  "data": {
    // === ОСНОВНЫЕ ДАННЫЕ (для главного экрана) ===
    "completion_rate_7": 68,         // % выполнения за 7 дней
    "completion_rate_30": 64,        // % выполнения за 30 дней
    "current_streak": 5,             // Текущая серия дней (все привычки)
    "total_completions": 95,         // Всего выполнений
    "week_xp": 255,                  // XP за текущую неделю
    "habits_data": [...],            // Аналитика по каждой привычке

    // === ДАННЫЕ ДЛЯ МОДАЛЬНОГО ОКНА "ВЫПОЛНЕНИЕ" ===
    "weekly_trend": [50, 60, 70, 75, 80, 85, 90, 92],  // % за 8 недель (от старых к новым)
    "best_week_rate": 92,                               // Лучшая неделя (%)
    "worst_habit_name": "Ранний подъём",                // Привычка для улучшения
    "worst_habit_rate": 45,                             // % худшей привычки

    // === ДАННЫЕ ДЛЯ МОДАЛЬНОГО ОКНА "ГОДОВОЙ КАЛЕНДАРЬ" ===
    "year_completions": 450,                            // Всего выполнений за год
    "year_active_days": 120,                            // Дней с активностью
    "best_month_name": "January",                       // Лучший месяц
    "best_month_rate": 95,                              // % лучшего месяца
    "calendar_data": {                                  // Heatmap данные
      "2025-01-15": 3,
      "2025-01-16": 5,
      "2025-01-17": 2
    },
    "monthly_stats": [...]                              // Статистика по месяцам
  }
}
```

## Детальное описание полей

### 1. Основные данные (для главного экрана)

#### `completion_rate_7` (integer, 0-100)
Общий процент выполнения всех привычек за последние 7 дней.

**Расчёт:**
- Берутся все запланированные привычки за 7 дней
- Считается процент выполненных (status='completed') от запланированных

**Пример использования:**
```vue
<div class="stat-card">
  <div class="stat-value">{{ data.completion_rate_7 }}%</div>
  <div class="stat-label">За 7 дней</div>
</div>
```

#### `completion_rate_30` (integer, 0-100)
Общий процент выполнения всех привычек за последние 30 дней.

**Пример использования:**
```vue
<div class="stat-card">
  <div class="stat-value">{{ data.completion_rate_30 }}%</div>
  <div class="stat-label">За 30 дней</div>
</div>
```

#### `current_streak` (integer, ≥0)
Текущая серия дней подряд, когда выполнены ВСЕ запланированные привычки.

**Важно:**
- Считается только полное выполнение всех привычек дня
- Если хоть одна привычка пропущена - серия обнуляется
- Уважительные пропуски (excused) и амнистированные дни не ломают серию

**Пример использования:**
```vue
<div class="streak-badge">
  <span class="fire-icon">🔥</span>
  <span class="streak-count">{{ data.current_streak }}</span>
  <span class="streak-label">дней подряд</span>
</div>
```

#### `total_completions` (integer, ≥0)
Общее количество выполненных привычек за всё время.

#### `week_xp` (integer, ≥0)
Заработано XP за текущую неделю (пн-вс).

#### `habits_data` (array)
Массив объектов с аналитикой по каждой привычке.

**Структура объекта:**
```json
{
  "habit_id": 1,
  "name": "Зарядка 10 мин",
  "icon": "fire",
  "completion_rate_7": 85,    // % за 7 дней
  "completion_rate_30": 78,   // % за 30 дней
  "streak": 5,                // Серия дней для этой привычки
  "total_completions": 25,    // Всего выполнений этой привычки
  "completion_history": [     // История за последние 30 дней
    {
      "date": "2024-11-07",
      "status": "completed"   // completed | missed | excused | amnestied | not_scheduled
    },
    {
      "date": "2024-11-08",
      "status": "missed"
    },
    // ... 28 дополнительных дней
  ]
}
```

**Поля completion_history:**
- `date` (string) - дата в формате YYYY-MM-DD
- `status` (string) - статус дня:
  - `completed` - привычка выполнена
  - `missed` - привычка пропущена
  - `excused` - пропущена по уважительной причине
  - `amnestied` - использована амнистия на этот день
  - `not_scheduled` - привычка не была запланирована на этот день

**Пример использования (базовый):**
```vue
<div v-for="habit in data.habits_data" :key="habit.habit_id">
  <div class="habit-analytics">
    <span>{{ habit.name }}</span>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{width: habit.completion_rate_30 + '%'}"
      ></div>
    </div>
    <span>{{ habit.completion_rate_30 }}%</span>
  </div>
</div>
```

**Пример использования (с историей выполнений):**
```vue
<template>
  <div class="habit-details">
    <h3>{{ habit.name }}</h3>

    <!-- Основная статистика -->
    <div class="stats">
      <span>7 дней: {{ habit.completion_rate_7 }}%</span>
      <span>30 дней: {{ habit.completion_rate_30 }}%</span>
      <span>Серия: {{ habit.streak }}</span>
    </div>

    <!-- История за 30 дней -->
    <div class="completion-history">
      <div
        v-for="day in habit.completion_history"
        :key="day.date"
        class="history-day"
        :class="getStatusClass(day.status)"
        :title="`${day.date}: ${getStatusLabel(day.status)}`"
      >
      </div>
    </div>
  </div>
</template>

<script setup>
const getStatusClass = (status) => {
  const classes = {
    'completed': 'status-completed',
    'missed': 'status-missed',
    'excused': 'status-excused',
    'amnestied': 'status-amnestied',
    'not_scheduled': 'status-not-scheduled'
  }
  return classes[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    'completed': 'Выполнена',
    'missed': 'Пропущена',
    'excused': 'Уважительная причина',
    'amnestied': 'Амнистия',
    'not_scheduled': 'Не запланирована'
  }
  return labels[status] || status
}
</script>

<style scoped>
.completion-history {
  display: flex;
  gap: 2px;
}

.history-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.status-completed { background: #10b981; }
.status-missed { background: #ef4444; }
.status-excused { background: #f59e0b; }
.status-amnestied { background: #8b5cf6; }
.status-not-scheduled { background: #e5e7eb; }
</style>
```

---

### 2. Данные для модального окна "Статистика выполнения"

#### `weekly_trend` (array of integers)
Массив из 8 чисел - процент выполнения по неделям от старых к новым.

**Структура:** `[week-7, week-6, ..., week-1, current_week]`

**Пример:** `[50, 60, 70, 75, 80, 85, 90, 92]`
- 50% - 7 недель назад
- 92% - текущая неделя

**Использование для графика:**
```vue
<template>
  <LineChart :data="chartData" />
</template>

<script setup>
import { computed } from 'vue'

const chartData = computed(() => ({
  labels: ['7 нед', '6 нед', '5 нед', '4 нед', '3 нед', '2 нед', '1 нед', 'Сейчас'],
  datasets: [{
    label: 'Выполнение (%)',
    data: props.analyticsData.weekly_trend,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  }]
}))
</script>
```

#### `best_week_rate` (integer, 0-100)
Процент выполнения в лучшую неделю из последних 8.

**Пример использования:**
```vue
<div class="best-week-card">
  <div class="icon">🏆</div>
  <div class="label">Лучшая неделя</div>
  <div class="value">{{ data.best_week_rate }}%</div>
</div>
```

#### `worst_habit_name` (string, nullable)
Название привычки с наименьшим процентом выполнения за 30 дней.

**Возможные значения:**
- `"Ранний подъём"` - название привычки
- `null` - если нет привычек

#### `worst_habit_rate` (integer, 0-100)
Процент выполнения худшей привычки.

**Пример использования:**
```vue
<div class="improvement-card">
  <div class="label">Нужно улучшить</div>
  <div v-if="data.worst_habit_name" class="habit-info">
    <span class="habit-name">{{ data.worst_habit_name }}</span>
    <span class="habit-rate">{{ data.worst_habit_rate }}%</span>
  </div>
  <div v-else class="no-data">Нет данных</div>
</div>
```

**Полный пример модального окна "Выполнение":**
```vue
<template>
  <div class="completion-modal">
    <!-- Основная статистика -->
    <div class="stats-grid">
      <StatCard
        label="За 7 дней"
        :value="data.completion_rate_7 + '%'"
      />
      <StatCard
        label="За 30 дней"
        :value="data.completion_rate_30 + '%'"
      />
      <StatCard
        label="Дней подряд"
        :value="data.current_streak"
        icon="🔥"
      />
    </div>

    <!-- График тренда -->
    <div class="trend-chart">
      <h3>Тренд за 8 недель</h3>
      <LineChart :weekly-trend="data.weekly_trend" />
    </div>

    <!-- Привычки за 30 дней -->
    <div class="habits-list">
      <h3>По привычкам за 30 дней</h3>
      <HabitProgress
        v-for="habit in data.habits_data"
        :key="habit.habit_id"
        :habit="habit"
      />
    </div>

    <!-- Дополнительная статистика -->
    <div class="additional-stats">
      <div class="best-week">
        <span>Лучшая неделя</span>
        <strong>{{ data.best_week_rate }}%</strong>
      </div>
      <div v-if="data.worst_habit_name" class="worst-habit">
        <span>Нужно улучшить</span>
        <strong>{{ data.worst_habit_name }} ({{ data.worst_habit_rate }}%)</strong>
      </div>
    </div>
  </div>
</template>
```

---

### 3. Данные для модального окна "Годовой календарь"

#### `year_completions` (integer, ≥0)
Общее количество выполненных привычек за текущий год.

**Пример:**
```vue
<div class="year-stat">
  <div class="stat-value">{{ data.year_completions }}</div>
  <div class="stat-label">выполнений за год</div>
</div>
```

#### `year_active_days` (integer, ≥0)
Количество дней в году, когда была выполнена хотя бы одна привычка.

**Отличие от year_completions:**
- `year_completions` - всего выполнений (может быть 450)
- `year_active_days` - дней с активностью (например, 120)

**Пример:**
```vue
<div class="year-stat">
  <div class="stat-value">{{ data.year_active_days }}</div>
  <div class="stat-label">активных дней</div>
</div>
```

#### `best_month_name` (string, nullable)
Название месяца с наибольшим процентом выполнения.

**Возможные значения:**
- `"January"`, `"February"`, ..., `"December"` - на английском
- `null` - если нет данных

**Важно:** Название на английском, локализацию делать на фронте.

#### `best_month_rate` (integer, 0-100)
Процент выполнения в лучший месяц.

**Пример:**
```vue
<div class="best-month">
  <span>{{ translateMonth(data.best_month_name) }} — лучший месяц</span>
  <strong>{{ data.best_month_rate }}%</strong>
</div>
```

#### `calendar_data` (object)
Объект с данными для heatmap календаря. Ключ - дата в формате `YYYY-MM-DD`, значение - количество выполненных привычек.

**Структура:**
```json
{
  "2025-01-15": 3,  // 15 января выполнено 3 привычки
  "2025-01-16": 5,  // 16 января выполнено 5 привычек
  "2025-01-17": 2,  // 17 января выполнено 2 привычки
  // дни без активности не включены в объект
}
```

**Важно:**
- Дни БЕЗ выполнений НЕ включены в объект
- Если даты нет в объекте - значит выполнений не было
- Количество = сколько разных привычек выполнено в этот день

**Использование для heatmap:**
```vue
<template>
  <div class="calendar-heatmap">
    <div
      v-for="date in yearDates"
      :key="date"
      class="day-cell"
      :class="getIntensityClass(date)"
      :title="`${date}: ${getCompletions(date)} выполнений`"
    >
    </div>
  </div>
</template>

<script setup>
const getCompletions = (date) => {
  return props.calendarData[date] || 0
}

const getIntensityClass = (date) => {
  const count = getCompletions(date)
  if (count === 0) return 'intensity-0'
  if (count === 1) return 'intensity-1'
  if (count === 2) return 'intensity-2'
  if (count <= 4) return 'intensity-3'
  return 'intensity-4'
}
</script>

<style scoped>
.intensity-0 { background: #ebedf0; }
.intensity-1 { background: #9be9a8; }
.intensity-2 { background: #40c463; }
.intensity-3 { background: #30a14e; }
.intensity-4 { background: #216e39; }
</style>
```

#### `monthly_stats` (array)
Массив с 12 объектами - статистика по каждому месяцу года.

**Структура объекта:**
```json
{
  "month": 1,                    // Номер месяца (1-12)
  "month_name": "January",       // Название (английский)
  "completion_rate": 85,         // Процент выполнения
  "completed": 42,               // Выполнено привычек
  "scheduled": 50                // Запланировано привычек
}
```

**Пример массива:**
```json
[
  {
    "month": 1,
    "month_name": "January",
    "completion_rate": 85,
    "completed": 42,
    "scheduled": 50
  },
  {
    "month": 2,
    "month_name": "February",
    "completion_rate": 78,
    "completed": 35,
    "scheduled": 45
  },
  // ... до декабря
  {
    "month": 12,
    "month_name": "December",
    "completion_rate": 64,
    "completed": 20,
    "scheduled": 31
  }
]
```

**Использование:**
```vue
<template>
  <div class="monthly-stats">
    <div
      v-for="month in data.monthly_stats"
      :key="month.month"
      class="month-card"
    >
      <div class="month-name">{{ translateMonth(month.month_name) }}</div>
      <div class="month-progress">
        <div
          class="progress-bar"
          :style="{width: month.completion_rate + '%'}"
        ></div>
      </div>
      <div class="month-stats">
        <span>{{ month.completion_rate }}%</span>
        <span class="count">{{ month.completed }}/{{ month.scheduled }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const monthTranslations = {
  'January': 'Январь',
  'February': 'Февраль',
  'March': 'Март',
  'April': 'Апрель',
  'May': 'Май',
  'June': 'Июнь',
  'July': 'Июль',
  'August': 'Август',
  'September': 'Сентябрь',
  'October': 'Октябрь',
  'November': 'Ноябрь',
  'December': 'Декабрь'
}

const translateMonth = (monthName) => {
  return monthTranslations[monthName] || monthName
}
</script>
```

**Полный пример модального окна "Годовой календарь":**
```vue
<template>
  <div class="year-calendar-modal">
    <!-- Годовая статистика -->
    <div class="year-summary">
      <StatCard
        :value="data.year_completions"
        label="выполнений за год"
      />
      <StatCard
        :value="data.year_active_days"
        label="активных дней"
      />
      <div v-if="data.best_month_name" class="best-month">
        <span>{{ translateMonth(data.best_month_name) }} — лучший месяц</span>
        <strong>{{ data.best_month_rate }}%</strong>
      </div>
    </div>

    <!-- Календарь-heatmap -->
    <div class="calendar-heatmap">
      <h3>Календарь активности</h3>
      <CalendarHeatmap :calendar-data="data.calendar_data" />
    </div>

    <!-- Статистика по месяцам -->
    <div class="monthly-breakdown">
      <h3>По месяцам</h3>
      <div class="months-grid">
        <MonthCard
          v-for="month in data.monthly_stats"
          :key="month.month"
          :month="month"
        />
      </div>
    </div>
  </div>
</template>
```

---

## Примеры полных ответов API

### Минимальный ответ (нет привычек)
```json
{
  "status": "ok",
  "data": {
    "completion_rate_7": 0,
    "completion_rate_30": 0,
    "current_streak": 0,
    "total_completions": 0,
    "week_xp": 0,
    "habits_data": [],
    "weekly_trend": [0, 0, 0, 0, 0, 0, 0, 0],
    "best_week_rate": 0,
    "worst_habit_name": null,
    "worst_habit_rate": 100,
    "year_completions": 0,
    "year_active_days": 0,
    "best_month_name": null,
    "best_month_rate": 0,
    "calendar_data": {},
    "monthly_stats": [
      {"month": 1, "month_name": "January", "completion_rate": 0, "completed": 0, "scheduled": 0},
      // ... остальные месяцы
    ]
  }
}
```

### Типичный ответ (с данными)
```json
{
  "status": "ok",
  "data": {
    "completion_rate_7": 68,
    "completion_rate_30": 64,
    "current_streak": 3,
    "total_completions": 95,
    "week_xp": 255,
    "habits_data": [
      {
        "habit_id": 1,
        "name": "Тренировка в зале",
        "icon": "fire",
        "completion_rate_7": 67,
        "completion_rate_30": 54,
        "streak": 2,
        "total_completions": 7
      },
      {
        "habit_id": 2,
        "name": "Прогулка 30 минут",
        "icon": "fire",
        "completion_rate_7": 86,
        "completion_rate_30": 73,
        "streak": 6,
        "total_completions": 22
      }
    ],
    "weekly_trend": [50, 55, 60, 65, 68, 70, 72, 68],
    "best_week_rate": 72,
    "worst_habit_name": "Тренировка в зале",
    "worst_habit_rate": 54,
    "year_completions": 450,
    "year_active_days": 120,
    "best_month_name": "November",
    "best_month_rate": 78,
    "calendar_data": {
      "2025-01-15": 3,
      "2025-01-16": 5,
      "2025-01-17": 2,
      "2025-02-10": 4,
      "2025-02-11": 3
    },
    "monthly_stats": [
      {
        "month": 1,
        "month_name": "January",
        "completion_rate": 85,
        "completed": 42,
        "scheduled": 50
      },
      {
        "month": 2,
        "month_name": "February",
        "completion_rate": 78,
        "completed": 35,
        "scheduled": 45
      }
      // ... остальные месяцы
    ]
  }
}
```

---

## Mapping данных на UI блоки

### Блок 1: Основной экран аналитики (верхние карточки)

**Карточка "Выполнение":**
- Основное значение: `completion_rate_7` или `completion_rate_30`
- При клике открывает модальное окно "Статистика выполнения"

**Карточка "Календарь - последние 4 недели":**
- Визуализация: последние 28 дней из `calendar_data`
- При клике открывает модальное окно "Годовой календарь"

**Карточка "Достижения":**
- Данные из отдельного API `/api/rest/front/app/habits/achievements/get/`

---

### Блок 2: Модальное окно "Статистика выполнения"

Используемые поля:
- `completion_rate_7` - процент за 7 дней
- `completion_rate_30` - процент за 30 дней
- `current_streak` - дней подряд
- `weekly_trend` - график тренда за 8 недель
- `habits_data` - список привычек с % выполнения
- `best_week_rate` - лучшая неделя
- `worst_habit_name`, `worst_habit_rate` - что улучшить

---

### Блок 3: Модальное окно "Годовой календарь"

Используемые поля:
- `year_completions` - всего выполнений
- `year_active_days` - активных дней
- `best_month_name`, `best_month_rate` - лучший месяц
- `calendar_data` - heatmap за год
- `monthly_stats` - детализация по месяцам

---

## Локализация

**Месяцы** приходят на английском, нужна локализация на фронте:

```javascript
const MONTH_NAMES_RU = {
  'January': 'Январь',
  'February': 'Февраль',
  'March': 'Март',
  'April': 'Апрель',
  'May': 'Май',
  'June': 'Июнь',
  'July': 'Июль',
  'August': 'Август',
  'September': 'Сентябрь',
  'October': 'Октябрь',
  'November': 'Ноябрь',
  'December': 'Декабрь'
}
```

---

## Обработка ошибок

**Возможные ошибки:**
```json
{
  "status": "error",
  "error_code": "habit_not_found",
  "error_message": "Привычка не найдена"
}
```

**Проверка перед использованием:**
```javascript
if (response.status === 'ok' && response.data) {
  // Используем данные
  const analytics = response.data
} else {
  // Обработка ошибки
  console.error(response.error_message)
}
```

---

## TypeScript типы

```typescript
interface CompletionHistoryDay {
  date: string                 // "YYYY-MM-DD"
  status: 'completed' | 'missed' | 'excused' | 'amnestied' | 'not_scheduled'
}

interface HabitAnalytics {
  habit_id: number
  name: string
  icon: string
  completion_rate_7: number    // 0-100
  completion_rate_30: number   // 0-100
  streak: number               // ≥0
  total_completions: number    // ≥0
  completion_history: CompletionHistoryDay[]  // 30 элементов
}

interface MonthlyStats {
  month: number                // 1-12
  month_name: string           // "January" - "December"
  completion_rate: number      // 0-100
  completed: number            // ≥0
  scheduled: number            // ≥0
}

interface AnalyticsData {
  // Основные данные
  completion_rate_7: number
  completion_rate_30: number
  current_streak: number
  total_completions: number
  week_xp: number
  habits_data: HabitAnalytics[]

  // Модальное окно "Выполнение"
  weekly_trend: number[]       // 8 элементов, 0-100
  best_week_rate: number       // 0-100
  worst_habit_name: string | null
  worst_habit_rate: number     // 0-100

  // Модальное окно "Годовой календарь"
  year_completions: number
  year_active_days: number
  best_month_name: string | null
  best_month_rate: number      // 0-100
  calendar_data: Record<string, number>  // {"YYYY-MM-DD": count}
  monthly_stats: MonthlyStats[]          // 12 элементов
}

interface AnalyticsResponse {
  status: 'ok' | 'error'
  data?: AnalyticsData
  error_code?: string
  error_message?: string
}
```

---

## Советы по реализации

### 1. Календарь Heatmap

Для отрисовки годового календаря рекомендуем библиотеку [vue-calendar-heatmap](https://github.com/razorness/vue3-calendar-heatmap):

```bash
npm install vue3-calendar-heatmap
```

```vue
<template>
  <CalendarHeatmap
    :values="heatmapValues"
    :end-date="new Date()"
    :range-color="['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']"
  />
</template>

<script setup>
import { computed } from 'vue'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'

const heatmapValues = computed(() => {
  return Object.entries(props.calendarData).map(([date, count]) => ({
    date,
    count
  }))
})
</script>
```

### 2. График тренда

Для графика weekly_trend используйте Chart.js или любую другую библиотеку:

```bash
npm install chart.js vue-chartjs
```

```vue
<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const chartData = {
  labels: ['7н', '6н', '5н', '4н', '3н', '2н', '1н', 'Сейчас'],
  datasets: [{
    label: 'Выполнение (%)',
    data: props.weeklyTrend,
    borderColor: '#10b981',
    tension: 0.4
  }]
}

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      max: 100
    }
  }
}
</script>
```

### 3. Прогресс бары для привычек

```vue
<template>
  <div class="habit-row">
    <span class="habit-name">{{ habit.name }}</span>
    <div class="progress-container">
      <div
        class="progress-bar"
        :style="{ width: habit.completion_rate_30 + '%' }"
        :class="getProgressClass(habit.completion_rate_30)"
      ></div>
    </div>
    <span class="percentage">{{ habit.completion_rate_30 }}%</span>
  </div>
</template>

<script setup>
const getProgressClass = (rate) => {
  if (rate >= 80) return 'progress-excellent'
  if (rate >= 60) return 'progress-good'
  if (rate >= 40) return 'progress-fair'
  return 'progress-poor'
}
</script>

<style scoped>
.progress-excellent { background: #10b981; }
.progress-good { background: #3b82f6; }
.progress-fair { background: #f59e0b; }
.progress-poor { background: #ef4444; }
</style>
```

---

## Changelog

**v3 (2025-12-08):**
- ✅ Добавлено поле `completion_history` в `habits_data` - история выполнений за последние 30 дней для каждой привычки

**v2 (2025-12-08):**
- ✅ Добавлены данные для модального окна "Выполнение": `weekly_trend`, `best_week_rate`, `worst_habit_name`, `worst_habit_rate`
- ✅ Добавлены данные для модального окна "Годовой календарь": `year_completions`, `year_active_days`, `best_month_name`, `best_month_rate`, `calendar_data`, `monthly_stats`

**v1:**
- Базовые данные аналитики: `completion_rate_7`, `completion_rate_30`, `current_streak`, `total_completions`, `week_xp`, `habits_data`

---

# Блок "По привычкам" - Краткая документация

Этот раздел содержит информацию специально для реализации блока "По привычкам" на странице аналитики привычек.

## Используемые данные

Блок "По привычкам" отображается в табе "Аналитика" и использует данные из поля `habits_data` ответа API `/api/rest/front/app/habits/analytics/get/`.

## Структура данных для каждой привычки

```json
{
  "habit_id": 1,
  "name": "Зарядка 10 мин",
  "icon": "fire",
  "completion_rate_7": 85,         // % выполнения за 7 дней
  "completion_rate_30": 78,        // % выполнения за 30 дней
  "streak": 5,                     // Текущая серия дней
  "total_completions": 25,         // Всего выполнений за все время
  "completion_history": [          // История за последние 30 дней
    {
      "date": "2024-11-07",
      "status": "completed"        // completed | missed | excused | amnestied | not_scheduled
    },
    // ... 29 дополнительных дней
  ]
}
```

## Что отображать

Для каждой привычки в блоке "По привычкам" нужно показать:

1. **Название и иконка** - `name`, `icon`
2. **% выполнения за неделю** - `completion_rate_7`
3. **% выполнения за месяц** - `completion_rate_30`
4. **Текущий стрик** - `streak` (серия дней подряд)
5. **История выполнений за 30 дней** - `completion_history` (массив из 30 элементов)

## Значения статусов в completion_history

- `completed` - привычка выполнена ✅
- `missed` - пропущена ❌
- `excused` - пропущена по уважительной причине 🟡
- `amnestied` - использована амнистия 🟣
- `not_scheduled` - день не в расписании (серый)

## Пример реализации

```vue
<template>
  <div class="habits-section">
    <h3>По привычкам</h3>

    <div v-for="habit in habitsData" :key="habit.habit_id" class="habit-card">
      <!-- Заголовок привычки -->
      <div class="habit-header">
        <span class="habit-icon">{{ habit.icon }}</span>
        <span class="habit-name">{{ habit.name }}</span>
      </div>

      <!-- Основная статистика -->
      <div class="habit-stats">
        <div class="stat">
          <span class="stat-label">7 дней</span>
          <span class="stat-value">{{ habit.completion_rate_7 }}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">30 дней</span>
          <span class="stat-value">{{ habit.completion_rate_30 }}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Серия</span>
          <span class="stat-value">
            <span class="fire-icon">🔥</span>
            {{ habit.streak }}
          </span>
        </div>
      </div>

      <!-- История выполнений (30 дней) -->
      <div class="completion-history">
        <div
          v-for="day in habit.completion_history"
          :key="day.date"
          class="history-cell"
          :class="getCellClass(day.status)"
          :title="formatTooltip(day.date, day.status)"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  habitsData: {
    type: Array,
    required: true
  }
})

const getCellClass = (status) => {
  const statusClasses = {
    'completed': 'cell-completed',
    'missed': 'cell-missed',
    'excused': 'cell-excused',
    'amnestied': 'cell-amnestied',
    'not_scheduled': 'cell-not-scheduled'
  }
  return statusClasses[status] || 'cell-default'
}

const formatTooltip = (date, status) => {
  const statusLabels = {
    'completed': 'Выполнена',
    'missed': 'Пропущена',
    'excused': 'Уважительная причина',
    'amnestied': 'Амнистия',
    'not_scheduled': 'Не запланирована'
  }
  return `${date}: ${statusLabels[status] || status}`
}
</script>

<style scoped>
.habits-section {
  padding: 20px;
}

.habit-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.habit-name {
  font-size: 16px;
  font-weight: 600;
}

.habit-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.completion-history {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.history-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
}

.cell-completed {
  background-color: #10b981; /* зеленый */
}

.cell-missed {
  background-color: #ef4444; /* красный */
}

.cell-excused {
  background-color: #f59e0b; /* оранжевый */
}

.cell-amnestied {
  background-color: #8b5cf6; /* фиолетовый */
}

.cell-not-scheduled {
  background-color: #e5e7eb; /* серый */
}

.fire-icon {
  margin-right: 4px;
}
</style>
```

## Цвета для статусов (рекомендуемые)

- ✅ **Completed** (выполнена): `#10b981` (зеленый)
- ❌ **Missed** (пропущена): `#ef4444` (красный)
- 🟡 **Excused** (уважительная причина): `#f59e0b` (оранжевый)
- 🟣 **Amnestied** (амнистия): `#8b5cf6` (фиолетовый)
- ⚪ **Not scheduled** (не запланирована): `#e5e7eb` (светло-серый)

## Важные моменты

1. **completion_history всегда содержит 30 элементов** - по одному для каждого из последних 30 дней
2. **Даты идут от старых к новым** - первый элемент это 30 дней назад, последний - сегодня
3. **Процент выполнения** - считается только от запланированных дней (дни со статусом `not_scheduled` не учитываются)
4. **Стрик** - серия дней подряд выполнения этой конкретной привычки (только `completed` статус)

## Пример данных из API

```json
{
  "status": "ok",
  "data": {
    "habits_data": [
      {
        "habit_id": 1,
        "name": "Тренировка в зале",
        "icon": "fire",
        "completion_rate_7": 67,
        "completion_rate_30": 54,
        "streak": 2,
        "total_completions": 7,
        "completion_history": [
          {"date": "2024-11-09", "status": "not_scheduled"},
          {"date": "2024-11-10", "status": "completed"},
          {"date": "2024-11-11", "status": "missed"},
          // ... еще 27 дней
          {"date": "2024-12-08", "status": "completed"}
        ]
      },
      {
        "habit_id": 2,
        "name": "Прогулка 30 минут",
        "icon": "fire",
        "completion_rate_7": 86,
        "completion_rate_30": 73,
        "streak": 6,
        "total_completions": 22,
        "completion_history": [
          {"date": "2024-11-09", "status": "completed"},
          {"date": "2024-11-10", "status": "completed"},
          // ... еще 28 дней
        ]
      }
    ]
  }
}
```