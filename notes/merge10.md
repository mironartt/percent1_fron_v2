# Merge 10 — Рефакторинг AI-рекомендаций и удаление старых тостов

**Дата:** 2 декабря 2025

---

## 1. Рефакторинг AI-рекомендаций: задачи → цели

### Проблема
AI-рекомендации генерировали отдельные задачи (tasks), которые не интегрировались с системой целей (Goals Bank).

### Решение
AI теперь генерирует полноценные **цели со шагами**, которые добавляются в Goals Bank.

### Изменения в `src/stores/app.js`

**Переименования:**
- `aiRecommendations` → `aiRecommendedGoals`

**Обновлённые методы:**

```javascript
// initAIRecommendations — теперь принимает цели со steps[]
initAIRecommendations(aiGoals) {
  aiRecommendedGoals.value = aiGoals.map(goal => ({
    id: goal.id || Date.now().toString(),
    title: goal.title,
    sphere: goal.sphere,
    description: goal.description || '',
    steps: goal.steps.map(step => ({
      id: step.id || Date.now().toString(),
      title: step.title,
      completed: false,
      xpAwarded: false
    })),
    status: 'pending', // pending | accepted | rejected
    source: 'ai'
  }))
}

// confirmAIRecommendations — добавляет принятые цели в Goals Bank
confirmAIRecommendations() {
  const acceptedGoals = aiRecommendedGoals.value.filter(g => g.status === 'accepted')
  
  acceptedGoals.forEach(aiGoal => {
    const newGoal = {
      id: Date.now().toString() + Math.random(),
      title: aiGoal.title,
      sphere: aiGoal.sphere,
      description: aiGoal.description,
      threeWhys: { why1: '', why2: '', why3: '' },
      steps: aiGoal.steps,
      status: 'active',
      progress: { completed: 0, total: aiGoal.steps.length },
      source: 'ai',
      xpAwarded: false,
      createdAt: new Date().toISOString()
    }
    goals.value.push(newGoal)
  })
  
  aiRecommendedGoals.value = []
  showPlanReview.value = false
}
```

**Новые методы:**
- `updateRecommendedGoalStatus(goalId, status)` — принять/отклонить цель
- `updateRecommendedGoal(goalId, updates)` — редактировать название цели
- `updateRecommendedGoalStep(goalId, stepId, updates)` — редактировать шаг

### Изменения в `src/components/PlanReview.vue`

Полностью переписан для отображения целей с шагами:
- Карточки целей с иконкой сферы и описанием
- Раскрывающийся список шагов (аккордеон)
- Inline-редактирование названий целей и шагов
- Кнопки "Принять" / "Отклонить" для каждой цели

### Изменения в `src/components/OnboardingAI.vue`

**Шаг 5 — генерация целей:**
```javascript
// generateAIGoals — вместо generateWeeklyPlan
function generateAIGoals() {
  const weakSpheres = getWeakestSpheres(3)
  
  return weakSpheres.map(sphere => ({
    id: Date.now().toString(),
    title: `Улучшить ${sphere.name}`,
    sphere: sphere.id,
    description: sphere.description,
    steps: generateStepsForSphere(sphere) // 5 шагов
  }))
}
```

**Превью целей на шаге 5:**
- Отображение 1-3 целей с иконками сфер
- Список шагов для каждой цели
- Кнопка "Завершить" передаёт цели в `initAIRecommendations`

---

## 2. Удаление тостов от старого 7-шагового онбординга

### Проблема
Старая система 7-шагового онбординга показывала тосты при каждом шаге:
- "Баланс жизни оценён! → Следующий шаг: Добавить первую идею"
- и т.д. для всех 7 шагов

### Решение
Удалены тосты, но сохранены сообщения AI-ментора.

### Изменения в `src/stores/toast.js`

**Удалено:**
```javascript
// Конфигурация 7 шагов
const firstStepsConfig = {
  ssp: { title: 'Баланс жизни оценён!', nextStep: 'add_idea', ... },
  add_idea: { title: 'Идея добавлена!', nextStep: 'validate_goal', ... },
  validate_goal: { ... },
  select_key_goal: { ... },
  plan_task: { ... },
  write_journal: { ... },
  chat_mentor: { ... }
}

// Функция показа тостов
function showFirstStepToast(stepId, firstSteps) { ... }
```

**Осталось:**
- `showToast(options)` — общая функция для других уведомлений
- `removeToast(id)`
- `clearAllToasts()`

### Изменения в `src/stores/app.js`

**Удалено из `completeFirstStep()`:**
```javascript
// Было:
try {
  const toastStore = useToastStore()
  toastStore.showFirstStepToast(stepId, firstSteps.value)
} catch (e) { ... }

// Стало: просто удалено
```

**Удалён неиспользуемый импорт:**
```javascript
// Удалено:
import { useToastStore } from '@/stores/toast'
```

**Сохранено:**
- `mentorStepMessages` — сообщения AI-ментора при завершении шагов
- Логика `completeFirstStep()` без тостов

---

## Поток данных после рефакторинга

```
Онбординг (шаг 5)
    ↓
generateAIGoals() — создаёт 1-3 цели на основе слабых сфер
    ↓
completeOnboarding() → initAIRecommendations(goals)
    ↓
PlanReview модал — пользователь принимает/редактирует цели
    ↓
confirmAIRecommendations() → goals.push(...)
    ↓
Goals Bank — цели отображаются с source: 'ai'
    ↓
Planning — шаги доступны для планирования
```

---

## Файлы изменены

| Файл | Изменения |
|------|-----------|
| `src/stores/app.js` | Рефакторинг AI-рекомендаций, удаление тостов |
| `src/stores/toast.js` | Удаление firstStepsConfig и showFirstStepToast |
| `src/components/PlanReview.vue` | Полная переработка для целей со шагами |
| `src/components/OnboardingAI.vue` | Генерация целей вместо задач |
| `replit.md` | Обновлена документация архитектуры |
