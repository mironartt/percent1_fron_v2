# Merge 17: Toast Store Fix и кнопка редактирования привычек

**Дата:** 5 декабря 2025

## Обзор изменений

Сессия включала исправление критического бага с toast store (отсутствие методов error/success) и добавление кнопки редактирования в карточки привычек.

---

## 1. Исправление Toast Store

**Файл:** `src/stores/toast.js`

### Проблема

При нажатии кнопки "Добавить цели" в попапе PlanReview возникала ошибка:
```
TypeError: toastStore.error is not a function
```

Это приводило к тому, что:
- Попап не закрывался после добавления целей
- Функция `confirmAIRecommendations` прерывалась с ошибкой

### Причина

В toast store был только метод `showToast()`, но код в других местах вызывал `toastStore.error()`, `toastStore.success()` и т.д.

### Решение

Добавлены helper-методы для удобного показа уведомлений:

```javascript
function success(message, options = {}) {
  return showToast({
    type: 'success',
    title: message,
    ...options
  })
}

function error(message, options = {}) {
  return showToast({
    type: 'error',
    title: message,
    ...options
  })
}

function warning(message, options = {}) {
  return showToast({
    type: 'warning',
    title: message,
    ...options
  })
}

function info(message, options = {}) {
  return showToast({
    type: 'info',
    title: message,
    ...options
  })
}
```

### Экспорт

```javascript
return {
  toasts,
  showToast,
  removeToast,
  clearAllToasts,
  success,  // новый
  error,    // новый
  warning,  // новый
  info      // новый
}
```

---

## 2. Кнопка редактирования привычки

**Файл:** `src/views/Habits.vue`

### Проблема

На странице привычек отсутствовала возможность редактировать уже созданные привычки. Функция `editHabit(habit)` существовала в коде, но не было UI-элемента для её вызова.

### Решение

Добавлена кнопка с иконкой карандаша в карточку привычки.

### HTML изменения

В `habit-row-top` после `xp-badge` добавлена кнопка:

```html
<button 
  class="btn-edit-habit" 
  @click.stop="editHabit(habit)" 
  title="Редактировать привычку"
>
  <Pencil :size="14" :stroke-width="1.5" />
</button>
```

**Важно:** Использован `@click.stop` для предотвращения триггера `toggleHabitCompletion` при клике на карандаш.

### CSS стили

```css
.btn-edit-habit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  flex-shrink: 0;
}

.habit-card:hover .btn-edit-habit {
  opacity: 1;
}

.btn-edit-habit:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .btn-edit-habit {
    opacity: 1;
    width: 32px;
    height: 32px;
  }
}
```

### Поведение

| Устройство | Поведение |
|------------|-----------|
| Desktop | Кнопка скрыта, появляется при hover на карточку |
| Mobile (≤768px) | Кнопка всегда видна, увеличенный размер для touch |

### Layout

Структура `habit-row-top`:
```
[checkbox] [icon] [name (flex:1)] [xp-badge] [edit-btn] [xp-popup]
```

- `habit-name` имеет `flex: 1` — занимает всё свободное пространство
- `xp-badge` и `btn-edit-habit` имеют `flex-shrink: 0` — не сжимаются

---

## Выявленные, но не исправленные проблемы

### 1. Ошибка сохранения целей в режиме без бэкенда

**Файл:** `src/stores/app.js` — функция `confirmAIRecommendations`

**Проблема:** При попытке сохранить AI-рекомендованные цели без запущенного бэкенд-сервера показывается ошибка "Не удалось сохранить цели".

**Решение (не реализовано):** Проверять `SKIP_AUTH_CHECK` и сохранять цели только локально в store без обращения к API.

### 2. Однобуквенные сокращения дней недели

**Файл:** `src/views/Habits.vue` — строка 317

**Проблема:** 
```javascript
{{ day.short.charAt(0) }}
```
Отображает П, В, С, Ч, П, С, В — буквы повторяются (Пн и Пт = П).

**Решение (не реализовано):** Использовать `day.short` вместо `day.short.charAt(0)` для отображения двухбуквенных сокращений (Пн, Вт, Ср, Чт, Пт, Сб, Вс).

---

## Технические детали

### Иконка Pencil

Уже была импортирована в компоненте:
```javascript
import { 
  Check, Pencil, X, Trash2, Settings, Gift, Archive, Info, TrendingUp, Calendar, Award,
  // ...
} from 'lucide-vue-next'
```

### Функция editHabit

Уже существовала в коде:
```javascript
function editHabit(habit) {
  editingHabit.value = habit
  // заполнение formData данными привычки
  // ...
  showHabitModal.value = true
}
```

---

## Файлы изменены

| Файл | Тип изменения |
|------|---------------|
| `src/stores/toast.js` | Добавлены методы success, error, warning, info |
| `src/views/Habits.vue` | Добавлена кнопка редактирования + CSS стили |
