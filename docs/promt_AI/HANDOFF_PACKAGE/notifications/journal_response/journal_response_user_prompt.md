# USER PROMPT: Journal Response

## ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

**Имя:** {{user_name}}
**Текущая дата:** {{current_date}}

---

## ЗАПИСЬ ДНЕВНИКА

**Дата записи:** {{journal_entry.date}}

### Что было сделано сегодня?
{{#if journal_entry.done}}
{{journal_entry.done}}
{{else}}
(не заполнено)
{{/if}}

### Что не получилось?
{{#if journal_entry.not_done}}
{{journal_entry.not_done}}
{{else}}
(не заполнено)
{{/if}}

### Что я понял/узнал?
{{#if journal_entry.learned}}
{{journal_entry.learned}}
{{else}}
(не заполнено)
{{/if}}

### Планы на завтра?
{{#if journal_entry.tomorrow}}
{{journal_entry.tomorrow}}
{{else}}
(не заполнено)
{{/if}}

---

## КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ

{{#if user_context.days_in_app}}
**Дней в приложении:** {{user_context.days_in_app}}
{{/if}}

{{#if user_context.journal_streak}}
**Дней подряд ведёт дневник:** {{user_context.journal_streak}}
{{/if}}

{{#if user_context.relationship_stage}}
**Стадия отношений:** {{user_context.relationship_stage}}
{{/if}}

---

## ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ

{{#if context.today_completion_rate}}
**Completion rate сегодня:** {{context.today_completion_rate}}%
{{/if}}

{{#if context.active_goals}}
**Активные цели:**
{{#each context.active_goals}}
- {{this.title}} ({{this.progress}}% прогресс)
{{/each}}
{{/if}}

{{#if context.previous_journal_entry}}
### Предыдущая запись ({{context.previous_journal_entry.date}})
**Что было сделано:** {{context.previous_journal_entry.done}}
**Что не получилось:** {{context.previous_journal_entry.not_done}}
{{/if}}

{{#if context.emotional_signals}}
**Эмоциональные сигналы:** {{context.emotional_signals}}
<!-- burnout, frustration, positive_momentum, overwhelm -->
{{/if}}

---

## ЗАДАЧА

Сгенерируй отклик на запись в дневнике:

1. **Прочитай все заполненные поля**
2. **Определи тип записи:**
   - Позитивная (хороший день)
   - Негативная (сложный день)
   - Смешанная (и то, и это)
   - Инсайт (осознание чего-то)
   - Формальная (отписка)
   - Burnout-сигналы
3. **Выбери один фокус** — самое важное/интересное
4. **Дай реакцию** — конкретную, по содержанию
5. **Задай один вопрос** — для углубления осознания

**Адаптируй по типу:**

### Если позитивная запись:
- Признай конкретное достижение (не абстрактное "молодец")
- Спроси: что помогло? или как повторить?

### Если негативная запись:
- Признай чувства без обесценивания
- Мягко спроси о причине или что нужно
- НЕ давать советов, если не просят

### Если инсайт:
- Подхвати и усиль
- Спроси: как это применить? или что изменится?

### Если формальная (отписка):
- Не давить
- Мягко спросить о главном за день

### Если burnout-сигналы:
- Признать состояние
- Дать разрешение на паузу
- НЕ гнать к действиям

**Требования:**
- 2-4 предложения
- Один фокус
- Один вопрос
- Без "молодец, что написал"
- Без оценки качества рефлексии
- Конкретная реакция на содержание
