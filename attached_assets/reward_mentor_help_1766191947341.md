# AI-генерация наград (Reward Mentor Help)

## Описание функционала

Функционал позволяет пользователю получить 3 персонализированные награды, сгенерированные AI-ментором на основе:
- Оценок сфер жизни (SSP) — зоны роста указывают на сферы, где нужна мотивация
- Текущих целей пользователя
- Существующих привычек
- Существующих наград (для исключения дублирования)
- XP баланса пользователя

## Сценарий использования

Пользователь нажимает кнопку "Помощь от AI-ментора" на странице "Достижения" (раздел наград) при добавлении награды.

---

## API

### 1. Запуск задачи генерации наград

**Эндпоинт:** `POST /api/rest/front/app/bots/ai-task/start/`

**Request:**
```json
{
    "task_type": "reward_mentor_help",
    "context_data": {
        "hint": "хочу награду связанную с путешествиями"
    }
}
```

**Параметры context_data:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `hint` | string | Нет | Подсказка от пользователя для персонализации наград |

**Response (успех):**
```json
{
    "status": "ok",
    "data": {
        "task_id": 123,
        "status": "pending",
        "message": "Задача поставлена в очередь"
    }
}
```

**Response (ошибка — активная задача):**
```json
{
    "status": "error",
    "error_code": "task_already_running",
    "error_message": "Задача этого типа уже выполняется"
}
```

---

### 2. Получение статуса/результата задачи

**Эндпоинт:** `POST /api/rest/front/app/bots/ai-task/status/`

**Request:**
```json
{
    "task_id": 123
}
```

**Response (в процессе):**
```json
{
    "status": "ok",
    "data": {
        "task_id": 123,
        "status": "running",
        "progress_percent": 70,
        "progress_text": "Генерация наград..."
    }
}
```

**Response (завершено):**
```json
{
    "status": "ok",
    "data": {
        "task_id": 123,
        "status": "completed",
        "progress_percent": 100,
        "result": {
            "rewards": [
                {
                    "name": "Поход в кино на премьеру",
                    "icon": "🎬",
                    "cost": 300,
                    "description": "Билет на любой фильм в кинотеатре с попкорном",
                    "why_motivating": "Отличный способ отдохнуть после достижения цели. Связано с вашим интересом к хобби."
                },
                {
                    "name": "Новая книга по саморазвитию",
                    "icon": "📚",
                    "cost": 500,
                    "description": "Книга на выбор: бумажная или электронная",
                    "why_motivating": "Поддержит вашу цель карьерного роста и поможет развить слабую сферу."
                },
                {
                    "name": "День без планов и обязательств",
                    "icon": "🌴",
                    "cost": 1000,
                    "description": "Целый день для себя — делать только то, что хочется",
                    "why_motivating": "После серии достижений важен полноценный отдых. Улучшит баланс жизни."
                }
            ],
            "reasoning": "Предложены награды разной стоимости: доступная (300 XP), средняя (500 XP) и ценная (1000 XP). Учтены цели пользователя и зоны роста.",
            "summary": "Сгенерировано 3 награды",
            "tokens_used": 600
        }
    }
}
```

---

## WebSocket события

Для real-time обновления прогресса используйте WebSocket события.

### Подписка
```javascript
// Подключение к WebSocket
const ws = new WebSocket('wss://your-domain/ws/notifications/');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'task_progress') {
        // Обновление прогресса
        console.log(`Progress: ${data.progress_percent}% - ${data.progress_text}`);
    }

    if (data.type === 'task_completed') {
        // Задача завершена
        console.log('Rewards:', data.result.rewards);
    }

    if (data.type === 'task_failed') {
        // Ошибка
        console.error('Error:', data.error);
    }
};
```

### События

| Событие | Описание | Данные |
|---------|----------|--------|
| `task_started` | Задача запущена | `{task_id, task_type}` |
| `task_progress` | Обновление прогресса | `{task_id, task_type, progress_percent, progress_text}` |
| `task_completed` | Задача завершена | `{task_id, task_type, result}` |
| `task_failed` | Ошибка выполнения | `{task_id, task_type, error: {code, message}}` |

---

## Формат результата

### Объект награды (reward)

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название награды (до 200 символов) |
| `icon` | string | Emoji иконка награды |
| `cost` | integer | Стоимость в XP (100-10000) |
| `description` | string | Описание награды (до 500 символов) |
| `why_motivating` | string | Персонализированное объяснение почему награда мотивирует |

### Полный результат

| Поле | Тип | Описание |
|------|-----|----------|
| `rewards` | array | Массив из 3 наград |
| `reasoning` | string | Общее объяснение выбора наград |
| `summary` | string | Краткое описание результата |
| `tokens_used` | integer | Количество использованных AI токенов |

---

## Интеграция с UI

### Рекомендуемый флоу

1. Пользователь нажимает кнопку "Помощь от AI-ментора"
2. Показать модальное окно или inline блок с прогрессом
3. Вызвать `POST /app/bots/ai-task/start/` с `task_type: "reward_mentor_help"`
4. Подписаться на WebSocket события или периодически poll статус
5. Показать результат с 3 наградами
6. Пользователь может:
   - Добавить награду в wishlist (вызов `POST /app/habits/rewards/create/`)
   - Отредактировать награду перед добавлением
   - Пропустить/закрыть

### Добавление награды в wishlist

После генерации, чтобы добавить награду:

**Эндпоинт:** `POST /api/rest/front/app/habits/rewards/create/`

```json
{
    "name": "Поход в кино на премьеру",
    "cost": 300,
    "icon": "🎬",
    "description": "Билет на любой фильм в кинотеатре с попкорном"
}
```

---

## Пример использования (Vue 3 + Pinia)

```javascript
// stores/rewardMentor.js
import { defineStore } from 'pinia';
import { api } from '@/api';

export const useRewardMentorStore = defineStore('rewardMentor', {
    state: () => ({
        isLoading: false,
        taskId: null,
        progress: 0,
        progressText: '',
        rewards: [],
        reasoning: '',
        error: null,
    }),

    actions: {
        async startGeneration(hint = '') {
            this.isLoading = true;
            this.error = null;
            this.rewards = [];

            try {
                const response = await api.post('/app/bots/ai-task/start/', {
                    task_type: 'reward_mentor_help',
                    context_data: { hint }
                });

                if (response.data.status === 'ok') {
                    this.taskId = response.data.data.task_id;
                    this.pollStatus();
                }
            } catch (e) {
                this.error = e.message;
                this.isLoading = false;
            }
        },

        async pollStatus() {
            if (!this.taskId) return;

            try {
                const response = await api.post('/app/bots/ai-task/status/', {
                    task_id: this.taskId
                });

                const data = response.data.data;
                this.progress = data.progress_percent;
                this.progressText = data.progress_text;

                if (data.status === 'completed') {
                    this.rewards = data.result.rewards;
                    this.reasoning = data.result.reasoning;
                    this.isLoading = false;
                } else if (data.status === 'failed') {
                    this.error = data.error?.message || 'Произошла ошибка';
                    this.isLoading = false;
                } else {
                    // Продолжаем опрос
                    setTimeout(() => this.pollStatus(), 1000);
                }
            } catch (e) {
                this.error = e.message;
                this.isLoading = false;
            }
        },

        async addReward(reward) {
            const response = await api.post('/app/habits/rewards/create/', {
                name: reward.name,
                cost: reward.cost,
                icon: reward.icon,
                description: reward.description
            });

            return response.data;
        }
    }
});
```

```vue
<!-- components/RewardMentorModal.vue -->
<template>
    <div class="modal" v-if="show">
        <!-- Прогресс -->
        <div v-if="store.isLoading" class="progress-section">
            <div class="progress-bar" :style="{ width: store.progress + '%' }"></div>
            <p>{{ store.progressText }}</p>
        </div>

        <!-- Результат -->
        <div v-else-if="store.rewards.length" class="rewards-section">
            <h3>Предложенные награды</h3>
            <p class="reasoning">{{ store.reasoning }}</p>

            <div v-for="reward in store.rewards" :key="reward.name" class="reward-card">
                <span class="icon">{{ reward.icon }}</span>
                <div class="info">
                    <h4>{{ reward.name }}</h4>
                    <p>{{ reward.description }}</p>
                    <span class="cost">{{ reward.cost }} XP</span>
                </div>
                <button @click="addReward(reward)">Добавить</button>
            </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="store.error" class="error-section">
            <p>{{ store.error }}</p>
            <button @click="retry">Попробовать снова</button>
        </div>
    </div>
</template>

<script setup>
import { useRewardMentorStore } from '@/stores/rewardMentor';

const store = useRewardMentorStore();

const props = defineProps({
    show: Boolean,
    hint: String
});

const emit = defineEmits(['close', 'added']);

const addReward = async (reward) => {
    await store.addReward(reward);
    emit('added', reward);
};

const retry = () => {
    store.startGeneration(props.hint);
};

// Запуск при открытии модала
watch(() => props.show, (newVal) => {
    if (newVal) {
        store.startGeneration(props.hint);
    }
});
</script>
```

---

## Cooldown

- Между запусками задачи одного типа: **60 секунд**
- Одновременно может выполняться только одна задача `reward_mentor_help` для пользователя

---

## Ошибки

| Код ошибки | Описание |
|------------|----------|
| `task_already_running` | Задача этого типа уже выполняется |
| `cooldown_active` | Слишком частые запросы (подождите 60 сек) |
| `ai_service_error` | Ошибка AI сервиса |
| `invalid_task_type` | Неизвестный тип задачи |
