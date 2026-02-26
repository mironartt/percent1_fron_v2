# Error Codes

Коды ошибок MCP сервера и их описания.

---

## Ошибки авторизации

| Код | Описание | Решение |
|-----|----------|---------|
| `AUTH_REQUIRED` | Токен не предоставлен | Добавить Authorization header |
| `AUTH_INVALID` | Невалидный токен | Запросить новый токен |
| `AUTH_EXPIRED` | Токен истёк | Запросить новый токен |
| `AUTH_REVOKED` | Токен отозван | Запросить новый токен |

---

## Ошибки Rate Limiting

| Код | Описание | Решение |
|-----|----------|---------|
| `RATE_LIMITED` | Превышен лимит запросов | Подождать retry_after секунд |
| `RATE_LIMIT_MINUTE` | Превышен лимит в минуту (60 req/min) | Подождать до следующей минуты |
| `RATE_LIMIT_HOUR` | Превышен лимит в час (1000 req/hour) | Подождать до следующего часа |

---

## Ошибки Preview

| Код | Ошибка | Причина | Решение |
|-----|--------|---------|---------|
| `PREVIEW_NOT_FOUND` | Preview not found or already used | Preview не существует или принадлежит другому пользователю | Создать новый preview_actions |
| `PREVIEW_EXPIRED` | Preview expired | Прошло более 5 минут | Создать новый preview_actions |
| `PREVIEW_APPLIED` | Preview already applied | Уже был применён | Создать новый preview_actions |
| `PREVIEW_CANCELLED` | Preview already cancelled | Был отменён | Создать новый preview_actions |
| `PREVIEW_ID_REQUIRED` | preview_id is required | Не передан preview_id | Указать preview_id |

---

## Ошибки Actions

### Общие ошибки

| Код | Ошибка | Причина | Решение |
|-----|--------|---------|---------|
| `UNKNOWN_ACTION` | Unknown action: {name} | Неизвестное действие | Использовать действие из списка |
| `NO_ACTIONS` | No actions provided | Пустой массив actions | Передать хотя бы одно действие |
| `ALL_FAILED` | All actions failed validation | Все действия невалидны | Проверить каждое действие |

### Ошибки полей

| Код | Ошибка | Причина |
|-----|--------|---------|
| `FIELD_REQUIRED` | {field} is required | Не указано обязательное поле |
| `FIELD_INVALID` | Invalid {field} | Невалидное значение поля |
| `FIELD_TOO_LONG` | {field} exceeds max length | Превышена максимальная длина |

### Ошибки сущностей

| Код | Ошибка | Причина |
|-----|--------|---------|
| `GOAL_NOT_FOUND` | Goal not found | Цель не найдена или не принадлежит пользователю |
| `STEP_NOT_FOUND` | Step not found | Шаг не найден |
| `HABIT_NOT_FOUND` | Habit not found | Привычка не найдена |
| `DIARY_NOT_FOUND` | Diary entry not found | Запись дневника не найдена |

---

## Ошибки валидации

| Код | Ошибка | Причина |
|-----|--------|---------|
| `INVALID_CATEGORY` | Invalid category | Недопустимое значение категории |
| `INVALID_PRIORITY` | Invalid priority | Недопустимое значение приоритета |
| `INVALID_FREQUENCY` | Invalid frequency_type | Недопустимое значение частоты |
| `INVALID_MOOD` | Invalid mood | Недопустимое значение настроения |
| `INVALID_DATE` | Invalid date format | Неверный формат даты (ожидается YYYY-MM-DD) |
| `INVALID_UUID` | Invalid UUID format | Неверный формат UUID |
| `SCHEDULE_REQUIRED` | schedule_days required for custom frequency | Для custom частоты нужен schedule_days |

---

## Системные ошибки

| Код | Описание | Решение |
|-----|----------|---------|
| `INTERNAL_ERROR` | Internal server error | Повторить позже, сообщить в поддержку |
| `DATABASE_ERROR` | Database error | Повторить позже |
| `TIMEOUT` | Request timeout | Повторить позже |

---

## HTTP статусы

| Статус | Описание |
|--------|----------|
| 200 | Успешный запрос |
| 400 | Ошибка валидации параметров |
| 401 | Требуется авторизация |
| 403 | Доступ запрещён |
| 404 | Ресурс не найден |
| 429 | Превышен лимит запросов |
| 500 | Внутренняя ошибка сервера |

---

## Обработка ошибок AI

### Рекомендуемые реакции

| Ошибка | Реакция AI |
|--------|------------|
| `Preview expired` | "Предпросмотр устарел (прошло более 5 минут). Создаю новый..." |
| `Preview already applied` | "Изменения уже были применены ранее." |
| `Goal not found` | "Эта цель не найдена. Возможно, она была удалена. Давай проверим актуальный список." |
| `Step not found` | "Этот шаг не найден. Давай посмотрим актуальные шаги." |
| `Habit not found` | "Эта привычка не найдена. Давай проверим список привычек." |
| `Unknown action` | (Это ошибка AI — использовано несуществующее действие) |
| `Rate limited` | "Слишком много запросов. Подожди немного..." |

### Паттерн обработки

```
1. Проверить success в ответе
2. Если success=false:
   - Прочитать error
   - Если это "recoverable" ошибка (expired, not found) — сообщить пользователю и предложить альтернативу
   - Если это системная ошибка — извиниться и предложить повторить позже
3. Если success=true но есть failed actions:
   - Сообщить что получилось и что нет
   - Предложить повторить неудавшиеся действия
```
