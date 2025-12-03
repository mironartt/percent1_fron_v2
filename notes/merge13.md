# Merge 13: Унификация фильтров Planning + новый API эндпоинт

**Дата:** 3 декабря 2025

## Обзор изменений

Унификация блока фильтров между страницами Planning и GoalsBank для единообразия UX и корректной работы с бэкендом. Добавлен новый API эндпоинт для получения запланированных шагов по диапазону дат.

---

## 1. Унификация фильтра статуса

### Было (Planning.vue)
```javascript
const statusOptions = ref([
  { value: '', label: 'Все статусы' },
  { value: 'scheduled', label: 'Запланированы' },
  { value: 'unscheduled', label: 'Не запланированы' },
  { value: 'partial', label: 'Частично' },
  { value: 'full', label: 'Полностью' }
])
```
Использовалась клиентская фильтрация по `scheduledCount` - подсчитывались шаги с датами.

### Стало (унифицировано с GoalsBank.vue)
```javascript
const statusOptions = ref([
  { value: '', label: 'Все статусы' },
  { value: 'work', label: 'В работе' },
  { value: 'complete', label: 'Завершенные' },
  { value: 'unstatus', label: 'Без статуса' }
])
```
Фильтрация через серверный API параметр `status_filter`.

### Бизнес-логика
- `work` - цели в активной работе (основной рабочий набор пользователя)
- `complete` - завершенные цели (архив достижений)
- `unstatus` - цели без явного статуса (требуют внимания/категоризации)

---

## 2. Исправление дефолтного значения status_filter

### Проблема
При пустом фильтре статуса отправлялся `status_filter: 'work'` по умолчанию:
```javascript
// Было
if (filterStatus.value) {
  params.status_filter = filterStatus.value
} else {
  params.status_filter = 'work' // Default to goals "in work"
}
```

### Решение
Синхронизировано с GoalsBank.vue - когда фильтр пустой, параметр не отправляется:
```javascript
// Стало
if (filterStatus.value) {
  params.status_filter = filterStatus.value
}
// When empty, don't set status_filter - returns all goals
```

### Почему это важно
- При пустом фильтре бэкенд возвращает ВСЕ цели независимо от статуса
- Это позволяет пользователю видеть полную картину целей
- Поведение идентично GoalsBank для консистентности UX

---

## 3. Флаг result_week_data

### Реализация
При активном фильтре "Эта неделя" (`filterThisWeek = true`) добавляется флаг в запрос:
```javascript
if (filterThisWeek.value) {
  params.result_week_data = true
}
```

### Формат ответа бэкенда
Когда `result_week_data: true`, бэкенд возвращает дополнительную структуру:
```json
{
  "status": "ok",
  "data": {
    "goals_data": [...],
    "result_week_data": [
      {
        "date": "2025-12-02",
        "steps_data": [...],
        "total_steps": 5,
        "total_complete": 2,
        "total_uncomplete": 3,
        "complete_percent": 40
      }
    ]
  }
}
```

---

## 4. Новый API эндпоинт getPlannedSteps

### Файл: `src/services/api.js`

### Сигнатура
```javascript
export async function getPlannedSteps(params) {
  const requestData = {
    date_from: params.date_from,  // YYYY-MM-DD
    date_to: params.date_to       // YYYY-MM-DD
  }
  
  return request('POST', '/api/rest/front/app/goals/steps/planned/get/', requestData)
}
```

### Назначение
Получение шагов запланированных на определенный диапазон дат. Используется для:
- Недельного планирования
- Календарного представления задач
- Dashboard виджета "Задачи на сегодня"

### Формат ответа
```json
{
  "status": "ok",
  "data": {
    "date_from": "2025-12-02",
    "date_to": "2025-12-08",
    "result_week_data": [
      {
        "date": "2025-12-02",
        "steps_data": [
          {
            "step_id": 123,
            "goal_id": 456,
            "title": "Шаг задачи",
            "priority": "important",
            "time_duration": "one",
            "status": "uncomplete"
          }
        ],
        "total_steps": 3,
        "total_complete": 1,
        "total_uncomplete": 2,
        "complete_percent": 33
      }
    ]
  }
}
```

---

## 5. Удаленный код

### Клиентская фильтрация статусов
Полностью удалена логика подсчета `scheduledCount` и фильтрации по статусам scheduled/unscheduled/partial/full:

```javascript
// УДАЛЕНО:
const goalMatchesStatusFilter = (goal) => {
  if (!filterStatus.value) return true
  
  const scheduledCount = goal.steps?.filter(step => {
    const scheduled = scheduledTasks.value.find(...)
    return scheduled?.date
  }).length || 0
  
  const totalSteps = goal.steps?.length || 0
  
  switch (filterStatus.value) {
    case 'scheduled': return scheduledCount === totalSteps && totalSteps > 0
    case 'unscheduled': return scheduledCount === 0
    case 'partial': return scheduledCount > 0 && scheduledCount < totalSteps
    case 'full': return scheduledCount === totalSteps
    default: return true
  }
}
```

---

## 6. Взаимодействие с бэкендом

### Эндпоинт: `/api/rest/front/app/goals/get/`

#### Параметры запроса
| Параметр | Тип | Описание |
|----------|-----|----------|
| `status_filter` | string | Опционально: `work`, `complete`, `unstatus` |
| `category_filter` | string | Сфера жизни: `health`, `relationships`, `career`, `finance`, `growth`, `leisure` |
| `query_filter` | string | Текстовый поиск (мин 3 символа) |
| `with_steps_data` | boolean | Включить данные шагов в ответ |
| `result_week_data` | boolean | Включить недельную статистику |
| `order_by` | string | Поле сортировки |
| `order_direction` | string | `asc` или `desc` |
| `page` | number | Номер страницы |

### Эндпоинт: `/api/rest/front/app/goals/steps/planned/get/`

#### Параметры запроса
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `date_from` | string | Да | Начальная дата (YYYY-MM-DD) |
| `date_to` | string | Да | Конечная дата (YYYY-MM-DD) |

---

## 7. Измененные файлы

1. **src/views/Planning.vue**
   - Изменены опции статус-фильтра
   - Удалена клиентская фильтрация по статусам
   - Добавлен флаг `result_week_data`
   - Исправлен дефолт status_filter

2. **src/services/api.js**
   - Добавлена функция `getPlannedSteps()`
   - Обновлен экспорт API объекта

3. **replit.md**
   - Обновлено описание Planning Module

---

## 8. Тестирование

### Чек-лист
- [ ] Фильтр "Все статусы" показывает все цели
- [ ] Фильтр "В работе" показывает только активные цели
- [ ] Фильтр "Завершенные" показывает только завершенные
- [ ] Фильтр "Без статуса" показывает цели без статуса
- [ ] Комбинация фильтров (статус + сфера + поиск) работает корректно
- [ ] "Эта неделя" добавляет result_week_data в запрос
- [ ] getPlannedSteps возвращает данные в ожидаемом формате
