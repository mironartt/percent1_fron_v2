# Обновление API: Флаг with_notes_first_page для получения целей и шагов целей

## Краткое описание изменений

Добавлен новый опциональный параметр `with_notes_first_page` в эндпоинты:
- `POST /api/rest/front/app/goals/get/` - для получения списка целей с заметками
- `POST /api/rest/front/app/goals/steps/get/` - для получения шагов цели с заметками

Параметр позволяет загружать первую страницу заметок (до 10 штук) вместе с данными целей, избегая дополнительных запросов.

---

## Что изменилось?

### Endpoint 1: `POST /api/rest/front/app/goals/get/`

Получение списка целей с опциональной загрузкой заметок для каждой цели.

#### Новый параметр запроса

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `with_notes_first_page` | boolean | Нет | `false` | Включить первую страницу заметок для каждой цели |

#### Новые поля в ответе

Когда `with_notes_first_page: true`, каждая цель в массиве `goals_data` будет содержать два дополнительных поля:

1. **`notes_data`** (array) - Массив заметок (первая страница, до 10 заметок)
   ```typescript
   notes_data: Array<{
     note_id: number;
     text: string;
     date_created: string;  // "YYYY-MM-DD HH:MM:SS"
     date_updated: string;  // "YYYY-MM-DD HH:MM:SS"
   }>
   ```

2. **`notes_pagination`** (object | null) - Информация о пагинации заметок
   ```typescript
   notes_pagination: {
     total_items: number;         // Всего заметок для цели
     total_filtered_items: number; // Всего заметок (без фильтров)
     total_pages: number;          // Всего страниц
     page: number;                 // Текущая страница (всегда 1)
     page_size: number;            // Размер страницы (всегда 10)
   } | null
   ```

---

### Endpoint 2: `POST /api/rest/front/app/goals/steps/get/`

Получение шагов конкретной цели с опциональной загрузкой заметок для этой цели.

#### Новый параметр запроса

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `with_notes_first_page` | boolean | Нет | `false` | Включить первую страницу заметок для цели |

#### Новые поля в ответе

Когда `with_notes_first_page: true`, объект `goal_data` в ответе будет содержать два дополнительных поля с той же структурой, что и в первом эндпоинте:

```typescript
{
  "status": "ok",
  "data": {
    "goal_data": {
      "goal_id": number,
      "title": string,
      // ... другие поля цели
      "steps_data": [...],
      "total_data": {...},

      // Новые поля:
      "notes_data": Array<GoalNote>,
      "notes_pagination": NotesPagination | null
    },
    "total_items": number,
    // ... остальные поля пагинации
  }
}
```

---

## Примеры использования

### Пример 1: Получение списка целей БЕЗ заметок

**Endpoint:** `POST /api/rest/front/app/goals/get/`

**Request:**
```json
{
  "page": 1,
  "order_by": "date_created",
  "order_direction": "desc"
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "goals_data": [
      {
        "goal_id": 1,
        "title": "Выучить английский язык",
        "category": "hobby",
        "status": "work",
        "score": "true",
        "date_created": "2023-08-27 15:43:45",
        "date_completed": null,

        // Эти поля всегда присутствуют, даже если флаг не передан
        "notes_data": [],
        "notes_pagination": null
      }
    ],
    "total_items": 5,
    "total_filtered_items": 5,
    "total_pages": 1,
    "page": 1,
    "page_size": 10
  }
}
```

---

### Пример 2: Получение списка целей С заметками

**Endpoint:** `POST /api/rest/front/app/goals/get/`

**Request:**
```json
{
  "with_notes_first_page": true,
  "page": 1,
  "order_by": "date_created",
  "order_direction": "desc"
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "goals_data": [
      {
        "goal_id": 1,
        "title": "Выучить английский язык",
        "category": "hobby",
        "status": "work",
        "score": "true",
        "date_created": "2023-08-27 15:43:45",
        "date_completed": null,

        // Новые поля с данными заметок
        "notes_data": [
          {
            "note_id": 1,
            "text": "Сегодня прошел первый урок по грамматике",
            "date_created": "2023-08-27 16:00:00",
            "date_updated": "2023-08-27 16:00:00"
          },
          {
            "note_id": 2,
            "text": "Выучил 20 новых слов",
            "date_created": "2023-08-28 10:30:00",
            "date_updated": "2023-08-28 10:30:00"
          }
        ],
        "notes_pagination": {
          "total_items": 15,
          "total_filtered_items": 15,
          "total_pages": 2,
          "page": 1,
          "page_size": 10
        }
      },
      {
        "goal_id": 2,
        "title": "Похудеть на 5 кг",
        "category": "health_sport",
        "status": "work",
        "score": "true",
        "date_created": "2023-08-25 12:00:00",
        "date_completed": null,

        // У этой цели нет заметок
        "notes_data": [],
        "notes_pagination": {
          "total_items": 0,
          "total_filtered_items": 0,
          "total_pages": 0,
          "page": 1,
          "page_size": 10
        }
      }
    ],
    "total_items": 5,
    "total_filtered_items": 5,
    "total_pages": 1,
    "page": 1,
    "page_size": 10
  }
}
```

---

### Пример 3: Получение шагов цели БЕЗ заметок

**Endpoint:** `POST /api/rest/front/app/goals/steps/get/`

**Request:**
```json
{
  "goal_id": 148,
  "order_by": "order",
  "order_direction": "asc",
  "page": 1
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "total_items": 5,
    "total_filtered_items": 5,
    "total_pages": 1,
    "page": 1,
    "page_size": 6,
    "per_goal_pagination": false,
    "goal_data": {
      "goal_id": 148,
      "title": "Улучшить финансовое положение",
      "category": "welfare",
      "status": "work",
      "score": "true",
      "date_created": "2025-12-09 11:41:17",
      "date_completed": null,

      "steps_data": [
        {
          "step_id": 244,
          "title": "Записать все источники дохода и расходы за месяц",
          "status": "unplanned",
          "order": 0,
          "is_complete": false
        }
      ],

      "total_data": {
        "total_steps": 5,
        "complete_steps": 0,
        "complete_percent": 0
      },

      // Поля заметок всегда присутствуют
      "notes_data": [],
      "notes_pagination": null
    }
  }
}
```

---

### Пример 4: Получение шагов цели С заметками

**Endpoint:** `POST /api/rest/front/app/goals/steps/get/`

**Request:**
```json
{
  "goal_id": 148,
  "order_by": "order",
  "order_direction": "asc",
  "page": 1,
  "with_notes_first_page": true
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "total_items": 5,
    "total_filtered_items": 5,
    "total_pages": 1,
    "page": 1,
    "page_size": 6,
    "per_goal_pagination": false,
    "goal_data": {
      "goal_id": 148,
      "title": "Улучшить финансовое положение",
      "category": "welfare",
      "status": "work",
      "score": "true",
      "date_created": "2025-12-09 11:41:17",
      "date_completed": null,

      "steps_data": [
        {
          "step_id": 244,
          "title": "Записать все источники дохода и расходы за месяц",
          "status": "planned",
          "priority": "attention",
          "order": 0,
          "is_complete": false
        },
        {
          "step_id": 245,
          "title": "Определить 3 категории расходов для оптимизации",
          "status": "unplanned",
          "order": 1,
          "is_complete": false
        }
      ],

      "total_data": {
        "total_steps": 5,
        "complete_steps": 0,
        "complete_percent": 0
      },

      // Новые поля с данными заметок
      "notes_data": [
        {
          "note_id": 2,
          "text": "Начал анализировать свои расходы",
          "date_created": "2025-12-09 12:19:52",
          "date_updated": "2025-12-09 12:19:52"
        },
        {
          "note_id": 3,
          "text": "Определил основные категории трат",
          "date_created": "2025-12-09 12:19:57",
          "date_updated": "2025-12-09 12:19:57"
        }
      ],

      "notes_pagination": {
        "total_items": 15,
        "total_filtered_items": 15,
        "total_pages": 2,
        "page": 1,
        "page_size": 10
      }
    }
  }
}
```

---

## Интеграция во фронтенд

### TypeScript типы

```typescript
// Базовые типы для заметок
interface GoalNote {
  note_id: number;
  text: string;
  date_created: string;  // "YYYY-MM-DD HH:MM:SS"
  date_updated: string;  // "YYYY-MM-DD HH:MM:SS"
}

interface NotesPagination {
  total_items: number;
  total_filtered_items: number;
  total_pages: number;
  page: number;
  page_size: number;
}

// Обновленный интерфейс Goal
interface Goal {
  goal_id: number;
  title: string;
  category: string | null;
  status: string | null;
  score: string | null;
  why_important?: string;
  why_give_me?: string;
  why_about_me?: string;
  date_created: string;
  date_completed: string | null;

  // Новые поля (всегда присутствуют)
  notes_data: GoalNote[];
  notes_pagination: NotesPagination | null;
}

// Интерфейс для детального просмотра цели с шагами
interface GoalWithSteps extends Goal {
  steps_data: GoalStep[];
  total_data: {
    total_steps: number;
    complete_steps: number;
    complete_percent: number;
    complete_days_in_row: number;
  };
}

interface GoalStep {
  step_id: number;
  goal_id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  time_duration: string | null;
  dt: string | null;
  order: number;
  is_complete: boolean;
  date_completed: string | null;
  date_created: string;
}
```

---

### Pinia Store (обновление)

```typescript
// stores/goals.ts
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [] as Goal[],
    currentGoal: null as GoalWithSteps | null,
    loading: false,
    pagination: null as any,
  }),

  actions: {
    // === СПИСОК ЦЕЛЕЙ ===

    // Загрузить цели БЕЗ заметок (быстрее)
    async loadGoals(page = 1) {
      this.loading = true;
      try {
        const response = await api.post('/app/goals/get/', {
          page,
          order_by: 'date_created',
          order_direction: 'desc',
        });

        this.goals = response.data.goals_data;
        this.pagination = {
          total_items: response.data.total_items,
          total_pages: response.data.total_pages,
          page: response.data.page,
        };
      } finally {
        this.loading = false;
      }
    },

    // Загрузить цели С первой страницей заметок (медленнее, но удобнее)
    async loadGoalsWithNotes(page = 1) {
      this.loading = true;
      try {
        const response = await api.post('/app/goals/get/', {
          with_notes_first_page: true,  // Загружаем заметки
          page,
          order_by: 'date_created',
          order_direction: 'desc',
        });

        this.goals = response.data.goals_data;
        this.pagination = {
          total_items: response.data.total_items,
          total_pages: response.data.total_pages,
          page: response.data.page,
        };
      } finally {
        this.loading = false;
      }
    },

    // === ДЕТАЛЬНЫЙ ПРОСМОТР ЦЕЛИ ===

    // Загрузить шаги цели БЕЗ заметок
    async loadGoalSteps(goalId: number, page = 1) {
      this.loading = true;
      try {
        const response = await api.post('/app/goals/steps/get/', {
          goal_id: goalId,
          page,
          order_by: 'order',
          order_direction: 'asc',
        });

        this.currentGoal = response.data.goal_data;
      } finally {
        this.loading = false;
      }
    },

    // Загрузить шаги цели С заметками (для детального экрана)
    async loadGoalStepsWithNotes(goalId: number, page = 1) {
      this.loading = true;
      try {
        const response = await api.post('/app/goals/steps/get/', {
          goal_id: goalId,
          with_notes_first_page: true,  // Загружаем заметки
          page,
          order_by: 'order',
          order_direction: 'asc',
        });

        this.currentGoal = response.data.goal_data;
      } finally {
        this.loading = false;
      }
    },
  },
});
```

---

### Vue Component - Список целей с превью заметок

```vue
<template>
  <div class="goals-list">
    <!-- Список целей -->
    <div v-for="goal in goals" :key="goal.goal_id" class="goal-card">
      <h3>{{ goal.title }}</h3>
      <p>{{ goal.category }} | {{ goal.status }}</p>

      <!-- Превью заметок (только если загружены) -->
      <div v-if="goal.notes_pagination && goal.notes_pagination.total_items > 0" class="notes-preview">
        <h4>
          Заметки ({{ goal.notes_pagination.total_items }})
        </h4>

        <div v-for="note in goal.notes_data" :key="note.note_id" class="note-preview">
          <p>{{ truncateText(note.text, 100) }}</p>
          <small>{{ formatDate(note.date_created) }}</small>
        </div>

        <!-- Кнопка "Показать все", если заметок больше 10 -->
        <button
          v-if="goal.notes_pagination.total_pages > 1"
          @click="openGoalDetail(goal.goal_id)"
        >
          Показать все ({{ goal.notes_pagination.total_items }})
        </button>
      </div>

      <div v-else class="no-notes">
        <p>Заметок пока нет</p>
        <button @click="addFirstNote(goal.goal_id)">Добавить заметку</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGoalsStore } from '@/stores/goals';
import { useRouter } from 'vue-router';

const goalsStore = useGoalsStore();
const router = useRouter();
const goals = computed(() => goalsStore.goals);

onMounted(() => {
  // Загружаем цели с заметками для превью
  goalsStore.loadGoalsWithNotes();
});

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const openGoalDetail = (goalId: number) => {
  // Переходим на детальный экран цели
  router.push(`/goals/${goalId}`);
};

const addFirstNote = (goalId: number) => {
  // Открыть форму добавления заметки
  router.push(`/goals/${goalId}/notes/create`);
};
</script>
```

---

### Vue Component - Детальный экран цели с шагами и заметками

```vue
<template>
  <div v-if="currentGoal" class="goal-detail">
    <h2>{{ currentGoal.title }}</h2>

    <!-- Блок шагов цели -->
    <section class="steps-section">
      <h3>Шаги цели</h3>
      <div v-for="step in currentGoal.steps_data" :key="step.step_id" class="step-card">
        <h4>{{ step.title }}</h4>
        <p v-if="step.description">{{ step.description }}</p>
        <span class="badge">{{ step.status }}</span>
      </div>
    </section>

    <!-- Блок заметок -->
    <section class="notes-section">
      <h3>Заметки по цели</h3>

      <div v-if="currentGoal.notes_pagination && currentGoal.notes_pagination.total_items > 0">
        <!-- Первая страница заметок -->
        <div v-for="note in currentGoal.notes_data" :key="note.note_id" class="note-card">
          <p>{{ note.text }}</p>
          <small>{{ formatDate(note.date_created) }}</small>
        </div>

        <!-- Показать больше заметок, если есть -->
        <button
          v-if="currentGoal.notes_pagination.total_pages > 1"
          @click="loadAllNotes"
        >
          Загрузить ещё ({{ currentGoal.notes_pagination.total_items - currentGoal.notes_data.length }} заметок)
        </button>
      </div>

      <div v-else>
        <p>Заметок пока нет</p>
      </div>

      <button @click="addNote">Добавить заметку</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGoalsStore } from '@/stores/goals';
import { useRoute, useRouter } from 'vue-router';

const goalsStore = useGoalsStore();
const route = useRoute();
const router = useRouter();

const goalId = computed(() => Number(route.params.id));
const currentGoal = computed(() => goalsStore.currentGoal);

onMounted(() => {
  // Загружаем шаги цели вместе с первой страницей заметок
  goalsStore.loadGoalStepsWithNotes(goalId.value);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const loadAllNotes = () => {
  // Открыть модальное окно или отдельную страницу с полным списком заметок
  router.push(`/goals/${goalId.value}/notes`);
};

const addNote = () => {
  // Открыть форму добавления заметки
  router.push(`/goals/${goalId.value}/notes/create`);
};
</script>
```

---

## Рекомендации по использованию

### Когда использовать `with_notes_first_page: true`?

#### ✅ Для эндпоинта `/app/goals/get/` (список целей)

**Используйте, когда:**
- Нужно показать превью заметок в списке целей (карточный вид)
- Важно сразу видеть, есть ли у цели заметки
- Список целей используется как главный экран приложения
- У пользователя обычно не больше 10-20 целей

**Не используйте, когда:**
- Нужен просто список целей без дополнительной информации
- Важна скорость загрузки (флаг увеличивает время ответа на 10-150ms)
- У пользователя много целей (>50) - будет медленная загрузка
- Заметки не отображаются на текущем экране

---

#### ✅ Для эндпоинта `/app/goals/steps/get/` (детальный экран цели)

**Используйте, когда:**
- Открыт детальный экран конкретной цели
- Нужно отобразить и шаги, и заметки одновременно
- Экран предусматривает отображение превью заметок
- Важна экономия запросов (1 запрос вместо 2)

**Не используйте, когда:**
- На экране отображаются только шаги (без заметок)
- Заметки загружаются по клику на отдельную вкладку
- Оптимизируете начальную загрузку экрана

---

### Когда НЕ использовать флаг (оставить false)?

✅ **Не используйте флаг, когда:**
- Загружаете цели для выпадающего списка / селекта
- Нужны только названия целей для навигации
- Заметки будут загружаться отдельно при клике
- Оптимизируете производительность

---

## Производительность

### Время ответа (примерные оценки)

#### `/app/goals/get/` (список целей)

| Сценарий | Без флага | С флагом | Разница |
|----------|-----------|----------|---------|
| 10 целей без заметок | ~50ms | ~60ms | +10ms |
| 10 целей, у каждой 5 заметок | ~50ms | ~120ms | +70ms |
| 10 целей, у каждой 50+ заметок | ~50ms | ~150ms | +100ms |

#### `/app/goals/steps/get/` (шаги одной цели)

| Сценарий | Без флага | С флагом | Разница |
|----------|-----------|----------|---------|
| 1 цель без заметок | ~30ms | ~35ms | +5ms |
| 1 цель с 5 заметками | ~30ms | ~50ms | +20ms |
| 1 цель с 50+ заметками | ~30ms | ~60ms | +30ms |

**Вывод:**
- Для списка целей флаг добавляет 10-150ms (зависит от количества заметок)
- Для детального экрана флаг добавляет 5-30ms (одна цель)
- В среднем случае задержка приемлемая

---

### Рекомендации по оптимизации

1. **Кэшируйте результаты** на фронтенде
   - Не загружайте заметки при каждом рендере
   - Используйте Pinia/Vuex для сохранения данных

2. **Lazy loading для списков**
   - Показывайте превью заметок только для видимых целей
   - Используйте виртуальный скроллинг для больших списков

3. **Условная загрузка**
   - Используйте флаг только на главной странице
   - На остальных экранах загружайте без заметок

4. **Отложенная загрузка заметок**
   - Первый запрос: получить список целей без заметок
   - Второй запрос (после 100-200ms): догрузить заметки для видимых целей

---

## Обратная совместимость

### ✅ Полностью совместимо

Изменения **полностью обратно совместимы**:

- Если не передавать `with_notes_first_page` или передать `false`, поведение идентично старому
- Поля `notes_data` и `notes_pagination` **всегда присутствуют** в ответе
  - `notes_data` = `[]` (пустой массив)
  - `notes_pagination` = `null`
- Старый код продолжит работать без изменений

---

### Миграция существующего кода

**Вариант 1: Ничего не менять**

Ваш текущий код продолжит работать как раньше. Поля `notes_data` будут пустыми массивами, `notes_pagination` будет `null`.

**Вариант 2: Постепенная миграция**

```typescript
// Шаг 1: Обновите TypeScript типы (добавьте новые поля)
interface Goal {
  // ... существующие поля
  notes_data: GoalNote[];
  notes_pagination: NotesPagination | null;
}

// Шаг 2: Обновите компоненты для отображения заметок
// Шаг 3: Добавьте флаг в запрос, когда будете готовы

// Пример: условное использование флага
async loadGoals(withNotes = false) {
  const response = await api.post('/app/goals/get/', {
    with_notes_first_page: withNotes,  // Включаем только при необходимости
    page: 1,
  });
  this.goals = response.data.goals_data;
}
```

---

## Часто задаваемые вопросы (FAQ)

### Q: Зачем нужен этот флаг, если есть отдельный эндпоинт `/app/goals/notes/get/`?

**A:** Флаг удобен для превью заметок. Вместо N+1 запросов (1 для целей + N для заметок каждой цели) делается один запрос. Для полного списка заметок с фильтрацией/сортировкой используйте отдельный эндпоинт.

---

### Q: Сколько заметок возвращается при использовании флага?

**A:** Всегда первая страница - **максимум 10 заметок** на цель. Если нужно больше, используйте `/app/goals/notes/get/` с пагинацией.

---

### Q: Что если у цели нет заметок?

**A:**
- `notes_data` будет пустым массивом `[]`
- Если флаг `with_notes_first_page: true`, то `notes_pagination.total_items` будет `0`
- Если флаг `false` или не передан, то `notes_pagination` будет `null`

---

### Q: В чем разница между использованием флага в `/app/goals/get/` и `/app/goals/steps/get/`?

**A:**
- `/app/goals/get/` - возвращает заметки для **каждой цели** в списке (может быть несколько целей)
- `/app/goals/steps/get/` - возвращает заметки только для **одной конкретной цели** (вместе с её шагами)

---

### Q: Можно ли получить заметки только для некоторых целей?

**A:** Нет, флаг работает для всех целей в ответе. Если нужны заметки только для одной цели:
- Используйте `/app/goals/steps/get/` с флагом для конкретной цели
- Или используйте `/app/goals/notes/get/` для прямой загрузки заметок

---

### Q: Влияет ли флаг на производительность?

**A:** Да, добавляет от 5ms до 150ms к времени ответа в зависимости от:
- Количества целей (для `/app/goals/get/`)
- Количества заметок у каждой цели
- Подробнее см. раздел "Производительность"

---

### Q: Можно ли фильтровать или сортировать заметки при использовании флага?

**A:** Нет, возвращается первая страница с дефолтной сортировкой по `date_created DESC` (новые первыми). Для кастомной сортировки/фильтрации используйте `/app/goals/notes/get/`.

---

### Q: Как обновить заметки после изменений?

**A:** После создания/обновления/удаления заметок через `/app/goals/notes/update/`:

1. **Вариант 1:** Перезагрузите цели с флагом `with_notes_first_page: true`
2. **Вариант 2:** Используйте `/app/goals/notes/get/` для обновления только заметок
3. **Вариант 3:** Обновите локальное состояние (optimistic update)

---

### Q: Всегда ли присутствуют поля `notes_data` и `notes_pagination` в ответе?

**A:** Да, эти поля **всегда присутствуют** в объектах целей, независимо от значения флага:
- Если `with_notes_first_page: false` или не указан:
  - `notes_data` = `[]`
  - `notes_pagination` = `null`
- Если `with_notes_first_page: true`:
  - `notes_data` = массив заметок (может быть пустым)
  - `notes_pagination` = объект с информацией о пагинации

---

## Связанная документация

- [Полная документация по заметкам](./goal_notes_api.md) - все эндпоинты для работы с заметками
- [API целей](./goals_api.md) - документация по работе с целями

---

## Changelog

### 2025-12-09 (v2)
- ✅ Добавлен параметр `with_notes_first_page` в `POST /api/rest/front/app/goals/steps/get/`
- ✅ Обновлена документация с примерами для обоих эндпоинтов
- ✅ Добавлены примеры использования в Pinia Store
- ✅ Добавлены примеры Vue-компонентов для списка целей и детального экрана
- ✅ Расширен раздел FAQ

### 2025-12-09 (v1)
- ✅ Добавлен параметр `with_notes_first_page` в `POST /api/rest/front/app/goals/get/`
- ✅ Добавлены поля `notes_data` и `notes_pagination` в ответ
- ✅ Обеспечена обратная совместимость (поля всегда присутствуют)