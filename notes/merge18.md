# Merge 18: Унификация модального окна редактирования цели

**Дата:** 6 декабря 2025

## Обзор

Унификация модального окна редактирования цели между страницами GoalsBank и GoalEdit (страница шагов). Теперь обе страницы используют одинаковый дизайн модального окна с табами.

---

## Выполненные изменения

### 1. GoalEdit.vue - Новое модальное окно редактирования цели

**Заменено старое модальное окно на новый дизайн с табами:**

- **Таб "Основное":**
  - Название цели (input)
  - Сфера жизни (grid с кнопками выбора)

- **Таб "Мотивация":**
  - Вступительный блок с иконкой лампочки
  - Поле "Почему для меня это важно?"
  - Поле "Как это изменит мою жизнь?"

- **Таб "Статус":**
  - Статус работы (toggle "В работе")
  - Оценка цели (кнопки "Подтвердить" / "Отклонить")
  - Прогресс (progress bar с X/Y шагов)
  - Удалить цель (красная кнопка в пунктирной рамке)

**Добавлены импорты иконок:**
```javascript
import { FileText, Lightbulb, Shield, BarChart2 } from 'lucide-vue-next'
```

**Добавлены CSS стили:**
- `.edit-modal-redesigned` - контейнер модалки
- `.modal-tabs`, `.modal-tab` - навигация по табам
- `.modal-body-tabs` - контент табов
- `.status-card`, `.status-card-header` - карточки статуса
- `.toggle-switch`, `.toggle-slider` - переключатель
- `.validation-buttons-new` - кнопки валидации
- `.progress-info`, `.progress-bar-container` - прогресс
- `.status-card-danger` - опасная зона (удаление)
- Адаптивные стили для мобильных устройств

### 2. Исправление синхронизации поля title

**Проблема:** Поле названия цели было привязано к `editingGoal.text`, но логика сохранения использовала `editingGoal.title`.

**Решение:** Изменено `v-model="editingGoal.text"` на `v-model="editingGoal.title"` в поле "Название цели".

### 3. Удаление кнопки "Завершить" (Quick Action)

**Причина:** Кнопка вводила пользователей в заблуждение - непонятно что завершается.

**Решение:** Удалён блок `<div class="quick-actions-goal">` с кнопкой "Завершить". Теперь завершить цель можно только через вкладку "Статус".

### 4. GoalsBank.vue - Исправление отступа кнопок

**Проблема:** Кнопки "В работе" и "Шаги" (quick-actions) были слишком близко к заголовку модалки.

**Решение:** Добавлен `margin-top: 0.75rem` к классу `.quick-actions`:

```css
.quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem;
  margin-top: 0.75rem;    /* Добавлено */
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
```

---

## Архитектурное решение

**Редактирование цели доступно из двух мест:**

1. **GoalsBank** (`/app/goals-bank`) - управление портфелем целей
2. **GoalEdit** (`/app/goals/{id}`) - страница шагов цели

Это стандартный паттерн inline editing - пользователь может редактировать цель там, где находится, без лишних переходов. Данные синхронизируются через общий Pinia store и backend API.

---

## Файлы изменены

| Файл | Изменения |
|------|-----------|
| `src/views/GoalEdit.vue` | Новое модальное окно с табами, CSS стили, исправление title, удаление Quick Action |
| `src/views/GoalsBank.vue` | Добавлен margin-top для quick-actions |

---

## Технические детали

### Структура модального окна

```html
<div class="edit-modal edit-modal-redesigned">
  <div class="modal-header">...</div>
  
  <div class="modal-tabs">
    <button class="modal-tab">Основное</button>
    <button class="modal-tab">Мотивация</button>
    <button class="modal-tab">Статус</button>
  </div>
  
  <div class="modal-body modal-body-tabs">
    <div v-show="editModalTab === 'main'">...</div>
    <div v-show="editModalTab === 'motivation'">...</div>
    <div v-show="editModalTab === 'status'">...</div>
  </div>
  
  <div class="modal-footer modal-footer-redesigned">
    <button>Отмена</button>
    <button>Сохранить</button>
  </div>
</div>
```

### Функции

- `openEditModal()` - открытие модалки с заполнением editingGoal
- `closeEditModal()` - закрытие модалки
- `saveEditModal()` - сохранение с синхронизацией на backend
- `deleteGoalFromModal()` - удаление цели с подтверждением

### Вычисляемые свойства для прогресса

```javascript
const totalStepsCount = computed(() => steps.value.length)
const completedStepsCount = computed(() => steps.value.filter(s => s.completed).length)
const completionProgress = computed(() => {
  if (totalStepsCount.value === 0) return 0
  return Math.round((completedStepsCount.value / totalStepsCount.value) * 100)
})
```

---

## Статус

✅ Завершено и протестировано
