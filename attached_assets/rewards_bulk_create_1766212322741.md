# Массовое создание наград (Rewards Bulk Create)

## Описание изменения

Эндпоинт `/api/rest/front/app/habits/rewards/create/` доработан для поддержки **массового создания наград** (до 100 штук за один запрос).

### Что изменилось

| До | После |
|----|-------|
| Создание одной награды | Создание от 1 до 100 наград за запрос |
| `{name, cost, icon, description}` | `{rewards_data: [{...}, {...}, ...]}` |
| Возврат `{reward_id}` | Возврат полных данных всех созданных наград |

---

## API

### Эндпоинт

**URL:** `POST /api/rest/front/app/habits/rewards/create/`

### Request

```json
{
    "rewards_data": [
        {
            "name": "Поход в кино",
            "cost": 300,
            "icon": "🎬",
            "description": "Билет на любой фильм в кинотеатре"
        },
        {
            "name": "Новая книга",
            "cost": 500,
            "icon": "📚",
            "description": "Книга на выбор"
        },
        {
            "name": "День отдыха",
            "cost": 1000,
            "icon": "☀️",
            "description": "Целый день для себя"
        }
    ]
}
```

### Параметры rewards_data (элемент массива)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `name` | string | Да | Название награды (до 200 символов) |
| `cost` | integer | Да | Стоимость в XP (1-100000) |
| `icon` | string | Нет | Emoji иконка (по умолчанию: 🎁) |
| `description` | string | Нет | Описание награды (до 500 символов) |

### Response (успех)

```json
{
    "status": "ok",
    "data": {
        "rewards": [
            {
                "reward_id": 42,
                "name": "Поход в кино",
                "cost": 300,
                "icon": "🎬",
                "description": "Билет на любой фильм в кинотеатре",
                "status": "available",
                "date_created": "2024-12-20 10:30:00",
                "xp_remaining": 50,
                "can_afford": false
            },
            {
                "reward_id": 43,
                "name": "Новая книга",
                "cost": 500,
                "icon": "📚",
                "description": "Книга на выбор",
                "status": "available",
                "date_created": "2024-12-20 10:30:00",
                "xp_remaining": 250,
                "can_afford": false
            },
            {
                "reward_id": 44,
                "name": "День отдыха",
                "cost": 1000,
                "icon": "☀️",
                "description": "Целый день для себя",
                "status": "available",
                "date_created": "2024-12-20 10:30:00",
                "xp_remaining": 750,
                "can_afford": false
            }
        ],
        "created_count": 3,
        "total_items": 15,
        "current_balance": 250
    }
}
```

### Поля ответа

| Поле | Тип | Описание |
|------|-----|----------|
| `rewards` | array | Массив созданных наград с полными данными |
| `created_count` | integer | Количество созданных наград |
| `total_items` | integer | Общее количество активных наград пользователя |
| `current_balance` | integer | Текущий баланс XP пользователя |

### Поля награды в ответе

| Поле | Тип | Описание |
|------|-----|----------|
| `reward_id` | integer | ID созданной награды |
| `name` | string | Название награды |
| `cost` | integer | Стоимость в XP |
| `icon` | string | Emoji иконка |
| `description` | string | Описание награды |
| `status` | string | Статус (всегда "available" для новых) |
| `date_created` | string | Дата создания (YYYY-MM-DD HH:MM:SS) |
| `xp_remaining` | integer | Сколько XP не хватает до покупки |
| `can_afford` | boolean | Можно ли купить (хватает XP) |

---

## Ошибки

### rewards_limit_exceeded

Превышен лимит наград для тарифа пользователя.

```json
{
    "status": "error",
    "error_code": "rewards_limit_exceeded",
    "error_message": "Достигнут лимит наград для вашего тарифа (10). Перейдите на Pro для безлимитных наград.",
    "current_count": 8,
    "requested_count": 5,
    "limit": 10,
    "tariff_code": "basic"
}
```

---

## Примеры использования

### Создание одной награды (минимальный запрос)

```json
{
    "rewards_data": [
        {
            "name": "Кофе в любимой кофейне",
            "cost": 100
        }
    ]
}
```

### Интеграция с AI-генерацией наград

После получения результата от `ai-task/status/` с `task_type: "reward_mentor_help"`:

```javascript
// stores/rewards.js
async addGeneratedRewards(generatedRewards) {
    // Трансформируем данные из AI в формат API
    const rewardsData = generatedRewards.map(reward => ({
        name: reward.name,
        cost: reward.cost,
        icon: reward.icon,
        description: reward.description
    }));

    const response = await api.post('/app/habits/rewards/create/', {
        rewards_data: rewardsData
    });

    if (response.data.status === 'ok') {
        // Все награды созданы, обновляем локальный стейт
        this.rewards.push(...response.data.data.rewards);
        this.totalItems = response.data.data.total_items;
        return response.data.data.rewards;
    }
}
```

### Vue 3 компонент

```vue
<script setup>
import { ref } from 'vue';
import { api } from '@/api';

const isLoading = ref(false);
const createdRewards = ref([]);

const createRewards = async (rewardsToCreate) => {
    isLoading.value = true;

    try {
        const response = await api.post('/app/habits/rewards/create/', {
            rewards_data: rewardsToCreate
        });

        if (response.data.status === 'ok') {
            createdRewards.value = response.data.data.rewards;
            console.log(`Создано ${response.data.data.created_count} наград`);
            console.log(`Всего наград: ${response.data.data.total_items}`);
        }
    } catch (error) {
        if (error.response?.data?.error_code === 'rewards_limit_exceeded') {
            alert(`Лимит наград: ${error.response.data.limit}. Перейдите на Pro.`);
        }
    } finally {
        isLoading.value = false;
    }
};
</script>
```

---

## Лимиты и ограничения

| Параметр | Значение |
|----------|----------|
| Максимум наград за запрос | 100 |
| Максимальная длина названия | 200 символов |
| Максимальная стоимость | 100,000 XP |
| Минимальная стоимость | 1 XP |
| Максимальная длина описания | 500 символов |

---

## Миграция с одиночного создания

Если ранее использовался старый формат:

```javascript
// Было (старый формат - УСТАРЕЛ)
await api.post('/app/habits/rewards/create/', {
    name: 'Награда',
    cost: 100,
    icon: '🎁',
    description: 'Описание'
});

// Стало (новый формат)
await api.post('/app/habits/rewards/create/', {
    rewards_data: [{
        name: 'Награда',
        cost: 100,
        icon: '🎁',
        description: 'Описание'
    }]
});
```

Новый формат **обязательно** требует обёртку `rewards_data` с массивом.
