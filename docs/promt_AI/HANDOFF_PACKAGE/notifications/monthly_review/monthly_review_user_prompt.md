# USER PROMPT: Monthly Review

## ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

**Имя:** {{user_name}}
**Текущая дата:** {{current_date}}
**Номер месяца в приложении:** {{month_number}}
<!-- 1 = первый месяц, 2 = второй и т.д. -->

---

## СТАТИСТИКА МЕСЯЦА

### Задачи
**Запланировано:** {{monthly_stats.tasks_planned}}
**Выполнено:** {{monthly_stats.tasks_completed}}
**Completion rate:** {{monthly_stats.completion_rate}}%

{{#if monthly_stats.tasks_by_time}}
**По времени суток:**
- Утро (до 12:00): {{monthly_stats.tasks_by_time.morning}} выполнено
- День (12:00-18:00): {{monthly_stats.tasks_by_time.afternoon}} выполнено
- Вечер (после 18:00): {{monthly_stats.tasks_by_time.evening}} выполнено
{{/if}}

{{#if monthly_stats.tasks_by_priority}}
**По приоритету:**
- Critical: {{monthly_stats.tasks_by_priority.critical.completed}}/{{monthly_stats.tasks_by_priority.critical.total}}
- Important: {{monthly_stats.tasks_by_priority.important.completed}}/{{monthly_stats.tasks_by_priority.important.total}}
- Other: {{monthly_stats.tasks_by_priority.other.completed}}/{{monthly_stats.tasks_by_priority.other.total}}
{{/if}}

### Цели
**Активных целей:** {{monthly_stats.active_goals}}
**Закрыто целей:** {{monthly_stats.goals_completed}}
**Шагов выполнено:** {{monthly_stats.steps_completed}}

{{#if monthly_stats.goals_progress}}
**Прогресс по целям:**
{{#each monthly_stats.goals_progress}}
- {{this.title}}: {{this.progress}}% (было {{this.progress_start}}%)
{{/each}}
{{/if}}

### Привычки
**Активных привычек:** {{monthly_stats.active_habits}}
**Дней с выполненными привычками:** {{monthly_stats.habit_days}}/{{monthly_stats.total_days}}

{{#if monthly_stats.habits_detail}}
**По привычкам:**
{{#each monthly_stats.habits_detail}}
- {{this.title}}: {{this.completed_days}}/{{this.total_days}} дней
{{/each}}
{{/if}}

{{#if monthly_stats.longest_streak}}
**Лучший streak месяца:** {{monthly_stats.longest_streak.habit}} — {{monthly_stats.longest_streak.days}} дней
{{/if}}

### Дневник
**Записей:** {{monthly_stats.journal_entries}}/{{monthly_stats.total_days}}
{{#if monthly_stats.journal_streak}}
**Максимальный streak дневника:** {{monthly_stats.journal_streak}} дней
{{/if}}

### XP
**Заработано XP:** {{monthly_stats.xp_earned}}
**Текущий уровень:** {{monthly_stats.current_level}}
{{#if monthly_stats.level_ups}}
**Повышений уровня:** {{monthly_stats.level_ups}}
{{/if}}

---

## СРАВНЕНИЕ С ПРОШЛЫМ МЕСЯЦЕМ

{{#if previous_month_stats}}
| Метрика | Прошлый месяц | Этот месяц | Изменение |
|---------|---------------|------------|-----------|
| Completion rate | {{previous_month_stats.completion_rate}}% | {{monthly_stats.completion_rate}}% | {{comparison.completion_rate_change}} |
| Задач выполнено | {{previous_month_stats.tasks_completed}} | {{monthly_stats.tasks_completed}} | {{comparison.tasks_change}} |
| XP | {{previous_month_stats.xp_earned}} | {{monthly_stats.xp_earned}} | {{comparison.xp_change}} |
{{/if}}

---

## ПАТТЕРНЫ МЕСЯЦА (предрассчитанные)

{{#if monthly_patterns}}
{{#each monthly_patterns}}
- **{{this.type}}:** {{this.description}}
{{/each}}
{{/if}}

---

## КОНТЕКСТ

**Стадия отношений:** {{relationship_stage}}
**Дней в приложении всего:** {{days_in_app}}

{{#if notable_events}}
**Значимые события месяца:**
{{#each notable_events}}
- {{this}}
{{/each}}
{{/if}}

---

## ЗАДАЧА

Сгенерируй monthly review:

1. **Открытие** — констатация факта (месяц прошёл, X-й месяц в системе)

2. **Ключевые цифры** — 2-3 главных метрики (не всё подряд):
   - Completion rate
   - Цели/шаги
   - Лучший streak или другое достижение

3. **Один инсайт** — паттерн, который заметил:
   - Временной (утро vs вечер)
   - По типу задач (короткие vs длинные)
   - По прогрессу (рост/plateau/падение)
   - По привычкам (что держится, что нет)

4. **Вопрос на следующий месяц** — конкретный фокус:
   - Что развить?
   - Что изменить?
   - На чём сконцентрироваться?

**Адаптируй по типу месяца:**

### Если первый месяц:
- Акцент на "начало положено"
- Показать первые паттерны
- Вопрос: что хочешь развить?

### Если продуктивный (completion >60%):
- Признать прогресс без восторга
- Показать, что работает
- Вопрос: как закрепить?

### Если сложный (completion <40%):
- Без осуждения
- Показать факты
- Вопрос: что мешало? как адаптировать?

### Если рост vs прошлый месяц:
- Показать изменение
- Спросить, что сработало

### Если plateau:
- Констатировать стабильность
- Спросить: комфорт или застой?

**Требования:**
- 5-8 предложений
- Конкретные цифры
- Один ключевой инсайт
- Один вопрос в конце
- Без "молодец", "супер"
