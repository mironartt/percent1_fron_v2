# OnePercent: План разработки и карта взаимодействия

**Дата:** 11 декабря 2025  
**Версия:** 1.0

---

## Часть 1: Карта взаимодействия компонентов

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ПОЛЬЗОВАТЕЛЬ                                    │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                              │
          ▼                                              ▼
┌─────────────────────┐                    ┌─────────────────────┐
│   Vue.js Frontend   │                    │   Telegram Bot      │
│   (SPA на Vite)     │                    │   (Telegraf/Node)   │
│                     │                    │                     │
│ • Dashboard         │                    │ • Задачи            │
│ • Колесо жизни      │                    │ • Привычки          │
│ • Цели              │                    │ • Дневник           │
│ • Планирование      │                    │ • AI Ментор         │
│ • Привычки          │                    │ • Напоминания       │
│ • Дневник           │                    │ • Настройки         │
│ • Достижения        │                    │                     │
└─────────────────────┘                    └─────────────────────┘
          │                                              │
          │  REST API                        REST API    │
          ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Django REST Backend                                 │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Auth     │  │    SSP      │  │   Goals     │  │  Planning   │        │
│  │  ─────────  │  │  ─────────  │  │  ─────────  │  │  ─────────  │        │
│  │ • Login     │  │ • Spheres   │  │ • CRUD      │  │ • Steps     │        │
│  │ • Register  │  │ • Scores    │  │ • Steps     │  │ • Calendar  │        │
│  │ • Telegram  │  │ • Reflect   │  │ • Templates │  │ • Week view │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Habits    │  │   Journal   │  │     XP      │  │  Telegram   │        │
│  │  ─────────  │  │  ─────────  │  │  ─────────  │  │  ─────────  │        │
│  │ • CRUD      │  │ • Entries   │  │ • Balance   │  │ • Validate  │        │
│  │ • Complete  │  │ • Streaks   │  │ • History   │  │ • Settings  │        │
│  │ • Schedule  │  │ • Calendar  │  │ • Rewards   │  │ • Notify    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                              │
          ▼                                              ▼
┌─────────────────────┐                    ┌─────────────────────┐
│   PostgreSQL DB     │                    │   OpenAI API        │
│                     │                    │                     │
│ • Users             │                    │ • GPT-4o-mini       │
│ • Spheres           │                    │ • JSON responses    │
│ • Goals/Steps       │                    │                     │
│ • Habits            │                    │                     │
│ • Journal           │                    │                     │
│ • XP/Achievements   │                    │                     │
│ • Telegram Settings │                    │                     │
└─────────────────────┘                    └─────────────────────┘
```

---

## Часть 2: Потоки данных

### 2.1 Аутентификация через Telegram

```
┌──────────┐    deep link     ┌──────────────┐    validate    ┌─────────────┐
│ Telegram │ ───────────────► │ Telegram Bot │ ─────────────► │ Django API  │
│   User   │ /start?auth=XXX  │              │ POST /validate │             │
└──────────┘                  └──────────────┘                └─────────────┘
                                     │                              │
                                     │ store telegram_id            │ verify token
                                     ▼                              ▼
                              ┌──────────────┐              ┌─────────────┐
                              │ userSessions │              │ User Model  │
                              │    (Map)     │              │ telegram_id │
                              └──────────────┘              └─────────────┘
```

### 2.2 Выполнение задачи/привычки

```
┌──────────────┐  callback_query  ┌──────────────┐  POST /complete  ┌─────────────┐
│   Telegram   │ ───────────────► │ Telegram Bot │ ───────────────► │ Django API  │
│ toggle_task_1│                  │              │                  │             │
└──────────────┘                  └──────────────┘                  └─────────────┘
                                         │                                │
                                         │ update UI                      │ add XP
                                         ▼                                ▼
                                  ┌──────────────┐                ┌─────────────┐
                                  │ editMessage  │                │ XP History  │
                                  │ ✅ completed │                │   +10 XP    │
                                  └──────────────┘                └─────────────┘
```

### 2.3 AI Ментор (чат)

```
┌──────────────┐   message    ┌──────────────┐   messages[]   ┌──────────────┐
│   Telegram   │ ───────────► │ Telegram Bot │ ─────────────► │   OpenAI     │
│  "Как мне?"  │              │              │ chat/complete  │  GPT-4o-mini │
└──────────────┘              └──────────────┘                └──────────────┘
       ▲                             │                              │
       │ reply                       │ store context                │ response
       │                             ▼                              ▼
       │                      ┌──────────────┐              ┌──────────────┐
       └───────────────────── │ mentorChats  │ ◄─────────── │ AI Response  │
                              │    (Map)     │              │ "Попробуй..."│
                              └──────────────┘              └──────────────┘
```

### 2.4 Напоминания (scheduled)

```
┌──────────────┐                    ┌──────────────┐
│  node-cron   │ ─────────────────► │ Telegram Bot │
│  08:00 MSK   │   triggerReminder  │              │
└──────────────┘                    └──────────────┘
                                           │
                                           │ for each user
                                           ▼
                                    ┌──────────────┐
                                    │ sendMessage  │
                                    │ to users[]   │
                                    └──────────────┘
```

---

## Часть 3: Детальный план задач

### Фаза 1: Backend API (Django) — Критические задачи

| # | Задача | Приоритет | Оценка | Зависимости |
|---|--------|-----------|--------|-------------|
| 1.1 | Создать эндпоинт `POST /api/telegram/validate-token/` | 🔴 High | 2h | — |
| 1.2 | Добавить поле `telegram_id` в модель User | 🔴 High | 1h | — |
| 1.3 | Создать модель TelegramSettings с полями: `morning_reminder`, `evening_reminder`, `streak_alerts`, `timezone` | 🔴 High | 2h | 1.2 |
| 1.4 | Эндпоинт `GET/PUT /api/telegram/settings/` | 🔴 High | 2h | 1.3 |
| 1.5 | Эндпоинт `POST /api/telegram/send-notification/` (webhook для бота) | 🟡 Medium | 3h | 1.2 |

### Фаза 2: Telegram Bot — Интеграция с API

| # | Задача | Приоритет | Оценка | Зависимости |
|---|--------|-----------|--------|-------------|
| 2.1 | Заменить demo-данные на `GET /api/planning/steps/?date=today` | 🔴 High | 2h | 1.1 |
| 2.2 | Заменить demo-привычки на `GET /api/habits/` | 🔴 High | 2h | 1.1 |
| 2.3 | Интеграция `POST /api/habits/{id}/complete/` | 🔴 High | 1h | 2.2 |
| 2.4 | Интеграция `POST /api/planning/steps/{id}/complete/` | 🔴 High | 1h | 2.1 |
| 2.5 | Сохранение дневника через `POST /api/journal/entries/` | 🔴 High | 2h | 1.1 |
| 2.6 | Загрузка настроек из `GET /api/telegram/settings/` | 🟡 Medium | 2h | 1.4 |
| 2.7 | Сохранение настроек через `PUT /api/telegram/settings/` | 🟡 Medium | 1h | 2.6 |

### Фаза 3: Напоминания — Персонализация

| # | Задача | Приоритет | Оценка | Зависимости |
|---|--------|-----------|--------|-------------|
| 3.1 | Получить список пользователей с включёнными утренними напоминаниями | 🟡 Medium | 2h | 1.3, 1.4 |
| 3.2 | Учёт часового пояса пользователя при отправке | 🟡 Medium | 3h | 3.1 |
| 3.3 | Персонализация утреннего сообщения (реальные данные) | 🟡 Medium | 2h | 2.1, 2.2 |
| 3.4 | Проверка streak перед отправкой streak-warning | 🟡 Medium | 2h | 3.1 |
| 3.5 | Недельный отчёт с реальной статистикой | 🟢 Low | 3h | 2.1, 2.2 |

### Фаза 4: XP и Геймификация

| # | Задача | Приоритет | Оценка | Зависимости |
|---|--------|-----------|--------|-------------|
| 4.1 | Отправка XP-уведомления при выполнении через бота | 🟡 Medium | 2h | 2.3, 2.4 |
| 4.2 | Интеграция `sendXPNotification()` с backend webhook | 🟡 Medium | 2h | 1.5 |
| 4.3 | Отправка уведомления при разблокировке достижения | 🟢 Low | 2h | 1.5 |
| 4.4 | Показ баланса XP в прогрессе | 🟢 Low | 1h | 2.1 |

### Фаза 5: Telegram Payments (Опционально)

| # | Задача | Приоритет | Оценка | Зависимости |
|---|--------|-----------|--------|-------------|
| 5.1 | Получить Provider Token от платёжной системы | 🟢 Low | 1h | — |
| 5.2 | Создать товары подписки (month/year) | 🟢 Low | 2h | 5.1 |
| 5.3 | Обработка pre_checkout_query | 🟢 Low | 2h | 5.2 |
| 5.4 | Обработка successful_payment | 🟢 Low | 3h | 5.3 |
| 5.5 | Синхронизация подписки с backend | 🟢 Low | 3h | 5.4 |

---

## Часть 4: API Endpoints для Telegram Bot

### Необходимые эндпоинты (Django)

```
# Аутентификация
POST   /api/telegram/validate-token/     # Валидация токена привязки
POST   /api/telegram/link/               # Привязка telegram_id к user

# Настройки
GET    /api/telegram/settings/           # Получить настройки
PUT    /api/telegram/settings/           # Обновить настройки

# Уведомления (webhook)
POST   /api/telegram/send-notification/  # Отправить уведомление пользователю
GET    /api/telegram/users-for-reminder/ # Список для напоминаний

# Существующие (используются ботом)
GET    /api/habits/                      # Список привычек
POST   /api/habits/{id}/complete/        # Отметка привычки
GET    /api/planning/steps/              # Задачи на день
POST   /api/planning/steps/{id}/complete/# Отметка задачи
POST   /api/journal/entries/             # Сохранить запись дневника
GET    /api/xp/balance/                  # Баланс XP
GET    /api/xp/history/                  # История XP
```

---

## Часть 5: Модели данных

### TelegramSettings (новая модель)

```python
class TelegramSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telegram_id = models.BigIntegerField(unique=True, null=True)
    
    # Напоминания
    morning_reminder = models.BooleanField(default=True)
    evening_reminder = models.BooleanField(default=True)
    streak_alerts = models.BooleanField(default=True)
    
    # Часовой пояс
    timezone = models.CharField(max_length=50, default='Europe/Moscow')
    
    # Метаданные
    linked_at = models.DateTimeField(auto_now_add=True)
    last_interaction = models.DateTimeField(null=True)
```

---

## Часть 6: Временные оценки

| Фаза | Описание | Часов | Дней* |
|------|----------|-------|-------|
| 1 | Backend API (Django) | 10h | 2 |
| 2 | Telegram Bot интеграция | 11h | 2 |
| 3 | Напоминания персонализация | 12h | 2 |
| 4 | XP и геймификация | 7h | 1 |
| 5 | Telegram Payments | 11h | 2 |
| **Итого** | | **51h** | **9 дней** |

*При 6 часах продуктивной работы в день

---

## Часть 7: Приоритеты внедрения

### MVP (обязательно для запуска)
- ✅ Фаза 1.1–1.4: Backend API для авторизации и настроек
- ✅ Фаза 2.1–2.5: Интеграция бота с реальными данными

### После MVP
- 🟡 Фаза 3: Персонализированные напоминания
- 🟡 Фаза 4: XP уведомления

### Опционально
- 🟢 Фаза 5: Telegram Payments

---

## Часть 8: Риски и митигации

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| OpenAI API недоступен | Средняя | Низкое | Fallback-ответы реализованы |
| Telegram Rate Limits | Низкая | Среднее | Очередь отправки, batch-сообщения |
| Потеря сессии (restart) | Высокая | Среднее | Персистентность в Redis/DB |
| Часовые пояса | Средняя | Низкое | Хранение TZ в настройках |

---

## Часть 9: Метрики успеха

| Метрика | Текущее | Цель |
|---------|---------|------|
| DAU Telegram Bot | 0 | 100+ |
| Retention D7 (бот) | — | 40%+ |
| Дневников через бот | 0 | 30% от всех |
| Ответы AI Ментора | 0 | 50/день |
| Привычки через бот | 0 | 20% от всех |
