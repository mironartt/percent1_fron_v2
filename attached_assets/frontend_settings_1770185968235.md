# Frontend Settings Storage

Документация для интеграции системы хранения настроек фронтенда.

## Обзор

Система позволяет фронтенду сохранять произвольные данные на бэкенде:
- Тема оформления (светлая/тёмная)
- Флаги показа модальных окон (welcome, onboarding и т.д.)
- Состояние UI элементов (свёрнутый сайдбар, выбранные фильтры)
- Любые другие пользовательские настройки

## Два способа получения данных

### 1. В составе get-user-data (рекомендуется)

```
POST /api/rest/front/get-user-data/
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "id": 1,
    "email": "user@example.com",
    ...
    "frontend_settings": {
      "theme": "dark",
      "welcome_modal_shown": true,
      "sidebar_collapsed": false
    }
  }
}
```

Используйте этот способ при инициализации приложения — данные приходят в составе общего запроса.

### 2. Отдельный эндпоинт

```
POST /api/rest/front/app/frontend-settings/get/
```

**Request:** `{}`

**Response:**
```json
{
  "status": "ok",
  "data": {
    "settings": {
      "theme": "dark",
      "welcome_modal_shown": true,
      "sidebar_collapsed": false
    }
  }
}
```

## Обновление настроек

```
POST /api/rest/front/app/frontend-settings/update/
```

### Добавление/обновление

**Request:**
```json
{
  "settings": {
    "theme": "dark",
    "sidebar_collapsed": true
  }
}
```

### Удаление ключа

Передайте `null` как значение:

**Request:**
```json
{
  "settings": {
    "old_deprecated_key": null
  }
}
```

### Комбинация

**Request:**
```json
{
  "settings": {
    "theme": "light",
    "new_feature_flag": true,
    "old_key": null
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "settings": {
      "theme": "light",
      "welcome_modal_shown": true,
      "sidebar_collapsed": false,
      "new_feature_flag": true
    }
  }
}
```

## Логика merge

| Операция | Поведение |
|----------|-----------|
| Новый ключ | Добавляется к существующим |
| Существующий ключ | Значение перезаписывается |
| Значение `null` | Ключ удаляется |

## Лимиты

| Параметр | Лимит | Ошибка |
|----------|-------|--------|
| Общий размер JSON | ≤ 50000 символов | `settings_too_large` |
| Длина ключа | ≤ 100 символов | `settings_key_too_long` |
| Размер значения | ≤ 5000 символов | `settings_value_too_large` |

## Поддерживаемые типы значений

Любые JSON-совместимые типы:
- `string`
- `number` (int, float)
- `boolean`
- `null` (для удаления)
- `object` (вложенные объекты)
- `array`

## Примеры использования

### Сохранение темы

```typescript
await api.post('/app/frontend-settings/update/', {
  settings: { theme: 'dark' }
});
```

### Отметка показа модалки

```typescript
await api.post('/app/frontend-settings/update/', {
  settings: { welcome_modal_shown: true }
});
```

### Сохранение сложных данных

```typescript
await api.post('/app/frontend-settings/update/', {
  settings: {
    sidebar: {
      collapsed: true,
      width: 250
    },
    filters: {
      goals: ['work', 'health'],
      habits: { showCompleted: false }
    }
  }
});
```

### Получение при инициализации

```typescript
const userData = await api.post('/get-user-data/');
const frontendSettings = userData.data.frontend_settings;

if (!frontendSettings.welcome_modal_shown) {
  showWelcomeModal();
}

applyTheme(frontendSettings.theme || 'light');
```

## Ошибки

| Код ошибки | Описание |
|------------|----------|
| `settings_must_be_dict` | `settings` должен быть объектом |
| `settings_invalid_json` | Невалидный JSON |
| `settings_too_large` | Превышен лимит общего размера (50KB) |
| `settings_key_must_be_string` | Ключ должен быть строкой |
| `settings_key_too_long` | Ключ длиннее 100 символов |
| `settings_value_invalid_json` | Значение не сериализуется в JSON |
| `settings_value_too_large` | Значение больше 5000 символов |

## Рекомендации

1. **Используйте плоские ключи** — проще удалять и обновлять
2. **Префиксуйте ключи по модулю** — `goals_filter_status`, `habits_view_mode`
3. **Не храните чувствительные данные** — это не для токенов и паролей
4. **Атомарные обновления** — update возвращает актуальное состояние
5. **Используйте get-user-data** — для первичной загрузки настроек
