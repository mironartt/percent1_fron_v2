# Relationship Checkin — Документация

## Назначение

Relationship Checkin — периодический вопрос о качестве взаимодействия с ментором. Цель: дать возможность адаптировать формат под пользователя.

**Почему это важно:** Одна из главных проблем AI-коучей — отсутствие "ремонта отношений". Человек-коуч замечает недовольство и спрашивает. AI — нет. Этот checkin решает проблему.

---

## Структура файлов

```
relationship_checkin/
├── relationship_checkin_system_prompt.md   # Системный промпт
├── relationship_checkin_user_prompt.md     # User prompt с переменными
├── relationship_checkin_examples.md        # Примеры по типам
└── README.md                               # Этот файл
```

---

## Триггеры отправки

### 1. First checkin (~14 дней)
```javascript
if (user.days_in_app >= 14 && !user.first_checkin_sent) {
  sendRelationshipCheckin('first');
  user.first_checkin_sent = true;
}
```

### 2. Regular checkin (каждые 2-4 недели)
```javascript
if (user.days_since_last_checkin >= 21 && user.days_since_last_checkin <= 28) {
  sendRelationshipCheckin('regular');
}
```

### 3. Triggered checkin (по сигналу)
```javascript
// При notification fatigue
if (user.notification_open_rate < 30 && user.notification_open_rate_was > 50) {
  sendRelationshipCheckin('triggered', 'notification_fatigue');
}

// При low engagement
if (user.messages_last_2_weeks < 3 && user.messages_previous_2_weeks >= 10) {
  sendRelationshipCheckin('triggered', 'low_engagement');
}

// При negative sentiment
if (user.journal_sentiment_last_week === 'negative') {
  sendRelationshipCheckin('triggered', 'negative_sentiment');
}
```

**Время отправки:** В обычное время активности пользователя, не в момент негатива.

---

## Типы Checkin

| Тип | Триггер | Тон | Фокус |
|-----|---------|-----|-------|
| **first** | ~14 дней в приложении | Мягкий, ознакомительный | Общий формат |
| **regular** | Каждые 2-4 недели | Партнёрский, краткий | Текущее состояние |
| **triggered** | Сигнал проблемы | Адресный, понимающий | Конкретная проблема |

---

## Требуемые данные от бэкенда

### Обязательные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `user_name` | string | Имя пользователя |
| `current_date` | string | Текущая дата |
| `days_in_app` | number | Дней в приложении |
| `checkin.type` | string | first, regular, triggered |

### Опциональные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `relationship_stage` | string | Стадия отношений |
| `checkin.trigger_reason` | string | Причина triggered checkin |
| `interaction_stats.messages_last_2_weeks` | number | Сообщений за 2 недели |
| `interaction_stats.response_rate` | number | % ответов на вопросы |
| `interaction_stats.notification_open_rate` | number | % открытых уведомлений |
| `previous_checkin.date` | string | Дата предыдущего checkin |
| `previous_checkin.response` | string | Ответ пользователя |
| `previous_checkin.changes_made` | string | Изменения после |

---

## Обработка ответов

| Ответ пользователя | Действие |
|--------------------|----------|
| "Всё ок" / "Норм" | Подтвердить, продолжать |
| "Хочу изменить" | Уточнить что именно |
| "Меньше сообщений" | Снизить частоту уведомлений |
| "Другой формат" | Уточнить и адаптировать |
| "Нужна пауза" | Снизить активность, напомнить через неделю |

### Пример обработки:

```javascript
function handleCheckinResponse(response, user) {
  switch (response) {
    case 'less_notifications':
      user.notification_frequency = 'low';
      sendMessage("Понял. Буду писать только когда реально важно.");
      break;

    case 'need_pause':
      user.mentor_paused_until = addDays(now, 7);
      sendMessage("Окей. Напишу через неделю — или напиши сам, когда будешь готов.");
      break;

    case 'want_change':
      sendMessage("Слушаю. Что именно хочешь изменить?");
      break;

    default:
      sendMessage("Хорошо. Если что — скажи.");
  }
}
```

---

## Частота

| Стадия | Интервал между checkins |
|--------|------------------------|
| Introduction (день 1-7) | Не отправлять |
| Building Trust (неделя 2-4) | 14 дней (первый), затем 21-28 дней |
| Deep Partnership (месяц 2-3) | 21-28 дней |
| Maintained (месяц 4+) | 28-35 дней |

**Правило:** Не более 2 checkins в месяц, если нет triggered reason.

---

## Метрики успеха

| Метрика | Цель | Как измерять |
|---------|------|--------------|
| Response rate | >50% | % пользователей, ответивших на checkin |
| Positive responses | >70% | % ответов "Всё ок" |
| Churn after checkin | <10% | % ушедших в течение недели после |
| Adaptation success | >80% | % удовлетворённых после изменений |

---

## Принципы

1. **Искренний интерес** — не формальность, а реальный вопрос
2. **Открытость к критике** — не защищаться, принять и адаптироваться
3. **Конкретные опции** — не "как тебе?", а варианты изменений
4. **Не навязываться** — один вопрос, без давления

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создана первая версия Relationship Checkin |
