# Обновление онбординга: поле how_many_time

## Описание изменений

В первичный онбординг пользователя добавлено новое поле `how_many_time` — выбор времени, которое пользователь готов уделять развитию.

## Поле how_many_time

**Тип:** string (выбор из списка)
**Обязательность:** Опциональное поле
**Значение по умолчанию:** `null`

### Доступные значения:

| Значение | Описание |
|----------|----------|
| `15_mins` | 15 мин/день |
| `30_mins` | 30 мин/день |
| `1_hour` | 1 час/день |
| `something` | По возможности |

## API эндпоинты

### 1. Получение данных онбординга

**Endpoint:** `POST /api/rest/front/app/onboard/get/`

**Request body:**
```json
{}
```

**Response:**
```json
{
    "status": "ok",
    "data": {
        "is_complete": false,
        "step_completed": 1,
        "date_completed": null,
        "reason_joined": "Устал от хаоса, хочу системности и контроля над жизнью",
        "desired_changes": "Хочу выстроить здоровые отношения, увеличить доход",
        "growth_comfort_zones": "Зона роста: публичные выступления\nЗона комфорта: привычная работа",
        "current_state": "Работаю на нелюбимой работе, доход 80к",
        "goal_state": "Работаю на себя, доход 200к+",
        "why_important": "Хочу чувствовать, что живу свою жизнь",
        "how_many_time": "30_mins"
    }
}
```

### 2. Обновление данных онбординга

**Endpoint:** `POST /api/rest/front/app/onboard/update/`

**Request body:**
```json
{
    "reason_joined": "Устал от хаоса, хочу системности и контроля над жизнью",
    "desired_changes": "Хочу выстроить здоровые отношения, увеличить доход",
    "growth_comfort_zones": "Зона роста: публичные выступления\nЗона комфорта: привычная работа",
    "current_state": "Работаю на нелюбимой работе, доход 80к",
    "goal_state": "Работаю на себя, доход 200к+",
    "why_important": "Хочу чувствовать, что живу свою жизнь",
    "how_many_time": "30_mins",
    "step_completed": 2
}
```

**Response:**
```json
{
    "status": "ok"
}
```

## Примеры использования

### Пример 1: Получение текущих данных онбординга

```javascript
// Vue 3 Composition API
const getOnboardingData = async () => {
    const response = await api.post('/api/rest/front/app/onboard/get/', {});
    if (response.data.status === 'ok') {
        const howManyTime = response.data.data.how_many_time;
        console.log('Выбранное время:', howManyTime); // "30_mins"
    }
};
```

### Пример 2: Обновление поля how_many_time

```javascript
// Vue 3 Composition API
const updateHowManyTime = async (selectedTime) => {
    const response = await api.post('/api/rest/front/app/onboard/update/', {
        how_many_time: selectedTime, // "15_mins" | "30_mins" | "1_hour" | "something"
        step_completed: 2
    });

    if (response.data.status === 'ok') {
        console.log('Данные успешно обновлены');
    }
};
```

### Пример 3: Компонент выбора времени (Vue 3)

```vue
<template>
    <div class="time-selector">
        <h3>Сколько времени готовы уделять развитию?</h3>
        <select v-model="selectedTime" @change="updateTime">
            <option value="15_mins">15 мин/день</option>
            <option value="30_mins">30 мин/день</option>
            <option value="1_hour">1 час/день</option>
            <option value="something">По возможности</option>
        </select>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useOnboardingStore } from '@/stores/onboarding';

const onboardingStore = useOnboardingStore();
const selectedTime = ref(null);

onMounted(async () => {
    await onboardingStore.fetchOnboardingData();
    selectedTime.value = onboardingStore.data.how_many_time;
});

const updateTime = async () => {
    await onboardingStore.updateOnboarding({
        how_many_time: selectedTime.value
    });
};
</script>
```

## Важные замечания

1. **Поле опциональное**: Может быть `null`, если пользователь еще не выбрал время
2. **Обновление частичное**: Можно отправить только `how_many_time` без других полей
3. **Валидация**: Бэкенд проверяет, что значение входит в список допустимых
4. **Пустое значение**: Для сброса можно передать `null`

## Технические детали

- Поле хранится в модели `OnboardingTask`
- При обновлении значение применяется ко всем задачам пользователя
- При получении значение берется из первой задачи онбординга
- Поле добавлено в сериализаторы `UpdateUserOnboardingRequestSerializer` и `GetUserOnboardingResponseSerializer`