# Merge 9 - Goal Validation Simplification & Dashboard Sync

**Дата:** 2 декабря 2025

## Обзор сессии

В этой сессии выполнено упрощение системы валидации целей (с 3 вопросов до 2), полная синхронизация Dashboard с Planning через единый источник данных, добавление виджета "Мои цели" и проверка merge-конфликтов.

---

## Выполненные изменения

### 1. Упрощение системы валидации целей (3 → 2 вопроса)

**Было (3 вопроса "Правило 3 Почему"):**
1. Почему эта цель мне важна?
2. Почему именно это даст мне то, что я хочу?
3. Почему это действительно про меня?

**Стало (2 вопроса "Проверка цели"):**
1. Почему для меня это важно?
2. Как эта цель поможет выйти на новый уровень?

#### 1.1 GoalsBank.vue — Шаблон валидации

**Инструкция:**
```vue
<!-- Было: -->
<span>Правило 3 Почему</span>

<!-- Стало: -->
<span>Проверка цели</span>
```

**Форма валидации идеи (Step 2):**
```vue
<!-- Было (3 поля): -->
<label>1. Почему эта цель мне важна?</label>
<label>2. Почему именно это даст мне то, что я хочу?</label>
<label>3. Почему это действительно про меня?</label>

<!-- Стало (2 поля): -->
<label>1. Почему для меня это важно?</label>
<label>2. Как эта цель поможет выйти на новый уровень?</label>
```

**Модал редактирования цели:**
```vue
<!-- Было: 3 textarea для why1, why2, why3 -->
<!-- Стало: 2 textarea для why1, why2 -->
<div class="form-group">
  <label>Почему для меня это важно?</label>
  <textarea v-model="editingGoal.whyImportant" />
</div>
<div class="form-group">
  <label>Как эта цель поможет выйти на новый уровень?</label>
  <textarea v-model="editingGoal.why2" />
</div>
```

**Модал добавления новой цели:**
```vue
<!-- Аналогично: 3 поля → 2 поля -->
```

#### 1.2 GoalEdit.vue — Модал редактирования

```vue
<!-- Было: 3 textarea -->
<!-- Стало: 2 textarea -->
<div class="form-group">
  <label>Почему для меня это важно?</label>
  <textarea v-model="editingGoal.whyImportant" />
</div>
<div class="form-group">
  <label>Как эта цель поможет выйти на новый уровень?</label>
  <textarea v-model="editingGoal.why2" />
</div>
```

#### 1.3 Goals.vue — Отображение ответов

```vue
<!-- Было: 3 блока why-answer -->
<div class="why-answer">
  <span class="why-label">Почему важно:</span>
  <span>{{ goal.threeWhys?.why1 }}</span>
</div>
<div class="why-answer">
  <span class="why-label">Как достичь:</span>
  <span>{{ goal.threeWhys?.why2 }}</span>
</div>
<div class="why-answer">
  <span class="why-label">Про меня:</span>
  <span>{{ goal.threeWhys?.why3 }}</span>
</div>

<!-- Стало: 2 блока -->
<div class="why-answer">
  <span class="why-label">Почему важно:</span>
  <span>{{ goal.threeWhys?.why1 }}</span>
</div>
<div class="why-answer">
  <span class="why-label">Новый уровень:</span>
  <span>{{ goal.threeWhys?.why2 }}</span>
</div>
```

---

### 2. Удаление why3 из модели данных

**Файл:** `src/views/GoalsBank.vue`

```javascript
// Было:
const newGoal = ref({
  text: '',
  sphereId: '',
  whyImportant: '',
  why2: '',
  why3: '',  // ← удалено
  status: null
})

// Стало:
const newGoal = ref({
  text: '',
  sphereId: '',
  whyImportant: '',
  why2: '',
  status: null
})
```

**Сохранение цели:**
```javascript
// Было:
threeWhys: {
  why1: newGoal.value.whyImportant,
  why2: newGoal.value.why2,
  why3: newGoal.value.why3  // ← удалено
}

// Стало:
threeWhys: {
  why1: newGoal.value.whyImportant,
  why2: newGoal.value.why2
}
```

**Фильтрация по поиску:**
```javascript
// Было:
const matchesWhy3 = goal.threeWhys?.why3?.toLowerCase().includes(query)
if (!matchesText && !matchesWhy && !matchesWhy1 && !matchesWhy2 && !matchesWhy3) {

// Стало:
if (!matchesText && !matchesWhy && !matchesWhy1 && !matchesWhy2) {
```

**Файл:** `src/views/GoalEdit.vue`

```javascript
// Было:
editingGoal.value = {
  ...
  why2: rawIdea?.threeWhys?.why2 || '',
  why3: rawIdea?.threeWhys?.why3 || '',  // ← удалено
  status: rawIdea?.status || 'validated'
}

// Стало:
editingGoal.value = {
  ...
  why2: rawIdea?.threeWhys?.why2 || '',
  status: rawIdea?.status || 'validated'
}
```

---

### 3. Синхронизация Dashboard ↔ Planning

**Файл:** `src/stores/app.js`

Добавлен единый computed getter `todayScheduledTasks`, объединяющий задачи из двух источников:

```javascript
todayScheduledTasks: (state) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  console.log('[Store] todayScheduledTasks - today:', todayStr)
  
  // Источник 1: weeklyPlans (Planning drag-and-drop)
  const currentPlan = state.weeklyPlans.find(p => {
    const weekStart = new Date(p.weekStart)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return today >= weekStart && today <= weekEnd
  })
  
  let weeklyTasks = []
  if (currentPlan) {
    console.log('[Store] todayScheduledTasks - currentPlan:', currentPlan.id, 'weekStart:', currentPlan.weekStart)
    weeklyTasks = (currentPlan.scheduledTasks || []).filter(t => {
      const taskDate = new Date(t.date)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.toISOString().split('T')[0] === todayStr
    })
    console.log('[Store] todayScheduledTasks - weekly tasks:', weeklyTasks.length)
  }
  
  // Источник 2: dailyPlan (AI recommendations)
  const dailyTasks = (state.dailyPlan?.tasks || []).filter(t => {
    if (!t.date) return false
    const taskDate = new Date(t.date)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.toISOString().split('T')[0] === todayStr
  })
  console.log('[Store] todayScheduledTasks - dailyPlan tasks:', dailyTasks.length)
  
  // Объединяем, исключая дубликаты по id
  const seenIds = new Set()
  const combined = []
  
  for (const task of [...weeklyTasks, ...dailyTasks]) {
    if (!seenIds.has(task.id)) {
      seenIds.add(task.id)
      combined.push(task)
    }
  }
  
  console.log('[Store] todayScheduledTasks - combined:', combined.length, 'tasks')
  return combined
}
```

**Файл:** `src/views/Dashboard.vue`

```javascript
// Было:
const dailyTasks = computed(() => store.dailyPlan?.tasks || [])

// Стало:
const dailyTasks = computed(() => store.todayScheduledTasks)
```

---

### 4. Виджет "Мои цели" на Dashboard

**Файл:** `src/views/Dashboard.vue`

Добавлен новый виджет справа от "Фокус дня":

```vue
<div class="dashboard-grid">
  <!-- Фокус дня (слева) -->
  <div class="card focus-card">...</div>
  
  <!-- Мои цели (справа) — НОВОЕ -->
  <div class="card goals-widget">
    <div class="card-header">
      <h3 class="card-title">
        <Target :size="18" />
        Мои цели
      </h3>
      <router-link to="/app/goals-bank" class="see-all-link">
        Все цели
        <ChevronRight :size="14" />
      </router-link>
    </div>
    
    <div v-if="topGoals.length > 0" class="goals-list">
      <div v-for="goal in topGoals" :key="goal.id" class="goal-item">
        <div class="goal-sphere-icon" :style="{ background: getSphereColor(goal.sphereId) }">
          <component :is="getSphereIcon(goal.sphereId)" :size="14" />
        </div>
        <div class="goal-info">
          <span class="goal-title">{{ goal.title }}</span>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" :style="{ width: goal.progress + '%' }"></div>
          </div>
        </div>
        <span class="goal-progress-text">{{ goal.progress }}%</span>
      </div>
    </div>
    
    <div v-else class="empty-goals">
      <Sparkles :size="32" />
      <p>Добавьте первую цель</p>
      <router-link to="/app/goals-bank" class="btn btn-primary btn-sm">
        <Plus :size="16" />
        Добавить
      </router-link>
    </div>
  </div>
</div>
```

**Computed для топ-3 целей:**
```javascript
const topGoals = computed(() => {
  return store.goals
    .filter(g => g.status === 'active' || g.status === 'work')
    .slice(0, 3)
    .map(g => ({
      ...g,
      progress: calculateProgress(g)
    }))
})

function calculateProgress(goal) {
  if (!goal.steps || goal.steps.length === 0) return 0
  const completed = goal.steps.filter(s => s.completed).length
  return Math.round((completed / goal.steps.length) * 100)
}
```

**CSS Grid layout:**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

### 5. Иконка настроек в "Фокус дня"

```vue
<div class="card-header">
  <h3 class="card-title">
    <Crosshair :size="18" />
    Фокус дня
  </h3>
  <router-link to="/app/planning" class="settings-link" title="Настроить задачи">
    <Settings :size="16" />
  </router-link>
</div>
```

---

### 6. Проверка merge-конфликтов

При pull из GitHub возникли конфликты в файлах:
- `replit.md`
- `src/views/GoalEdit.vue`
- `src/views/GoalsBank.vue`
- `src/views/Planning.vue`

**Результат проверки:** Конфликтов не обнаружено — они были разрешены автоматически или ранее.

---

## Ошибки в консоли (ожидаемые)

### Vite Proxy Errors

```
[vite] http proxy error: /api/rest/front/csrf/
Error: connect ECONNREFUSED 127.0.0.1:8017
```

**Причина:** Django backend не запущен на порту 8017. Vite пытается проксировать API-запросы, но сервер недоступен.

**Статус:** Ожидаемое поведение в демо-режиме. Приложение работает с `SKIP_AUTH_CHECK=true`, используя localStorage для данных.

### Browser Console Warnings

```
[API] CSRF cookie not set after request
```

**Причина:** Без Django backend CSRF-токен не устанавливается. Это нормально в демо-режиме.

```
<Suspense> is an experimental feature and its API will likely change.
```

**Причина:** Vue 3 предупреждение о экспериментальном компоненте. Не влияет на работу.

---

## Статистика изменений

```
src/views/Dashboard.vue | 346 +++++++++++++++++++++++++++++++++++++++++------
src/stores/app.js       |  82 ++++++++++--
src/views/GoalsBank.vue |  71 +++-------
src/views/GoalEdit.vue  |  22 +--
src/views/Goals.vue     |   7 +-
src/views/Planning.vue  |   3 +
replit.md               |   4 +-
.replit                 |   8 +-
```

**Всего:** ~410 строк добавлено, ~133 строк удалено

---

## Архитектурные решения

### Синхронизация задач

Два источника данных для задач объединены в один computed getter:
- `weeklyPlans` — задачи, перенесённые drag-and-drop в Planning
- `dailyPlan` — задачи, рекомендованные AI

Это обеспечивает:
- Единый источник правды для Dashboard
- Мгновенное отражение изменений в обоих направлениях
- Дедупликацию по ID

### Упрощение UX

Сокращение с 3 до 2 вопросов при валидации целей:
- Снижает когнитивную нагрузку
- Ускоряет процесс добавления целей
- Сохраняет суть проверки мотивации

---

## Следующие шаги

1. Интеграция с Django backend для синхронизации данных
2. Реализация AI Plan Review для обработки рекомендаций после онбординга
3. Добавление возможности выбора задач в "Фокус дня" (сейчас первые 3 автоматически)
