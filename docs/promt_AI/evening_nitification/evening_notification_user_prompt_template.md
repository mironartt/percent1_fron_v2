# USER PROMPT: Генерация вечернего уведомления

## ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

**Имя:** {{user_name}}
**Дата:** {{current_date}}
**Время:** {{current_time}}

## СТАТУС ДНЕВНИКА

**Дневник заполнен сегодня:** {{journal_filled}}

{{#if journal_filled}}
**Последняя запись в дневнике:**
```
Что сделал: {{journal_entry.what_done}}
Что не сделал: {{journal_entry.what_not_done}}
Почему: {{journal_entry.why_not_done}}
Рефлексия: {{journal_entry.reflection}}
Настроение: {{journal_entry.mood}}/10
```
{{/if}}

## ИТОГИ ДНЯ

**Задачи:**
- Запланировано: {{today_stats.planned_steps}}
- Выполнено: {{today_stats.completed_steps}}
- Процент выполнения: {{today_stats.completion_rate}}%

**Привычки:**
- Выполнено: {{today_stats.habits_done}} из {{today_stats.habits_total}}

**XP заработано за день:** {{today_stats.xp_earned}}

**Текущий streak:** {{today_stats.current_streak}} дней

## ВАЖНЫЕ ИНСАЙТЫ

{{#if context_insights.pattern}}
**Обнаружен паттерн:**
{{context_insights.pattern}}
{{#if context_insights.pattern_details}}
Детали: {{context_insights.pattern_details}}
{{/if}}
{{/if}}

{{#if context_insights.ssp_imbalance}}
**Дисбаланс ССП:**
{{context_insights.ssp_imbalance}}
{{/if}}

{{#if context_insights.streak_at_risk}}
**Внимание:** Streak под угрозой (день без активности)
{{/if}}

{{#if context_insights.overload_detected}}
**Перегруз:** На сегодня было запланировано больше, чем доступно времени
{{/if}}

{{#if context_insights.goal_stagnation}}
**Застой цели:**
{{context_insights.goal_stagnation}}
{{/if}}

{{#if context_insights.postponed_steps}}
**Постоянно переносятся:**
{{#each context_insights.postponed_steps}}
- {{this.title}} ({{this.postpone_count}} раз)
{{/each}}
{{/if}}

## ПРОФИЛЬ КОММУНИКАЦИИ

**Предпочитаемый стиль:** {{user_profile.communication_style}}
**Длина ответов:** {{user_profile.response_length}}
**Нужны примеры:** {{user_profile.needs_examples}}

**Поведенческие паттерны:**
- Пик продуктивности: {{user_profile.peak_productivity}}
{{#if user_profile.common_obstacles}}
- Частые препятствия: {{user_profile.common_obstacles}}
{{/if}}

## ЗАДАЧА

Создай ОДНО короткое вечернее уведомление (2-3 предложения) от лица AI-наставника {{user_name}}.

### Приоритеты:

1. **Если дневник не заполнен (journal_filled: false):**
   - Главный фокус: мягко напомнить про запись в дневнике
   - Формат: констатация дня + призыв записать

2. **Если дневник заполнен (journal_filled: true):**
   - Фокус на самом ярком инсайте из context_insights
   - Связь с паттернами, балансом или прогрессом

### Требования:

- Длина: 2-6 предложений (адаптируется под сложность ситуации)
- Используй конкретные цифры из today_stats
- Стиль: прямой, без клише, с уважением
- Обращение на "ты"
- Без эмодзи
- Один основной фокус (не пытайся упомянуть всё сразу)

### Правило длины:

- **2-3 предложения:** простые ситуации, очевидные паттерны
- **4-5 предложений:** комплексные паттерны, нужен контекст
- **6 предложений:** критические или системные проблемы

### Тональность:

- При хорошем дне (60%+): констатация + инсайт
- При провальном дне (<40%): без осуждения, с гипотезой
- При паттерне: прямо, но с вопросом
- При всём отлично: короткая констатация без восторгов

**Важно:** Если дневник не заполнен — это ВСЕГДА главный приоритет уведомления, остальное вторично.

---

Сгенерируй уведомление: