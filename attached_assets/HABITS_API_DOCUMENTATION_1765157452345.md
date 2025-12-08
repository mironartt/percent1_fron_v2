# API Documentation: Habits (Привычки)

Документация по REST API для раздела "Привычки" и "Достижения".

**Базовый URL:** `/api/rest/front/`
**Метод:** `POST` для всех эндпоинтов
**Content-Type:** `application/json`

## Содержание

1. [Настройки (Settings)](#1-настройки-settings)
2. [Привычки (Habits)](#2-привычки-habits)
3. [Выполнения (Completions)](#3-выполнения-completions)
4. [Амнистия (Amnesty)](#4-амнистия-amnesty)
5. [Аналитика (Analytics)](#5-аналитика-analytics)
6. [Достижения (Achievements)](#6-достижения-achievements)
7. [Статистика панели (Stats Panel)](#7-статистика-панели-stats-panel)
8. [Рекомендации (Recommendations)](#8-рекомендации-recommendations)
9. [XP](#9-xp)
10. [Награды (Rewards)](#10-награды-rewards)

---

## 1. Настройки (Settings)

### 1.1 Получение настроек

**Endpoint:** `POST /app/habits/settings/get/`

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "difficulty_mode": "balanced",
    "penalty_multiplier": 0.5,
    "weekly_amnesty_count": 1,
    "planning_penalty_enabled": false,
    "planning_penalty_amount": 0,
    "journal_penalty_enabled": false,
    "journal_penalty_amount": 0,
    "amnestied_dates": ["2024-12-05"],
    "amnestied_this_week": 1,
    "amnesty_remaining": 0
  }
}
```

**Поля:**
| Поле | Тип | Описание |
|------|-----|----------|
| `difficulty_mode` | string | Режим сложности: `soft`, `balanced`, `hardcore`, `custom` |
| `penalty_multiplier` | float | Множитель штрафа (0-1). Soft=0, Balanced=0.5, Hardcore=1.0 |
| `weekly_amnesty_count` | int | Количество амнистий в неделю (0-7) |
| `amnestied_dates` | array | Даты с применённой амнистией в текущей неделе |
| `amnesty_remaining` | int | Оставшиеся амнистии на неделю |

---

### 1.2 Обновление настроек

**Endpoint:** `POST /app/habits/settings/update/`

**Request:**
```json
{
  "difficulty_mode": "balanced",
  "weekly_amnesty_count": 2
}
```

**Response:** Аналогичен получению настроек.

**Автоматические значения при смене режима:**
- `soft` → `penalty_multiplier=0`, `weekly_amnesty_count=0`
- `balanced` → `penalty_multiplier=0.5`, `weekly_amnesty_count=1` (если не указано иное)
- `hardcore` → `penalty_multiplier=1.0`, `weekly_amnesty_count=0` (если не указано иное)
- `custom` → все значения настраиваются вручную

---

## 2. Привычки (Habits)

### 2.1 Получение привычек

**Endpoint:** `POST /app/habits/get/`

**Request:**
```json
{
  "date_from": "2024-12-02",
  "date_to": "2024-12-08",
  "include_deleted": false
}
```

Все параметры опциональны. По умолчанию возвращаются данные за текущую неделю.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "date_from": "2024-12-02",
    "date_to": "2024-12-08",
    "habits": [
      {
        "habit_id": 1,
        "name": "Зарядка 10 мин",
        "icon": "strength",
        "xp_reward": 10,
        "xp_penalty": 20,
        "frequency_type": "daily",
        "schedule_days": [0, 1, 2, 3, 4, 5, 6],
        "description": "Делать по утрам",
        "date_created": "2024-12-01 10:30:00",
        "date_deleted": null,
        "week_schedule": [
          {
            "date": "2024-12-02",
            "weekday": 1,
            "status": "completed",
            "is_scheduled": true,
            "note": "Сделал утром",
            "excuse_reason": null
          },
          {
            "date": "2024-12-03",
            "weekday": 2,
            "status": "missed",
            "is_scheduled": true,
            "note": null,
            "excuse_reason": "Проспал"
          }
        ]
      }
    ],
    "settings": {
      "difficulty_mode": "balanced",
      "penalty_multiplier": 0.5,
      "weekly_amnesty_count": 1,
      "amnestied_dates": [],
      "amnestied_this_week": 0,
      "amnesty_remaining": 1
    }
  }
}
```

**Статусы дней (`status`):**
| Статус | Описание |
|--------|----------|
| `completed` | Выполнено |
| `missed` | Пропущено (со штрафом) |
| `excused` | Уважительный пропуск (без штрафа) |
| `amnestied` | Применена амнистия (штраф отменён) |
| `pending` | Текущий день, ожидает выполнения |
| `future` | Будущий день |
| `not-scheduled` | Не в расписании привычки |

**Типы частоты (`frequency_type`):**
| Тип | Описание | schedule_days |
|-----|----------|---------------|
| `daily` | Ежедневно | [0,1,2,3,4,5,6] |
| `weekdays` | Будни | [1,2,3,4,5] |
| `weekends` | Выходные | [0,6] |
| `custom` | Свой | указывается вручную |

**Дни недели:** 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб

---

### 2.2 Создание/обновление привычек

**Endpoint:** `POST /app/habits/update/`

**Создание привычки:**
```json
{
  "habits_data": [
    {
      "name": "Медитация 10 мин",
      "icon": "meditation",
      "xp_reward": 15,
      "xp_penalty": 30,
      "frequency_type": "daily",
      "description": "Утренняя практика"
    }
  ]
}
```

**Обновление привычки:**
```json
{
  "habits_data": [
    {
      "habit_id": 1,
      "name": "Медитация 15 мин",
      "xp_reward": 20
    }
  ]
}
```

**Soft-delete (восстановимое удаление):**
```json
{
  "deleted_habit_ids": [1, 2]
}
```

**Восстановление:**
```json
{
  "restored_habit_ids": [1]
}
```

**Полное удаление (безвозвратное):**
```json
{
  "permanently_deleted_ids": [2]
}
```

**Комбинированный запрос:**
```json
{
  "habits_data": [
    {"name": "Новая привычка", "icon": "fire", "frequency_type": "daily"},
    {"habit_id": 3, "xp_reward": 25}
  ],
  "deleted_habit_ids": [5],
  "restored_habit_ids": [6]
}
```

**Response:** Аналогичен получению привычек (возвращает обновлённые данные за текущую неделю).

**Доступные иконки (`icon`):**
`fire`, `strength`, `brain`, `heart`, `book`, `run`, `water`, `sleep`, `meditation`, `target`, `money`, `graph`, `sun`, `moon`, `shield`, `palette`, `smile`, `apple`, `weight`, `calendar`, `trophy`, `star`, `rocket`, `leaf`, `coffee`, `music`, `camera`, `laptop`, `dumbbell`, `yoga`, `bicycle`, `swimmer`

---

## 3. Выполнения (Completions)

### 3.1 Обновление выполнений

**Endpoint:** `POST /app/habits/completions/update/`

**Request:**
```json
{
  "completions_data": [
    {
      "habit_id": 1,
      "date": "2024-12-06",
      "status": "completed",
      "note": "Отлично выполнил!"
    },
    {
      "habit_id": 2,
      "date": "2024-12-05",
      "status": "excused",
      "excuse_reason": "Был болен"
    }
  ]
}
```

**Статусы:**
| Статус | Описание | XP эффект |
|--------|----------|-----------|
| `completed` | Выполнено | +xp_reward |
| `missed` | Пропущено | -xp_penalty × penalty_multiplier |
| `excused` | Уважительный пропуск | 0 (штраф не списывается) |

**Ограничения:**
- Нельзя менять статус для будущих дат (только note)
- Можно изменять статусы прошлых и текущего дня
- Для текущего дня можно многократно менять статус

**Response:** Аналогичен получению привычек.

---

## 4. Амнистия (Amnesty)

### 4.1 Применение амнистии

**Endpoint:** `POST /app/habits/amnesty/apply/`

**Request:**
```json
{
  "date": "2024-12-05"
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "difficulty_mode": "balanced",
    "penalty_multiplier": 0.5,
    "weekly_amnesty_count": 1,
    "amnestied_dates": ["2024-12-05"],
    "amnestied_this_week": 1,
    "amnesty_remaining": 0
  }
}
```

**Условия:**
- Режим не `soft`
- Есть доступные амнистии (`amnesty_remaining > 0`)
- Дата в пределах текущей недели (Пн-Вс)
- Дата не в будущем
- Амнистия ещё не применена к этой дате

**Механика:**
- Все штрафы XP за указанный день возвращаются
- Выполнения помечаются как `is_amnestied=true`
- Амнистии сбрасываются каждый понедельник

---

### 4.2 Отмена амнистии

**Endpoint:** `POST /app/habits/amnesty/revoke/`

**Request:**
```json
{
  "date": "2024-12-05"
}
```

**Response:** Аналогичен применению амнистии (с обновлёнными данными).

**Механика:**
- Амнистия возвращается в пул доступных
- Штрафы XP снова списываются

---

## 5. Аналитика (Analytics)

### 5.1 Получение аналитики

**Endpoint:** `POST /app/habits/analytics/get/`

**Request:**
```json
{
  "date_from": "2024-11-06",
  "date_to": "2024-12-06"
}
```

Параметры опциональны. По умолчанию: последние 30 дней.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "completion_rate_7": 85,
    "completion_rate_30": 78,
    "current_streak": 7,
    "total_completions": 150,
    "week_xp": 120,
    "habits_data": [
      {
        "habit_id": 1,
        "name": "Зарядка 10 мин",
        "icon": "strength",
        "completion_rate_7": 100,
        "completion_rate_30": 90,
        "streak": 12,
        "total_completions": 45
      }
    ]
  }
}
```

**Расчёт процентов:**
- Проценты рассчитываются только по дням в расписании привычки
- Если привычка только по понедельникам и все выполнены → 100%

---

## 6. Достижения (Achievements)

### 6.1 Получение достижений

**Endpoint:** `POST /app/habits/achievements/get/`

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "total": 19,
    "unlocked": 5,
    "by_category": {
      "streak": [...],
      "completion": [...],
      "volume": [...],
      "variety": [...]
    },
    "all": [
      {
        "achievement_id": "streak7",
        "category": "streak",
        "icon": "🔥",
        "name": "Неделя огня",
        "description": "7 дней подряд",
        "target": 7,
        "progress": 5,
        "is_unlocked": false
      }
    ]
  }
}
```

**Категории достижений:**

| Категория | ID | Название | Условие |
|-----------|-----|----------|---------|
| streak | streak3 | Первые ростки | 3 дня подряд |
| streak | streak7 | Неделя огня | 7 дней подряд |
| streak | streak14 | Две недели силы | 14 дней подряд |
| streak | streak21 | Привычка закреплена | 21 день подряд |
| streak | streak30 | Месяц стабильности | 30 дней подряд |
| streak | streak50 | Железная воля | 50 дней подряд |
| streak | streak100 | Легенда | 100 дней подряд |
| completion | week80 | Почти идеал | 80%+ за неделю |
| completion | perfectWeek | Идеальная неделя | 100% за неделю |
| completion | month80 | Стабильный месяц | 80%+ за месяц |
| completion | perfectMonth | Идеальный месяц | 100% за месяц |
| volume | first | Первый шаг | 1 выполнение |
| volume | completions10 | Десятка | 10 выполнений |
| volume | completions50 | Полсотни | 50 выполнений |
| volume | completions100 | Сотня | 100 выполнений |
| volume | completions500 | Мастер привычек | 500 выполнений |
| variety | habits3 | Разнообразие | 3 активные привычки |
| variety | habits5 | Богатый арсенал | 5 активных привычек |
| variety | habits10 | Всесторонний рост | 10 активных привычек |

**Автоматическая разблокировка:**
Достижения разблокируются автоматически при выполнении привычек (после каждого `update_completions`).

---

## 7. Статистика панели (Stats Panel)

### 7.1 Получение статистики для верхней панели

**Endpoint:** `POST /app/habits/stats-panel/`

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "streak": 7,
    "today_completed": 2,
    "today_total": 5,
    "week_xp": 120,
    "amnesty_remaining": 1,
    "difficulty_mode": "balanced"
  }
}
```

**Поля:**
| Поле | Описание |
|------|----------|
| `streak` | Дней подряд (все привычки выполнены) |
| `today_completed` | Выполнено сегодня |
| `today_total` | Запланировано на сегодня |
| `week_xp` | XP за текущую неделю |
| `amnesty_remaining` | Осталось амнистий |
| `difficulty_mode` | Текущий режим сложности |

---

## 8. Рекомендации (Recommendations)

### 8.1 Получение рекомендуемых привычек

**Endpoint:** `POST /app/habits/recommended/`

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "categories": [
      {
        "id": "health",
        "name": "Здоровье и спорт",
        "icon": "strength",
        "habits": [
          {
            "name": "Зарядка 10 мин",
            "icon": "strength",
            "xp_reward": 10,
            "xp_penalty": 20,
            "frequency_type": "daily",
            "description": "Утренняя разминка для бодрости на весь день"
          }
        ]
      }
    ]
  }
}
```

**Категории:** `health`, `productivity`, `self_development`, `mental_health`, `routine`

---

## 9. XP

### 9.1 История транзакций XP

**Endpoint:** `POST /app/habits/xp/history/`

**Request:**
```json
{
  "limit": 10,
  "transaction_type": "habit_completed",
  "date_from": "2024-12-01",
  "date_to": "2024-12-08"
}
```

Все параметры опциональны.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "transactions": [
      {
        "id": 123,
        "amount": 10,
        "transaction_type": "habit_completed",
        "habit_name": "Зарядка 10 мин",
        "achievement_name": null,
        "metadata": {"habit_name": "Зарядка 10 мин", "date": "2024-12-06"},
        "balance_after": 250,
        "date_created": "2024-12-06 08:30:00"
      }
    ]
  }
}
```

**Типы транзакций (`transaction_type`):**
| Тип | Описание |
|-----|----------|
| `habit_completed` | Привычка выполнена |
| `habit_penalty` | Штраф за пропуск |
| `goal_step_completed` | Шаг цели выполнен |
| `goal_completed` | Цель выполнена |
| `journal_entry` | Запись в дневник |
| `achievement_bonus` | Бонус за достижение |
| `reward_redeemed` | Получена награда |
| `manual_adjustment` | Ручная корректировка |

---

### 9.2 Статистика XP

**Endpoint:** `POST /app/habits/xp/stats/`

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "xp_balance": 250,
    "lifetime_xp": 1500,
    "today_xp": 45,
    "week_xp": 180
  }
}
```

---

## 10. Награды (Rewards)

### 10.1 Получение списка наград

**Endpoint:** `POST /app/habits/rewards/get/`

**Request:**
```json
{
  "status_filter": "available",
  "include_deleted": false
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "rewards": [
      {
        "reward_id": 1,
        "name": "Кофе в любимой кофейне",
        "cost": 50,
        "icon": "☕",
        "description": "Хорошего кофе",
        "status": "available",
        "date_created": "2024-12-01 10:00:00",
        "date_redeemed": null
      }
    ]
  }
}
```

---

### 10.2 Создание награды

**Endpoint:** `POST /app/habits/rewards/create/`

**Request:**
```json
{
  "name": "Кофе в любимой кофейне",
  "cost": 50,
  "icon": "☕",
  "description": "Хорошего кофе"
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "reward_id": 1
  }
}
```

---

### 10.3 Получение награды (redeem)

**Endpoint:** `POST /app/habits/rewards/redeem/`

**Request:**
```json
{
  "reward_id": 1
}
```

**Response (успех):**
```json
{
  "status": "ok",
  "data": {
    "success": true,
    "new_balance": 200
  }
}
```

**Response (ошибка):**
```json
{
  "status": "ok",
  "data": {
    "success": false,
    "error": "insufficient_balance"
  }
}
```

---

### 10.4 Обновление награды

**Endpoint:** `POST /app/habits/rewards/update/`

**Request:**
```json
{
  "reward_id": 1,
  "name": "Новое название",
  "cost": 100
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "success": true
  }
}
```

---

### 10.5 Удаление награды

**Endpoint:** `POST /app/habits/rewards/delete/`

**Request:**
```json
{
  "reward_id": 1,
  "permanent": false
}
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "success": true
  }
}
```

**Параметры:**
| Параметр | Описание |
|----------|----------|
| `permanent: false` | Soft-delete (можно восстановить) |
| `permanent: true` | Полное удаление (безвозвратное) |

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| `habit_name_required_for_create` | Не указано название при создании привычки |
| `habit_access_denied` | Нет доступа к указанной привычке |
| `cannot_change_future_status` | Нельзя менять статус для будущей даты |
| `invalid_date_format` | Неверный формат даты |
| `amnesty_date_not_in_current_week` | Дата амнистии не в текущей неделе |
| `amnesty_date_in_future` | Дата амнистии в будущем |
| `amnesty_not_available` | Амнистии недоступны (режим soft или лимит исчерпан) |
| `amnesty_already_applied` | Амнистия уже применена к этой дате |
| `insufficient_balance` | Недостаточно XP для получения награды |

---

## Инициализация

Перед первым использованием API необходимо выполнить:

```bash
python manage.py init_achievements
```

Эта команда создаст 19 встроенных достижений в БД.
