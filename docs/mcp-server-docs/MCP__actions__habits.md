# Habits Actions

Действия для управления привычками.

## habit.create

Создать новую привычку.

### Параметры

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `name` | string | ✓ | — | Название привычки (1-200 символов) |
| `description` | string | — | null | Описание (до 1000 символов) |
| `icon` | string | — | "star" | Иконка (emoji или название) |
| `xp_reward` | integer | — | 10 | XP за выполнение (1-100) |
| `frequency_type` | string | — | "daily" | Частота выполнения |
| `schedule_days` | array | — | null | Дни недели для custom расписания |

### Частота (frequency_type)

| Значение | Описание |
|----------|----------|
| `daily` | Каждый день (7 дней в неделю) |
| `weekly` | Раз в неделю (любой день) |
| `custom` | Пользовательское расписание (нужен schedule_days) |

### Дни недели (schedule_days)

ISO 8601 нумерация:

| Число | День |
|-------|------|
| 1 | Понедельник |
| 2 | Вторник |
| 3 | Среда |
| 4 | Четверг |
| 5 | Пятница |
| 6 | Суббота |
| 7 | Воскресенье |

### Рекомендации по XP

| Сложность | Примеры | XP |
|-----------|---------|-----|
| Лёгкие | Выпить воду, почистить зубы | 5-10 |
| Средние | Чтение 30 мин, медитация | 10-20 |
| Сложные | Тренировка 1 час, изучение языка | 20-50 |

### Примеры

**Ежедневная привычка:**
```json
{
  "action": "habit.create",
  "client_action_id": "uuid-xxx",
  "params": {
    "name": "Утренняя медитация",
    "description": "10 минут осознанности после пробуждения",
    "icon": "brain",
    "xp_reward": 15,
    "frequency_type": "daily"
  }
}
```

**По будням:**
```json
{
  "action": "habit.create",
  "client_action_id": "uuid-xxx",
  "params": {
    "name": "Рабочая тренировка",
    "xp_reward": 25,
    "frequency_type": "custom",
    "schedule_days": [1, 2, 3, 4, 5]
  }
}
```

**По выходным:**
```json
{
  "action": "habit.create",
  "client_action_id": "uuid-xxx",
  "params": {
    "name": "Семейный ужин",
    "frequency_type": "custom",
    "schedule_days": [6, 7]
  }
}
```

---

## habit.update

Обновить существующую привычку.

### Параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `habit_id` | integer | ✓ | ID привычки для обновления |
| `name` | string | — | Новое название |
| `description` | string | — | Новое описание |
| `icon` | string | — | Новая иконка |
| `xp_reward` | integer | — | Новая награда XP |
| `frequency_type` | string | — | Новая частота |
| `schedule_days` | array | — | Новое расписание |

### Пример

```json
{
  "action": "habit.update",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789,
    "name": "Медитация 15 минут",
    "xp_reward": 20
  }
}
```

---

## habit.delete

Удалить привычку (soft delete).

### Параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `habit_id` | integer | ✓ | ID привычки для удаления |

### Пример

```json
{
  "action": "habit.delete",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789
  }
}
```

### Важно

- История выполнений сохраняется
- Привычка перестаёт появляться в ежедневном плане

---

## habit.mark_completed

Отметить привычку как выполненную за указанную дату.

### Параметры

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `habit_id` | integer | ✓ | — | ID привычки |
| `date` | string | — | сегодня | Дата выполнения (YYYY-MM-DD) |

### XP

**+N XP** (значение `habit.xp_reward`)

### Примеры

**Сегодня:**
```json
{
  "action": "habit.mark_completed",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789
  }
}
```

**За вчера:**
```json
{
  "action": "habit.mark_completed",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789,
    "date": "2026-01-26"
  }
}
```

### Ограничения

Можно отмечать за прошлые дни (до 7 дней назад).

---

## habit.mark_missed

Отметить привычку как пропущенную (с возможным excuse).

### Параметры

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `habit_id` | integer | ✓ | — | ID привычки |
| `date` | string | — | сегодня | Дата пропуска (YYYY-MM-DD) |
| `excuse_reason` | string | — | null | Причина пропуска |

### XP (логика штрафов)

| Ситуация | XP |
|----------|-----|
| БЕЗ excuse_reason | -N XP (штраф = habit.xp_reward) |
| С excuse_reason | 0 XP (без штрафа) |

### Примеры

**Пропуск со штрафом:**
```json
{
  "action": "habit.mark_missed",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789
  }
}
```

**Уважительный пропуск (без штрафа):**
```json
{
  "action": "habit.mark_missed",
  "client_action_id": "uuid-xxx",
  "params": {
    "habit_id": 789,
    "date": "2026-01-26",
    "excuse_reason": "Был на больничном"
  }
}
```
