# USER PROMPT: Relationship Checkin

## ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

**Имя:** {{user_name}}
**Текущая дата:** {{current_date}}

---

## ДАННЫЕ ОБ ОТНОШЕНИЯХ

**Дней в приложении:** {{days_in_app}}
**Стадия отношений:** {{relationship_stage}}
<!-- introduction, building_trust, deep_partnership, maintained -->

**Тип checkin:** {{checkin.type}}
<!-- first (первый, ~14 дней), regular (регулярный, каждые 2-4 недели), triggered (по сигналу) -->

{{#if checkin.trigger_reason}}
**Причина checkin:** {{checkin.trigger_reason}}
<!-- notification_fatigue, low_engagement, negative_sentiment -->
{{/if}}

---

## ИСТОРИЯ ВЗАИМОДЕЙСТВИЯ

{{#if interaction_stats}}
**Сообщений за последние 2 недели:** {{interaction_stats.messages_last_2_weeks}}
**Ответов на вопросы ментора:** {{interaction_stats.response_rate}}%
**Open rate уведомлений:** {{interaction_stats.notification_open_rate}}%
{{/if}}

{{#if previous_checkin}}
### Предыдущий checkin
**Дата:** {{previous_checkin.date}}
**Ответ:** {{previous_checkin.response}}
**Изменения после:** {{previous_checkin.changes_made}}
{{/if}}

---

## ЗАДАЧА

Сгенерируй relationship checkin:

1. **Определи тип checkin:**
   - First (первый) — мягкий, ознакомительный
   - Regular — партнёрский, краткий
   - Triggered — адресующий конкретную проблему

2. **Сформулируй вопрос:**
   - Конкретный, не абстрактный
   - Открытый к любому ответу
   - Без самобичевания

3. **Добавь опции ответа** (опционально)

**Адаптируй по типу:**

### Если first (первый checkin, ~14 дней):
```
Две недели вместе. Как тебе формат?
Что-то работает, что-то нет — нормально об этом сказать.

[Всё ок] [Хочу по-другому]
```

### Если regular (регулярный):
```
Уже месяц работаем. Как тебе?
Что-то раздражает или хочешь изменить?

[Норм] [Есть мысли]
```

### Если triggered (по сигналу, например low engagement):
```
Заметил, что реже заходишь.
Может, формат не подходит? Или просто пауза нужна?

[Пауза] [Хочу изменить] [Всё ок, просто занят]
```

**Требования:**
- 2-4 предложения
- Один вопрос
- Без "прости если что"
- Без формальных опросов
- Варианты ответа — опционально
