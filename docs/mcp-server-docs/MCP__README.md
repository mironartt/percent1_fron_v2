# MCP Server Documentation

## Обзор

Документация для MCP (Model Context Protocol) сервера OnePercent.

MCP сервер позволяет пользователям управлять целями, привычками, дневником через естественный диалог с AI. OpenAI вызывает наш MCP сервер напрямую через `server_url`.

## Tools

| Tool | Файл | Назначение |
|------|------|-----------|
| get_user_snapshot | [MCP__get_user_snapshot.md](MCP__get_user_snapshot.md) | Получение данных пользователя (read-only) |
| preview_actions | [MCP__preview_actions.md](MCP__preview_actions.md) | Фаза 1: предпросмотр изменений |
| apply_actions | [MCP__apply_actions.md](MCP__apply_actions.md) | Фаза 2: применение изменений |
| cancel_preview | [MCP__cancel_preview.md](MCP__cancel_preview.md) | Отмена preview |

## Actions

Полный список доступных действий для preview_actions / apply_actions:

| Домен | Файл | Действия |
|-------|------|----------|
| Goals (цели) | [MCP__actions__goals.md](MCP__actions__goals.md) | goal.create, goal.update, goal.complete, goal.delete |
| Steps (шаги) | [MCP__actions__steps.md](MCP__actions__steps.md) | step.create, step.update, step.complete, step.delete |
| Habits (привычки) | [MCP__actions__habits.md](MCP__actions__habits.md) | habit.create, habit.update, habit.delete, habit.mark_completed, habit.mark_missed |
| Diary (дневник) | [MCP__actions__diary.md](MCP__actions__diary.md) | diary.create_entry, diary.update_entry |

Индекс всех действий: [MCP__actions__README.md](MCP__actions__README.md)

## Справочники

### Схемы и форматы

- [MCP__schemas.md](MCP__schemas.md) — JSON Schema для всех параметров (strict mode)
- [MCP__response_formats.md](MCP__response_formats.md) — форматы ответов tools
- [MCP__error_codes.md](MCP__error_codes.md) — коды ошибок и их описания

### Для AI модели

- [MCP__intent_mapping.md](MCP__intent_mapping.md) — маппинг фраз пользователя → MCP actions
- [MCP__field_naming.md](MCP__field_naming.md) — каноническое именование полей (dt vs date, goal_id vs id)

### Архитектура и безопасность

- [MCP__atomicity.md](MCP__atomicity.md) — гарантии порядка, транзакционность, обработка ошибок
- [MCP__security.md](MCP__security.md) — инварианты безопасности, JWT, Rate Limiting

## Связанная документация

| Файл | Описание |
|------|----------|
| `mcp_server/CLAUDE.md` | Техническая документация кодовой базы |
| `notes/docs/front_docs/mcp_server.md` | Документация для фронтенда |
| `CLAUDE.md` (корневой) | Обзор проекта, секция MCP Server |

## Двухфазный коммит

```
                     ┌─────────────────────────────────────┐
                     │           ДВУХФАЗНЫЙ КОММИТ          │
                     └─────────────────────────────────────┘

┌─────────┐    ┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│  User   │───>│ preview_actions │───>│ Показать diff│───>│ Подтверждение│
│ request │    │   (Фаза 1)      │    │ пользователю │    │    да/нет    │
└─────────┘    └─────────────────┘    └──────────────┘    └──────┬───────┘
                                                                  │
                                      ┌───────────────────────────┴───────┐
                                      │                                   │
                                      ▼                                   ▼
                              ┌───────────────┐                   ┌───────────────┐
                              │ apply_actions │                   │cancel_preview │
                              │   (Фаза 2)    │                   │  (отмена)     │
                              └───────────────┘                   └───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   Изменения   │
                              │   применены   │
                              └───────────────┘
```

## Важные правила

1. **get_user_snapshot** — read-only, можно вызывать без подтверждения пользователя
2. **preview_actions** — ОБЯЗАТЕЛЬНО перед любыми изменениями данных
3. **apply_actions** — ТОЛЬКО после явного подтверждения пользователя ("да", "применить", "ок")
4. **cancel_preview** — при отказе пользователя ("нет", "отмена")

## Формат action (новый нейминг domain.verb)

```json
{
  "action": "goal.create",
  "client_action_id": "uuid-xxx-xxx",
  "params": {
    "title": "Выучить Python",
    "category": "work"
  }
}
```

- `action` — обязательный, формат `domain.verb`
- `client_action_id` — обязательный, UUID для трассировки
- `params` — параметры действия (зависят от типа)
