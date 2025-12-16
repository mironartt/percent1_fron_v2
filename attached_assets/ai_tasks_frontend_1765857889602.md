# AI Tasks API - Интеграция для фронтенда

## Обзор

Система AI-кнопок позволяет запускать фоновые AI-задачи и отслеживать их прогресс в реальном времени.

**Основные компоненты:**
- **REST API** - запуск задач, получение статуса, отмена
- **WebSocket** - прогресс в реальном времени (`ws/tasks/`)

---

## REST API Endpoints

Все endpoints используют метод **POST** и возвращают JSON.

Base URL: `/api/rest/front/`

### 1. Запуск задачи

```
POST /app/ai-tasks/start/
```

**Request:**
```json
{
    "task_type": "goal_decomposition",
    "context": {
        "goal_id": 123
    }
}
```

**Response (успех):**
```json
{
    "status": "ok",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "status": "pending"
    }
}
```

**Response (задача уже выполняется):**
```json
{
    "status": "error",
    "error_code": "ai_task_already_running",
    "error_message": "Задача этого типа уже выполняется",
    "data": {
        "existing_task_id": 455
    }
}
```

**Response (cooldown):**
```json
{
    "status": "error",
    "error_code": "ai_task_cooldown",
    "error_message": "Подождите 45 секунд перед повторным запуском",
    "data": {
        "wait_seconds": 45
    }
}
```

### 2. Статус задачи

```
POST /app/ai-tasks/status/
```

**Request:**
```json
{
    "task_id": 456
}
```

**Response:**
```json
{
    "status": "ok",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "status": "completed",
        "progress_percent": 100,
        "progress_text": "Готово",
        "result": {
            "steps": [
                {"title": "Шаг 1", "description": "..."},
                {"title": "Шаг 2", "description": "..."}
            ],
            "summary": "Декомпозиция: 5 шагов"
        },
        "error": null,
        "date_created": "2024-01-15 10:30:00",
        "date_finished": "2024-01-15 10:30:45"
    }
}
```

### 3. Активные задачи

```
POST /app/ai-tasks/active/
```

**Request:** (пустой body)
```json
{}
```

**Response:**
```json
{
    "status": "ok",
    "data": {
        "tasks": [
            {
                "task_id": 456,
                "task_type": "goal_decomposition",
                "status": "running",
                "progress_percent": 50,
                "progress_text": "Генерация шагов...",
                "date_created": "2024-01-15 10:30:00"
            }
        ]
    }
}
```

### 4. Отмена задачи

```
POST /app/ai-tasks/cancel/
```

**Request:**
```json
{
    "task_id": 456
}
```

**Response:**
```json
{
    "status": "ok",
    "data": {
        "task_id": 456,
        "cancelled": true
    }
}
```

### 5. История задач

```
POST /app/ai-tasks/history/
```

**Request:**
```json
{
    "task_type_filter": "goal_decomposition",
    "status_filter": "completed",
    "page": 1,
    "page_size": 10
}
```

**Response:**
```json
{
    "status": "ok",
    "data": {
        "tasks": [...],
        "total_items": 25,
        "total_pages": 3,
        "page": 1,
        "page_size": 10
    }
}
```

---

## WebSocket API

### Подключение

```javascript
const ws = new WebSocket('wss://your-domain.com/ws/tasks/');
```

**Важно:** Пользователь должен быть авторизован (session cookie).

### События от сервера

#### 1. active_tasks (при подключении)

```json
{
    "type": "active_tasks",
    "data": {
        "tasks": [
            {
                "task_id": 456,
                "task_type": "goal_decomposition",
                "status": "running",
                "progress_percent": 30,
                "progress_text": "Анализ цели..."
            }
        ]
    }
}
```

#### 2. task_started

```json
{
    "type": "task_started",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition"
    }
}
```

#### 3. task_progress

```json
{
    "type": "task_progress",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "progress_percent": 50,
        "progress_text": "Генерация шагов..."
    }
}
```

#### 4. task_completed

```json
{
    "type": "task_completed",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "result": {
            "steps": [...],
            "summary": "Декомпозиция: 5 шагов"
        }
    }
}
```

#### 5. task_failed

```json
{
    "type": "task_failed",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "error": {
            "code": "timeout",
            "message": "Превышено время выполнения"
        }
    }
}
```

#### 6. ping (heartbeat)

```json
{
    "type": "ping",
    "data": {
        "timestamp": "2024-01-15T10:30:00.000Z"
    }
}
```

**Ответ:** Отправить `pong`

```json
{
    "type": "pong"
}
```

#### 7. force_disconnect

```json
{
    "type": "force_disconnect",
    "data": {
        "reason": "new_connection"
    }
}
```

Соединение будет закрыто. Причина: пользователь открыл другую вкладку.

### События от клиента

#### 1. pong (ответ на ping)

```json
{
    "type": "pong"
}
```

#### 2. cancel_task

```json
{
    "action": "cancel_task",
    "data": {
        "task_id": 456
    }
}
```

**Ответ:**
```json
{
    "type": "cancel_task_response",
    "data": {
        "task_id": 456,
        "success": true
    }
}
```

#### 3. get_task_status

```json
{
    "action": "get_task_status",
    "data": {
        "task_id": 456
    }
}
```

**Ответ:**
```json
{
    "type": "task_status",
    "data": {
        "task_id": 456,
        "task_type": "goal_decomposition",
        "status": "running",
        "progress_percent": 60,
        "progress_text": "Генерация шагов...",
        "result": null,
        "error": null
    }
}
```

---

## Типы задач

| task_type | Описание | Context |
|-----------|----------|---------|
| `onboarding_generate_goals` | Генерация 3 целей с шагами | — |
| `goal_mentor_help` | Помощь ментора | `{category?: string}` |
| `goal_decomposition` | Декомпозиция цели | `{goal_id: number}` или `{goal_title: string}` |
| `week_planning_help` | Помощь в планировании недели | `{include_overdue?: boolean}` |
| `habit_create_help` | Помощь при создании привычек | — |

---

## Статусы задач

| status | Описание |
|--------|----------|
| `pending` | В очереди (ожидает выполнения) |
| `running` | Выполняется |
| `completed` | Успешно завершена |
| `failed` | Ошибка |
| `cancelled` | Отменена пользователем |

---

## Форматы результатов

### onboarding_generate_goals

```json
{
    "goals": [
        {
            "title": "Улучшить физическую форму",
            "category": "health",
            "why_important": "Здоровье - основа продуктивности",
            "steps": [
                {"title": "Записаться в спортзал", "description": "..."},
                {"title": "Составить план тренировок", "description": "..."}
            ]
        }
    ],
    "summary": "Сгенерировано 3 цели"
}
```

### goal_decomposition

```json
{
    "goal_id": 123,
    "steps": [
        {"title": "Шаг 1", "description": "...", "time_estimate": "1 день"},
        {"title": "Шаг 2", "description": "...", "time_estimate": "2 дня"}
    ],
    "summary": "Декомпозиция: 5 шагов"
}
```

### goal_mentor_help

```json
{
    "suggestions": [
        {
            "title": "Развитие карьеры",
            "description": "Получить повышение или сменить работу",
            "why_important": "Профессиональный рост важен для самореализации"
        }
    ],
    "summary": "3 предложения"
}
```

### week_planning_help

```json
{
    "plan": [
        {"stepId": 123, "date": "2025-12-16", "estimatedTime": "one", "reason": "..."}
    ],
    "not_this_week": [
        {"stepId": 456, "reason": "..."}
    ],
    "summary": {"total_planned": 5, "total_hours": 10, "total_not_planned": 2},
    "reasoning": "..."
}
```

**Использование фронтом:**
- `plan` — массив шагов для планирования, можно использовать для обновления `dt` шагов через API `/app/goals/steps/update/`
- `not_this_week` — шаги отложенные на следующую неделю
- `estimatedTime` — оценка времени (half/one/two/three/four)

### habit_create_help

```json
{
    "habits": [
        {
            "name": "Утренняя зарядка 5 минут",
            "icon": "dumbbell",
            "description": "Простая разминка после пробуждения",
            "frequency_type": "daily",
            "schedule_days": [0, 1, 2, 3, 4, 5, 6],
            "schedule_label": "Каждый день",
            "xp_reward": 10,
            "why_useful": "Поможет улучшить здоровье (ваша зона роста)",
            "trigger": "После пробуждения, перед душем"
        }
    ],
    "reasoning": "Предложены привычки для здоровья, карьеры и баланса",
    "summary": "Сгенерировано 3 привычки"
}
```

**Использование фронтом:**
- `habits` — массив из 3 привычек готовых к созданию
- Для создания привычки: отправить данные на `/app/habits/update/` с полями `name`, `icon`, `description`, `frequency_type`, `schedule_days`, `xp_reward`
- `why_useful` и `trigger` — для отображения пользователю в UI (не сохраняются в БД)
- `schedule_days` — массив дней недели где 0=Воскресенье, 1=Понедельник, ... 6=Суббота

**Доступные иконки:**
```
fire, strength, brain, heart, book, run, water, sleep, meditation, target,
money, graph, sun, moon, shield, palette, smile, apple, weight, calendar,
trophy, star, rocket, leaf, coffee, music, camera, laptop, dumbbell, yoga,
bicycle, swimmer
```

**Типы частоты (frequency_type):**
- `daily` — каждый день
- `weekdays` — по будням (Пн-Пт)
- `weekends` — по выходным (Сб-Вс)
- `custom` — свой график

---

## Vue.js Composable (пример)

```typescript
// composables/useAITask.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/services/api'

interface AITask {
  task_id: number
  task_type: string
  status: string
  progress_percent: number
  progress_text: string | null
  result: any
  error: any
}

export function useAITask() {
  const activeTasks = ref<AITask[]>([])
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)

  // WebSocket подключение
  function connect() {
    ws.value = new WebSocket(`wss://${window.location.host}/ws/tasks/`)

    ws.value.onopen = () => {
      isConnected.value = true
    }

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleMessage(message)
    }

    ws.value.onclose = () => {
      isConnected.value = false
      // Переподключение через 3 секунды
      setTimeout(connect, 3000)
    }
  }

  function handleMessage(message: any) {
    const { type, data } = message

    switch (type) {
      case 'ping':
        ws.value?.send(JSON.stringify({ type: 'pong' }))
        break

      case 'active_tasks':
        activeTasks.value = data.tasks
        break

      case 'task_started':
        activeTasks.value.push({
          task_id: data.task_id,
          task_type: data.task_type,
          status: 'running',
          progress_percent: 0,
          progress_text: 'Запуск...',
          result: null,
          error: null
        })
        break

      case 'task_progress':
        updateTask(data.task_id, {
          progress_percent: data.progress_percent,
          progress_text: data.progress_text
        })
        break

      case 'task_completed':
        updateTask(data.task_id, {
          status: 'completed',
          progress_percent: 100,
          result: data.result
        })
        break

      case 'task_failed':
        updateTask(data.task_id, {
          status: 'failed',
          error: data.error
        })
        break
    }
  }

  function updateTask(taskId: number, updates: Partial<AITask>) {
    const index = activeTasks.value.findIndex(t => t.task_id === taskId)
    if (index !== -1) {
      activeTasks.value[index] = { ...activeTasks.value[index], ...updates }
    }
  }

  // Запуск задачи
  async function startTask(taskType: string, context: Record<string, any> = {}) {
    const response = await api.post('/app/ai-tasks/start/', {
      task_type: taskType,
      context
    })

    if (response.status === 'error') {
      throw new Error(response.error_message)
    }

    return response.data
  }

  // Отмена задачи
  async function cancelTask(taskId: number) {
    const response = await api.post('/app/ai-tasks/cancel/', {
      task_id: taskId
    })
    return response.status === 'ok'
  }

  // Получить активную задачу по типу
  function getActiveTaskByType(taskType: string): AITask | undefined {
    return activeTasks.value.find(
      t => t.task_type === taskType && ['pending', 'running'].includes(t.status)
    )
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    ws.value?.close()
  })

  return {
    activeTasks,
    isConnected,
    startTask,
    cancelTask,
    getActiveTaskByType
  }
}
```

---

## Использование в компоненте

```vue
<template>
  <div>
    <!-- Кнопка AI-помощи -->
    <button
      @click="handleMentorHelp"
      :disabled="isTaskRunning"
    >
      <span v-if="isTaskRunning">
        {{ currentTask?.progress_text || 'Загрузка...' }}
        ({{ currentTask?.progress_percent }}%)
      </span>
      <span v-else>
        Помощь от ментора
      </span>
    </button>

    <!-- Результат -->
    <div v-if="taskResult">
      <h3>Предложения:</h3>
      <ul>
        <li v-for="suggestion in taskResult.suggestions" :key="suggestion.title">
          <strong>{{ suggestion.title }}</strong>
          <p>{{ suggestion.description }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAITask } from '@/composables/useAITask'

const { startTask, getActiveTaskByType, activeTasks } = useAITask()

const taskResult = ref(null)

const currentTask = computed(() =>
  getActiveTaskByType('goal_mentor_help')
)

const isTaskRunning = computed(() =>
  currentTask.value?.status === 'pending' ||
  currentTask.value?.status === 'running'
)

async function handleMentorHelp() {
  try {
    const task = await startTask('goal_mentor_help', {
      category: 'health'
    })
    console.log('Task started:', task.task_id)
  } catch (error) {
    alert(error.message)
  }
}

// Следим за завершением задачи
watch(
  () => currentTask.value?.status,
  (newStatus) => {
    if (newStatus === 'completed') {
      taskResult.value = currentTask.value?.result
    }
  }
)
</script>
```

---

## Обработка ошибок

### Ошибки REST API

| error_code | Описание | Действие |
|------------|----------|----------|
| `ai_task_already_running` | Задача уже выполняется | Показать прогресс существующей задачи |
| `ai_task_cooldown` | Нужно подождать | Показать таймер обратного отсчета |
| `ai_task_not_found` | Задача не найдена | Обновить список задач |
| `ai_task_cannot_cancel` | Нельзя отменить | Показать сообщение |

### Ошибки WebSocket

| error_code | Описание |
|------------|----------|
| `timeout` | Превышено время выполнения (2 минуты) |
| `stuck_task` | Задача застряла (более 10 минут) |
| `ValidationError` | Неверные входные данные |

### Коды закрытия WebSocket

| code | Описание |
|------|----------|
| 4001 | Не авторизован |
| 4002 | Heartbeat timeout |
| 4003 | Принудительное отключение (новое соединение) |

---

## Рекомендации

1. **Всегда подключайтесь к WebSocket** для получения прогресса в реальном времени
2. **Обрабатывайте `force_disconnect`** - пользователь открыл другую вкладку
3. **Отвечайте на `ping` через `pong`** - иначе соединение закроется через 60 секунд
4. **Используйте REST `/active/` как fallback** при загрузке страницы
5. **Показывайте таймер при `ai_task_cooldown`** - улучшает UX
6. **Кэшируйте результаты** - одинаковые запросы могут дать тот же результат
