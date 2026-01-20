# Документация: Версионирование онбординга (A/B тест)

## Обзор

Реализована система версионирования онбординга с поддержкой A/B тестирования. Позволяет показывать разные версии онбординга новым пользователям с контролируемым распределением через админку.

**Версии:**
- `1` — текущий онбординг (по умолчанию)
- `2` — новый онбординг (в разработке)

---

## API изменения

### GET /api/rest/front/get-user-data/

**Новое поле в ответе:**

```json
{
  "status": "ok",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "finish_onboarding": false,
    "finish_minitask": false,
    "onboarding_version": 1,
    ...
  }
}
```

**Поле `onboarding_version`:**
- Тип: `integer`
- Значения: `1` или `2`
- Required: `true`
- Описание: Версия онбординга для данного пользователя

---

## Логика определения версии

### Сценарий 1: Глобально версия 1 (по умолчанию)
```
ProjectSettings.active_onboarding_version = 1
→ Все пользователи получают onboarding_version = 1
```

### Сценарий 2: Глобально версия 2, ratio = 50%
```
ProjectSettings.active_onboarding_version = 2
ProjectSettings.onboarding_v2_ab_ratio = 50
→ 50% новых пользователей получают версию 2
→ 50% новых пользователей получают версию 1
```

### Сценарий 3: Глобально версия 2, ratio = 100%
```
ProjectSettings.active_onboarding_version = 2
ProjectSettings.onboarding_v2_ab_ratio = 100
→ Все новые пользователи получают версию 2
```

### Сценарий 4: Повторное прохождение онбординга
```
→ Пользователь видит ту же версию, что была зафиксирована ранее
→ Версия НЕ пересчитывается
```

---

## Когда фиксируется версия

1. **При первом GET /get-user-data/**: версия определяется, но **НЕ сохраняется** в БД
2. **При первом POST /onboarding/update/**: версия **фиксируется** в UserOnboarding
3. **После фиксации**: версия неизменна для пользователя

Это обеспечивает:
- Консистентность: пользователь всегда видит одну версию
- Точность A/B теста: версия определяется случайно один раз
- Возможность повторного прохождения: версия сохраняется

---

## Интеграция на фронтенде

### 1. Получение версии

```typescript
// В store/auth или composable
const userData = await api.getUserData()
const onboardingVersion = userData.onboarding_version // 1 или 2
```

### 2. Роутинг на онбординг

```typescript
// В router или guard
if (!userData.finish_onboarding) {
  if (userData.onboarding_version === 1) {
    router.push('/onboarding/v1')
  } else {
    router.push('/onboarding/v2')
  }
}
```

### 3. Компонент-обёртка

```vue
<template>
  <OnboardingV1 v-if="onboardingVersion === 1" />
  <OnboardingV2 v-else />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const onboardingVersion = computed(() => authStore.userData?.onboarding_version ?? 1)
</script>
```

---

## Админ-панель

### ProjectSettings

Доступ: `/admin/core/projectsettings/`

**Новые поля:**
- `active_onboarding_version` — активная версия (1 или 2)
- `onboarding_v2_ab_ratio` — % пользователей для версии 2 (0-100)

**Логика:**
- Если `active_onboarding_version = 1` → все пользователи получают версию 1
- Если `active_onboarding_version = 2` → распределение по `onboarding_v2_ab_ratio`

### UserOnboarding

Доступ: `/admin/core/useronboarding/`

**Новые поля:**
- `onboarding_version` — версия онбординга (read-only)
- Фильтр по версии в списке

---

## Модели

### ProjectSettings

```python
active_onboarding_version = PositiveSmallIntegerField(default=1)
onboarding_v2_ab_ratio = PositiveSmallIntegerField(default=0)

# Методы
ProjectSettings.get_active_onboarding_version() -> int
ProjectSettings.get_onboarding_v2_ab_ratio() -> int
```

### UserOnboarding

```python
onboarding_version = PositiveSmallIntegerField(null=True, blank=True)
```

### User

```python
def determine_onboarding_version(self, save_if_new: bool = True) -> int:
    """
    Определяет версию онбординга для пользователя.

    Args:
        save_if_new: Сохранять ли версию в БД при первом определении

    Returns:
        int: Версия онбординга (1 или 2)
    """
```

---

## Миграция

Файл: `core/migrations/0064_onboarding_versioning.py`

```python
# Добавляет поля:
# - ProjectSettings.active_onboarding_version (default=1)
# - ProjectSettings.onboarding_v2_ab_ratio (default=0)
# - UserOnboarding.onboarding_version (null=True)
```

---

## Обратная совместимость

- Все новые поля имеют default значения
- `active_onboarding_version=1` по умолчанию → текущее поведение
- `onboarding_version=NULL` для существующих пользователей → автоопределение при следующем запросе
- Существующий код онбординга НЕ изменяется
- AI сервисы и socket-tasks НЕ затрагиваются

---

## Тестирование

### Ручное тестирование

1. Создать нового пользователя
2. Проверить `GET /get-user-data/` — должен вернуть `onboarding_version`
3. Изменить `ProjectSettings.active_onboarding_version = 2`, `ratio = 100`
4. Создать ещё пользователя — должен получить `onboarding_version = 2`
5. Проверить что при повторном прохождении версия не меняется

### Unit тесты (рекомендуется добавить)

```python
def test_onboarding_version_assignment():
    # Тест 1: При глобальной версии 1 — все получают 1
    # Тест 2: При глобальной версии 2 и ratio=100 — все получают 2
    # Тест 3: Версия фиксируется и не меняется
    # Тест 4: Существующие пользователи с NULL получают корректную версию
```

---

## FAQ

**Q: Что если пользователь уже прошёл онбординг?**
A: Для существующих пользователей `onboarding_version = NULL`, при следующем `GET /get-user-data/` они получат версию 1 (default), но версия сохранится только при следующем `POST /onboarding/update/`.

**Q: Можно ли принудительно переключить версию пользователю?**
A: Да, через админку UserOnboarding можно изменить `onboarding_version`. Но лучше не делать это во время A/B теста.

**Q: Как отключить A/B тест?**
A: Установить `ProjectSettings.active_onboarding_version = 1`. Все новые пользователи будут получать версию 1.
