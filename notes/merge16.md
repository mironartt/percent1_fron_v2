# Merge 16: UI/UX улучшения и исправления

**Дата:** 5 декабря 2025

## Обзор изменений

Сессия включала улучшения мобильной версии формы в Банке целей, удаление отображения штрафов в привычках и исправление визуального бага с border-radius на карточках.

---

## 1. Улучшение формы добавления/редактирования цели (мобильная версия)

**Файл:** `src/views/GoalsBank.vue`

### 1.1 Сокращение текста кнопок оценки

**Было:**
```
"Это истинная цель" / "Это ложная цель"
```

**Стало:**
```
"Истинная" / "Ложная"
```

**Причина:** Экономия места на мобильных экранах, улучшение читаемости.

### 1.2 Горизонтальное расположение кнопок действий

**Было:** Кнопки "Отмена" и "Добавить цель" располагались вертикально.

**Стало:** Кнопки расположены горизонтально в одну строку.

**CSS изменения:**
```css
.modal-footer-add {
  flex-direction: row !important;
  gap: 0.75rem;
}

.modal-footer-add .btn {
  flex: 1;
  min-width: 0;
}
```

### 1.3 Аккордеон для полей вопросов

**Проблема:** Поля "Почему для меня это важно?" и "Зачем мне это нужно?" занимали много места.

**Решение:** Превращены в сворачиваемые блоки (аккордеон):
- По умолчанию свёрнуты
- Показывают превью текста (первые 50 символов)
- Разворачиваются по клику

**Новые refs:**
```javascript
const whyAccordion = ref({ why1: false, why2: false })
const editWhyAccordion = ref({ why1: false, why2: false })
```

**Функция сброса состояния:**
```javascript
function resetAccordion(isEdit = false) {
  if (isEdit) {
    editWhyAccordion.value = { why1: false, why2: false }
  } else {
    whyAccordion.value = { why1: false, why2: false }
  }
}
```

**Вызывается при:**
- `addNewGoal()` — открытие модали добавления
- `closeAddModal()` — закрытие модали добавления
- `openEditModal()` — открытие модали редактирования
- `closeEditModal()` — закрытие модали редактирования

**CSS стили:**
```css
.why-accordion {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.why-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  cursor: pointer;
}

.why-accordion-content {
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.why-preview {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## 2. Удаление отображения штрафа на карточках привычек

**Файл:** `src/views/Habits.vue`

### Проблема:
На карточке привычки отображался красный бейдж "-3 XP" (штраф за пропуск), что вызывало вопросы у пользователей.

### Решение:
Удалён элемент отображения штрафа из карточки привычки.

**Удалено:**
```vue
<span v-if="habit.xpPenalty && gameSettings.penaltiesEnabled" class="xp-badge negative">
  -{{ habit.xpPenalty }} XP
</span>
```

**Примечание:** Система штрафов продолжает работать в фоне, просто не отображается на карточке.

---

## 3. Исправление скашивания border-radius на карточках целей

**Файл:** `src/views/GoalsBank.vue`

### Проблема:
Синий/цветной индикатор статуса слева на карточках целей "скашивался" по углам из-за использования `border-left` вместо псевдоэлемента.

### Решение:
Заменён `border-left` на псевдоэлемент `::before` с правильным `border-radius`.

### 3.1 Карточки `.idea-card`

**Было:**
```css
.idea-card.validated {
  border-left: 3px solid var(--success-color);
}

.idea-card.rejected {
  border-left: 3px solid var(--danger-color);
}
```

**Стало:**
```css
.idea-card {
  position: relative;
  overflow: hidden;
}

.idea-card.validated::before,
.idea-card.rejected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.idea-card.validated::before {
  background: var(--success-color);
}

.idea-card.rejected::before {
  background: var(--danger-color);
}
```

### 3.2 Карточки `.validation-card`

Аналогичное исправление для карточек валидации:
```css
.validation-card {
  position: relative;
  overflow: hidden;
}

.validation-card.validated::before,
.validation-card.rejected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}
```

### 3.3 Карточки `.selectable-goal-item.weak-sphere`

```css
.selectable-goal-item.weak-sphere {
  position: relative;
  overflow: hidden;
}

.selectable-goal-item.weak-sphere::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--warning-color);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}
```

### 3.4 Мобильные карточки целей (таблица)

**Проблема:**
- `overflow: visible` мешал корректному отображению скруглённых углов
- При смене статуса менялась толщина border (1px → 2px), что создавало "дёргание"

**Было:**
```css
.goals-table-section .goals-table tbody tr {
  border: 1px solid var(--border-color);
  overflow: visible;
}

.goals-table-section .goals-table tbody tr.in-work {
  border-color: var(--primary-color);
  border-width: 2px;
}
```

**Стало:**
```css
.goals-table-section .goals-table tbody tr {
  border: 2px solid var(--border-color);
  overflow: hidden;
}

.goals-table-section .goals-table tbody tr.in-work {
  border-color: var(--primary-color);
}
```

---

## Итоговый список изменений

### Файлы изменены:

1. **`src/views/GoalsBank.vue`**
   - Сокращены тексты кнопок оценки
   - Добавлен аккордеон для полей вопросов
   - Горизонтальное расположение кнопок в футере модали
   - Исправлен border-radius для индикаторов статуса (4 места)
   - Исправлен overflow и унифицирован border для мобильных карточек

2. **`src/views/Habits.vue`**
   - Удалено отображение штрафа (-X XP) на карточках привычек

---

## Технические детали

### Паттерн исправления border-radius:

Вместо использования `border-left` на элементе со скруглёнными углами:
1. Добавить `position: relative; overflow: hidden` на контейнер
2. Использовать `::before` псевдоэлемент для индикатора
3. Задать `border-radius` только для левых углов: `border-radius: Xpx 0 0 Xpx`

### Паттерн аккордеона:

1. Состояние хранится в ref объекте: `{ why1: false, why2: false }`
2. Функция toggle: `accordion.value.key = !accordion.value.key`
3. Функция reset вызывается при открытии/закрытии модального окна
4. Превью показывает первые N символов: `text.slice(0, 50)`
