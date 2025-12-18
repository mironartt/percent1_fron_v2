# Инвалидация localStorage

## Обзор

Система версионирования localStorage позволяет администратору сбросить localStorage у всех пользователей одновременно. Это полезно при деплое критических изменений, когда закешированные данные могут вызвать проблемы.

## Как это работает

1. Бэкенд хранит версию в модели `ProjectSettings.localstorage_version`
2. Версия отдаётся в ответах `get-user-data` и `get-global-data`
3. Фронтенд сравнивает версию с сохранённой в localStorage
4. При несовпадении версий фронтенд очищает весь localStorage

## API

### GET данные

Версия возвращается в обоих эндпоинтах:

**`POST /api/rest/front/get-user-data/`** (для авторизованных)
```json
{
  "status": "ok",
  "data": {
    "id": 1,
    "email": "user@example.com",
    ...
    "localstorage_version": "20251218154600"
  }
}
```

**`POST /api/rest/front/get-global-data/`** (для всех)
```json
{
  "status": "ok",
  "data": {
    "t_auth_link": "...",
    "localstorage_version": "20251218154600",
    ...
  }
}
```

## Логика фронтенда

```typescript
// При загрузке приложения
const savedVersion = localStorage.getItem('localstorage_version')
const serverVersion = response.data.localstorage_version

if (savedVersion && savedVersion !== serverVersion) {
  // Версия изменилась - очищаем всё
  localStorage.clear()
}

// Сохраняем текущую версию
localStorage.setItem('localstorage_version', serverVersion)
```

### Рекомендуемая реализация

```typescript
// utils/localStorage.ts

const VERSION_KEY = 'localstorage_version'

export function checkAndClearLocalStorage(serverVersion: string): boolean {
  const savedVersion = localStorage.getItem(VERSION_KEY)

  if (savedVersion && savedVersion !== serverVersion) {
    // Сохраняем критичные данные перед очисткой (если нужно)
    const preserveKeys = ['theme', 'language'] // примеры
    const preserved: Record<string, string | null> = {}

    preserveKeys.forEach(key => {
      preserved[key] = localStorage.getItem(key)
    })

    // Очищаем localStorage
    localStorage.clear()

    // Восстанавливаем критичные данные
    preserveKeys.forEach(key => {
      if (preserved[key]) {
        localStorage.setItem(key, preserved[key]!)
      }
    })

    // Сохраняем новую версию
    localStorage.setItem(VERSION_KEY, serverVersion)

    return true // Был сброс
  }

  // Сохраняем версию (первый визит или версия совпадает)
  localStorage.setItem(VERSION_KEY, serverVersion)
  return false
}
```

### Интеграция в приложение

```typescript
// App.vue или main.ts

import { checkAndClearLocalStorage } from '@/utils/localStorage'

// При получении данных из get-global-data или get-user-data
const wasCleared = checkAndClearLocalStorage(response.data.localstorage_version)

if (wasCleared) {
  // Опционально: показать уведомление пользователю
  console.log('localStorage был очищен из-за обновления версии')
}
```

## Админка

В Django Admin (раздел "Project settings"):
1. Открыть список ProjectSettings
2. Выбрать запись (чекбокс)
3. В выпадающем меню действий выбрать "Инвалидировать localStorage у всех пользователей"
4. Нажать "Go"

При выполнении действия версия обновляется на текущий timestamp в формате `YYYYMMDDHHMMSS`.

## Формат версии

- Начальное значение: `"1"`
- После инвалидации: `"YYYYMMDDHHMMSS"` (например, `"20251218154600"`)

Фронтенд должен сравнивать версии как строки, без попытки парсинга в числа.

## Когда использовать

- **Критические изменения структуры данных** - когда старые закешированные данные несовместимы
- **Исправление багов с кешем** - когда закешированные данные вызывают ошибки
- **Обновление формата хранения** - при изменении схемы localStorage
- **Принудительный релогин** - как часть безопасности (в комбинации с инвалидацией сессий)

## Важно

- Это действие затронет **всех пользователей** при следующем запросе к API
- Нет возможности откатить изменение
- Данные в localStorage будут безвозвратно удалены
- Используйте с осторожностью в продакшене