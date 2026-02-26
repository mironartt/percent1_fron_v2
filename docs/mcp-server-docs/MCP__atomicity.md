# Atomicity & Ordering

Гарантии порядка выполнения и обработка частичных ошибок в MCP actions.

---

## Гарантии порядка выполнения

### Последовательное выполнение

Все actions в одном `apply_actions` выполняются **СТРОГО ПОСЛЕДОВАТЕЛЬНО** в порядке массива:

```json
{
  "actions": [
    {"action": "goal.create", ...},      // 1. Сначала
    {"action": "step.create", ...},      // 2. Потом
    {"action": "step.create", ...}       // 3. В конце
  ]
}
```

**Гарантии:**
- Action N+1 начинается ТОЛЬКО после завершения Action N
- Порядок results соответствует порядку actions
- `created_id` от предыдущего action доступен для следующих (в одной транзакции)

### Зависимые действия

**Правильный порядок для создания цели с шагами:**

```json
{
  "actions": [
    {
      "action": "goal.create",
      "client_action_id": "uuid-goal",
      "params": {"title": "Выучить Python", "category": "work"}
    },
    {
      "action": "step.create",
      "client_action_id": "uuid-step-1",
      "params": {"goal_id": "$ref:uuid-goal", "title": "Изучить основы"}
    },
    {
      "action": "step.create",
      "client_action_id": "uuid-step-2",
      "params": {"goal_id": "$ref:uuid-goal", "title": "Написать первый проект"}
    }
  ]
}
```

**Примечание:** `$ref:uuid-goal` — условный синтаксис. На практике:
1. Выполняется `goal.create` → получаем `created_id: 123`
2. Сервер автоматически подставляет `goal_id: 123` в последующие step.create

---

## Транзакционная атомарность

### Режим "всё или ничего"

Все actions выполняются в **ОДНОЙ транзакции БД**:

```
BEGIN TRANSACTION
  → goal.create    ✓
  → step.create    ✓
  → step.create    ✗ ERROR
ROLLBACK           ← Все изменения откатываются
```

**Результат при ошибке:**
- Цель НЕ создана (откат)
- Первый шаг НЕ создан (откат)
- XP НЕ начислен (откат)
- Пользователь видит чистую ошибку

### Что откатывается

| Операция | Откатывается? |
|----------|---------------|
| CREATE сущностей | ✅ Да |
| UPDATE сущностей | ✅ Да |
| DELETE сущностей | ✅ Да |
| XP начисление | ✅ Да |
| XP списание | ✅ Да |
| Preview статус → applied | ✅ Да |

### Что НЕ откатывается

| Операция | Причина |
|----------|---------|
| Логи запросов (MCPRequestLog) | Записываются вне транзакции для аудита |
| Preview статус → expired | TTL проверяется до транзакции |

---

## Обработка ошибок

### Типы ошибок

**1. Ошибки валидации (до выполнения):**

```json
{
  "success": false,
  "error": "title is required",
  "failed_action": {
    "action": "goal.create",
    "client_action_id": "uuid-xxx"
  }
}
```

Транзакция НЕ начинается → ничего не выполнено.

**2. Ошибки выполнения (во время транзакции):**

```json
{
  "success": false,
  "error": "Step not found",
  "failed_action": {
    "action": "step.complete",
    "client_action_id": "uuid-yyy"
  },
  "results": [
    {"action": "goal.create", "success": true, "rollback": true},
    {"action": "step.complete", "success": false, "error": "Step not found"}
  ]
}
```

Транзакция откатывается → ВСЕ действия отменены.

**3. Ошибки preview:**

```json
{
  "success": false,
  "error": "Preview expired"
}
```

Транзакция НЕ начинается → ничего не выполнено.

### Матрица ошибок

| Этап | Что происходит | Результат |
|------|----------------|-----------|
| Валидация preview_id | Ошибка | Отказ, ничего не выполнено |
| Валидация idempotency_key | Ошибка | Отказ, ничего не выполнено |
| Валидация параметров action | Ошибка | Отказ, ничего не выполнено |
| Выполнение action 1 | Успех | Продолжаем |
| Выполнение action 2 | Ошибка | ROLLBACK всех |
| Коммит транзакции | Ошибка | ROLLBACK всех |

---

## Идемпотентность

### idempotency_key

Каждый `apply_actions` ДОЛЖЕН иметь уникальный `idempotency_key`:

```json
{
  "preview_id": "abc-123",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Поведение:**

| Ситуация | Результат |
|----------|-----------|
| Первый вызов с ключом | Выполняет actions, кэширует результат |
| Повторный вызов с тем же ключом | Возвращает кэшированный результат |
| Другой ключ для того же preview | Ошибка "Preview already applied" |

### Сценарии ретрая

**Сеть оборвалась после успешного выполнения:**

```
Client → apply_actions(key=X) → Server выполнил ✓ → Network timeout
Client не получил ответ
Client → apply_actions(key=X) → Server видит key=X в кэше → Возвращает сохранённый результат
```

**Результат:** Действия выполнены ровно 1 раз.

**Сеть оборвалась до выполнения:**

```
Client → apply_actions(key=X) → Network timeout до сервера
Client → apply_actions(key=X) → Server получает впервые → Выполняет
```

**Результат:** Действия выполнены ровно 1 раз.

---

## Рекомендации по формированию actions

### Группировка связанных действий

**Правильно — одна логическая операция:**

```json
{
  "actions": [
    {"action": "goal.create", "params": {"title": "..."}},
    {"action": "step.create", "params": {"goal_id": "...", "title": "Шаг 1"}},
    {"action": "step.create", "params": {"goal_id": "...", "title": "Шаг 2"}}
  ]
}
```

Если шаг 2 не создастся — вся цель откатится. Пользователь не получит "полу-созданную" цель.

**Неправильно — разные логические операции:**

```json
{
  "actions": [
    {"action": "goal.create", "params": {"title": "Цель 1"}},
    {"action": "goal.complete", "params": {"goal_id": 123}},
    {"action": "habit.mark_completed", "params": {"habit_id": 456}}
  ]
}
```

Эти действия не связаны. Если одно провалится — остальные откатятся без причины.

### Порядок для цепочек

**Создание → Обновление → Завершение:**

```json
{
  "actions": [
    {"action": "step.create", "params": {...}},
    {"action": "step.update", "params": {"step_id": "...", "priority": "critical"}},
    {"action": "step.complete", "params": {"step_id": "..."}}
  ]
}
```

Каждое следующее действие зависит от предыдущего.

### Лимиты

| Параметр | Значение |
|----------|----------|
| Максимум actions в одном preview | 50 |
| TTL preview | 5 минут |
| Максимум вложенности | Нет вложенности, только плоский массив |

---

## Edge Cases

### Удаление + Создание на то же место

```json
{
  "actions": [
    {"action": "step.delete", "params": {"step_id": 123}},
    {"action": "step.create", "params": {"goal_id": 1, "order": 0}}
  ]
}
```

**Поведение:** Сначала удаляется шаг 123, затем создаётся новый с order=0. Оба действия в одной транзакции.

### Обновление удалённой сущности

```json
{
  "actions": [
    {"action": "step.delete", "params": {"step_id": 123}},
    {"action": "step.update", "params": {"step_id": 123, "title": "..."}}
  ]
}
```

**Поведение:** Ошибка "Step not found" на втором действии → ROLLBACK первого → шаг НЕ удалён.

### Дублирование действий

```json
{
  "actions": [
    {"action": "step.complete", "params": {"step_id": 123}},
    {"action": "step.complete", "params": {"step_id": 123}}
  ]
}
```

**Поведение:** Первое завершает шаг (+25 XP). Второе — "Step already completed" → ROLLBACK → шаг НЕ завершён, XP НЕ начислен.

---

## Диагностика

### Поля для отладки

В ответе `apply_actions`:

```json
{
  "success": true,
  "results": [
    {
      "action": "goal.create",
      "client_action_id": "uuid-xxx",  // Для сопоставления с запросом
      "success": true,
      "created_id": 789                 // ID созданной сущности
    }
  ],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  }
}
```

### Логирование

Все вызовы записываются в `MCPRequestLog`:

| Поле | Описание |
|------|----------|
| `request_id` | UUID запроса |
| `tool_name` | "apply_actions" |
| `request_body` | Полный JSON запроса |
| `response_body` | Полный JSON ответа |
| `execution_time_ms` | Время выполнения |
| `error_message` | Текст ошибки (если была) |

---

## Связанные документы

- [preview_actions](MCP__preview_actions.md) — создание preview
- [apply_actions](MCP__apply_actions.md) — применение изменений
- [field_naming](MCP__field_naming.md) — правильные имена полей
