# preview_actions

Фаза 1 двухфазного коммита: создать предпросмотр изменений.

## Назначение

**Критически важно:** ВСЕГДА вызывай этот инструмент ПЕРЕД любыми изменениями данных! НИКОГДА не вызывай apply_actions напрямую.

Инструмент реализует ПЕРВУЮ ФАЗУ двухфазного коммита:
1. Принимает список действий (создание/изменение/удаление/завершение)
2. Валидирует каждое действие (проверяет существование сущностей, права доступа)
3. Генерирует детальный diff — показывает ЧТО изменится
4. Сохраняет preview в БД с TTL 5 минут
5. Возвращает preview_id для последующего apply_actions

**Зачем нужен двухфазный коммит:**
- Пользователь ВИДИТ все изменения ДО их применения
- Пользователь может ОТКАЗАТЬСЯ от изменений
- Защита от случайных или нежелательных модификаций
- Возможность корректировки перед применением
- Аудит и логирование намерений

---

## Workflow (обязательный порядок)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Шаг 1: ПОЛЬЗОВАТЕЛЬ ПРОСИТ ИЗМЕНИТЬ ДАННЫЕ                                │
│         "Создай цель выучить Python"                                        │
│         "Отметь эту привычку выполненной"                                   │
│         "Удали вчерашний шаг"                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Шаг 2: ТЫ ВЫЗЫВАЕШЬ preview_actions                                       │
│         → Передаёшь список действий                                         │
│         → Получаешь diff и preview_id                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Шаг 3: ТЫ ПОКАЗЫВАЕШЬ ПОЛЬЗОВАТЕЛЮ DIFF                                   │
│         "Вот что изменится:"                                                │
│         "✓ Будет создана цель 'Выучить Python' (категория: Карьера)"       │
│         "Применить эти изменения?"                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Шаг 4: ЖДЁШЬ ПОДТВЕРЖДЕНИЯ ПОЛЬЗОВАТЕЛЯ                                   │
│         ✓ "да" / "ок" / "применить" / "давай" → переходи к шагу 5          │
│         ✗ "нет" / "отмена" / "стоп" → НЕ вызывай apply_actions             │
│         ? "измени..." → создай новый preview_actions с корректировками     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Шаг 5: ВЫЗЫВАЕШЬ apply_actions с preview_id                               │
│         → Изменения применяются атомарно                                    │
│         → Сообщаешь пользователю результат                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Важно:** Preview живёт только 5 минут! Если истёк — создай новый через preview_actions.

---

## Параметры

### actions (array, ОБЯЗАТЕЛЬНО)

Массив действий для предпросмотра и последующего применения.

**Формат:**
```json
[
  {"action": "goal.create", "client_action_id": "uuid-xxx", "params": {...}},
  {"action": "step.complete", "client_action_id": "uuid-yyy", "params": {...}},
  ...
]
```

Каждый элемент массива содержит:
- `action` (string, ОБЯЗАТЕЛЬНО) — имя действия в формате `domain.verb`
- `client_action_id` (string, ОБЯЗАТЕЛЬНО) — UUID для трассировки
- `params` (object, опционально) — параметры действия

Поддерживается до 50 действий в одном запросе.
Действия выполняются последовательно в порядке указания.

---

## Структура ответа

### Успешный ответ

```json
{
  "success": true,
  "preview_id": "5f02f604-1685-47dd-8f9c-535187d30d1c",
  "expires_in_seconds": 300,
  "diff": {
    "creates": [...],
    "updates": [...],
    "deletes": [...],
    "completions": [...],
    "errors": [...]
  },
  "message": "Покажи пользователю diff и спроси подтверждение..."
}
```

### Ответ с ошибкой

```json
{
  "success": false,
  "error": "All actions failed validation",
  "errors": [
    {"action": "goal.delete", "client_action_id": "uuid-xxx", "error": "Goal not found"},
    {"action": "invalid_action", "client_action_id": "uuid-yyy", "error": "Unknown action: invalid_action"}
  ]
}
```

---

## Структура diff

### creates (создание новых сущностей)

```json
[
  {
    "entity": "goal",
    "client_action_id": "uuid-xxx",
    "title": "Выучить Python",
    "category": "work"
  },
  {
    "entity": "habit",
    "client_action_id": "uuid-yyy",
    "name": "Медитация",
    "icon": "brain",
    "xp_reward": 15,
    "frequency": "daily"
  },
  {
    "entity": "diary",
    "client_action_id": "uuid-zzz",
    "date": "2026-01-27",
    "what_done_preview": "Завершил 3 шага к цели..."
  }
]
```

### updates (изменение существующих)

```json
[
  {
    "entity": "goal",
    "id": 123,
    "client_action_id": "uuid-xxx",
    "title": "Текущее название",
    "changes": {
      "title": {"from": "Старое", "to": "Новое"},
      "category": {"from": "work", "to": "hobby"}
    }
  },
  {
    "entity": "step",
    "id": 456,
    "client_action_id": "uuid-yyy",
    "title": "Шаг",
    "goal_title": "Родительская цель",
    "changes": {
      "priority": {"from": "attention", "to": "important"},
      "dt": {"from": null, "to": "2026-01-28"}
    }
  },
  {
    "entity": "diary",
    "id": 789,
    "client_action_id": "uuid-zzz",
    "date": "2026-01-27",
    "changes": {
      "what_done": "обновлён",
      "plans": "обновлён"
    }
  }
]
```

### deletes (удаление — soft delete)

```json
[
  {
    "entity": "goal",
    "id": 123,
    "client_action_id": "uuid-xxx",
    "title": "Удаляемая цель"
  },
  {
    "entity": "step",
    "id": 456,
    "client_action_id": "uuid-yyy",
    "title": "Удаляемый шаг",
    "goal_title": "Родительская цель"
  },
  {
    "entity": "habit",
    "id": 789,
    "client_action_id": "uuid-zzz",
    "name": "Удаляемая привычка"
  }
]
```

### completions (завершение с начислением XP)

```json
[
  {
    "entity": "goal",
    "id": 123,
    "client_action_id": "uuid-xxx",
    "title": "Завершаемая цель",
    "action": "complete",
    "xp_reward": 150
  },
  {
    "entity": "step",
    "id": 456,
    "client_action_id": "uuid-yyy",
    "title": "Завершаемый шаг",
    "goal_title": "Родительская цель",
    "action": "complete",
    "xp_reward": 25
  },
  {
    "entity": "habit",
    "id": 789,
    "client_action_id": "uuid-zzz",
    "name": "Выполненная привычка",
    "date": "2026-01-27",
    "action": "complete",
    "xp_reward": 15
  }
]
```

### errors (ошибки валидации)

```json
[
  {
    "action": "goal.delete",
    "client_action_id": "uuid-xxx",
    "error": "Goal not found"
  },
  {
    "action": "unknown_action",
    "client_action_id": "uuid-yyy",
    "error": "Unknown action: unknown_action"
  }
]
```

---

## XP награды и штрафы

| Действие | XP | Примечание |
|----------|-----|------------|
| goal.complete | +150 XP | Фиксировано |
| step.complete | +25 XP | Фиксировано |
| habit.mark_completed | +N XP | Зависит от habit.xp_reward |
| habit.mark_missed | -N XP или 0 | Без excuse: штраф; с excuse: 0 |
| diary.create_entry | +10 XP | Фиксировано |

---

## Примеры

### Пример 1: Создание цели с шагами

```json
{
  "actions": [
    {
      "action": "goal.create",
      "client_action_id": "a1b2c3d4-...",
      "params": {
        "title": "Пробежать марафон",
        "category": "health_sport",
        "deadline": "2026-10-01"
      }
    },
    {
      "action": "step.create",
      "client_action_id": "e5f6g7h8-...",
      "params": {
        "goal_id": null,
        "title": "Записаться в беговой клуб",
        "priority": "important",
        "date": "2026-01-28"
      }
    },
    {
      "action": "step.create",
      "client_action_id": "i9j0k1l2-...",
      "params": {
        "goal_id": null,
        "title": "Первая тренировка 5 км",
        "date": "2026-02-01",
        "time_duration": 45
      }
    }
  ]
}
```

**Примечание:** `goal_id: null` работает ТОЛЬКО в пределах одного вызова preview_actions. Система автоматически подставит ID созданной цели в последующие шаги.

### Пример 2: Ежедневная рутина

```json
{
  "actions": [
    {"action": "habit.mark_completed", "client_action_id": "uuid-1", "params": {"habit_id": 1}},
    {"action": "habit.mark_completed", "client_action_id": "uuid-2", "params": {"habit_id": 2}},
    {"action": "step.complete", "client_action_id": "uuid-3", "params": {"step_id": 123}},
    {
      "action": "diary.create_entry",
      "client_action_id": "uuid-4",
      "params": {
        "what_done": "Выполнил все утренние привычки, изучил главу про async/await",
        "reflection": "День был продуктивным",
        "plans": "Завтра продолжить Django"
      }
    }
  ]
}
```

### Пример 3: Завершение цели

```json
{
  "actions": [
    {"action": "step.complete", "client_action_id": "uuid-1", "params": {"step_id": 456}},
    {"action": "goal.complete", "client_action_id": "uuid-2", "params": {"goal_id": 123}}
  ]
}
```

---

## Возможные ошибки

| Ошибка | Причина и решение |
|--------|-------------------|
| `Unknown action: {name}` | Неизвестное действие. Используй только действия из списка в [MCP__actions__README.md](MCP__actions__README.md) |
| `{field} is required` | Не указан обязательный параметр. Проверь params на наличие поля |
| `Goal not found` | Цель не найдена или не принадлежит пользователю. Проверь goal_id |
| `Step not found` | Шаг не найден или удалён. Проверь step_id через get_user_snapshot |
| `Habit not found` | Привычка не найдена или удалена. Проверь habit_id через get_user_snapshot |
| `All actions failed validation` | Все действия невалидны. Проверь каждое действие и его параметры |

---

## Рекомендации AI

1. **ВСЕГДА** вызывай preview_actions ПЕРЕД изменениями — никогда не пропускай!

2. **ПОКАЗЫВАЙ** diff пользователю понятным языком:
   - ✓ "Будет создана цель 'Выучить Python' в категории Карьера"
   - ✓ "Шаг 'Урок 1' будет отмечен выполненным (+25 XP)"
   - ✗ НЕ показывай сырой JSON diff

3. **ГРУППИРУЙ** изменения по типу:
   ```
   "Вот что изменится:
   • Создание: цель 'Python', 2 шага
   • Завершение: 3 привычки (+45 XP)
   • Итого XP: +45"
   ```

4. **СПРАШИВАЙ** подтверждение ЯВНО: "Применить эти изменения?"

5. **При ОТКАЗЕ** не вызывай apply_actions: "Понял, изменения не применены. Хочешь что-то изменить?"

6. **Если preview ИСТЁК** (5 минут) — создай новый.

7. **Используй** get_user_snapshot для получения актуальных ID перед preview_actions.

---

## Связанные tools

- [get_user_snapshot](MCP__get_user_snapshot.md) — получение данных перед изменениями
- [apply_actions](MCP__apply_actions.md) — применение изменений (фаза 2)
- [cancel_preview](MCP__cancel_preview.md) — отмена preview
