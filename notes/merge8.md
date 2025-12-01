# Merge 8 - Dashboard "День пользователя" Redesign

**Дата:** 1 декабря 2025

## Обзор сессии

В этой сессии был полностью переработан дашборд по концепции "День пользователя" — ориентированный на ежедневное использование и удержание пользователей. Также проведён анализ пробела в обработке рекомендаций AI после онбординга.

---

## Выполненные изменения

### 1. Полный редизайн Dashboard.vue

**Файл:** `src/views/Dashboard.vue`

**Было (старый дашборд):**
- FirstSteps виджет (7 шагов)
- Stats grid (статистика)
- Spheres widget (6 сфер жизни)
- Today's tasks (неограниченный список)
- Quick actions (быстрые действия)
- AI Mentor widget (отдельный)

**Стало (новый "День пользователя"):**

#### 1.1 Контекстно-зависимый хедер

```javascript
const timeOfDay = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
})

const greeting = computed(() => {
  switch (timeOfDay.value) {
    case 'morning': return 'Доброе утро'
    case 'afternoon': return 'Добрый день'
    case 'evening': return 'Добрый вечер'
  }
})

const dayMessage = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 9) return 'Отличное время для планирования дня'
  if (hour >= 9 && hour < 12) return 'Время для важных дел'
  if (hour >= 12 && hour < 14) return 'Не забудьте про перерыв'
  if (hour >= 14 && hour < 18) return 'Продолжайте двигаться к целям'
  if (hour >= 18 && hour < 21) return 'Время подвести итоги дня'
  return 'Отдохните и подготовьтесь к завтра'
})
```

**Визуальное оформление:**
- Иконка солнца/луны в зависимости от времени
- Цветовая схема меняется (утро: жёлтый, день: синий, вечер: фиолетовый)
- Бейджи: стрик дневника + баланс

#### 1.2 Фокус дня (1-3 задачи)

```vue
<div class="card focus-card">
  <div class="card-header">
    <h3 class="card-title">
      <Crosshair :size="18" />
      Фокус дня
    </h3>
    <span class="focus-count">{{ completedFocusTasks }}/{{ focusTasks.length }}</span>
  </div>
  ...
</div>
```

```javascript
const focusTasks = computed(() => {
  return dailyTasks.value.slice(0, 3)  // Ограничение до 3 задач
})
```

**Пустое состояние:**
```vue
<div class="empty-focus">
  <Sparkles :size="32" />
  <p>Выберите 1-3 важных дела на сегодня</p>
  <router-link to="/app/planning" class="btn btn-primary">
    <Plus :size="18" />
    Выбрать задачи
  </router-link>
</div>
```

#### 1.3 Минимальный трекер привычек

```vue
<div class="habits-row">
  <!-- Дневник -->
  <div class="card habit-card">
    <div class="habit-icon journal">
      <BookOpen :size="20" />
    </div>
    <div class="habit-info">
      <span class="habit-name">Дневник</span>
      <span class="habit-status" :class="{ done: hasTodayEntry }">
        {{ hasTodayEntry ? 'Записано' : 'Не записано' }}
      </span>
    </div>
    ...
  </div>

  <!-- Баланс -->
  <div class="card habit-card">
    <div class="habit-icon balance">
      <ChartPie :size="20" />
    </div>
    <div class="habit-info">
      <span class="habit-name">Баланс</span>
      <span class="habit-status">{{ averageScore }}/10</span>
    </div>
    <router-link to="/app/ssp" class="habit-action">
      <ChevronRight :size="16" />
    </router-link>
  </div>
</div>
```

#### 1.4 Вечерняя рефлексия (после 18:00)

```javascript
const isEvening = computed(() => currentHour.value >= 18)
```

```vue
<div v-if="isEvening" class="card evening-card">
  <div class="evening-content">
    <div class="evening-icon">
      <Moon :size="24" />
    </div>
    <div class="evening-text">
      <h4>Вечерняя точка</h4>
      <p>Подведите итоги дня и запланируйте завтра</p>
    </div>
    <button class="btn btn-secondary" @click="showJournalModal = true">
      Записать
    </button>
  </div>
</div>
```

#### 1.5 Prominent AI Mentor CTA

```vue
<div class="card mentor-cta">
  <div class="mentor-content">
    <div class="mentor-avatar">
      <MessageCircle :size="24" />
    </div>
    <div class="mentor-text">
      <h4>AI Ментор</h4>
      <p>{{ mentorHint }}</p>
    </div>
    <button class="btn btn-primary" @click="openMentorPanel">
      <MessageCircle :size="16" />
      Спросить
    </button>
  </div>
</div>
```

```javascript
const mentorHint = computed(() => {
  if (focusTasks.value.length === 0) return 'Помогу выбрать задачи на сегодня'
  if (completedFocusTasks.value === focusTasks.value.length) return 'Отлично! Все задачи выполнены'
  return 'Готов помочь с текущими задачами'
})
```

#### 1.6 Быстрые ссылки

```vue
<div class="quick-links">
  <router-link to="/app/goals-bank" class="quick-link">
    <Lightbulb :size="18" />
    <span>Банк целей</span>
  </router-link>
  <router-link to="/app/planning" class="quick-link">
    <Calendar :size="18" />
    <span>Планирование</span>
  </router-link>
  <router-link to="/app/journal" class="quick-link">
    <BookOpen :size="18" />
    <span>Дневник</span>
  </router-link>
</div>
```

---

### 2. Адаптация под MentorPanel

```css
.dashboard {
  flex: 1;
  min-width: 0;
  padding-right: 500px;  /* Место для панели ментора */
  transition: padding-right 0.3s ease;
}

.dashboard.panel-collapsed {
  padding-right: 100px;
}

@media (max-width: 1024px) {
  .dashboard {
    padding-right: 0;
  }
}
```

---

### 3. Отключение принудительного онбординга

**Файл:** `src/config/local_settings.js`

```javascript
// Было:
export const FORCE_SHOW_ONBOARDING = true

// Стало:
export const FORCE_SHOW_ONBOARDING = false
```

---

### 4. Обновление replit.md

Добавлена документация новой архитектуры дашборда:

```markdown
- **Dashboard ("День пользователя")**: Redesigned for daily retention, featuring:
  - **Context-aware header**: Time-based greeting (morning/afternoon/evening) with personalized messages
  - **Focus of the Day**: Limited to 1-3 micro-actions (first 3 from daily tasks, future: user-selected)
  - **Habit tracker**: Compact cards for Journal (with streak) and Balance score
  - **Evening reflection**: Appears after 18:00 prompting day summary
  - **AI Mentor CTA**: Prominent call-to-action with contextual hints
  - **Quick navigation**: Links to Goals Bank, Planning, Journal
  - Removed clutter: FirstSteps widget, stats grid, spheres widget, quick actions
```

---

## Анализ: Пробел с рекомендациями AI

### Проблема

После онбординга AI генерирует 7-дневный план с задачами, но:
1. Задачи сохраняются в `onboarding.data.weeklyPlan`
2. **Не переносятся** в модуль Планирование
3. **Не появляются** в Фокусе дня
4. Пользователь не может с ними работать

### Рекомендованное решение

**Гибридный подход "AI Plan Review":**

1. После онбординга → экран просмотра рекомендаций
2. Для каждой задачи: Принять | Редактировать | Пропустить | Заменить
3. Принятые задачи → создаются в Планировании
4. Метка `source: 'ai_recommendation'` для отслеживания

### Запланированные задачи

| # | Задача | Статус |
|---|--------|--------|
| 1 | Создать компонент PlanReview.vue | Pending |
| 2 | Добавить управление задачами | Pending |
| 3 | Интегрировать с Планированием | Pending |
| 4 | Связать с Фокусом дня | Pending |
| 5 | Добавить метку 'AI рекомендация' | Pending |

---

## Статистика изменений

```
src/views/Dashboard.vue         | 807 ++++++++++++++++++--------------
src/config/local_settings.js    |   2 +-
replit.md                       |  25 +-
```

**Всего:** ~500 строк изменений

---

## Замечания архитектора

> "Текущая реализация берёт первые 3 задачи автоматически. В будущей итерации рекомендуется добавить возможность пользователю самому выбирать задачи в Фокус дня."

Это отложено как future improvement.

---

## Следующие шаги

1. Реализовать PlanReview.vue для обработки рекомендаций AI
2. Добавить интеграцию рекомендаций с модулем Планирование
3. Связать принятые рекомендации с Фокусом дня на дашборде
