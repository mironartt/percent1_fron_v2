# USER PROMPT: Milestone Notification

## ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

**Имя:** {{user_name}}
**Текущая дата:** {{current_date}}

---

## ДАННЫЕ MILESTONE

**Тип milestone:** {{milestone.type}}
<!-- Возможные значения: goal_completed, streak_milestone, level_up, first_achievement -->

**Название:** {{milestone.title}}
<!-- Для goal: название цели; для streak: название привычки; для level: "Уровень X" -->

{{#if milestone.goal_data}}
### Данные закрытой цели

**Название цели:** {{milestone.goal_data.title}}
**Сфера:** {{milestone.goal_data.sphere}}
**Дата создания:** {{milestone.goal_data.created_date}}
**Дата закрытия:** {{milestone.goal_data.completed_date}}
**Всего шагов:** {{milestone.goal_data.total_steps}}
**Выполнено шагов:** {{milestone.goal_data.completed_steps}}
**Дней в работе:** {{milestone.goal_data.days_in_work}}

{{#if milestone.goal_data.was_rescheduled}}
**Переносилась:** Да, {{milestone.goal_data.reschedule_count}} раз(а)
{{/if}}
{{/if}}

{{#if milestone.streak_data}}
### Данные streak milestone

**Привычка:** {{milestone.streak_data.habit_title}}
**Достигнутый streak:** {{milestone.streak_data.current_streak}} дней
**Категория milestone:** {{milestone.streak_data.milestone_category}}
<!-- Возможные значения: week_1 (7), week_2 (14), month_1 (30), month_2 (60), month_3 (90), half_year (180), year (365) -->

{{#if milestone.streak_data.previous_record}}
**Предыдущий рекорд:** {{milestone.streak_data.previous_record}} дней
**Новый рекорд:** {{milestone.streak_data.is_new_record}}
{{/if}}
{{/if}}

{{#if milestone.level_data}}
### Данные уровня

**Новый уровень:** {{milestone.level_data.new_level}}
**Предыдущий уровень:** {{milestone.level_data.previous_level}}
**Всего XP:** {{milestone.level_data.total_xp}}
**XP за последний месяц:** {{milestone.level_data.xp_last_month}}
{{/if}}

{{#if milestone.first_achievement}}
### Первое достижение

**Тип:** {{milestone.first_achievement.type}}
<!-- Возможные значения: first_goal, first_streak_7, first_level -->
{{/if}}

---

## КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ

{{#if user_context.days_in_app}}
**Дней в приложении:** {{user_context.days_in_app}}
{{/if}}

{{#if user_context.total_goals_completed}}
**Всего целей закрыто:** {{user_context.total_goals_completed}}
{{/if}}

{{#if user_context.longest_streak_ever}}
**Самый длинный streak:** {{user_context.longest_streak_ever}} дней
{{/if}}

{{#if user_context.relationship_stage}}
**Стадия отношений:** {{user_context.relationship_stage}}
<!-- introduction, building_trust, deep_partnership, maintained -->
{{/if}}

---

## ЗАДАЧА

Сгенерируй milestone notification:

1. **Признай достижение** — констатируй факт с конкретными цифрами
2. **Покажи путь** — сколько времени/шагов/усилий потребовалось
3. **Задай вопрос** — помоги осознать значение или спроси о следующем

**Адаптируй по типу:**

### Если goal_completed:
- Упомяни название цели, количество шагов, время в работе
- Спроси: что помогло дойти до конца? или что дальше?

### Если streak_milestone:
- Упомяни название привычки и количество дней
- Адаптируй тон по категории (7 дней легче, 90+ весомее)
- Спроси: как ощущения? или что эта привычка дала?

### Если level_up:
- Лёгкий тон (геймификация)
- Можно упомянуть XP
- Спроси: за счёт чего рост?

### Если first_achievement:
- Подчеркни: начало положено
- Спроси: как ощущения от первого результата?

**Требования:**
- 3-5 предложений
- Конкретные цифры (не округлять)
- Без "молодец", "супер", "потрясающе"
- Один вопрос в конце
