# ИСПРАВЛЕННАЯ ДОКУМЕНТАЦИЯ: /api/app/habits/update/

## Endpoint
`POST /api/app/habits/update/`

## Когда использовать
- Создание новой привычки
- Редактирование существующей привычки
- Удаление привычки (soft-delete)
- Восстановление удалённой привычки
- Полное удаление привычки
- Любая комбинация вышеперечисленного

---

## Request Structure

Все поля **опциональны**, но хотя бы одно должно быть указано.

```typescript
{
    habits_data?: Array<HabitData>,
    deleted_habit_ids?: Array<number>,
    restored_habit_ids?: Array<number>,
    permanently_deleted_ids?: Array<number>
}
```

### HabitData Structure

```typescript
{
    habit_id?: number,           // Если есть - обновление, если нет - создание
    name?: string,               // Обязательно для создания
    icon?: string,               // По умолчанию 'fire'
    xp_reward?: number,          // 1-100, по умолчанию 5
    xp_penalty?: number,         // 0-200, по умолчанию 0
    frequency_type?: string,     // 'daily', 'weekdays', 'weekends', 'custom'
    schedule_days?: Array<number>, // [0-6] где 0=Вс, 1=Пн
    description?: string         // До 500 символов
}
```

---

## Примеры запросов

### 1. Создание одной привычки

```json
{
    "habits_data": [
        {
            "name": "Медитация 10 мин",
            "icon": "meditation",
            "xp_reward": 15,
            "xp_penalty": 30,
            "frequency_type": "daily",
            "description": "Практика осознанности"
        }
    ]
}
```

**Response:**
```json
{
    "response": {
        "status": "ok",
        "data": {
            "date_from": "2024-12-02",
            "date_to": "2024-12-08",
            "habits": [
                {
                    "habit_id": 123,
                    "name": "Медитация 10 мин",
                    "icon": "meditation",
                    "xp_reward": 15,
                    "xp_penalty": 30,
                    "frequency_type": "daily",
                    "schedule_days": [0, 1, 2, 3, 4, 5, 6],
                    "description": "Практика осознанности",
                    "week_schedule": [...]
                }
            ],
            "settings": {...}
        }
    }
}
```

---

### 2. Создание нескольких привычек за раз

```json
{
    "habits_data": [
        {
            "name": "Зарядка 10 мин",
            "icon": "strength",
            "xp_reward": 10,
            "frequency_type": "daily"
        },
        {
            "name": "Медитация",
            "icon": "meditation",
            "xp_reward": 15,
            "frequency_type": "weekdays"
        },
        {
            "name": "Чтение",
            "icon": "book",
            "xp_reward": 20,
            "frequency_type": "daily"
        }
    ]
}
```

---

### 3. Обновление существующей привычки

```json
{
    "habits_data": [
        {
            "habit_id": 123,
            "name": "Медитация 15 мин",
            "xp_reward": 20
        }
    ]
}
```

**Важно:** 
- Указывается только `habit_id` и изменяемые поля
- Остальные поля останутся без изменений

---

### 4. Обновление нескольких привычек

```json
{
    "habits_data": [
        {
            "habit_id": 123,
            "xp_reward": 25
        },
        {
            "habit_id": 124,
            "name": "Новое название",
            "description": "Новое описание"
        }
    ]
}
```

---

### 5. Soft-delete (восстановимое удаление)

```json
{
    "deleted_habit_ids": [123, 456]
}
```

**Что происходит:**
- Устанавливается `date_deleted = now()`
- Привычка скрывается из активных
- История выполнений сохраняется
- Можно восстановить

---

### 6. Восстановление удалённой привычки

```json
{
    "restored_habit_ids": [123]
}
```

**Что происходит:**
- `date_deleted` устанавливается в `null`
- Привычка снова становится активной
- История выполнений сохранена

---

### 7. Полное удаление (БЕЗВОЗВРАТНОЕ!)

```json
{
    "permanently_deleted_ids": [789]
}
```

**⚠️ ВНИМАНИЕ:**
- Физическое удаление из БД
- БЕЗВОЗВРАТНО
- История выполнений становится orphaned (без привычки)
- Требует подтверждения на фронтенде

---

### 8. Комбинированный запрос

```json
{
    "habits_data": [
        {
            "name": "Новая привычка 1"
        },
        {
            "name": "Новая привычка 2"
        },
        {
            "habit_id": 100,
            "name": "Обновлённое название"
        }
    ],
    "deleted_habit_ids": [200],
    "restored_habit_ids": [300],
    "permanently_deleted_ids": [400]
}
```

**Результат:**
- Создадутся 2 новые привычки
- Обновится привычка 100
- Удалится привычка 200 (soft)
- Восстановится привычка 300
- Удалится навсегда привычка 400

---

## Валидация

### Обязательные поля

**При создании (habit_id не указан):**
- `name` — ОБЯЗАТЕЛЬНО

**При обновлении (habit_id указан):**
- Все поля опциональны

### Правила валидации

| Поле | Правило |
|------|---------|
| `name` | 1-100 символов |
| `icon` | Один из 32 доступных |
| `xp_reward` | 1-100 |
| `xp_penalty` | 0-200 |
| `frequency_type` | 'daily', 'weekdays', 'weekends', 'custom' |
| `schedule_days` | Массив [0-6], уникальные значения |
| `description` | 0-500 символов |

### Проверка доступа

- Все указанные `habit_id` должны принадлежать текущему пользователю
- Нельзя обновить/удалить чужие привычки

---

## Response Structure

```typescript
{
    response: {
        status: "ok",
        data: {
            date_from: string,      // Начало текущей недели
            date_to: string,        // Конец текущей недели
            habits: Array<Habit>,   // Обновлённые привычки с расписанием
            settings: Settings      // Настройки пользователя
        }
    }
}
```

**Важно:** 
В ответе возвращаются только **изменённые** привычки за текущую неделю.

Если нужны все привычки — сделайте дополнительный запрос `/get/`.

---

## Ошибки

### `habit_name_required_for_create`

**Когда:** Попытка создать привычку без имени

```json
{
    "error": {
        "code": "habit_name_required_for_create",
        "message": "Для создания привычки обязательно указать название"
    }
}
```

**Решение:** Добавить поле `name`

---

### `habit_access_denied`

**Когда:** Попытка изменить чужую привычку

```json
{
    "error": {
        "code": "habit_access_denied",
        "message": "Нет доступа к указанным привычкам"
    }
}
```

**Решение:** Проверить что все `habit_id` принадлежат текущему пользователю

---

### Валидационные ошибки

```json
{
    "error": {
        "code": "validation_error",
        "message": "Ошибка валидации",
        "details": {
            "habits_data": {
                "0": {
                    "xp_reward": ["Значение должно быть от 1 до 100"]
                }
            }
        }
    }
}
```

---

## Примеры использования

### Создание привычки из рекомендаций

```javascript
// 1. Получить рекомендации
const recResponse = await fetch('/api/app/habits/recommended/', ...)
const recommendations = recResponse.response.data

// 2. Пользователь выбирает привычку
const selectedHabit = recommendations.categories[0].habits[0]

// 3. Создать привычку
const createResponse = await fetch('/api/app/habits/update/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
        habits_data: [selectedHabit]
    })
})

const newHabit = createResponse.response.data.habits[0]
console.log(`Создана привычка с ID: ${newHabit.habit_id}`)
```

---

### Редактирование привычки

```javascript
async function updateHabit(habitId, changes) {
    const response = await fetch('/api/app/habits/update/', {
        method: 'POST',
        body: JSON.stringify({
            habits_data: [{
                habit_id: habitId,
                ...changes
            }]
        })
    })
    
    return response.response.data
}

// Использование
await updateHabit(123, {
    name: "Новое название",
    xp_reward: 25
})
```

---

### Удаление с подтверждением

```javascript
async function deleteHabit(habitId, permanent = false) {
    const confirmed = confirm(
        permanent 
            ? "Удалить привычку НАВСЕГДА? Это действие нельзя отменить!"
            : "Удалить привычку? Её можно будет восстановить."
    )
    
    if (!confirmed) return
    
    const field = permanent ? 'permanently_deleted_ids' : 'deleted_habit_ids'
    
    await fetch('/api/app/habits/update/', {
        method: 'POST',
        body: JSON.stringify({
            [field]: [habitId]
        })
    })
}

// Soft-delete
await deleteHabit(123, false)

// Permanent delete
await deleteHabit(123, true)
```

---

### Массовое создание (Quick Start)

```javascript
async function quickStartHabits() {
    const starterHabits = [
        {
            name: "Зарядка 10 мин",
            icon: "strength",
            xp_reward: 10,
            frequency_type: "daily"
        },
        {
            name: "Медитация 5 мин",
            icon: "meditation",
            xp_reward: 10,
            frequency_type: "daily"
        },
        {
            name: "Чтение 20 страниц",
            icon: "book",
            xp_reward: 15,
            frequency_type: "daily"
        }
    ]
    
    const response = await fetch('/api/app/habits/update/', {
        method: 'POST',
        body: JSON.stringify({
            habits_data: starterHabits
        })
    })
    
    const createdHabits = response.response.data.habits
    console.log(`Создано ${createdHabits.length} привычек`)
}
```

---

## Best Practices

### 1. Создание привычки

```javascript
// ✅ Хорошо - указаны все важные поля
{
    "habits_data": [{
        "name": "Зарядка",
        "icon": "strength",
        "xp_reward": 10,
        "xp_penalty": 20,
        "frequency_type": "daily",
        "description": "Утренняя разминка"
    }]
}

// ❌ Плохо - нет имени
{
    "habits_data": [{
        "icon": "strength"
    }]
}
```

---

### 2. Обновление привычки

```javascript
// ✅ Хорошо - только изменяемые поля
{
    "habits_data": [{
        "habit_id": 123,
        "xp_reward": 25
    }]
}

// ❌ Избыточно - передаются все поля
{
    "habits_data": [{
        "habit_id": 123,
        "name": "То же название",
        "icon": "та же иконка",
        "xp_reward": 25,  // только это изменилось
        // ... остальные поля
    }]
}
```

---

### 3. Batch операции

```javascript
// ✅ Хорошо - одним запросом
await fetch('/api/app/habits/update/', {
    body: JSON.stringify({
        habits_data: [habit1, habit2, habit3]
    })
})

// ❌ Плохо - три запроса
await fetch('/api/app/habits/update/', { body: JSON.stringify({ habits_data: [habit1] }) })
await fetch('/api/app/habits/update/', { body: JSON.stringify({ habits_data: [habit2] }) })
await fetch('/api/app/habits/update/', { body: JSON.stringify({ habits_data: [habit3] }) })
```

---

### 4. Optimistic Updates

```javascript
// ✅ Правильный порядок
function updateHabitName(habitId, newName) {
    // 1. Сразу обновить UI
    updateUIOptimistic(habitId, { name: newName })
    
    // 2. Отправить запрос
    fetch('/api/app/habits/update/', {
        body: JSON.stringify({
            habits_data: [{
                habit_id: habitId,
                name: newName
            }]
        })
    })
    .then(response => {
        // 3. Обновить с серверными данными
        updateUI(response.data.habits[0])
    })
    .catch(error => {
        // 4. При ошибке - откатить
        revertUI(habitId)
        showError(error)
    })
}
```

---

## Итого

**Правильная структура запроса:**

```json
{
    "habits_data": [...],           // Создание/обновление
    "deleted_habit_ids": [...],     // Soft-delete
    "restored_habit_ids": [...],    // Восстановление
    "permanently_deleted_ids": [...] // Полное удаление
}
```

**НЕТ полей:**
- ❌ `action`
- ❌ `habits` (правильно: `habits_data`)
- ❌ `habit_ids` (правильно: `deleted_habit_ids`, `restored_habit_ids`, `permanently_deleted_ids`)
- ❌ `permanent` (правильно: использовать `permanently_deleted_ids`)

---

**Дата обновления:** 07.12.2024  
**Версия:** 2.0 (исправлено)
