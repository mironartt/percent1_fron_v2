# Merge 7 - First Steps Navigation & Toast System

**Дата:** 29 ноября 2025

## Обзор сессии

В этой сессии были реализованы: система навигации First Steps (7 шагов для новых пользователей), уведомления Toast с интеграцией AI Mentor, и исправлена навигация между модулями для соответствия пути First Steps.

---

## Выполненные изменения

### 1. Удалено гейтинг уроков из всех модулей

Все модули теперь показывают рабочий интерфейс сразу, без вводных уроков:
- ССП — сразу колесо жизни
- Банк целей — сразу форма добавления идей
- Декомпозиция — сразу список целей
- Планирование — сразу недельный календарь

---

### 2. Исправлена навигация First Steps

**Путь пользователя (7 шагов):**

| Шаг | Действие | Триггер | Следующий шаг |
|-----|----------|---------|---------------|
| 1 | Оценить баланс жизни | `ssp` | Банк целей |
| 2 | Добавить идею | `add_idea` | Проверка цели |
| 3 | Валидировать цель | `validate_goal` | Выбор ключевой |
| 4 | Выбрать ключевую цель | `select_key_goal` | Планирование |
| 5 | Запланировать задачу | `plan_task` | Дневник |
| 6 | Написать в дневник | `write_journal` | Ментор |
| 7 | Пообщаться с ментором | `chat_mentor` | — |

**Файл:** `src/views/GoalsBank.vue`

**Изменения в completeGoalsBankHandler():**
```javascript
// Было:
router.push('/app/goals')

// Стало:
router.push('/app/planning')
```

**Кнопка на итоговой странице:**
```vue
<!-- Было: -->
<span>Перейти к декомпозиции</span>

<!-- Стало: -->
<span>Запланировать задачу</span>
```

---

### 3. Добавлена кнопка "Запланировать" в Декомпозиции

**Файл:** `src/views/Goals.vue`

**Добавлена функция:**
```javascript
function goToPlanning() {
  router.push('/app/planning')
}
```

**Кнопка появляется для целей с шагами:**
```vue
<button @click="goToPlanning" class="secondary-btn">
  <Calendar :size="16" />
  <span>Запланировать</span>
</button>
```

---

### 4. Исправлен триггер select_key_goal

**Файл:** `src/stores/app.js`

**Проблема:** Триггер `select_key_goal` не срабатывал при переносе целей.

**Решение:** Добавлен вызов в `completeGoalsBank()`:
```javascript
function completeGoalsBank() {
  goalsBank.value.currentStep = 4
  goalsBank.value.completed = true
  
  // Триггер для первых шагов
  if (!firstSteps.value.select_key_goal) {
    completeFirstStep('select_key_goal')
  }
  
  saveToLocalStorage()
}
```

---

### 5. Система Toast-уведомлений

**Файлы:** 
- `src/stores/toast.js` — новый store
- `src/components/ToastNotification.vue` — новый компонент

**Конфигурация First Steps:**
```javascript
const firstStepsConfig = {
  ssp: {
    title: 'Баланс жизни оценён!',
    nextStep: 'add_idea',
    nextStepText: 'Добавить первую идею',
    nextStepRoute: '/app/goals-bank',
    icon: 'check-circle'
  },
  // ... остальные шаги
}
```

**Интеграция с AI Mentor:**
При выполнении каждого шага ментор добавляет персональное сообщение поддержки.

---

### 6. Перемещение Toast в правый верхний угол

**Проблема:** Toast-уведомления накладывались на виджет чата ментора (правый нижний угол).

**Файл:** `src/components/ToastNotification.vue`

**CSS изменения:**
```css
/* Было: */
.toast-container {
  bottom: 24px;
  right: 24px;
  flex-direction: column-reverse;
}

/* Стало: */
.toast-container {
  top: 24px;
  right: 24px;
  flex-direction: column;
}
```

**Анимация обновлена для вертикального появления:**
```css
/* Было: */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Стало: */
@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-20px); opacity: 0; }
}
```

**Файл:** `src/stores/toast.js`

**Порядок добавления:**
```javascript
// Было:
toasts.value.push(toast)

// Стало:
toasts.value.unshift(toast)
```

Новые уведомления появляются сверху, старые сдвигаются вниз.

---

## Архитектура First Steps

### Компоненты системы

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │   FirstStepsWidget  │  │      MentorWidget           │   │
│  │   (7-step checklist)│  │   (chat + encouragement)    │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      app.js Store                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ firstSteps   │  │ completeFirst│  │ mentorMessages   │   │
│  │ (ref object) │  │ Step()       │  │ (encouragement)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      toast.js Store                          │
│  ┌──────────────────┐  ┌────────────────────────────────┐   │
│  │ showFirstStep    │  │ firstStepsConfig               │   │
│  │ Toast()          │  │ (title, nextStep, route, icon) │   │
│  └──────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ToastNotification.vue                       │
│  - Позиция: правый верхний угол                             │
│  - Анимация: появление сверху вниз                          │
│  - Кнопка CTA: переход к следующему шагу                    │
└─────────────────────────────────────────────────────────────┘
```

### Триггеры в модулях

| Модуль | Функция | Триггер |
|--------|---------|---------|
| BalancedScorecard | completeSSP() | `ssp` |
| GoalsBank | addIdea() | `add_idea` |
| GoalsBank | validateGoal() | `validate_goal` |
| GoalsBank | completeGoalsBank() | `select_key_goal` |
| Planning | addScheduledTask() | `plan_task` |
| Journal | saveEntry() | `write_journal` |
| Mentor | addMessage() | `chat_mentor` |

---

## Файлы изменённые в этой сессии

| Файл | Изменения |
|------|-----------|
| `src/views/GoalsBank.vue` | Навигация на /app/planning, текст кнопки "Запланировать задачу" |
| `src/views/Goals.vue` | Добавлена функция goToPlanning(), кнопка "Запланировать" |
| `src/stores/app.js` | Триггер select_key_goal в completeGoalsBank() |
| `src/stores/toast.js` | unshift вместо push для порядка уведомлений |
| `src/components/ToastNotification.vue` | Позиция top:24px, вертикальная анимация |

---

## Статус

✅ Все 7 триггеров First Steps работают корректно
✅ Навигация SSP → Банк целей → Планирование согласована
✅ Toast-уведомления не накладываются на чат ментора
✅ AI Mentor добавляет персональные сообщения поддержки
✅ Приложение работает корректно
