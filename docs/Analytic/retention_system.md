# Система удержания пользователей OnePercent

## Что это?

Это план внедрения системы, которая:
- Отслеживает поведение пользователей (аналитика)
- Автоматически напоминает им вернуться (триггеры)
- Определяет кто рискует уйти (сегментация)
- Показывает пользователю его прогресс (мотивация)

**Основа**: документ `docs/Analytic/model_ltv`

---

## ЧТО УЖЕ ЕСТЬ В ПРИЛОЖЕНИИ

| Функция | Файл | Описание |
|---------|------|----------|
| XP система | `stores/xp.js` | Начисление очков за действия |
| Стрики | `stores/habits.js` | Серии дней, амнистия |
| 19 достижений | `views/Habits.vue` | Badges за привычки |
| Toast уведомления | `stores/toast.js` | In-app нотификации |
| Telegram бот | `server/telegramBot.js` | Утренние/вечерние напоминания |
| First Week Mission | `stores/activation.js` | 4 задачи активации |
| Подписки | `stores/subscription.js` | free/basic/pro, trial |

---

## ЧТО НУЖНО ДОБАВИТЬ

### Этап 1: Аналитика событий

**Зачем**: Чтобы понимать какие пользователи купят, а какие уйдут.

**Что трекать (из документа model_ltv):**

#### Предикторы покупки (пользователь скорее купит подписку):
- `onboarding_completed` — завершил онбординг
- `ai_coach_message` — написал AI-коучу (>3 сообщений = сигнал)
- `personal_goal_added` — добавил свою цель
- `streak_milestone_10` — достиг стрика 10 дней
- `referral_sent` — пригласил друга

#### Предикторы оттока (пользователь скорее уйдёт):
- `inactivity_first_3_days` — 0 действий за первые 3 дня
- `streak_broken_early` — сломал стрик на 1-й неделе
- `zero_ai_interactions` — не написал AI ни разу
- `trial_low_engagement` — trial + заходит 1 раз в неделю

**Полный список событий с metadata:**

| Событие | Когда отправлять | Metadata |
|---------|------------------|----------|
| `session_start` | При входе в приложение | `{}` |
| `onboarding_completed` | После завершения онбординга | `{"variant": "fast"}` |
| `first_goal_completed` | Первая завершённая цель | `{"goal_id": 123}` |
| `ai_coach_message` | После отправки сообщения AI | `{"session_id": "xxx", "message_count": 5}` |
| `personal_goal_added` | Создание своей цели (не из банка) | `{"goal_id": 123, "sphere": "health"}` |
| `custom_habit_created` | Создание своей привычки | `{"habit_id": 456}` |
| `referral_sent` | Отправка реферальной ссылки | `{"channel": "telegram"}` |
| `streak_milestone_10` | Достижение стрика 10 дней | `{"streak": 10, "type": "habits"}` |
| `goal_progress_50` | Цель достигла 50% | `{"goal_id": 123, "progress": 50}` |
| `habit_completed` | Выполнение привычки | `{"habit_id": 456, "streak": 5}` |
| `journal_entry` | Запись в дневник | `{"entry_id": 789}` |
| `feature_used` | Использование функции | `{"feature": "journal", "duration_seconds": 120}` |
| `reminder_followed` | Действие после напоминания | `{"reminder_type": "morning", "delay_minutes": 15}` |
| `streak_broken` | Прерывание стрика | `{"streak_was": 7, "type": "habits"}` |
| `feedback_negative` | Негативный фидбэк | `{"context": "task_difficulty", "value": "too_hard"}` |

**Список features для `feature_used`:**
- `journal` — дневник
- `habits` — привычки
- `goals` — цели
- `ai_chat` — чат с AI
- `planning` — планирование
- `ssp` — колесо жизни

**Новые файлы:**
```
src/stores/analytics.js      — Pinia store для трекинга
src/services/analyticsApi.js — API для отправки на бэкенд
```

**API для бэкенда:**
```
POST /api/rest/front/analytics/events/batch/
Body: {
  events: [
    { type: 'habit_completed', metadata: { habit_id: 123 }, timestamp: '...' }
  ]
}
```

---

### Этап 2: Триггерная система

**Зачем**: Автоматически возвращать пользователей, которые уходят.

**Триггеры (из документа):**

| Триггер | Условие | Что делать |
|---------|---------|------------|
| Неактивность 3 дня | Не заходил 3 дня | Push + Telegram: "Привет! Твои цели ждут!" |
| Стрик под угрозой | Стрик ≥3, сегодня не выполнил, время 20:00 | Telegram: "Твоя серия под угрозой!" |
| Trial заканчивается | Trial осталось <3 дней | In-app modal + Telegram |
| Win-back | Не заходил 30 дней | Email со скидкой 30% |
| Первая неделя | День 7 + активен 5+ дней | In-app: "Поздравляем! +50 XP" |
| Месячный отчёт | День 30 | Modal с достижениями за месяц |

**Новые файлы:**
```
src/stores/triggers.js                    — Store триггеров
src/components/retention/TriggerNotification.vue
src/components/retention/ReactivationModal.vue
src/components/retention/MonthlyReportModal.vue
```

**Интеграция с Telegram ботом** (`server/telegramBot.js`):
- Добавить cron job для проверки неактивных
- Функция `sendTriggerNotification(userId, trigger)`

---

### Этап 3: Сегментация пользователей

**Зачем**: Разные пользователи требуют разного подхода.

**4 сегмента (из документа model_ltv):**

| Сегмент | Поведение | Что делать |
|---------|-----------|------------|
| **Энтузиаст** | >20 дней/мес активен, использует 3+ функции | Предлагать Pro, upsell |
| **Тихий пользователь** | 4-10 дней/мес, использует 1 функцию | Мягкие напоминания, вовлечение |
| **Тест-драйвер** | Активен дни 1-5, потом спад | Новые стимулы, разнообразие |
| **Вернувшийся** | Был >7 дней inactive, вернулся | Onboarding 2.0, поддержка |

**Логика определения (на бэкенде):**
```python
def calculate_segment(user):
    if days_active_30 >= 20 and feature_diversity >= 0.7:
        return 'enthusiast'
    if days_active_30 <= 10 and feature_diversity < 0.4:
        return 'quiet_user'
    if is_declining_pattern():
        return 'test_driver'
    if returned_after_7_days_inactive():
        return 'returned'
    return 'new_user'
```

**Новый файл:**
```
src/stores/retention.js — Профиль пользователя (сегмент, lifecycle_day)
```

---

### Этап 4: User Progress (для пользователя)

**Зачем**: Показать прогресс = мотивация продолжать.

**Что показывать:**
1. Виджет "30-дневный путь" на Dashboard
2. Monthly Report (модалка с достижениями за месяц)

**Что НЕ показывать:**
- Сегмент ("ты тихий пользователь") — демотивирует
- Риск оттока — внутренняя метрика

**Виджет UserJourneyWidget.vue:**
```
┌─────────────────────────────────────────────┐
│ Твой путь 1%                    День 12/30  │
│ ━━━━━━━━━━━━━━━━○───────────────            │
│                                              │
│ ✓ Первые шаги (День 1-3)                    │
│ ✓ Исследователь (День 4-7)                  │
│ ● Развитие (День 8-14) ← ТЫ ЗДЕСЬ           │
│ ○ Итоги месяца (День 22-30)                 │
│                                              │
│ Следующая цель: Заполни дневник 3 раза      │
│ +50 XP за выполнение                        │
└─────────────────────────────────────────────┘
```

**Новые файлы:**
```
src/components/retention/UserJourneyWidget.vue
src/components/retention/MonthlyReportModal.vue
```

---

## ADMIN DASHBOARD (для Django админки)

**Что показывать владельцу/аналитику:**

### Блок 1: Ключевые метрики
```
DAU: 1,234      MAU: 5,678      D7: 23%      D30: 12%
```

### Блок 2: Когортный анализ
```
Когорта      │ D1    │ D7    │ D30
─────────────┼───────┼───────┼───────
2024-01-01   │ 45%   │ 23%   │ 12%
2024-01-08   │ 48%   │ 25%   │ -
```

### Блок 3: Конверсионная воронка
```
Регистрация → Активация D1 → D7 Active → Trial → Paid
   100%     →     45%      →    23%    →  8%  →  4%
```

### Блок 4: Сегментация (пирог)
```
Энтузиаст: 15%
Тихий: 35%
Тест-драйвер: 25%
Вернувшийся: 10%
Новый: 15%
```

### Блок 5: Риск оттока (таблица)
```
Email           │ Сегмент     │ Риск   │ Последняя активность │ Действие
user1@mail.ru   │ test_driver │ HIGH   │ 5 дней назад         │ [Push]
```

### Блок 6: Активность платящих
```
Всего Pro: 234
Активных (≥3 дня/нед): 156 (67%)
"Мёртвые души" (<1 дня/нед): 26 (11%) ← РИСК
```

---

## API ДЛЯ БЭКЕНДА (полная спецификация)

### 1. Приём событий (batch)

```
POST /api/rest/front/analytics/events/batch/

Headers:
  Content-Type: application/json
  X-CSRFToken: <token>

Request:
{
    "events": [
        {
            "type": "habit_completed",
            "metadata": {
                "habit_id": 123,
                "streak": 5
            },
            "timestamp": "2024-01-15T10:30:00Z"
        },
        {
            "type": "feature_used",
            "metadata": {
                "feature": "journal",
                "duration_seconds": 120
            },
            "timestamp": "2024-01-15T10:32:00Z"
        }
    ]
}

Response (200):
{
    "status": "ok",
    "processed": 2,
    "errors": []
}

Response (400):
{
    "status": "error",
    "message": "Invalid event type",
    "errors": [
        {"index": 0, "error": "Unknown event type 'invalid_type'"}
    ]
}
```

**Валидация:**
- `type` — должен быть из списка EVENT_TYPES (см. модель)
- `timestamp` — ISO 8601 формат, не старше 7 дней
- `metadata` — JSON object, опционально
- Максимум 100 событий за запрос

---

### 2. Retention профиль пользователя

```
POST /api/rest/front/retention/profile/get/

Headers:
  X-CSRFToken: <token>

Request: {} (пустой, берёт текущего пользователя)

Response (200):
{
    "lifecycle_day": 12,
    "segment": "test_driver",
    "segment_label": "Тест-драйвер",
    "churn_risk": "medium",
    "retention_score": 45,

    "metrics": {
        "days_active_30": 8,
        "feature_diversity": 0.5,
        "completion_rate": 0.6,
        "last_active_at": "2024-01-15T10:30:00Z"
    },

    "journey": {
        "current_milestone": 2,
        "completed_milestones": [0, 1],
        "next_milestone": {
            "id": 3,
            "title": "Развитие",
            "description": "Заполни дневник 3 раза",
            "xp_bonus": 50,
            "progress": 1,
            "target": 3
        },
        "milestones": [
            {"id": 0, "title": "Первые шаги", "days": "1-3", "completed": true},
            {"id": 1, "title": "Исследователь", "days": "4-7", "completed": true},
            {"id": 2, "title": "Развитие", "days": "8-14", "completed": false},
            {"id": 3, "title": "Итоги месяца", "days": "22-30", "completed": false}
        ]
    }
}
```

---

### 3. Триггеры — получение pending

```
POST /api/rest/front/triggers/pending/get/

Response (200):
{
    "triggers": [
        {
            "id": 456,
            "type": "streak_at_risk",
            "type_label": "Стрик под угрозой",
            "priority": "high",
            "data": {
                "streak": 7,
                "last_activity": "2024-01-14"
            },
            "message": "Осторожно! Твоя серия из 7 дней под угрозой!",
            "action": {
                "type": "open_habits",
                "label": "Выполнить привычку"
            },
            "created_at": "2024-01-15T20:00:00Z"
        }
    ],
    "priority_trigger": {
        // Самый важный триггер для немедленного показа
        "id": 456,
        "type": "streak_at_risk",
        ...
    }
}
```

---

### 4. Триггеры — dismiss

```
POST /api/rest/front/triggers/dismiss/

Request:
{
    "trigger_id": 456,
    "reason": "snoozed"  // snoozed, completed, not_interested
}

Response (200):
{
    "status": "ok"
}
```

---

### 5. Месячный отчёт

```
POST /api/rest/front/retention/monthly-report/get/

Response (200):
{
    "month": 1,  // Какой месяц с регистрации
    "period": {
        "start": "2024-01-01",
        "end": "2024-01-31"
    },

    "stats": {
        "total_actions": 47,
        "habits_completed": 32,
        "journal_entries": 8,
        "goals_progress": 65,  // %
        "streak_max": 18,
        "xp_earned": 1250,
        "features_used": 5
    },

    "achievements": [
        {
            "id": "fire_streak",
            "title": "Огненный стрик",
            "description": "14 дней подряд",
            "icon": "fire"
        },
        {
            "id": "goal_completed",
            "title": "Цель достигнута",
            "description": "Завершил цель 'ЗОЖ'",
            "icon": "target"
        }
    ],

    "comparison": {
        "vs_last_month": {
            "actions": "+15%",
            "streak": "+5 дней"
        },
        "vs_average_user": {
            "percentile": 75  // Лучше чем 75% пользователей
        }
    }
}
```

---

### 6. Admin Dashboard метрики

```
POST /api/rest/front/admin/retention/metrics/

Request:
{
    "date_from": "2024-01-01",
    "date_to": "2024-01-31"
}

Response (200):
{
    "overview": {
        "dau": 1234,
        "dau_change": 5.2,  // % vs предыдущий период
        "mau": 5678,
        "mau_change": 3.1,
        "d7_retention": 0.23,
        "d7_change": -2.0,
        "d30_retention": 0.12,
        "d30_change": 1.5
    },

    "cohorts": [
        {
            "cohort_date": "2024-01-01",
            "users": 150,
            "d1": 0.45,
            "d3": 0.32,
            "d7": 0.23,
            "d14": 0.18,
            "d30": 0.12
        },
        {
            "cohort_date": "2024-01-08",
            "users": 180,
            "d1": 0.48,
            "d3": 0.35,
            "d7": 0.25,
            "d14": null,  // Ещё не прошло
            "d30": null
        }
    ],

    "funnel": {
        "registered": 1000,
        "activated_d1": 450,
        "active_d7": 230,
        "started_trial": 80,
        "converted_paid": 40,
        "renewed": 25
    },

    "segments": {
        "enthusiast": {"count": 150, "percent": 15},
        "quiet_user": {"count": 350, "percent": 35},
        "test_driver": {"count": 250, "percent": 25},
        "returned": {"count": 100, "percent": 10},
        "new_user": {"count": 150, "percent": 15}
    },

    "churn_risk": {
        "critical": {"count": 50, "percent": 5},
        "high": {"count": 150, "percent": 15},
        "medium": {"count": 300, "percent": 30},
        "low": {"count": 500, "percent": 50}
    },

    "paying_users": {
        "total": 234,
        "active": {"count": 156, "percent": 67},
        "inactive": {"count": 52, "percent": 22},
        "dead": {"count": 26, "percent": 11}
    }
}
```

---

### 7. Admin — список пользователей с риском оттока

```
POST /api/rest/front/admin/retention/at-risk-users/

Request:
{
    "segment": null,  // или "test_driver", "quiet_user"
    "churn_risk": "high",  // или "critical", "medium"
    "page": 1,
    "per_page": 20
}

Response (200):
{
    "users": [
        {
            "id": 123,
            "email": "user1@mail.ru",
            "first_name": "Иван",
            "segment": "test_driver",
            "churn_risk": "high",
            "lifecycle_day": 15,
            "last_active_at": "2024-01-10T10:30:00Z",
            "days_inactive": 5,
            "subscription_status": "trial"
        }
    ],
    "total": 150,
    "page": 1,
    "pages": 8
}
```

---

### 8. Admin — отправить триггер пользователю

```
POST /api/rest/front/admin/retention/send-trigger/

Request:
{
    "user_id": 123,
    "trigger_type": "inactivity_3_days",
    "channels": ["telegram", "email"]
}

Response (200):
{
    "status": "ok",
    "trigger_id": 789
}
```

---

## МОДЕЛИ DJANGO (детальные)

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserEvent(models.Model):
    """События пользователя для аналитики"""

    EVENT_TYPES = [
        # Предикторы покупки
        ('onboarding_completed', 'Завершил онбординг'),
        ('first_goal_completed', 'Завершил первую цель'),
        ('ai_coach_message', 'Написал AI-коучу'),
        ('personal_goal_added', 'Добавил свою цель'),
        ('custom_habit_created', 'Создал свою привычку'),
        ('referral_sent', 'Отправил приглашение'),
        ('streak_milestone_10', 'Достиг стрика 10 дней'),
        ('goal_progress_50', 'Достиг 50% цели'),

        # Предикторы удержания
        ('session_start', 'Начал сессию'),
        ('feature_used', 'Использовал функцию'),
        ('habit_completed', 'Выполнил привычку'),
        ('journal_entry', 'Записал в дневник'),
        ('reminder_followed', 'Выполнил после напоминания'),

        # Предикторы оттока
        ('streak_broken', 'Сломал стрик'),
        ('feedback_negative', 'Негативный фидбэк'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    # Примеры metadata:
    # habit_completed: {"habit_id": 123, "streak": 5}
    # feature_used: {"feature": "journal", "duration_seconds": 120}
    # ai_coach_message: {"message_count": 3, "session_id": "xxx"}
    timestamp = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['event_type', 'timestamp']),
        ]
        ordering = ['-timestamp']


class RetentionProfile(models.Model):
    """Профиль удержания пользователя"""

    SEGMENTS = [
        ('new_user', 'Новый пользователь'),
        ('enthusiast', 'Энтузиаст'),
        ('quiet_user', 'Тихий пользователь'),
        ('test_driver', 'Тест-драйвер'),
        ('returned', 'Вернувшийся'),
        ('churned', 'Ушедший'),
    ]

    CHURN_RISKS = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('critical', 'Критический'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='retention_profile')

    # Основные метрики
    lifecycle_day = models.IntegerField(default=0, help_text='Дней с момента регистрации')
    segment = models.CharField(max_length=20, choices=SEGMENTS, default='new_user', db_index=True)
    churn_risk = models.CharField(max_length=10, choices=CHURN_RISKS, default='low', db_index=True)
    retention_score = models.IntegerField(default=0, help_text='0-100, выше = лучше')

    # Метрики для расчёта сегмента
    days_active_30 = models.IntegerField(default=0, help_text='Дней активности за 30 дней')
    feature_diversity = models.FloatField(default=0, help_text='0-1, разнообразие функций')
    completion_rate = models.FloatField(default=0, help_text='0-1, % выполнения задач')
    avg_session_duration = models.IntegerField(default=0, help_text='Средняя длина сессии в секундах')

    # Для определения паттерна
    last_active_at = models.DateTimeField(null=True, blank=True)
    longest_inactive_period = models.IntegerField(default=0, help_text='Макс. дней без активности')
    return_count = models.IntegerField(default=0, help_text='Сколько раз возвращался после >7 дней')

    # Journey
    current_milestone = models.IntegerField(default=0)
    completed_milestones = models.JSONField(default=list)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['segment', 'churn_risk']),
            models.Index(fields=['last_active_at']),
        ]


class UserTrigger(models.Model):
    """Триггеры для пользователя"""

    TRIGGER_TYPES = [
        ('inactivity_3_days', 'Неактивность 3 дня'),
        ('streak_at_risk', 'Стрик под угрозой'),
        ('trial_expiring', 'Trial заканчивается'),
        ('first_week_completed', 'Первая неделя завершена'),
        ('monthly_report', 'Месячный отчёт'),
        ('win_back', 'Win-back'),
    ]

    STATUSES = [
        ('pending', 'Ожидает'),
        ('sent', 'Отправлен'),
        ('dismissed', 'Отклонён'),
        ('expired', 'Истёк'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='triggers')
    trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUSES, default='pending', db_index=True)
    priority = models.CharField(max_length=10, default='medium')  # low, medium, high

    # Данные триггера
    data = models.JSONField(default=dict)
    # Примеры data:
    # streak_at_risk: {"streak": 7, "last_activity": "2024-01-15"}
    # trial_expiring: {"days_remaining": 2, "trial_end_date": "2024-01-20"}

    # Каналы отправки
    channels = models.JSONField(default=list)  # ['in_app', 'telegram', 'email']
    sent_channels = models.JSONField(default=list)  # Куда уже отправили

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_at = models.DateTimeField(null=True, blank=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    dismiss_reason = models.CharField(max_length=50, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status', 'trigger_type']),
            models.Index(fields=['status', 'scheduled_at']),
        ]


class DailyMetrics(models.Model):
    """Ежедневные метрики для админки"""

    date = models.DateField(unique=True, db_index=True)

    # Основные
    dau = models.IntegerField(default=0, help_text='Daily Active Users')
    new_users = models.IntegerField(default=0)

    # Retention (для когорт)
    d1_retention = models.FloatField(default=0)
    d7_retention = models.FloatField(default=0)
    d30_retention = models.FloatField(default=0)

    # Конверсия
    started_trial = models.IntegerField(default=0)
    converted_paid = models.IntegerField(default=0)
    churned = models.IntegerField(default=0)

    # Сегменты (на конец дня)
    segment_enthusiast = models.IntegerField(default=0)
    segment_quiet = models.IntegerField(default=0)
    segment_test_driver = models.IntegerField(default=0)
    segment_returned = models.IntegerField(default=0)
    segment_new = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
```

---

## CELERY TASKS (cron jobs)

```python
from celery import shared_task
from datetime import datetime, timedelta
from django.db.models import Count, Q

@shared_task
def calculate_daily_metrics():
    """
    Ежедневный расчёт DAU, retention, сегментов
    Запускать: каждый день в 00:05
    """
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    # DAU = уникальные пользователи с session_start за вчера
    dau = UserEvent.objects.filter(
        event_type='session_start',
        timestamp__date=yesterday
    ).values('user').distinct().count()

    # D1 Retention = % зарегистрированных вчера, кто был активен сегодня
    # (считается на следующий день)
    registered_2_days_ago = User.objects.filter(
        date_joined__date=today - timedelta(days=2)
    ).count()

    active_from_that_cohort = UserEvent.objects.filter(
        user__date_joined__date=today - timedelta(days=2),
        event_type='session_start',
        timestamp__date=yesterday
    ).values('user').distinct().count()

    d1_retention = active_from_that_cohort / registered_2_days_ago if registered_2_days_ago > 0 else 0

    # Аналогично D7, D30...
    # (пропущено для краткости)

    DailyMetrics.objects.create(
        date=yesterday,
        dau=dau,
        d1_retention=d1_retention,
        # ...
    )


@shared_task
def update_retention_profiles():
    """
    Обновление профилей удержания всех пользователей
    Запускать: каждый день в 01:00
    """
    from django.utils import timezone
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    for user in User.objects.all():
        profile, _ = RetentionProfile.objects.get_or_create(user=user)

        # Lifecycle day
        profile.lifecycle_day = (now.date() - user.date_joined.date()).days

        # Days active in last 30 days
        profile.days_active_30 = UserEvent.objects.filter(
            user=user,
            event_type='session_start',
            timestamp__gte=thirty_days_ago
        ).dates('timestamp', 'day').count()

        # Feature diversity (0-1)
        # Считаем уникальные feature из feature_used событий
        features_used = UserEvent.objects.filter(
            user=user,
            event_type='feature_used',
            timestamp__gte=thirty_days_ago
        ).values_list('metadata__feature', flat=True).distinct()

        TOTAL_FEATURES = 6  # journal, habits, goals, ai_chat, planning, ssp
        profile.feature_diversity = len(set(features_used)) / TOTAL_FEATURES

        # Last active
        last_event = UserEvent.objects.filter(
            user=user,
            event_type='session_start'
        ).order_by('-timestamp').first()

        if last_event:
            profile.last_active_at = last_event.timestamp

        # Calculate segment
        profile.segment = calculate_user_segment(profile)

        # Calculate churn risk
        profile.churn_risk = calculate_churn_risk(user, profile)

        profile.save()


def calculate_user_segment(profile):
    """Определение сегмента пользователя"""

    # Энтузиаст: >20 дней/мес, diversity >0.7
    if profile.days_active_30 >= 20 and profile.feature_diversity >= 0.7:
        return 'enthusiast'

    # Тихий: 4-10 дней/мес, низкое разнообразие
    if 4 <= profile.days_active_30 <= 10 and profile.feature_diversity < 0.4:
        return 'quiet_user'

    # Тест-драйвер: был активен в начале, потом спад
    if profile.lifecycle_day >= 7:
        # Проверяем активность первой недели vs последней
        first_week_active = UserEvent.objects.filter(
            user=profile.user,
            event_type='session_start',
            timestamp__lte=profile.user.date_joined + timedelta(days=7)
        ).dates('timestamp', 'day').count()

        if first_week_active >= 5 and profile.days_active_30 < 5:
            return 'test_driver'

    # Вернувшийся: был >7 дней inactive, вернулся
    if profile.return_count > 0:
        return 'returned'

    # Новый: <7 дней с регистрации
    if profile.lifecycle_day < 7:
        return 'new_user'

    return 'quiet_user'  # По умолчанию


def calculate_churn_risk(user, profile):
    """Расчёт риска оттока"""
    from django.utils import timezone

    risk_score = 0

    # Фактор 1: Дни без активности (вес 35%)
    if profile.last_active_at:
        days_inactive = (timezone.now() - profile.last_active_at).days
        if days_inactive >= 7:
            risk_score += 35
        elif days_inactive >= 3:
            risk_score += 20
        elif days_inactive >= 1:
            risk_score += 5

    # Фактор 2: Сломанный стрик на 1-й неделе (вес 25%)
    if profile.lifecycle_day <= 7:
        streak_broken = UserEvent.objects.filter(
            user=user,
            event_type='streak_broken',
            timestamp__gte=user.date_joined
        ).exists()
        if streak_broken:
            risk_score += 25

    # Фактор 3: 0 AI взаимодействий на 1-й неделе (вес 20%)
    if profile.lifecycle_day <= 7:
        ai_messages = UserEvent.objects.filter(
            user=user,
            event_type='ai_coach_message',
            timestamp__gte=user.date_joined
        ).count()
        if ai_messages == 0:
            risk_score += 20

    # Фактор 4: Низкое вовлечение после trial (вес 20%)
    if hasattr(user, 'subscription') and user.subscription.is_trial:
        if profile.days_active_30 < 4:  # Меньше 1 раза в неделю
            risk_score += 20

    # Определение уровня
    if risk_score >= 60:
        return 'critical'
    elif risk_score >= 40:
        return 'high'
    elif risk_score >= 20:
        return 'medium'
    return 'low'


@shared_task
def check_and_create_triggers():
    """
    Проверка условий триггеров и создание
    Запускать: каждые 4 часа
    """
    from django.utils import timezone
    now = timezone.now()

    for profile in RetentionProfile.objects.all():
        user = profile.user

        # Триггер: Неактивность 3 дня
        if profile.last_active_at:
            days_inactive = (now - profile.last_active_at).days
            if days_inactive >= 3:
                # Проверяем, не создавали ли уже
                existing = UserTrigger.objects.filter(
                    user=user,
                    trigger_type='inactivity_3_days',
                    status='pending'
                ).exists()

                if not existing:
                    UserTrigger.objects.create(
                        user=user,
                        trigger_type='inactivity_3_days',
                        priority='high',
                        data={'days_inactive': days_inactive},
                        channels=['telegram', 'email']
                    )

        # Триггер: Стрик под угрозой (проверять в 20:00)
        if now.hour >= 20:
            # Проверяем текущий стрик из habits
            # (зависит от вашей модели привычек)
            pass

        # Триггер: Trial заканчивается
        if hasattr(user, 'subscription'):
            sub = user.subscription
            if sub.is_trial and sub.trial_end_date:
                days_remaining = (sub.trial_end_date - now.date()).days
                if days_remaining <= 3 and days_remaining > 0:
                    existing = UserTrigger.objects.filter(
                        user=user,
                        trigger_type='trial_expiring',
                        status='pending'
                    ).exists()

                    if not existing:
                        UserTrigger.objects.create(
                            user=user,
                            trigger_type='trial_expiring',
                            priority='high',
                            data={'days_remaining': days_remaining},
                            channels=['in_app', 'telegram', 'email']
                        )

        # Триггер: Первая неделя завершена
        if profile.lifecycle_day == 7 and profile.days_active_30 >= 5:
            existing = UserTrigger.objects.filter(
                user=user,
                trigger_type='first_week_completed'
            ).exists()

            if not existing:
                UserTrigger.objects.create(
                    user=user,
                    trigger_type='first_week_completed',
                    priority='medium',
                    data={'days_active': profile.days_active_30},
                    channels=['in_app']
                )

        # Триггер: Месячный отчёт
        if profile.lifecycle_day > 0 and profile.lifecycle_day % 30 == 0:
            existing = UserTrigger.objects.filter(
                user=user,
                trigger_type='monthly_report',
                created_at__gte=now - timedelta(days=7)
            ).exists()

            if not existing:
                UserTrigger.objects.create(
                    user=user,
                    trigger_type='monthly_report',
                    priority='medium',
                    data={'month_number': profile.lifecycle_day // 30},
                    channels=['in_app']
                )


@shared_task
def send_pending_triggers():
    """
    Отправка pending триггеров
    Запускать: каждый час
    """
    from django.utils import timezone

    pending_triggers = UserTrigger.objects.filter(
        status='pending',
        scheduled_at__lte=timezone.now()
    ).select_related('user')

    for trigger in pending_triggers:
        # Отправка в каналы
        for channel in trigger.channels:
            if channel not in trigger.sent_channels:
                if channel == 'telegram':
                    send_telegram_trigger(trigger)
                elif channel == 'email':
                    send_email_trigger(trigger)
                # in_app обрабатывается фронтендом

                trigger.sent_channels.append(channel)

        trigger.status = 'sent'
        trigger.sent_at = timezone.now()
        trigger.save()


def send_telegram_trigger(trigger):
    """Отправка триггера в Telegram"""
    # Интеграция с существующим telegramBot.js
    # Можно через HTTP запрос к Node.js серверу или напрямую через python-telegram-bot
    pass


def send_email_trigger(trigger):
    """Отправка триггера по email"""
    from django.core.mail import send_mail

    MESSAGES = {
        'inactivity_3_days': {
            'subject': 'Мы скучаем! Твои цели ждут тебя',
            'body': 'Привет! Ты не заходил уже {days_inactive} дня. Давай продолжим путь к твоим целям!'
        },
        'trial_expiring': {
            'subject': 'Trial заканчивается через {days_remaining} дня',
            'body': 'Не упусти возможность! Оформи подписку и продолжай развиваться.'
        },
        'win_back': {
            'subject': 'Вернись со скидкой 30%!',
            'body': 'Мы скучаем! Специально для тебя - скидка 30% на любую подписку.'
        }
    }

    msg = MESSAGES.get(trigger.trigger_type)
    if msg:
        send_mail(
            subject=msg['subject'].format(**trigger.data),
            message=msg['body'].format(**trigger.data),
            from_email='noreply@onepercent.app',
            recipient_list=[trigger.user.email]
        )
```

---

## ФОРМУЛЫ РАСЧЁТА МЕТРИК

### DAU (Daily Active Users)
```
DAU = COUNT(DISTINCT user_id)
WHERE event_type = 'session_start'
AND timestamp >= today_start
AND timestamp < today_end
```

### MAU (Monthly Active Users)
```
MAU = COUNT(DISTINCT user_id)
WHERE event_type = 'session_start'
AND timestamp >= 30_days_ago
AND timestamp < now
```

### D1/D7/D30 Retention
```
Dn Retention = (Пользователи из когорты, активные на день N) / (Всего в когорте) × 100%

Когорта = пользователи, зарегистрированные в определённый день/неделю

Пример D7:
- Когорта: зарегистрированы 2024-01-01
- Всего в когорте: 100
- Активных на 2024-01-08: 23
- D7 = 23 / 100 = 23%
```

### Feature Diversity (0-1)
```
feature_diversity = (Кол-во уникальных функций за 30 дней) / (Всего функций)

Функции: journal, habits, goals, ai_chat, planning, ssp
Всего: 6

Пример:
- Использовал: journal, habits, ai_chat (3 функции)
- feature_diversity = 3 / 6 = 0.5
```

### Churn Risk Score (0-100)
```
risk_score = 0

# Дни без активности (вес 35%)
if days_inactive >= 7: risk_score += 35
elif days_inactive >= 3: risk_score += 20
elif days_inactive >= 1: risk_score += 5

# Сломанный стрик на 1-й неделе (вес 25%)
if lifecycle_day <= 7 AND streak_broken: risk_score += 25

# 0 AI на 1-й неделе (вес 20%)
if lifecycle_day <= 7 AND ai_messages == 0: risk_score += 20

# Низкое вовлечение в trial (вес 20%)
if is_trial AND days_active_30 < 4: risk_score += 20

# Уровень риска
if risk_score >= 60: return 'critical'
elif risk_score >= 40: return 'high'
elif risk_score >= 20: return 'medium'
else: return 'low'
```

### Conversion Funnel
```
1. registered = COUNT(users WHERE date_joined IN period)
2. activated_d1 = COUNT(users WHERE has_session_on_d1)
3. active_d7 = COUNT(users WHERE has_session_on_d7)
4. started_trial = COUNT(users WHERE subscription.is_trial)
5. converted_paid = COUNT(users WHERE subscription.is_paid)
6. renewed = COUNT(users WHERE subscription.renewals >= 1)
```

---

## МИГРАЦИЯ ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ

### Шаг 1: Создание таблиц
```python
# migrations/0001_retention_tables.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserEvent',
            fields=[...],  # см. модель выше
        ),
        migrations.CreateModel(
            name='RetentionProfile',
            fields=[...],
        ),
        migrations.CreateModel(
            name='UserTrigger',
            fields=[...],
        ),
        migrations.CreateModel(
            name='DailyMetrics',
            fields=[...],
        ),
    ]
```

### Шаг 2: Инициализация профилей для существующих пользователей
```python
# migrations/0002_init_retention_profiles.py
from django.db import migrations

def create_profiles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    RetentionProfile = apps.get_model('analytics', 'RetentionProfile')

    for user in User.objects.all():
        lifecycle_day = (timezone.now().date() - user.date_joined.date()).days

        RetentionProfile.objects.create(
            user=user,
            lifecycle_day=lifecycle_day,
            segment='quiet_user' if lifecycle_day > 7 else 'new_user',
            churn_risk='medium',
        )

class Migration(migrations.Migration):
    dependencies = [
        ('analytics', '0001_retention_tables'),
    ]

    operations = [
        migrations.RunPython(create_profiles, migrations.RunPython.noop),
    ]
```

### Шаг 3: Бэкфилл событий из существующих данных
```python
# management/commands/backfill_events.py
from django.core.management.base import BaseCommand
from django.utils import timezone

class Command(BaseCommand):
    help = 'Backfill UserEvents from existing data'

    def handle(self, *args, **options):
        # Из привычек
        for habit_log in HabitLog.objects.all():
            UserEvent.objects.get_or_create(
                user=habit_log.user,
                event_type='habit_completed',
                timestamp=habit_log.completed_at,
                defaults={
                    'metadata': {'habit_id': habit_log.habit_id}
                }
            )

        # Из дневника
        for entry in JournalEntry.objects.all():
            UserEvent.objects.get_or_create(
                user=entry.user,
                event_type='journal_entry',
                timestamp=entry.created_at,
                defaults={
                    'metadata': {'entry_id': entry.id}
                }
            )

        # Из сообщений AI
        for message in ChatMessage.objects.filter(role='user'):
            UserEvent.objects.get_or_create(
                user=message.user,
                event_type='ai_coach_message',
                timestamp=message.created_at,
                defaults={
                    'metadata': {'message_id': message.id}
                }
            )

        # Онбординг
        for user in User.objects.filter(finish_onboarding=True):
            UserEvent.objects.get_or_create(
                user=user,
                event_type='onboarding_completed',
                timestamp=user.date_joined + timedelta(hours=1),  # Примерно
                defaults={}
            )

        self.stdout.write('Backfill completed!')
```

### Шаг 4: Первичный расчёт метрик
```bash
# После миграции запустить:
python manage.py backfill_events
python manage.py shell -c "from analytics.tasks import update_retention_profiles; update_retention_profiles()"
```

---

## CELERY BEAT SCHEDULE (расписание cron jobs)

```python
# settings.py или celery.py

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Ежедневные метрики — каждый день в 00:05
    'calculate-daily-metrics': {
        'task': 'analytics.tasks.calculate_daily_metrics',
        'schedule': crontab(hour=0, minute=5),
    },

    # Обновление профилей — каждый день в 01:00
    'update-retention-profiles': {
        'task': 'analytics.tasks.update_retention_profiles',
        'schedule': crontab(hour=1, minute=0),
    },

    # Проверка триггеров — каждые 4 часа
    'check-triggers': {
        'task': 'analytics.tasks.check_and_create_triggers',
        'schedule': crontab(hour='*/4', minute=0),
    },

    # Отправка триггеров — каждый час
    'send-triggers': {
        'task': 'analytics.tasks.send_pending_triggers',
        'schedule': crontab(minute=30),  # В XX:30
    },
}
```

---

## ПОРЯДОК РЕАЛИЗАЦИИ

| Этап | Что делаем | Результат |
|------|------------|-----------|
| **1. Аналитика** | stores/analytics.js + API | События отправляются на бэкенд |
| **2. Admin Dashboard** | Блоки в Django админке | Видим D1/D7/D30, воронку, сегменты |
| **3. Триггеры** | stores/triggers.js + компоненты | Уведомления по условиям |
| **4. Сегментация** | stores/retention.js + бэкенд | Пользователи в сегментах |
| **5. User Progress** | UserJourneyWidget + MonthlyReport | Пользователь видит свой прогресс |

---

## ФАЙЛОВАЯ СТРУКТУРА (новые файлы)

```
src/
├── stores/
│   ├── analytics.js       # Трекинг событий
│   ├── triggers.js        # Триггеры
│   └── retention.js       # Профиль удержания
│
├── services/
│   ├── analyticsApi.js    # API аналитики
│   ├── triggersApi.js     # API триггеров
│   └── retentionApi.js    # API retention
│
└── components/retention/
    ├── UserJourneyWidget.vue     # Виджет 30-дневного пути
    ├── MonthlyReportModal.vue    # Отчёт за месяц
    ├── TriggerNotification.vue   # Уведомление-триггер
    └── ReactivationModal.vue     # "Мы скучаем!"
```

---

## МОДИФИКАЦИИ СУЩЕСТВУЮЩИХ ФАЙЛОВ

| Файл | Что добавить |
|------|--------------|
| `stores/app.js` | Загрузка retention profile при логине |
| `stores/habits.js` | Трекинг `habit_completed`, `streak_broken` |
| `stores/chat.js` | Трекинг `ai_coach_message` |
| `views/Dashboard.vue` | Добавить UserJourneyWidget |
| `App.vue` | Глобальные триггеры |
| `server/telegramBot.js` | Функции для триггеров |
