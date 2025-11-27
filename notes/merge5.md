# Merge 5 - Planning Module Cleanup

**Дата:** 27 ноября 2025

## Обзор сессии

В этой сессии была попытка добавить функцию hover popover для карточек задач в модуле Планирование, но по запросу пользователя функция была полностью откачена.

---

## Выполненные изменения

### 1. Исправлена ошибка дублирования функции

**Файл:** `src/views/Planning.vue`

**Проблема:** Функция `formatTimeEstimate` была объявлена дважды (строки 1221 и 1258), что вызывало ошибку компиляции:
```
Identifier 'formatTimeEstimate' has already been declared
```

**Решение:** Удалена дублирующая функция на строке 1258-1266.

---

### 2. Попытка добавления Hover Popover (ОТКАЧЕНО)

#### 2.1 Компактный календарь (режим урока, шаг 2)

**Было добавлено:**
- Wrapper `<div class="scheduled-task-wrapper">` вокруг карточек задач
- Popover `<div class="task-popover">` с информацией:
  - Приоритет (цветной бейдж)
  - Название шага
  - Название цели с иконкой Target
  - Время с иконкой Clock
  - Комментарий с иконкой MessageSquare

#### 2.2 Полный календарь (основной режим планировщика)

**Было добавлено:**
- Wrapper `<div class="task-card-wrapper">` вокруг карточек
- Popover `<div class="task-card-popover">` с аналогичной информацией

#### 2.3 CSS стили для popover

**Было добавлено:**
- `.scheduled-task-wrapper` - position: relative
- `.task-popover` - абсолютно позиционированный popover снизу
- `.task-card-wrapper` - position: relative для полного вида
- `.task-card-popover` - popover справа от карточки
- `overflow: visible` для всех родительских контейнеров
- Анимация `@keyframes popoverFadeIn`
- Стили для `.popover-header`, `.popover-priority-badge`, `.popover-title`, `.popover-goal`, `.popover-meta`, `.popover-time`, `.popover-comment`

---

### 3. Откат Popover функционала

**По запросу пользователя все изменения связанные с popover были удалены.**

#### 3.1 Удалено из HTML

**Компактный календарь (строки ~221-237):**
```vue
<!-- Было -->
<div class="scheduled-task-wrapper">
  <div class="scheduled-task">...</div>
  <div class="task-popover">...</div>
</div>

<!-- Стало -->
<div class="scheduled-task">...</div>
```

**Полный календарь (строки ~599-635):**
```vue
<!-- Было -->
<div class="task-card-wrapper">
  <div class="task-card">...</div>
  <div class="task-card-popover">...</div>
</div>

<!-- Стало -->
<div class="task-card">...</div>
```

#### 3.2 Удалено из CSS

Удалены все стили popover (~90 строк):
- `.scheduled-task-wrapper`
- `.task-popover` и все вложенные стили
- `.task-card-wrapper`
- `.task-card-popover`
- `@keyframes popoverFadeIn`
- `.popover-*` классы

#### 3.3 Удалены overflow: visible

Убраны из контейнеров:
- `.week-calendar`
- `.calendar-grid`
- `.calendar-day`
- `.day-tasks`
- `.week-calendar-full`
- `.calendar-grid-full`
- `.calendar-day-full`

#### 3.4 Удалены неиспользуемые импорты

```javascript
// Удалено из импортов lucide-vue-next:
Clock,
MessageSquare
```

---

## Итоговое состояние

### Planning.vue

Модуль Планирование работает в чистом виде:
- Карточки задач в компактном календаре показывают название и время
- Карточки в полном календаре показывают название, цель, время и кнопку удаления
- Никаких всплывающих подсказок при наведении

### Импорты Lucide

Актуальный список импортов:
```javascript
import { 
  Calendar, 
  BookOpen, 
  Target, 
  Lightbulb, 
  Zap, 
  AlertTriangle, 
  RefreshCcw, 
  Smartphone, 
  Sparkles,
  Square,
  ArrowRight,
  CheckSquare
} from 'lucide-vue-next'
```

---

## Технические заметки

### Почему popover не работал изначально

1. **Неправильный вид календаря:** Popover был добавлен только в компактный вид (шаг урока), но пользователь тестировал в полном виде (основной режим после урока)

2. **Overflow clipping:** Родительские контейнеры имели неявный `overflow: hidden`, что обрезало абсолютно позиционированный popover

3. **Разные классы:** В разных режимах используются разные классы карточек:
   - Урок: `.scheduled-task`
   - Планировщик: `.task-card`

### Уроки

- Перед добавлением UI фичи нужно проверить ВСЕ режимы отображения
- CSS popover требует careful management of overflow на всей цепочке родителей
- Лучше предлагать альтернативы (tooltip библиотека, click modal) вместо pure CSS решений

---

## Файлы изменённые в этой сессии

| Файл | Изменения |
|------|-----------|
| `src/views/Planning.vue` | Исправлен дубликат функции, добавлен/удалён popover |

---

## Статус

✅ Приложение работает корректно
✅ Popover полностью удалён
✅ Код очищен от неиспользуемых импортов
