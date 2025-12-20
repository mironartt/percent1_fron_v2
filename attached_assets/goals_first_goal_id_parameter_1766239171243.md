# Добавление параметра first_goal_id в эндпоинт goals/get

## Краткое описание изменений

В эндпоинт `POST /api/rest/front/app/goals/get/` добавлен новый опциональный параметр **`first_goal_id`**, который позволяет указать ID цели для приоритетного отображения первой в списке результатов.

**Кейс использования:**
Пользователь находится на странице "детали по цели", где создает шаги для цели. После создания всех нужных шагов, на данной странице у пользователя есть кнопка "запланировать цель". Клик по данной кнопке редиректит на страницу "планирование". При переходе на страницу планирования, редактируемая ранее цель должна быть первой в списке, независимо от текущей сортировки.

---

## Что изменилось?

### Эндпоинт: `POST /api/rest/front/app/goals/get/`

#### Новый параметр запроса

```typescript
{
  // Существующие параметры
  "with_steps_data": boolean,
  "order_by": string,
  "order_direction": "asc" | "desc",
  "status_filter": string,
  "category_filter": string,
  // ... другие параметры

  // НОВЫЙ параметр
  "first_goal_id": number | null  // Опциональный, ID цели для приоритетного отображения
}
```

#### Описание параметра

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `first_goal_id` | `integer` | Нет | ID цели, которая должна быть первой в сортировке. Если указана, то эта цель будет первой, далее идет обычная сортировка |

#### Валидация

- Минимальное значение: `1`
- Если указан несуществующий `goal_id` или цель не принадлежит пользователю, вернется ошибка:
  ```json
  {
    "status": "error",
    "error_code": "goal_not_access",
    "error_message": "Указанная цель не найдена или недоступна"
  }
  ```
- Если цель была удалена (`date_deleted != null`), также вернется ошибка `goal_not_access`

---

## Бизнес-логика и механика работы

### Как работает приоритетная сортировка?

1. **Без `first_goal_id`** (стандартное поведение):
   ```
   Сортировка: [order_by] [order_direction], затем -goal_id
   Результат: [Goal 5, Goal 3, Goal 1, ...] (по заданной сортировке)
   ```

2. **С `first_goal_id`** (новое поведение):
   ```
   Сортировка: priority_order, затем [order_by] [order_direction], затем -goal_id

   где priority_order:
   - 0 для цели с ID = first_goal_id
   - 1 для всех остальных целей

   Результат: [Goal {first_goal_id}], затем [остальные по сортировке]
   ```

### Примеры сортировки

#### Пример 1: Базовая сортировка по дате создания

**Запрос:**
```json
{
  "order_by": "date_created",
  "order_direction": "desc"
}
```

**Результат (без first_goal_id):**
```
Goal 10 (2024-12-20)
Goal 8  (2024-12-19)
Goal 5  (2024-12-18)
Goal 3  (2024-12-17)
```

**Результат (с first_goal_id = 5):**
```
Goal 5  (2024-12-18)  ← Приоритетная цель
Goal 10 (2024-12-20)  ← Остальные по сортировке
Goal 8  (2024-12-19)
Goal 3  (2024-12-17)
```

#### Пример 2: Сортировка с фильтрами

**Запрос:**
```json
{
  "order_by": "status",
  "order_direction": "asc",
  "category_filter": "health_sport",
  "first_goal_id": 15
}
```

**Логика:**
1. Применяются фильтры (category_filter)
2. Среди отфильтрованных целей выбирается Goal 15 (если она проходит фильтр)
3. Goal 15 становится первой
4. Остальные сортируются по status (asc)

**Важно:** Если `first_goal_id` не проходит фильтры (например, у Goal 15 категория не "health_sport"), она **не будет** включена в результаты, даже если указана в `first_goal_id`.

---

## Примеры использования

### Кейс 1: Редирект на планирование после создания шагов

**Сценарий:**
1. Пользователь на странице `/goals/123/details`
2. Создает шаги для цели с ID = 123
3. Нажимает "Запланировать цель"
4. Редирект на `/goals/planning`

**Запрос на странице планирования:**
```json
POST /api/rest/front/app/goals/get/
{
  "first_goal_id": 123,
  "steps_planning_filter": "has_unplanned",
  "order_by": "date_created",
  "order_direction": "desc",
  "page": 1
}
```

**Результат:**
```json
{
  "status": "ok",
  "data": {
    "goals_data": [
      {
        "goal_id": 123,  ← Цель с которой работал пользователь
        "title": "Похудеть на 10 кг",
        "category": "health_sport",
        "status": "work",
        // ... остальные поля
      },
      {
        "goal_id": 145,  ← Остальные цели по сортировке
        "title": "Выучить английский",
        // ...
      },
      // ... другие цели
    ],
    "total_items": 25,
    "total_filtered_items": 8,
    "total_pages": 1,
    "page": 1,
    "page_size": 10
  }
}
```

### Кейс 2: Обычный запрос без приоритета

**Запрос:**
```json
POST /api/rest/front/app/goals/get/
{
  "order_by": "date_created",
  "order_direction": "desc",
  "page": 1
}
```

**Поведение:**
- Параметр `first_goal_id` не передан
- Сортировка работает как обычно (без изменений)
- Полная обратная совместимость

### Кейс 3: Ошибка при несуществующей цели

**Запрос:**
```json
POST /api/rest/front/app/goals/get/
{
  "first_goal_id": 99999  // Несуществующая или чужая цель
}
```

**Ответ:**
```json
{
  "status": "error",
  "error_code": "goal_not_access",
  "error_message": "Указанная цель не найдена или недоступна"
}
```

---

## Интеграция во фронтенде

### TypeScript типы

```typescript
// Добавить в интерфейс запроса
interface GetGoalsDataRequest {
  with_steps_data?: boolean;
  with_steps_on_current_week?: boolean;
  with_notes_first_page?: boolean;
  order_by?: 'date_created' | 'status' | 'category' | 'score';
  order_direction?: 'asc' | 'desc';
  status_filter?: string;
  category_filter?: string;
  steps_planning_filter?: 'has_unplanned' | 'all_planned';
  query_filter?: string;
  page?: number;

  // Новый параметр
  first_goal_id?: number | null;
}
```

### Пример использования в Vue 3 (Composition API)

```typescript
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { goalsApi } from '@/api/goals';

const route = useRoute();
const router = useRouter();

// Получение целей с приоритетом
const loadGoalsWithPriority = async (priorityGoalId?: number) => {
  const request = {
    order_by: 'date_created',
    order_direction: 'desc' as const,
    steps_planning_filter: 'has_unplanned' as const,
    page: 1,
    first_goal_id: priorityGoalId || null,
  };

  const response = await goalsApi.getGoals(request);

  if (response.status === 'ok') {
    return response.data;
  } else {
    console.error('Ошибка загрузки целей:', response.error_message);
    return null;
  }
};

// Редирект на планирование с приоритетной целью
const navigateToPlanningWithGoal = (goalId: number) => {
  router.push({
    name: 'GoalsPlanning',
    query: {
      priority_goal: goalId.toString(),
    },
  });
};

// В компоненте планирования
const loadPlanningData = async () => {
  const priorityGoalId = route.query.priority_goal
    ? parseInt(route.query.priority_goal as string)
    : undefined;

  const data = await loadGoalsWithPriority(priorityGoalId);
  // ... обработка данных
};
```

### Pinia Store пример

```typescript
// stores/goals.ts
import { defineStore } from 'pinia';
import { goalsApi } from '@/api/goals';

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [],
    priorityGoalId: null as number | null,
  }),

  actions: {
    async fetchGoals(filters = {}) {
      const request = {
        ...filters,
        first_goal_id: this.priorityGoalId,
      };

      const response = await goalsApi.getGoals(request);

      if (response.status === 'ok') {
        this.goals = response.data.goals_data;
      }
    },

    setPriorityGoal(goalId: number | null) {
      this.priorityGoalId = goalId;
    },

    clearPriorityGoal() {
      this.priorityGoalId = null;
    },
  },
});
```

---

## Обратная совместимость

### ✅ Полностью совместимо

Изменение **полностью обратно совместимо**:

- Параметр `first_goal_id` опциональный (`required=False, allow_null=True`)
- Если параметр не передан, сортировка работает как раньше
- Все существующие запросы продолжат работать без изменений
- Новая логика активируется только при явной передаче `first_goal_id`

### Рекомендации для фронтенда

1. **Добавьте параметр в TypeScript типы** для автодополнения
2. **Используйте query параметры** для передачи `priority_goal` между страницами
3. **Очищайте приоритет** после первой загрузки, чтобы последующие запросы работали стандартно
4. **Обрабатывайте ошибку `goal_not_access`** при указании несуществующей цели

---

## Что НЕ изменилось

- Все остальные параметры эндпоинта работают как прежде
- Фильтры (`status_filter`, `category_filter`, `steps_planning_filter`) применяются до приоритетной сортировки
- Пагинация работает стандартно
- Структура ответа не изменилась
- Другие эндпоинты (`/app/goals/update/`, `/app/goals/steps/get/`) не затронуты

---

## Технические детали реализации

### SQL логика (для понимания)

Приоритетная сортировка реализована через Django ORM аннотацию:

```python
# Если first_goal_id указан
queryset.annotate(
    priority_order=Case(
        When(id=first_goal_id, then=0),
        default=1,
        output_field=IntegerField(),
    )
).order_by('priority_order', order_by_field, '-goal_id')
```

**SQL эквивалент:**
```sql
SELECT *,
  CASE
    WHEN id = {first_goal_id} THEN 0
    ELSE 1
  END as priority_order
FROM goals
WHERE user_id = {user_id} AND date_deleted IS NULL
ORDER BY priority_order ASC, {order_by_field}, goal_id DESC
```

### Файлы изменений

1. **core/serializers/goals.py** (строка 70)
   - Добавлен параметр `first_goal_id` в `GetGoalsDataRequestSerializer`
   - Добавлена валидация существования и доступа к цели

2. **core/views/drf/front_api_methods/goals.py** (строки 59, 73)
   - Параметр передается в метод модели

3. **core/models/globals.py** (строки 1148, 1221-1234)
   - Реализована логика приоритетной сортировки

---

## Changelog

### 2025-12-20
- Добавлен параметр `first_goal_id` в эндпоинт `POST /api/rest/front/app/goals/get/`
- Реализована приоритетная сортировка для указанной цели
- Добавлена валидация доступа к цели при использовании `first_goal_id`
- Полная обратная совместимость с существующими интеграциями