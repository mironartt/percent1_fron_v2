# Billing API Flow

Документация по вызовам биллинговых API из фронтенда.

## Файлы системы

- `src/services/billing.js` — API-сервис
- `src/stores/subscription.js` — Pinia store с состоянием и хелперами
- `src/views/Subscription.vue` — страница подписки
- `src/components/PaymentModal.vue` — модалка подтверждения оплаты
- `src/components/UpgradeModal.vue` — модалка апгрейда для Free пользователей
- `src/views/BillingSuccess.vue` — страница успешной оплаты
- `src/views/BillingFail.vue` — страница ошибки оплаты

---

## Кейсы вызовов API

### 1. Загрузка лендинга (/)

**Когда:** Пользователь открывает главную страницу  
**Эндпоинт:** `POST /api/rest/front/land/tariffs/get/`  
**Тело запроса:** `{}`  
**Цель:** Показать блок тарифов с ценами и возможностями

---

### 2. Открытие страницы подписки (/app/subscription)

**Когда:** Авторизованный пользователь открывает страницу подписки  
**Эндпоинты (вызываются параллельно):**

| Эндпоинт | Цель |
|----------|------|
| `POST /app/subscription/get/` | Текущий статус подписки, effective_tariff, trial info, активный промокод |
| `POST /app/tariffs/get/` | Список тарифов и периодов с ценами (с учётом активного промокода) |
| `POST /app/payment/history/` | История платежей пользователя |

---

### 3. Активация промокода

**Когда:** Пользователь вводит промокод и нажимает "Применить"  
**Эндпоинт:** `POST /api/rest/front/app/promocode/activate/`  
**Тело запроса:**
```json
{ "code": "PROMO2025" }
```

**Ответ успеха:**
```json
{
  "status": "ok",
  "data": {
    "promocode": {
      "code": "PROMO2025",
      "discount_type": "percent",
      "discount_value": 15
    }
  }
}
```

**После успеха:** Автоматически вызывается `/app/tariffs/get/` для обновления цен со скидкой

---

### 4. Выбор тарифа для оплаты (расчёт)

**Когда:** Пользователь нажимает "Выбрать" на тарифе  
**Эндпоинт:** `POST /api/rest/front/app/payment/calculate/`  
**Тело запроса:**
```json
{ "tariff_id": 2, "term_id": 3 }
```

**Ответ:**
```json
{
  "status": "ok",
  "data": {
    "calculation": {
      "tariff_title": "Pro",
      "term_title": "6 месяцев",
      "base_price": 5940,
      "term_discount": 1188,
      "promocode_discount": 713,
      "final_price": 4039
    }
  }
}
```

**Результат:** Открывается PaymentModal с детализацией расчёта

---

### 5. Подтверждение оплаты (создание платежа)

**Когда:** Пользователь нажимает "Оплатить" в PaymentModal  
**Эндпоинт:** `POST /api/rest/front/app/payment/create/`  
**Тело запроса:**
```json
{ "tariff_id": 2, "term_id": 3, "final_price": 4039 }
```

**Ответ:**
```json
{
  "status": "ok",
  "data": {
    "payment_id": "pay_abc123",
    "payment_link": "https://auth.robokassa.ru/Merchant/Index/..."
  }
}
```

**Результат:** Редирект пользователя на `payment_link` (Robokassa)

---

### 6. Возврат после оплаты

#### Успешная оплата → /app/billing/success

- Показывает сообщение об успешной оплате
- Вызывает `POST /app/subscription/get/` для обновления статуса подписки
- Кнопка "Вернуться в приложение" → /app

#### Ошибка оплаты → /app/billing/fail

- Показывает сообщение об ошибке
- Кнопка "Попробовать снова" → /app/subscription

---

### 7. Проверка доступа к AI (локальная логика)

**Когда:** Пользователь пытается отправить сообщение в MentorPanel или AICurator  
**Логика (не API-вызов):**
```js
const subscriptionStore = useSubscriptionStore()

if (!subscriptionStore.hasAIAccess()) {
  // Показать UpgradeModal
  showUpgradeModal.value = true
  return
}

// Отправить сообщение AI
```

**hasAIAccess()** проверяет наличие `chat_ai` или `goals_ai_assistant` в features текущего effective_tariff

---

### 8. Проверка лимитов (локальная логика)

**Когда:** Создание цели, привычки или записи в дневнике  
**Логика:**
```js
const result = subscriptionStore.checkLimit('goals', currentGoalsCount)
// { allowed: false, limit: 3, remaining: 0 }

if (!result.allowed) {
  // Показать UpgradeModal с сообщением о лимите
}
```

**Лимиты Free тарифа:**
- `max_goals`: 4
- `max_habits`: 3
- `max_rewards`: 5
- Дневник: без лимитов

**Ошибки лимитов от бэкенда (HTTP 400):**
- `goals_limit_exceeded` — лимит целей
- `habits_limit_exceeded` — лимит привычек
- `rewards_limit_exceeded` — лимит наград

Формат ответа:
```json
{
  "error": "goals_limit_exceeded",
  "message": "Достигнут лимит целей для вашего тарифа (4)...",
  "current_count": 4,
  "limit": 4,
  "tariff_code": "free"
}
```

Функции `createGoal`, `createHabit`, `createReward` возвращают `{ success: false, limitError: {...} }` при получении этих ошибок

---

## Схема потока оплаты

```
┌─────────────────────────────────────────────────────────────┐
│                    Subscription Page                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   subscription/get/     tariffs/get/        payment/history/
   (статус подписки)     (тарифы+цены)      (история платежей)
                              │
                              ▼
                    ┌─────────────────┐
                    │ Ввод промокода  │
                    └─────────────────┘
                              │
                              ▼
                    promocode/activate/
                              │
                              ▼
                    tariffs/get/ (обновить цены)
                              │
                              ▼
                    ┌─────────────────┐
                    │ Выбор тарифа    │
                    └─────────────────┘
                              │
                              ▼
                    payment/calculate/
                    (детализация цены)
                              │
                              ▼
                    ┌─────────────────┐
                    │  PaymentModal   │
                    └─────────────────┘
                              │
                              ▼
                    payment/create/
                    (создать платёж)
                              │
                              ▼
                    ┌─────────────────┐
                    │   Robokassa     │
                    └─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   /app/billing/success              /app/billing/fail
   (subscription/get/)               (показать ошибку)
```

---

## Важные моменты

1. **effective_tariff vs tariff**: Всегда использовать `effective_tariff` для проверки доступа — он учитывает истечение триала

2. **Триал**: 7 дней Pro-доступа, одноразовый, после истечения конвертируется в Free

3. **Промокоды**: После активации автоматически применяются к ценам тарифов

4. **Параллельные запросы**: При загрузке страницы подписки все 3 запроса выполняются параллельно для ускорения

5. **Обработка ошибок**: Все методы store возвращают `{ success: boolean, error?: string }` для единообразной обработки

---

## Структура данных API

### Tariff (тариф)
```json
{
  "id": 2,
  "code": "pro",
  "title": "Pro",
  "description": "Полный доступ ко всем возможностям",
  "feature_items": [
    {"id": 1, "text": "Безлимитные цели", "sort_order": 0},
    {"id": 2, "text": "AI ментор", "sort_order": 1},
    {"id": 3, "text": "Аналитика прогресса", "sort_order": 2}
  ],
  "features": ["unlimited_goals", "ai_mentor", "habits_analytics"],
  "terms": [...]
}
```

**Примечание:** `feature_items` — тексты для отображения в UI, `features` — коды для проверки `hasFeature()`

### Term (период подписки)
```json
{
  "id": 12,
  "months": 12,
  "title": "12 месяцев",
  "discount": 30,
  "is_hit": true,
  "total_price": "11880.00",
  "final_price": "8316.00",
  "savings": "3564.00"
}
```

**Примечание:** `savings` — готовое значение экономии, рассчитанное на бэкенде (total_price - final_price)
