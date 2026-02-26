# Actions Index

Полный список доступных действий для `preview_actions` / `apply_actions`.

## Формат action

```json
{
  "action": "domain.verb",
  "client_action_id": "uuid-xxx-xxx",
  "params": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

- `action` — обязательный, формат `domain.verb`
- `client_action_id` — обязательный, UUID для трассировки
- `params` — параметры действия (зависят от типа)

---

## Все действия

| Домен | Action | Описание | XP | Документация |
|-------|--------|----------|-----|--------------|
| **Goals** | `goal.create` | Создать новую цель | 0 | [MCP__actions__goals.md](MCP__actions__goals.md) |
| | `goal.update` | Обновить существующую цель | 0 | [MCP__actions__goals.md](MCP__actions__goals.md) |
| | `goal.complete` | Отметить цель выполненной | +150 | [MCP__actions__goals.md](MCP__actions__goals.md) |
| | `goal.delete` | Удалить цель (soft delete) | 0 | [MCP__actions__goals.md](MCP__actions__goals.md) |
| **Steps** | `step.create` | Создать шаг для цели | 0 | [MCP__actions__steps.md](MCP__actions__steps.md) |
| | `step.update` | Обновить шаг | 0 | [MCP__actions__steps.md](MCP__actions__steps.md) |
| | `step.complete` | Отметить шаг выполненным | +25 | [MCP__actions__steps.md](MCP__actions__steps.md) |
| | `step.delete` | Удалить шаг | 0 | [MCP__actions__steps.md](MCP__actions__steps.md) |
| **Habits** | `habit.create` | Создать привычку | 0 | [MCP__actions__habits.md](MCP__actions__habits.md) |
| | `habit.update` | Обновить привычку | 0 | [MCP__actions__habits.md](MCP__actions__habits.md) |
| | `habit.delete` | Удалить привычку | 0 | [MCP__actions__habits.md](MCP__actions__habits.md) |
| | `habit.mark_completed` | Отметить привычку выполненной | +N | [MCP__actions__habits.md](MCP__actions__habits.md) |
| | `habit.mark_missed` | Отметить привычку пропущенной | -N/0 | [MCP__actions__habits.md](MCP__actions__habits.md) |
| **Diary** | `diary.create_entry` | Создать запись в дневнике | +10 | [MCP__actions__diary.md](MCP__actions__diary.md) |
| | `diary.update_entry` | Обновить запись | 0 | [MCP__actions__diary.md](MCP__actions__diary.md) |

---

## Категории (category)

Используются для целей и соответствуют жизненным сферам ССП:

| Значение | Описание |
|----------|----------|
| `work` | Карьера, работа, профессиональное развитие |
| `health_sport` | Здоровье, спорт, физическая форма |
| `welfare` | Финансы, благосостояние, материальные цели |
| `family` | Семья, отношения, личная жизнь |
| `environment` | Окружение, друзья, нетворкинг |
| `hobby` | Хобби, увлечения, творчество |

---

## Приоритеты (priority)

Используются для шагов целей:

| Значение | Описание | Цвет |
|----------|----------|------|
| `critical` | Критический, срочный | Красный |
| `important` | Важный, но не срочный | Оранжевый |
| `attention` | Требует внимания | Жёлтый |
| `optional` | Опциональный, можно отложить | Серый |

---

## Частота привычек (frequency_type)

| Значение | Описание |
|----------|----------|
| `daily` | Каждый день (7 дней в неделю) |
| `weekly` | Раз в неделю |
| `custom` | Пользовательское расписание (требуется schedule_days) |

---

## Настроение дневника (mood)

| Значение | Описание |
|----------|----------|
| `great` | Отличное |
| `good` | Хорошее |
| `neutral` | Нейтральное |
| `bad` | Плохое |
| `awful` | Ужасное |

---

## XP система

| Действие | XP |
|----------|-----|
| goal.complete | +150 |
| step.complete | +25 |
| habit.mark_completed | +N (habit.xp_reward) |
| habit.mark_missed | -N или 0 (с excuse) |
| diary.create_entry | +10 |

---

## Связанные документы

- [MCP__preview_actions.md](MCP__preview_actions.md) — создание preview
- [MCP__apply_actions.md](MCP__apply_actions.md) — применение изменений
- [MCP__schemas.md](MCP__schemas.md) — JSON Schema для параметров
