# Merge 37: Мобильная навигация Remente-style и оптимизация форм

**Дата:** 19 января 2026

## Обзор изменений

В этом merge реализована мобильная навигация в стиле Remente с центральной FAB-кнопкой, исправлено затемнение overlay, и оптимизирована форма "Быстрая задача" с заменой кнопок на компактные dropdown.

---

## 1. Мобильная навигация Remente-style

### Файл: `src/components/BottomNavigation.vue`

**Структура навигации:**
```
Главная - Цели - [FAB] - План - Ещё
```

**Изменения:**
- FAB кнопка интегрирована в центр нижней навигации
- FAB выступает над панелью навигации (Remente-style)
- При нажатии на FAB открывается меню с 5 действиями:
  - Быстрая задача
  - Новая цель
  - Запись в дневник
  - Добавить привычку
  - AI ментор

**Стили FAB:**
- Цвет: `#4f46e5` (индиго)
- Убрано свечение (`box-shadow: none`)
- z-index: 1070 (выше overlay)
- Иконка поворачивается на 45° при открытии (превращается в ×)

---

## 2. Исправление затемнения при открытии FAB

### Проблема:
Overlay не отображался при открытии FAB меню из-за стекового контекста.

### Решение:
- Overlay вынесен из `.fab-spacer` на верхний уровень через `<Teleport to="body">`
- Добавлен отдельный глобальный `<style>` блок (без scoped) для overlay стилей

**z-index иерархия:**
| Элемент | z-index |
|---------|---------|
| Overlay | 1050 |
| FAB Menu | 1060 |
| FAB Button | 1070 |
| Bottom Nav | 1100 |

**Код overlay:**
```vue
<Teleport to="body">
  <Transition name="fab-overlay">
    <div 
      v-if="fabOpen" 
      class="fab-overlay"
      @click="closeFab"
    ></div>
  </Transition>
</Teleport>
```

**Глобальные стили:**
```css
<style>
.fab-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1050;
}
</style>
```

---

## 3. Скрытие кнопки ментора на мобильной версии

### Файл: `src/components/MentorFloatingButton.vue`

**Добавлено:**
```css
@media (max-width: 768px) {
  .mentor-floating-container {
    display: none;
  }
}
```

Теперь на мобильных устройствах доступ к AI ментору только через FAB меню.

---

## 4. Оптимизация формы "Быстрая задача"

### Файл: `src/components/QuickAddTask.vue`

### Этап 1: Компактные кнопки с горизонтальным скроллом

**Сокращённые лейблы:**
| Было | Стало |
|------|-------|
| Критично | Крит |
| В поле внимания | Внимание |
| По возможности | Можно |
| 30 минут | 30м |
| 1 час | 1ч |
| Без даты | — |

**Стили pill-selector:**
```css
.pill-selector {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.pill-btn {
  padding: 6px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}
```

### Этап 2: Замена на dropdown

**Новая структура:**
```vue
<div class="compact-selectors">
  <div class="compact-field">
    <label><Calendar /> Когда</label>
    <select v-model="selectedDay" @change="onDayChange">...</select>
  </div>
  <div class="compact-field">
    <label><Flag /> Приоритет</label>
    <select v-model="selectedPriority">...</select>
  </div>
  <div class="compact-field">
    <label><Clock /> Время</label>
    <select v-model="selectedTime">...</select>
  </div>
</div>
```

**Особенности:**
- 3 dropdown в ряд на десктопе
- Вертикально на мобильном (< 480px)
- Цветной индикатор приоритета (точка слева от select)
- Автозаполнение даты при выборе "Выбрать дату"

**Computed для цвета приоритета:**
```javascript
const selectedPriorityColor = computed(() => {
  const p = priorityOptions.find(opt => opt.value === selectedPriority.value)
  return p?.color || null
})
```

**Стили compact-selectors:**
```css
.compact-selectors {
  display: flex;
  gap: 12px;
}

.compact-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compact-select {
  padding: 8px 28px 8px 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  appearance: none;
}

.priority-dot {
  position: absolute;
  left: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@media (max-width: 480px) {
  .compact-selectors {
    flex-direction: column;
    gap: 16px;
  }
}
```

---

## Затронутые файлы

| Файл | Изменения |
|------|-----------|
| `src/components/BottomNavigation.vue` | FAB стили, Teleport для overlay, глобальные стили |
| `src/components/MentorFloatingButton.vue` | Media query для скрытия на mobile |
| `src/components/QuickAddTask.vue` | Замена pill-кнопок на dropdown, compact стили |

---

## Коммиты

1. `fcf4671` - Add Remente-style mobile bottom navigation with integrated FAB
2. `0ccffbf` - Update mobile navigation and button styles for better user experience
3. `a152d0f` - Update FAB overlay and styles to display correctly on mobile devices
4. `d571d07` - Improve task creation form layout for mobile users
5. `3f8ad09` - Update task creation form to use dropdown menus for date, priority, and time

---

## Результат

- Мобильная навигация теперь соответствует паттерну Remente
- Затемнение фона работает корректно при открытии FAB
- Форма "Быстрая задача" занимает значительно меньше места
- Улучшен UX на мобильных устройствах
