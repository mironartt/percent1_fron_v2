# cancel_preview

Отмена pending preview вместо ожидания TTL.

## Назначение

Позволяет явно отменить preview, когда пользователь отказывается от изменений.
Без этого инструмента preview автоматически истечёт через 5 минут.

**Когда использовать:**
- Пользователь сказал "нет", "отмена", "не надо"
- Пользователь хочет создать другой preview
- Необходимо освободить ресурсы немедленно

**Когда НЕ нужен:**
- Если пользователь просто замолчал — preview истечёт сам
- Если создаёте новый preview — старый перестанет быть актуальным

---

## Параметры

### preview_id (string, ОБЯЗАТЕЛЬНО)

UUID идентификатор preview для отмены.

**Формат:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Структура ответа

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

```json
{
  "success": false,
  "error": "Preview already expired"
}
```

---

## Статусы после отмены

После вызова cancel_preview:
- `status: pending` → `status: cancelled`
- Нельзя вызвать apply_actions для этого preview
- Preview сохраняется в БД для аудита

---

## Пример использования

```
AI: "Создам цель 'Выучить Python'. Применить?"
User: "Нет, передумал"

AI → cancel_preview(preview_id="abc-123")
AI: "Понял, изменения отменены. Хочешь создать другую цель?"
```

---

## Рекомендации AI

1. **Не обязательно вызывать** — preview истечёт сам через 5 минут
2. **Вызывай для явной обратной связи** пользователю
3. **Полезно для длинных сессий** — освобождает ресурсы
4. **При создании нового preview** — старый автоматически становится неактуальным

---

## Связанные tools

- [preview_actions](MCP__preview_actions.md) — создание preview (фаза 1)
- [apply_actions](MCP__apply_actions.md) — применение изменений (фаза 2)
