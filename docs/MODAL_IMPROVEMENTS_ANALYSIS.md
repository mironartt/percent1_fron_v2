# Анализ модальных окон и предложения по улучшению

## Обзор проанализированных компонентов

| Компонент | Путь | Назначение |
|-----------|------|------------|
| AddGoalModal | `src/components/AddGoalModal.vue` | Создание новой цели |
| MentorGoalSuggestionsModal | `src/components/MentorGoalSuggestionsModal.vue` | AI-генерация целей с декомпозицией |
| GoalsBank Edit Modal | `src/views/GoalsBank.vue` (строки 358-541) | Редактирование цели из банка |
| GoalEdit Step Modal | `src/views/GoalEdit.vue` (строки 828-936) | Редактирование шага цели |

---

## 1. AddGoalModal.vue

### Текущее состояние
- **Teleport**: ✅ Рендерится в `<body>`
- **Swipe-to-close**: ✅ Реализовано
- **Mobile bottom sheet**: ✅ Реализовано
- **Drag handle**: ✅ Показывается на мобильных

### Что хорошо
- Чистая структура с collapsible секциями (сферы, мотивация)
- Шаблоны целей по сферам
- Интеграция с ментором через emit
- Оптимистичное сохранение (сначала локально, потом на бекенд)

### Предложения по улучшению (только UI)

| # | Предложение | Приоритет | Влияние на API |
|---|-------------|-----------|----------------|
| 1.1 | **Добавить счетчик символов** в поле названия цели (макс 200) | Низкий | Нет |
| 1.2 | **Добавить автофокус** на поле ввода при открытии (уже есть) | - | Нет |
| 1.3 | **Упростить секцию шаблонов** — показывать иконки сфер горизонтально с подписями | Средний | Нет |
| 1.4 | **Добавить haptic feedback** при свайпе (если доступно) | Низкий | Нет |
| 1.5 | **Объединить "Почему важно" и "Как изменит жизнь"** в одно поле мотивации | Средний | Нет* |

*Примечание: Поле why2 хранится локально, но при сохранении передается в `threeWhys.why2`

### Структура данных при сохранении
```javascript
// Текущая структура (НЕ МЕНЯТЬ)
const goalData = {
  text: 'Название цели',
  sphereId: 'wealth',
  whyImportant: 'Текст мотивации',
  threeWhys: {
    why1: 'Текст мотивации',
    why2: 'Дополнительный текст'
  }
}
// Вызов: store.addRawIdea(goalData) → store.createGoalOnBackend(goalData)
```

---

## 2. MentorGoalSuggestionsModal.vue

### Текущее состояние
- **Teleport**: Нет (использует обычный modal-overlay)
- **Swipe-to-close**: ✅ Реализовано
- **Multi-step wizard**: ✅ (intro → loading → selection → creating → confirmation)
- **AI Integration**: ✅ Через aiTasksStore

### Что хорошо
- Прогресс-бар загрузки с текстом
- Раскрываемый список шагов для каждой цели
- Множественный выбор целей
- Автоматическая декомпозиция на шаги

### Предложения по улучшению (только UI)

| # | Предложение | Приоритет | Влияние на API |
|---|-------------|-----------|----------------|
| 2.1 | **Добавить Teleport to body** для корректного z-index | Высокий | Нет |
| 2.2 | **Добавить drag handle** на мобильных (как в AddGoalModal) | Средний | Нет |
| 2.3 | **Показывать превью шагов** без необходимости кликать на "X шагов" | Низкий | Нет |
| 2.4 | **Добавить skeleton loader** вместо статичной анимации | Низкий | Нет |
| 2.5 | **Добавить возможность редактирования** названия цели перед созданием | Средний | Нет |

### Структура данных AI-генерации
```javascript
// Входные данные (НЕ МЕНЯТЬ)
const sspData = {
  spheres: [
    { id: 'wealth', score: 7 },
    { id: 'health', score: 5 }
  ]
}

// AI возвращает
const result = {
  goals: [
    {
      title: 'Название цели',
      category: 'welfare',  // backend category
      why_important: 'Описание',
      steps: [
        { title: 'Шаг 1' },
        { title: 'Шаг 2' }
      ]
    }
  ]
}

// При создании целей (НЕ МЕНЯТЬ)
await updateGoals({ goals_data: goalsData })
await updateGoalSteps({ goals_steps_data: allStepsData })
```

---

## 3. GoalsBank.vue - Edit Modal

### Текущее состояние
- **Teleport**: ✅ Рендерится в `<body>`
- **Swipe-to-close**: ✅ Реализовано
- **Bottom sheet**: ✅ На мобильных
- **Quick actions**: ✅ Кнопки с текстом

### Что хорошо
- Контекстные кнопки действий (зависят от статуса цели)
- Collapsible секция сфер
- Collapsible секция рефлексии
- Кнопка удаления вынесена отдельно

### Предложения по улучшению (только UI)

| # | Предложение | Приоритет | Влияние на API |
|---|-------------|-----------|----------------|
| 3.1 | **Показывать статус цели** в заголовке модалки | Средний | Нет |
| 3.2 | **Добавить индикатор несохраненных изменений** | Средний | Нет |
| 3.3 | **Добавить подтверждение удаления** (модалка) | Высокий | Нет |
| 3.4 | **Улучшить визуальную группировку** action buttons по типу | Низкий | Нет |
| 3.5 | **Добавить toast notification** после успешного сохранения | Низкий | Нет |

### Структура данных при сохранении
```javascript
// При редактировании (НЕ МЕНЯТЬ)
const updates = {
  text: editingGoal.value.text,
  whyImportant: editingGoal.value.whyImportant,
  sphereId: editingGoal.value.sphereId,
  status: editingGoal.value.status,
  threeWhys: {
    why1: editingGoal.value.whyImportant,
    why2: editingGoal.value.why2
  }
}
// Вызов: store.updateRawIdea(editingGoal.value.id, updates)
```

---

## 4. GoalEdit.vue - Step Edit Modal

### Текущее состояние
- **Teleport**: ✅ Рендерится в `<body>`
- **Swipe-to-close**: ✅ Реализовано
- **Bottom sheet**: ✅ На мобильных
- **Параметры шага**: Время, дата, приоритет

### Что хорошо
- Компактный интерфейс с chip-селекторами
- Циклический переключатель приоритета
- Опциональное поле комментария
- Подтверждение удаления

### Предложения по улучшению (только UI)

| # | Предложение | Приоритет | Влияние на API |
|---|-------------|-----------|----------------|
| 4.1 | **Добавить drag handle** как в других модалках | Средний | Нет |
| 4.2 | **Показывать название цели** в заголовке | Низкий | Нет |
| 4.3 | **Добавить цветовую индикацию** приоритета на chip | Средний | Нет |
| 4.4 | **Показывать оставшееся время** если дата уже назначена | Низкий | Нет |
| 4.5 | **Добавить keyboard shortcuts** для быстрого сохранения (Enter) | Низкий | Нет |

### Структура данных при сохранении
```javascript
// При редактировании шага (НЕ МЕНЯТЬ)
step.title = editStepForm.value.title.trim()
step.comment = editStepForm.value.comment || ''
step.priority = editStepForm.value.priority || ''
step.timeEstimate = editStepForm.value.timeEstimate || ''
step.scheduledDate = editStepForm.value.scheduledDate || ''
step.checklist = editStepForm.value.checklist.filter(item => item.text.trim())

// Синхронизация с бекендом через updateGoalSteps
```

---

## Сводная таблица приоритетных улучшений

### Высокий приоритет (рекомендуется сделать)

| Компонент | Улучшение | Сложность |
|-----------|-----------|-----------|
| MentorGoalSuggestionsModal | Добавить Teleport to body | Низкая |
| GoalsBank Edit Modal | Добавить подтверждение удаления | Низкая |

### Средний приоритет (улучшит UX)

| Компонент | Улучшение | Сложность |
|-----------|-----------|-----------|
| AddGoalModal | Объединить why1/why2 в одно поле | Средняя |
| MentorGoalSuggestionsModal | Добавить drag handle | Низкая |
| MentorGoalSuggestionsModal | Редактирование названия перед созданием | Средняя |
| GoalsBank Edit Modal | Индикатор несохраненных изменений | Средняя |
| GoalEdit Step Modal | Цветовая индикация приоритета | Низкая |

### Низкий приоритет (nice to have)

| Компонент | Улучшение | Сложность |
|-----------|-----------|-----------|
| AddGoalModal | Счетчик символов | Низкая |
| AddGoalModal | Haptic feedback | Низкая |
| MentorGoalSuggestionsModal | Skeleton loader | Средняя |
| GoalEdit Step Modal | Показывать название цели | Низкая |

---

## Общие рекомендации по стилю

### Унификация модальных окон

Все модальные окна должны иметь:
1. **Teleport to body** — для корректного z-index
2. **Swipe-to-close** — на мобильных устройствах
3. **Drag handle** — визуальный индикатор возможности свайпа
4. **Консистентные отступы** — padding 1.25rem
5. **Единый стиль кнопки закрытия** — 36x36px, border-radius 10px

### Паттерн Bottom Sheet (мобильные)

```css
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal-sheet {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }

  .modal-drag-handle {
    display: flex;
  }
}
```

### Анимации

```css
/* Вход/выход модалки */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: opacity 0.25s ease;
}

.modal-slide-enter-active .modal-sheet,
.modal-slide-leave-active .modal-sheet {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Mobile: slide up */
@media (max-width: 480px) {
  .modal-slide-enter-from .modal-sheet {
    transform: translateY(100%);
  }
}
```

---

## Важно: Что НЕ менять

### API вызовы (оставить как есть)
- `store.addRawIdea()` — создание цели локально
- `store.createGoalOnBackend()` — синхронизация с бекендом
- `store.updateRawIdea()` — обновление цели
- `updateGoals()` — массовое создание/обновление целей
- `updateGoalSteps()` — создание/обновление шагов
- `aiTasksStore.startTaskAndWait()` — AI генерация

### Структуры данных (оставить как есть)
- Маппинг категорий frontend ↔ backend
- Формат goalData при создании
- Формат steps при создании
- Формат SSP данных для ментора

### Store методы (оставить как есть)
- `useAppStore()` — основной store
- `useAITasksStore()` — AI задачи
- Все методы работы с goals/steps

---

## Дополнительные документы

- [USER_FLOW_OPTIMIZATION_STRATEGY.md](./User_flow/USER_FLOW_OPTIMIZATION_STRATEGY.md) — глобальная стратегия оптимизации пользовательского пути
- [FRONTEND_IMPROVEMENTS_PROPOSAL.md](./FRONTEND_IMPROVEMENTS_PROPOSAL.md) — краткий обзор безопасных изменений

---

*Документ создан: 2026-01-20*
*Последнее обновление: 2026-01-20*
