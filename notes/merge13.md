# Merge 13: Унификация фильтров Planning + интеграция API для недельного планировщика

**Дата:** 3 декабря 2025

## Обзор изменений

1. Унификация блока фильтров между страницами Planning и GoalsBank
2. Полная интеграция нового API эндпоинта `/api/rest/front/app/goals/steps/planned/get/` для недельного планировщика

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
Использовалась клиентская фильтрация по `scheduledCount`.

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

### Бизнес-логика статусов
- `work` - цели в активной работе (основной рабочий набор пользователя)
- `complete` - завершенные цели (архив достижений)
- `unstatus` - цели без явного статуса (требуют внимания/категоризации)

---

## 2. Исправление дефолтного значения status_filter

### Проблема
При пустом фильтре статуса отправлялся `status_filter: 'work'` по умолчанию.

### Решение
Синхронизировано с GoalsBank.vue - когда фильтр пустой, параметр не отправляется:
```javascript
if (filterStatus.value) {
  params.status_filter = filterStatus.value
}
// When empty, don't set status_filter - returns all goals
```

---

## 3. Интеграция API для недельного планировщика

### Новый эндпоинт: `/api/rest/front/app/goals/steps/planned/get/`

#### Добавленные структуры данных
```javascript
// Weekly planner data from backend API
const weeklyStepsData = ref([]) // Data from /goals/steps/planned/get/
const weeklyStepsLoading = ref(false)
```

#### Функция загрузки данных
```javascript
async function loadWeeklySteps() {
  if (weeklyStepsLoading.value) return
  
  // Get week date range based on weekOffset
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + (weekOffset.value * 7))
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  const dateFrom = formatDateLocal(monday)
  const dateTo = formatDateLocal(sunday)
  
  weeklyStepsLoading.value = true
  
  try {
    const { getPlannedSteps } = await import('@/services/api.js')
    const response = await getPlannedSteps({
      date_from: dateFrom,
      date_to: dateTo
    })
    
    if (response.status === 'ok' && response.data?.result_week_data) {
      weeklyStepsData.value = response.data.result_week_data
    }
  } catch (error) {
    console.error('[Planning] Error loading weekly steps:', error)
    weeklyStepsData.value = []
  } finally {
    weeklyStepsLoading.value = false
  }
}
```

#### Вызов при загрузке и смене недели
```javascript
// Watch weekOffset to reload weekly steps when navigating weeks
watch(weekOffset, () => {
  loadWeeklySteps()
})

onMounted(async () => {
  await loadGoalsFromBackend()
  await loadWeeklySteps()  // <-- Новый вызов
  ensureWeekPlan()
  setupDemoData()
  loadFiltersFromUrl()
})
```

---

## 4. Обновление getTasksForDay()

### Маппинг данных бэкенда
```javascript
// Map backend time_duration to frontend timeEstimate
const timeDurationMap = { 
  'half': '30min', 
  'one': '1h', 
  'two': '2h', 
  'three': '3h', 
  'four': '4h' 
}

// Map backend priority to frontend priority
const priorityBackendToFrontend = { 
  'important': 'critical', 
  'attention': 'attention', 
  'optional': 'optional' 
}
```

### Логика функции
```javascript
function getTasksForDay(dateStr) {
  // First check weeklyStepsData from backend API
  const dayData = weeklyStepsData.value.find(d => d.date === dateStr)
  if (dayData && dayData.steps_data && dayData.steps_data.length > 0) {
    // Transform backend format to UI format
    return dayData.steps_data
      .map(step => ({
        id: `backend-${step.step_id}`,
        goalId: step.goal_id,
        stepId: step.step_id,
        stepTitle: step.step_title,
        goalTitle: step.goal_title,
        goalCategory: step.goal_category,
        scheduledDate: step.step_dt,
        timeEstimate: timeDurationMap[step.step_time_duration] || '',
        priority: priorityBackendToFrontend[step.step_priority] || step.step_priority || '',
        completed: step.step_is_complete || false,
        order: step.step_order,
        description: step.step_description
      }))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }
  
  // Fallback to local scheduledTasks if no backend data
  return scheduledTasks.value
    .filter(t => t.scheduledDate === dateStr)
    .sort(...)
}
```

---

## 5. Формат данных API

### Запрос
```json
{
  "date_from": "2025-12-02",
  "date_to": "2025-12-08"
}
```

### Ответ
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
            "goal_id": 23,
            "goal_title": "Улучшить финансовую дисциплину",
            "goal_category": "welfare",
            "goal_status": "work",
            "goal_score": "true",
            "goal_date_created": "2025-12-02 15:29:10",
            "step_id": 18,
            "step_title": "Проверить корректность формул",
            "step_description": "Обязательно протестировать расчёты",
            "step_priority": "attention",
            "step_time_duration": "four",
            "step_dt": "2025-12-02",
            "step_order": 22,
            "step_is_complete": false,
            "step_date_completed": null,
            "step_date_created": "2025-12-01 16:12:22"
          }
        ],
        "total_steps": 2,
        "total_complete": 0,
        "total_uncomplete": 2,
        "complete_percent": 0
      }
    ]
  }
}
```

---

## 6. Поля сериализатора

| Поле | Тип | Описание |
|------|-----|----------|
| `goal_id` | int | ID цели |
| `goal_title` | string | Название цели |
| `goal_category` | choice | Категория: health, relationships, career, finance, growth, leisure, welfare |
| `goal_status` | choice | Статус: work, complete, unstatus |
| `goal_score` | choice | Оценка цели: true/false |
| `goal_date_created` | datetime | Дата создания цели |
| `step_id` | int | ID шага |
| `step_title` | string | Название шага |
| `step_description` | string | Описание шага |
| `step_priority` | choice | Приоритет: important, attention, optional |
| `step_time_duration` | choice | Время: half, one, two, three, four |
| `step_dt` | date | Запланированная дата (YYYY-MM-DD) |
| `step_order` | int | Порядок сортировки |
| `step_is_complete` | bool | Завершен ли шаг |
| `step_date_completed` | datetime | Дата завершения |
| `step_date_created` | datetime | Дата создания |

---

## 7. Измененные файлы

1. **src/views/Planning.vue**
   - Добавлен `weeklyStepsData` ref для хранения данных с бэкенда
   - Добавлена функция `loadWeeklySteps()` для вызова API
   - Добавлен watcher для `weekOffset` (перезагрузка при смене недели)
   - Обновлена функция `getTasksForDay()` с маппингом данных бэкенда
   - Изменены опции статус-фильтра на work/complete/unstatus
   - Удалена клиентская фильтрация по статусам

2. **src/services/api.js**
   - Добавлена функция `getPlannedSteps(params)`
   - Обновлен экспорт API объекта

3. **replit.md**
   - Обновлено описание Planning Module

---

## 8. Порядок приоритетов

```javascript
const priorityOrder = { 
  critical: 0,   // Критически важный
  important: 0,  // Важный (backend mapping)
  desirable: 1,  // Желательный
  attention: 2,  // Требует внимания
  optional: 3,   // Опциональный
  '': 4          // Без приоритета
}
```

---

## 9. Тестирование

### Чек-лист
- [ ] При загрузке `/app/planning` в сетевых запросах виден POST на `/goals/steps/planned/get/`
- [ ] Даты date_from и date_to соответствуют текущей неделе (Пн-Вс)
- [ ] При переключении недели (стрелки навигации) отправляется новый запрос
- [ ] Шаги из бэкенда отображаются в блоке "План на неделю"
- [ ] Приоритеты корректно маппятся (important → critical)
- [ ] Время маппится (four → 4h, one → 1h и т.д.)
- [ ] Фильтр "Все статусы" показывает все цели
- [ ] Фильтр "В работе" показывает только активные цели
