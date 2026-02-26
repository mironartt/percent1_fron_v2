# Response Formats

Форматы ответов всех MCP tools.

---

## get_user_snapshot

### Успешный ответ

```json
{
  "success": true,
  "user_name": "Иван",
  "data": {
    "goals": {
      "items": [
        {
          "id": 123,
          "title": "Выучить Python",
          "category": "work",
          "status": "work",
          "score": "true",
          "steps_count": 5,
          "steps_completed": 2
        }
      ],
      "total_count": 5
    },
    "habits": {
      "items": [
        {
          "id": 45,
          "name": "Утренняя зарядка",
          "icon": "🏃",
          "frequency": "daily",
          "xp_reward": 15,
          "current_streak": 7,
          "best_streak": 14,
          "today_status": "completed"
        }
      ],
      "total_count": 5,
      "today_completed": 3,
      "today_total": 5,
      "weekly_completion_rate": 85
    },
    "diary": {
      "items": [
        {
          "id": 789,
          "date": "2026-01-27T10:30:00Z",
          "what_done": "Завершил 3 шага к цели Python...",
          "what_not_done": "Не успел сделать домашку",
          "reflection": "День был продуктивным",
          "plans": "Завтра закончить Django ORM"
        }
      ],
      "total_count": 15
    },
    "schedule": {
      "today": [
        {
          "id": 456,
          "title": "Прочитать главу 3",
          "goal_title": "Выучить Python",
          "date": "2026-01-27",
          "is_complete": false,
          "priority": "important"
        }
      ],
      "upcoming": [...]
    },
    "xp": {
      "balance": 1500,
      "lifetime": 12500,
      "level": 2,
      "level_progress": 45,
      "next_level_xp": 2000
    },
    "ssp": {
      "spheres": [
        {
          "category": "welfare",
          "name": "Благосостояние",
          "score": 7
        }
      ],
      "average_score": 6.5,
      "ssp_evaluation_id": "uuid..."
    },
    "subscription": {
      "tariff": "pro",
      "status": "active",
      "days_remaining": 25
    }
  }
}
```

---

## preview_actions

### Успешный ответ

```json
{
  "success": true,
  "preview_id": "5f02f604-1685-47dd-8f9c-535187d30d1c",
  "expires_in_seconds": 300,
  "diff": {
    "creates": [
      {
        "entity": "goal",
        "client_action_id": "uuid-xxx",
        "title": "Выучить Python",
        "category": "work"
      }
    ],
    "updates": [
      {
        "entity": "step",
        "id": 456,
        "client_action_id": "uuid-yyy",
        "title": "Текущее название",
        "changes": {
          "priority": {"from": "medium", "to": "high"}
        }
      }
    ],
    "deletes": [
      {
        "entity": "habit",
        "id": 789,
        "client_action_id": "uuid-zzz",
        "name": "Удаляемая привычка"
      }
    ],
    "completions": [
      {
        "entity": "step",
        "id": 123,
        "client_action_id": "uuid-aaa",
        "title": "Завершаемый шаг",
        "xp_reward": 25
      }
    ],
    "errors": []
  },
  "message": "Покажи пользователю diff и спроси подтверждение..."
}
```

### Ответ с ошибками валидации

```json
{
  "success": false,
  "error": "All actions failed validation",
  "errors": [
    {
      "action": "goal.delete",
      "client_action_id": "uuid-xxx",
      "error": "Goal not found"
    },
    {
      "action": "invalid_action",
      "client_action_id": "uuid-yyy",
      "error": "Unknown action: invalid_action"
    }
  ]
}
```

---

## apply_actions

### Полностью успешный ответ

```json
{
  "success": true,
  "results": [
    {
      "action": "goal.create",
      "client_action_id": "uuid-xxx",
      "success": true,
      "created_id": 789,
      "message": "Цель 'Выучить Python' создана"
    },
    {
      "action": "step.complete",
      "client_action_id": "uuid-yyy",
      "success": true,
      "message": "Шаг отмечен выполненным"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "message": "✓ Цель 'Выучить Python' создана\n✓ Шаг отмечен выполненным"
}
```

### Частично успешный ответ

```json
{
  "success": false,
  "results": [
    {
      "action": "goal.create",
      "client_action_id": "uuid-xxx",
      "success": true,
      "created_id": 789,
      "message": "Цель создана"
    },
    {
      "action": "step.complete",
      "client_action_id": "uuid-yyy",
      "success": false,
      "error": "Step not found"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  },
  "message": "✓ Цель создана\n✗ step.complete: Step not found"
}
```

### Ошибка preview

```json
{
  "success": false,
  "error": "Preview not found or already used"
}
```

```json
{
  "success": false,
  "error": "Preview expired. Create new preview with preview_actions."
}
```

```json
{
  "success": false,
  "error": "Preview already applied. Create new preview."
}
```

---

## cancel_preview

### Успешная отмена

```json
{
  "success": true,
  "message": "Preview cancelled successfully"
}
```

### Ошибки

```json
{
  "success": false,
  "error": "Preview not found or already processed"
}
```

```json
{
  "success": false,
  "error": "Preview already applied"
}
```

---

## Общий формат ошибок

### Ошибка валидации параметров

```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "description of the error"
  }
}
```

### Ошибка авторизации

```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```

### Rate limit

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retry_after": 60
}
```

### Внутренняя ошибка

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```
