# Security Invariants

Инварианты безопасности MCP сервера.

---

## Аутентификация

### JWT Token

Каждый запрос к MCP серверу ДОЛЖЕН содержать валидный JWT токен:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Структура токена:**

```json
{
  "sub": "user:123",           // subject = user ID
  "exp": 1706500000,           // expiration timestamp
  "iat": 1706496400,           // issued at
  "jti": "abc-123-uuid"        // unique token ID
}
```

### Валидация токена

| Проверка | Ошибка при нарушении |
|----------|---------------------|
| Токен присутствует | 401 Unauthorized |
| Подпись валидна | 401 Invalid token |
| Токен не истёк (exp > now) | 401 Token expired |
| User существует в БД | 401 User not found |
| User активен (is_active=True) | 403 User disabled |

**Код проверки:** `mcp_server/auth/dependencies.py:get_current_user()`

### Время жизни токена

| Параметр | Значение |
|----------|----------|
| TTL токена | 1 час (3600 сек) |
| Автообновление | Нет — запрашивать новый через API |
| Revocation | Через `MCPToken.is_active = False` |

---

## Привязка к пользователю

### Preview привязан к user_id

При создании `preview_actions`:

```python
preview = MCPActionPreview.objects.create(
    user=current_user,          # ← Привязка
    preview_id=uuid4(),
    actions_data=actions,
    status='pending'
)
```

**Инвариант:** `preview.user_id == request.user_id` — ВСЕГДА.

### Apply проверяет владельца

При `apply_actions`:

```python
preview = MCPActionPreview.objects.filter(
    preview_id=preview_id,
    user=current_user              # ← Проверка владельца
).first()

if not preview:
    raise Error("Preview not found")  # Не говорим "не ваш"
```

**Защита:** Пользователь A НЕ может применить preview пользователя B.

### Сущности принадлежат пользователю

Все операции проверяют владельца:

```python
# goal.update
goal = Goal.objects.filter(
    id=goal_id,
    user=current_user,           # ← Проверка
    date_deleted__isnull=True
).first()

if not goal:
    raise Error("Goal not found")
```

**Матрица проверок:**

| Действие | Проверка |
|----------|----------|
| goal.* | goal.user == current_user |
| step.* | step.goal.user == current_user |
| habit.* | habit.user == current_user |
| diary.* | diary.user == current_user |

---

## Валидация входных данных

### Схема валидации

Все параметры проверяются на соответствие схеме:

```python
# preview_actions
actions: List[Dict] = Field(..., max_length=50)

# Каждый action
action: str = Field(..., regex=r'^[a-z]+\.[a-z_]+$')
client_action_id: UUID = Field(...)
params: Dict = Field(...)
```

### Защита от инъекций

| Тип | Защита |
|-----|--------|
| SQL Injection | Django ORM с параметризованными запросами |
| XSS | Не применимо (API-only сервер) |
| Path Traversal | Нет файловых операций |
| Command Injection | Нет shell-вызовов |

### Ограничения полей

| Поле | Ограничение | Причина |
|------|-------------|---------|
| title (goal/step) | max 500 символов | Защита от переполнения |
| name (habit) | max 200 символов | Защита от переполнения |
| description | max 2000 символов | Разумный лимит |
| diary fields | max 5000 символов | Разумный лимит |
| actions array | max 50 элементов | Защита от DoS |

---

## Rate Limiting

### Лимиты по endpoint

| Endpoint | Лимит | Окно |
|----------|-------|------|
| get_user_snapshot | 60 req | 1 минута |
| preview_actions | 30 req | 1 минута |
| apply_actions | 20 req | 1 минута |
| cancel_preview | 30 req | 1 минута |

### Реализация

```python
# mcp_server/middleware/rate_limit.py
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    key = f"rate:{user_id}:{endpoint}"
    current = redis.incr(key)

    if current == 1:
        redis.expire(key, 60)  # TTL = 1 минута

    if current > LIMITS[endpoint]:
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded"}
        )

    return await call_next(request)
```

### Ответ при превышении

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retry_after": 45
}
```

HTTP Status: `429 Too Many Requests`
Header: `Retry-After: 45`

---

## Защита Preview

### Single-use

Preview можно использовать **ТОЛЬКО ОДИН РАЗ**:

```python
# apply_actions
with transaction.atomic():
    preview.status = 'applied'
    preview.date_applied = now
    preview.save()

    # Выполнение actions...
```

**Повторный вызов:**

```json
{
  "success": false,
  "error": "Preview already applied"
}
```

### TTL (Time To Live)

Preview истекает через **5 минут**:

```python
if preview.date_created + timedelta(seconds=300) < now:
    raise Error("Preview expired")
```

### Статусы Preview

```
pending    → apply_actions  → applied
pending    → 5 минут        → expired
pending    → cancel_preview → cancelled
```

Только `pending` можно применить или отменить.

---

## Idempotency Key

### Защита от дублей

`idempotency_key` предотвращает повторное выполнение:

```python
# Первый вызов
if not preview.idempotency_key:
    preview.idempotency_key = idempotency_key
    preview.save()
    # Выполняем actions...

# Повторный вызов с тем же ключом
if preview.idempotency_key == idempotency_key:
    return cached_result  # Возвращаем сохранённый результат
```

### Требования к ключу

| Требование | Значение |
|------------|----------|
| Формат | UUID v4 |
| Уникальность | Уникален для каждого нового apply |
| Привязка | К preview_id |
| TTL | Время жизни preview record |

---

## Логирование для аудита

### Что логируется

Каждый запрос записывается в `MCPRequestLog`:

```python
MCPRequestLog.objects.create(
    user=current_user,
    request_id=uuid4(),
    tool_name='apply_actions',
    request_body=sanitized_request,    # Без токена
    response_body=response,
    ip_address=request.client.host,
    user_agent=request.headers.get('User-Agent'),
    execution_time_ms=duration,
    error_message=error if error else None
)
```

### Чувствительные данные

**НЕ логируются:**
- JWT токены
- Пароли
- API ключи

**Логируются (санитизированно):**
- User ID
- IP адрес
- Request/Response body (без токенов)
- Временные метки

---

## Защита от атак

### CSRF

Не применимо — API использует Bearer Token, не cookies.

### Replay Attack

Защита через:
1. `idempotency_key` — предотвращает повторное выполнение
2. TTL токена — 1 час
3. TTL preview — 5 минут

### Enumeration Attack

Ответы не раскрывают существование ресурсов:

```python
# Плохо
if goal.user != current_user:
    raise Error("Access denied")  # Раскрывает, что goal существует

# Хорошо
goal = Goal.objects.filter(user=current_user, id=goal_id).first()
if not goal:
    raise Error("Goal not found")  # Не различаем "нет" и "не ваш"
```

### Brute Force

Защита через Rate Limiting:
- 20 apply_actions в минуту
- После превышения — блокировка на 60 секунд

---

## Чеклист безопасности

### Для каждого endpoint

- [ ] JWT токен валидируется
- [ ] User существует и активен
- [ ] Rate limit настроен
- [ ] Входные данные валидируются по схеме
- [ ] Сущности проверяются на владельца
- [ ] Ошибки не раскрывают лишнюю информацию
- [ ] Запросы логируются

### Для apply_actions

- [ ] Preview принадлежит текущему пользователю
- [ ] Preview в статусе `pending`
- [ ] Preview не истёк (< 5 минут)
- [ ] idempotency_key уникален или совпадает с сохранённым
- [ ] Все actions проверяют владельца сущностей

---

## Конфигурация

### Переменные окружения

| Переменная | Описание | Default |
|------------|----------|---------|
| `MCP_JWT_SECRET` | Секрет для JWT | Обязательно |
| `MCP_JWT_ALGORITHM` | Алгоритм | HS256 |
| `MCP_TOKEN_TTL` | TTL токена (сек) | 3600 |
| `MCP_PREVIEW_TTL` | TTL preview (сек) | 300 |
| `MCP_RATE_LIMIT_ENABLED` | Включить лимиты | True |

### Безопасные значения

```bash
# Генерация секрета
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Связанные документы

- [apply_actions](MCP__apply_actions.md) — применение изменений
- [preview_actions](MCP__preview_actions.md) — создание preview
- [atomicity](MCP__atomicity.md) — транзакционность
