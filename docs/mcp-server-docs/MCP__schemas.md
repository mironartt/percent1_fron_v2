# JSON Schema Reference

Строгие JSON Schema для всех параметров MCP tools (strict mode).

## Общие принципы

- Все объекты имеют `additionalProperties: false`
- Все обязательные поля указаны в `required`
- Используется `anyOf` для discriminated unions
- Формат action: `domain.verb`

---

## get_user_snapshot

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "include": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["goals", "habits", "diary", "schedule", "xp", "ssp", "subscription"]
      },
      "default": ["goals", "habits", "xp"]
    },
    "date_from": {
      "type": ["string", "null"],
      "format": "date",
      "description": "YYYY-MM-DD"
    },
    "date_to": {
      "type": ["string", "null"],
      "format": "date",
      "description": "YYYY-MM-DD"
    },
    "goals_status": {
      "type": "string",
      "enum": ["work", "complete", "all"],
      "default": "work"
    }
  },
  "required": []
}
```

---

## preview_actions / apply_actions

### Массив actions

```json
{
  "type": "array",
  "items": {
    "anyOf": [
      { "$ref": "#/definitions/goal_create" },
      { "$ref": "#/definitions/goal_update" },
      { "$ref": "#/definitions/goal_complete" },
      { "$ref": "#/definitions/goal_delete" },
      { "$ref": "#/definitions/step_create" },
      { "$ref": "#/definitions/step_update" },
      { "$ref": "#/definitions/step_complete" },
      { "$ref": "#/definitions/step_delete" },
      { "$ref": "#/definitions/habit_create" },
      { "$ref": "#/definitions/habit_update" },
      { "$ref": "#/definitions/habit_delete" },
      { "$ref": "#/definitions/habit_mark_completed" },
      { "$ref": "#/definitions/habit_mark_missed" },
      { "$ref": "#/definitions/diary_create_entry" },
      { "$ref": "#/definitions/diary_update_entry" }
    ]
  },
  "maxItems": 50
}
```

---

## Definitions: Goals

### goal.create

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "goal.create" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "title": { "type": "string", "minLength": 1, "maxLength": 500 },
        "category": {
          "type": ["string", "null"],
          "enum": ["work", "health_sport", "welfare", "family", "environment", "hobby", null],
          "default": "work"
        },
        "why_important": { "type": ["string", "null"], "maxLength": 2000 },
        "why_give_me": { "type": ["string", "null"], "maxLength": 2000 },
        "why_about_me": { "type": ["string", "null"], "maxLength": 2000 }
      },
      "required": ["title"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### goal.update

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "goal.update" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "goal_id": { "type": "integer" },
        "title": { "type": ["string", "null"], "maxLength": 500 },
        "category": {
          "type": ["string", "null"],
          "enum": ["work", "health_sport", "welfare", "family", "environment", "hobby", null]
        },
        "why_important": { "type": ["string", "null"], "maxLength": 2000 },
        "why_give_me": { "type": ["string", "null"], "maxLength": 2000 },
        "why_about_me": { "type": ["string", "null"], "maxLength": 2000 }
      },
      "required": ["goal_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### goal.complete / goal.delete

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "enum": ["goal.complete", "goal.delete"] },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "goal_id": { "type": "integer" }
      },
      "required": ["goal_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

---

## Definitions: Steps

### step.create

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "step.create" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "goal_id": { "type": ["integer", "null"] },
        "title": { "type": "string", "minLength": 1, "maxLength": 500 },
        "description": { "type": ["string", "null"], "maxLength": 2000 },
        "priority": {
          "type": ["string", "null"],
          "enum": ["critical", "important", "attention", "optional", null],
          "default": "attention"
        },
        "date": { "type": ["string", "null"], "format": "date" },
        "time_duration": { "type": ["integer", "null"], "minimum": 1, "maximum": 480 }
      },
      "required": ["goal_id", "title"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### step.update

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "step.update" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "step_id": { "type": "integer" },
        "title": { "type": ["string", "null"], "maxLength": 500 },
        "description": { "type": ["string", "null"], "maxLength": 2000 },
        "priority": {
          "type": ["string", "null"],
          "enum": ["critical", "important", "attention", "optional", null]
        },
        "dt": { "type": ["string", "null"], "format": "date" },
        "time_duration": { "type": ["integer", "null"], "minimum": 1, "maximum": 480 }
      },
      "required": ["step_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### step.complete / step.delete

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "enum": ["step.complete", "step.delete"] },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "step_id": { "type": "integer" }
      },
      "required": ["step_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

---

## Definitions: Habits

### habit.create

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "habit.create" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1, "maxLength": 200 },
        "description": { "type": ["string", "null"], "maxLength": 1000 },
        "icon": { "type": ["string", "null"], "default": "star" },
        "xp_reward": { "type": ["integer", "null"], "minimum": 1, "maximum": 100, "default": 10 },
        "frequency_type": {
          "type": ["string", "null"],
          "enum": ["daily", "weekly", "custom", null],
          "default": "daily"
        },
        "schedule_days": {
          "type": ["array", "null"],
          "items": { "type": "integer", "minimum": 1, "maximum": 7 }
        }
      },
      "required": ["name"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### habit.update

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "habit.update" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "habit_id": { "type": "integer" },
        "name": { "type": ["string", "null"], "maxLength": 200 },
        "description": { "type": ["string", "null"], "maxLength": 1000 },
        "icon": { "type": ["string", "null"] },
        "xp_reward": { "type": ["integer", "null"], "minimum": 1, "maximum": 100 },
        "frequency_type": {
          "type": ["string", "null"],
          "enum": ["daily", "weekly", "custom", null]
        },
        "schedule_days": {
          "type": ["array", "null"],
          "items": { "type": "integer", "minimum": 1, "maximum": 7 }
        }
      },
      "required": ["habit_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### habit.delete

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "habit.delete" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "habit_id": { "type": "integer" }
      },
      "required": ["habit_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### habit.mark_completed

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "habit.mark_completed" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "habit_id": { "type": "integer" },
        "date": { "type": ["string", "null"], "format": "date" }
      },
      "required": ["habit_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### habit.mark_missed

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "habit.mark_missed" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "habit_id": { "type": "integer" },
        "date": { "type": ["string", "null"], "format": "date" },
        "excuse_reason": { "type": ["string", "null"], "maxLength": 500 }
      },
      "required": ["habit_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

---

## Definitions: Diary

### diary.create_entry

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "diary.create_entry" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "what_done": { "type": ["string", "null"], "maxLength": 10000 },
        "what_not_done": { "type": ["string", "null"], "maxLength": 10000 },
        "reflection": { "type": ["string", "null"], "maxLength": 10000 },
        "plans": { "type": ["string", "null"], "maxLength": 10000 }
      },
      "required": [],
      "description": "At least one of what_done, what_not_done, reflection, plans must be provided"
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

### diary.update_entry

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "action": { "const": "diary.update_entry" },
    "client_action_id": { "type": "string", "format": "uuid" },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "diary_id": { "type": "integer" },
        "what_done": { "type": ["string", "null"], "maxLength": 10000 },
        "what_not_done": { "type": ["string", "null"], "maxLength": 10000 },
        "reflection": { "type": ["string", "null"], "maxLength": 10000 },
        "plans": { "type": ["string", "null"], "maxLength": 10000 }
      },
      "required": ["diary_id"]
    }
  },
  "required": ["action", "client_action_id", "params"]
}
```

---

## cancel_preview

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "preview_id": { "type": "string", "format": "uuid" }
  },
  "required": ["preview_id"]
}
```

---

## apply_actions

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "preview_id": { "type": "string", "format": "uuid" },
    "user_confirmation": { "type": ["string", "null"], "maxLength": 500 },
    "idempotency_key": { "type": "string", "format": "uuid" }
  },
  "required": ["preview_id", "idempotency_key"]
}
```
