# Отчёт для Frontend: Расхождения в системе стриков

**Дата:** 2026-01-17

---

## Что нужно исправить на фронтенде

### 1. Journal Streak — изменить логику расчёта

**Текущая логика (неверная):**
```javascript
// src/stores/app.js
const journalStreak = computed(() => {
  for (let i = 0; i < 365; i++) {
    const hasEntry = journal.value.entries.some(e => e.date === dateStr)
    if (hasEntry) {
      streak++
    } else if (i > 0) {  // <-- ПРОБЛЕМА: пропускаем сегодня
      break
    }
  }
  return streak
})
```

**Проблема:**
Если сегодня нет записи, но вчера была — стрик продолжается. На бэкенде логика строже: если сегодня нет записи → streak = 0.

**Как должно быть (синхронизация с бэкендом):**
```javascript
const journalStreak = computed(() => {
  if (journal.value.entries.length === 0) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]

    const hasEntry = journal.value.entries.some(e => e.date === dateStr)
    if (hasEntry) {
      streak++
    } else {
      break  // <-- Прерываем сразу, даже если это сегодня
    }
  }

  return streak
})
```

**Решение:** Используем строгую логику бэкенда. Исправить фронтенд.

---

### 2. Убрать/скрыть отображение `best_streak`

**Факт:**
Бэкенд **НЕ возвращает** поле `best_streak`. Оно нигде не рассчитывается и не хранится.

**Что делать:**

**Вариант А:** Убрать отображение "Лучшая серия" из UI до реализации на бэкенде.

**Вариант Б:** Рассчитывать локально на фронте (но данные потеряются при очистке localStorage):
```javascript
// При получении данных
const currentStreak = habitsStore.statsPanel.streak
const storedBestStreak = localStorage.getItem('bestHabitStreak') || 0
const bestStreak = Math.max(currentStreak, parseInt(storedBestStreak))
localStorage.setItem('bestHabitStreak', bestStreak)
```

**Рекомендация:** Вариант А — убрать до реализации на бэке, чтобы не показывать некорректные данные.

---

### 3. Проверить использование полей streak

**API возвращает:**

| Эндпоинт | Поле | Описание |
|----------|------|----------|
| `/app/habits/stats-panel/get/` | `streak` | Общий стрик всех привычек |
| `/app/habits/stats-panel/get/` | `streak_days[]` | Массив дней для календаря |
| `/app/habits/analytics/get/` | `current_streak` | Общий стрик |
| `/app/habits/analytics/get/` | `habits_data[].streak` | Стрик конкретной привычки |

**Проверь:**
- Используется ли `habitsStore.statsPanel.streak` для отображения общего стрика (должно быть ОК)
- Если где-то ожидается `best_streak` — см. пункт 2
- Если где-то ожидается `current_streak` вместо `streak` — исправить на `streak`

---

## Что корректно и не требует изменений

| Функционал | Статус |
|------------|--------|
| Habit Streak (общий) из `/stats-panel/` | OK |
| `streak_days` для календаря | OK |
| Достижения категории `streak` | OK |
| Цвета календаря (success/partial/missed) | OK |

---

## Резюме задач

| # | Задача | Приоритет | Сложность |
|---|--------|-----------|-----------|
| 1 | Исправить логику Journal Streak | Высокий | Низкая |
| 2 | Скрыть `best_streak` (если отображается) | Средний | Низкая |
| 3 | Проверить имена полей streak | Низкий | Низкая |

---

## Решение по Journal Streak

**Выбрана строгая логика (как на бэкенде):**
- Нет записи сегодня = streak сбрасывается до 0
- Фронтенд должен быть исправлен согласно коду в пункте 1
