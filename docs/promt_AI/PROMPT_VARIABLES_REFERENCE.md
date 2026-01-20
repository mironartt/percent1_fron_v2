# СПРАВОЧНИК ПЕРЕМЕННЫХ ПРОМПТОВ AI MENTOR

> **Цель:** Единый источник истины для всех переменных, используемых в промптах.
> Обращайся к этому файлу при создании новых промптов, чтобы избежать ошибок в названиях и типах данных.

---

## СОДЕРЖАНИЕ

### Текущие переменные (уже используются)
1. [Базовые переменные пользователя](#1-базовые-переменные-пользователя)
2. [Временные переменные](#2-временные-переменные)
3. [Профиль коммуникации](#3-профиль-коммуникации)
4. [План и задачи](#4-план-и-задачи)
5. [Привычки](#5-привычки)
6. [Статистика дня](#6-статистика-дня)
7. [Статистика недели](#7-статистика-недели)
8. [Контекстные инсайты](#8-контекстные-инсайты)
9. [Дневник](#9-дневник)
10. [Цели и прогресс](#10-цели-и-прогресс)
11. [Награды и XP](#11-награды-и-xp)
12. [Контексты для чат-бота](#12-контексты-для-чат-бота)
13. [Message Scoring](#13-message-scoring)

### Новые переменные (из плана разработки)
14. [Переменные для новых промптов](#14-переменные-для-новых-промптов-из-mentor_development_planmd)
    - 14.1 [Mentor Memory — Стадия отношений](#141-mentor-memory--стадия-отношений-relationship_stage)
    - 14.2 [Mentor Memory — Факты о пользователе](#142-mentor-memory--факты-о-пользователе-facts)
    - 14.3 [Mentor Memory — Паттерны](#143-mentor-memory--паттерны-patterns)
    - 14.4 [Mentor Memory — Эмоциональное состояние](#144-mentor-memory--эмоциональное-состояние-emotional_state)
    - 14.5 [Mentor Memory — Эффективные/неэффективные подходы](#145-mentor-memory--эффективныенеэффективные-подходы)
    - 14.6 [Mentor Memory — Инсайты и followups](#146-mentor-memory--инсайты-и-followups)
    - 14.7 [Mentor Memory — Streak Data](#147-mentor-memory--streak-data)
    - 14.8 [Welcome Sequence](#148-welcome-sequence-day-1-3)
    - 14.9 [Streak Recovery](#149-streak-recovery)
    - 14.10 [Comeback Notification](#1410-comeback-notification-возвращение-после-паузы)
    - 14.11 [Milestone Notification](#1411-milestone-notification)
    - 14.12 [Journal Response](#1412-journal-response)
    - 14.13 [Monthly Review](#1413-monthly-review)
    - 14.14 [Relationship Checkin](#1414-relationship-checkin)
    - 14.15 [Knowledge Base References](#1415-knowledge-base-references-для-интеграции)

---

## 1. БАЗОВЫЕ ПЕРЕМЕННЫЕ ПОЛЬЗОВАТЕЛЯ

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{user_name}}` | string | Имя пользователя | Все промпты |

---

## 2. ВРЕМЕННЫЕ ПЕРЕМЕННЫЕ

| Переменная | Тип | Формат | Используется в |
|------------|-----|--------|----------------|
| `{{current_date}}` | string | "DD.MM.YYYY" | morning, evening, chat |
| `{{current_time}}` | string | "HH:MM" | morning, evening, chat |
| `{{day_of_week}}` | string | "Понедельник", "Вторник"... | morning |
| `{{week_start_date}}` | string | "DD.MM.YYYY" | weekly_summary |
| `{{week_end_date}}` | string | "DD.MM.YYYY" | weekly_summary |

---

## 3. ПРОФИЛЬ КОММУНИКАЦИИ

| Переменная | Тип | Возможные значения | Используется в |
|------------|-----|-------------------|----------------|
| `{{user_profile.communication_style}}` | string | "прямой", "мягкий", "деловой", "дружеский" | morning, evening, weekly, chat |
| `{{user_profile.response_length}}` | string | "короткий", "средний", "подробный" | evening |
| `{{user_profile.needs_examples}}` | boolean | true/false | evening |
| `{{user_profile.peak_productivity}}` | string | "утро", "день", "вечер" | evening |
| `{{user_profile.common_obstacles}}` | string | Текст описания частых препятствий | evening |

---

## 4. ПЛАН И ЗАДАЧИ

### 4.1 Утренние уведомления

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{today_plan.planned_steps}}` | number | Количество запланированных задач |
| `{{today_plan.total_estimated_time}}` | string | Общее время работы (напр. "4h 30m") |
| `{{today_plan.available_time}}` | string | Доступное время пользователя |
| `{{today_plan.steps_list}}` | array | Массив задач |
| `{{today_plan.steps_list[].title}}` | string | Название задачи |
| `{{today_plan.steps_list[].estimated_time}}` | string | Оценка времени |
| `{{today_plan.steps_list[].goal}}` | string | Связанная цель (опционально) |
| `{{today_plan.habits}}` | array | Массив привычек на день |
| `{{today_plan.habits[].title}}` | string | Название привычки |
| `{{today_plan.habits[].streak}}` | number | Текущий streak в днях |

### 4.2 Handlebars итерация

```handlebars
{{#if today_plan.steps_list}}
{{#each today_plan.steps_list}}
- "{{this.title}}" ({{this.estimated_time}}){{#if this.goal}} — цель: {{this.goal}}{{/if}}
{{/each}}
{{/if}}
```

---

## 5. ПРИВЫЧКИ

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{habits}}` | array | Массив привычек | weekly_summary |
| `{{habits[].title}}` | string | Название привычки | weekly_summary |
| `{{habits[].completed_days}}` | number | Дней выполнено за неделю | weekly_summary |
| `{{habits[].total_days}}` | number | Всего дней (обычно 7) | weekly_summary |

### Handlebars итерация

```handlebars
{{#each habits}}
- {{this.title}}: {{this.completed_days}} дней из {{this.total_days}}
{{/each}}
```

---

## 6. СТАТИСТИКА ДНЯ

Используется в **evening notification**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{today_stats.planned_steps}}` | number | Запланировано задач |
| `{{today_stats.completed_steps}}` | number | Выполнено задач |
| `{{today_stats.completion_rate}}` | number | Процент выполнения (0-100) |
| `{{today_stats.habits_done}}` | number | Привычек выполнено |
| `{{today_stats.habits_total}}` | number | Всего привычек |
| `{{today_stats.xp_earned}}` | number | XP за день |
| `{{today_stats.current_streak}}` | number | Текущий streak в днях |

---

## 7. СТАТИСТИКА НЕДЕЛИ

Используется в **weekly_summary**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{tasks_completed}}` | number | Выполнено задач за неделю |
| `{{tasks_planned}}` | number | Запланировано задач за неделю |
| `{{xp_earned}}` | number | XP за неделю |

### 7.1 Разбивка по дням

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{daily_breakdown}}` | array | Массив дней |
| `{{daily_breakdown[].day}}` | string | День недели |
| `{{daily_breakdown[].completed}}` | number | Выполнено |
| `{{daily_breakdown[].planned}}` | number | Запланировано |

### 7.2 Лучший/худший день

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{best_day.day}}` | string | День недели |
| `{{best_day.completed}}` | number | Выполнено |
| `{{best_day.planned}}` | number | Запланировано |
| `{{worst_day.day}}` | string | День недели |
| `{{worst_day.completed}}` | number | Выполнено |
| `{{worst_day.planned}}` | number | Запланировано |

### Handlebars итерация

```handlebars
{{#each daily_breakdown}}
**{{this.day}}:** {{this.completed}} из {{this.planned}}
{{/each}}
```

---

## 8. КОНТЕКСТНЫЕ ИНСАЙТЫ

Объект `context_insights` содержит аналитику и паттерны.

### 8.1 Паттерны поведения

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{context_insights.pattern}}` | string | Описание обнаруженного паттерна | evening, weekly |
| `{{context_insights.pattern_details}}` | string | Детали паттерна | evening |
| `{{context_insights.pattern_already_discussed}}` | boolean | Паттерн уже обсуждался? | weekly |
| `{{context_insights.pattern_context}}` | string | Контекст предыдущего обсуждения | weekly |

### 8.2 ССП и баланс

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{context_insights.ssp_imbalance}}` | string | Описание дисбаланса ССП | morning, evening, weekly |

### 8.3 Предупреждения

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{context_insights.streak_at_risk}}` | boolean | Streak под угрозой | evening |
| `{{context_insights.overload_detected}}` | boolean | Обнаружен перегруз | morning, evening |
| `{{context_insights.goal_stagnation}}` | string | Описание застоя цели | evening |
| `{{context_insights.important_goal_stagnation}}` | string | Застой важной цели | morning |

### 8.4 Переносы задач

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{context_insights.postponed_steps}}` | array | Массив часто переносимых задач | morning, evening |
| `{{context_insights.postponed_steps[].title}}` | string | Название задачи | evening |
| `{{context_insights.postponed_steps[].postpone_count}}` | number | Сколько раз переносилась | evening |

### 8.5 Дополнительные инсайты

| Переменная | Тип | Описание | Используется в |
|------------|-----|----------|----------------|
| `{{context_insights.yesterday_completion}}` | number | % выполнения вчера | morning |
| `{{context_insights.peak_productivity_time}}` | string | Время пиковой продуктивности | morning |
| `{{context_insights.journal_insights}}` | string | Инсайты из дневника | weekly |
| `{{context_insights.comparison_with_last_week}}` | string | Сравнение с прошлой неделей | weekly |

### Handlebars условия

```handlebars
{{#if context_insights.pattern}}
**Паттерн:** {{context_insights.pattern}}
{{#if context_insights.pattern_already_discussed}}
(Уже обсуждался: {{context_insights.pattern_context}})
{{/if}}
{{/if}}

{{#if context_insights.postponed_steps}}
**Переносятся:**
{{#each context_insights.postponed_steps}}
- {{this.title}} ({{this.postpone_count}} раз)
{{/each}}
{{/if}}
```

---

## 9. ДНЕВНИК

Используется в **evening notification**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{journal_filled}}` | boolean | Дневник заполнен сегодня? |
| `{{journal_entry.what_done}}` | string | Что сделал |
| `{{journal_entry.what_not_done}}` | string | Что не сделал |
| `{{journal_entry.why_not_done}}` | string | Почему не сделал |
| `{{journal_entry.reflection}}` | string | Рефлексия |
| `{{journal_entry.mood}}` | number | Настроение (1-10) |

### Handlebars условия

```handlebars
{{#if journal_filled}}
**Запись дневника:**
- Сделал: {{journal_entry.what_done}}
- Настроение: {{journal_entry.mood}}/10
{{/if}}
```

---

## 10. ЦЕЛИ И ПРОГРЕСС

### 10.1 Прогресс по целям (weekly_summary)

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{goals_progress}}` | array | Массив целей с прогрессом |
| `{{goals_progress[].title}}` | string | Название цели |
| `{{goals_progress[].progress_description}}` | string | Описание прогресса |
| `{{goals_progress[].key_step_completed}}` | string | Ключевой завершённый шаг |

### Handlebars итерация

```handlebars
{{#if goals_progress}}
{{#each goals_progress}}
**{{this.title}}:**
- Прогресс: {{this.progress_description}}
{{#if this.key_step_completed}}
- Ключевой шаг: «{{this.key_step_completed}}»
{{/if}}
{{/each}}
{{/if}}
```

---

## 11. НАГРАДЫ И XP

Используется в **weekly_summary**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{near_reward}}` | object/null | Ближайшая награда или null |
| `{{near_reward.reward_name}}` | string | Название награды |
| `{{near_reward.current_xp}}` | number | Текущий XP |
| `{{near_reward.needed_xp}}` | number | Нужно XP для награды |
| `{{near_reward.remaining_xp}}` | number | Осталось заработать XP |

### Handlebars условия

```handlebars
{{#if near_reward}}
До награды «{{near_reward.reward_name}}» осталось {{near_reward.remaining_xp}} XP
{{/if}}
```

---

## 12. КОНТЕКСТЫ ДЛЯ ЧАТ-БОТА

Используется в **chat_bot_response_system.md**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{user_profile}}` | object | Полный профиль пользователя |
| `{{ssp_context}}` | string | Данные ССП (колесо баланса) |
| `{{goals_context}}` | string | Цели и шаги |
| `{{schedule_context}}` | string | План на сегодня |
| `{{journal_context}}` | string | Данные дневника |
| `{{habits_context}}` | string | Привычки и XP |
| `{{achievements_context}}` | string | Достижения |
| `{{current_screen}}` | string | Текущий экран приложения |

### Возможные значения current_screen

- `"dashboard"` - Главная
- `"planner"` - Планировщик
- `"goals"` - Цели
- `"ssp"` - Колесо баланса
- `"journal"` - Дневник
- `"habits"` - Привычки
- `"achievements"` - Достижения

---

## 13. MESSAGE SCORING

Используется в **message_scoring_user.md**:

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{recent_messages}}` | string | Последние сообщения (контекст) |
| `{{user_message}}` | string | Текущее сообщение пользователя |

---

## 14. ПЕРЕМЕННЫЕ ДЛЯ НОВЫХ ПРОМПТОВ (из MENTOR_DEVELOPMENT_PLAN.md)

> **Статус:** Запланированы к реализации. Используй эти переменные при создании новых промптов.

---

### 14.1 Mentor Memory — Стадия отношений (relationship_stage)

> Используется в: все промпты (адаптация тона и частоты)

| Переменная | Тип | Возможные значения | Описание |
|------------|-----|-------------------|----------|
| `{{mentor_memory.relationship_stage.current}}` | string | "introduction", "building_trust", "deep_partnership", "maintained" | Текущая стадия |
| `{{mentor_memory.relationship_stage.days_in_app}}` | number | 1-∞ | Дней в приложении |
| `{{mentor_memory.relationship_stage.stage_since}}` | string | "YYYY-MM-DD" | Дата входа в текущую стадию |
| `{{mentor_memory.relationship_stage.aha_moments_delivered}}` | number | 0-∞ | Сколько Aha-моментов доставлено |
| `{{mentor_memory.relationship_stage.last_checkin_response}}` | string/null | "positive", "neutral", "negative", null | Ответ на последний relationship checkin |

**Логика стадий:**
```
introduction (Day 1-7):
  tone: дружелюбный, структурированный
  frequency: 2 сообщения/день
  focus: quick wins, первый Aha-момент
  exit: aha_moment_delivered && days >= 7

building_trust (Week 2-4):
  tone: персонализированный, с инсайтами
  frequency: 1-2 сообщения/день
  focus: паттерны, глубокие вопросы
  exit: days >= 28 && completion_rate > 40%

deep_partnership (Month 2-3):
  tone: уверенный, прямой
  frequency: адаптивная
  focus: вызовы, сложные вопросы
  exit: days >= 90

maintained (Month 4+):
  tone: партнёрский, краткий
  frequency: низкая, только значимое
  focus: неожиданные инсайты
```

---

### 14.2 Mentor Memory — Факты о пользователе (facts)

> Используется в: chat, journal_response, персонализация

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{mentor_memory.facts.personal}}` | array[string] | Личные факты ["работает в IT", "есть ребёнок"] |
| `{{mentor_memory.facts.work}}` | array[string] | Рабочие факты ["запускает стартап", "по пятницам встречи"] |
| `{{mentor_memory.facts.preferences}}` | array[string] | Предпочтения ["не любит мотивационные фразы"] |

---

### 14.3 Mentor Memory — Паттерны (patterns)

> Используется в: chat, evening, weekly, инсайты

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{mentor_memory.patterns.productive_times}}` | array[string] | Продуктивное время ["утро", "понедельник-среда"] |
| `{{mentor_memory.patterns.problematic}}` | array[string] | Проблемные паттерны ["творческие задачи откладывает"] |

---

### 14.4 Mentor Memory — Эмоциональное состояние (emotional_state)

> Используется в: все промпты (адаптация тона), streak_recovery, crisis detection

| Переменная | Тип | Возможные значения | Описание |
|------------|-----|-------------------|----------|
| `{{mentor_memory.emotional_state.current_trend}}` | string | "improving", "stable", "declining", "crisis" | Тренд эмоций |
| `{{mentor_memory.emotional_state.last_7_days}}` | array[string] | ["neutral", "positive", ...] | Настроения за 7 дней |
| `{{mentor_memory.emotional_state.burnout_signals}}` | number | 0-∞ | Счётчик сигналов выгорания |
| `{{mentor_memory.emotional_state.last_journal_sentiment}}` | string | "positive", "neutral", "negative" | Sentiment последней записи дневника |

---

### 14.5 Mentor Memory — Эффективные/неэффективные подходы

> Используется в: chat, выбор интервенций

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{mentor_memory.effective_approaches}}` | array[object] | Что работает |
| `{{mentor_memory.effective_approaches[].approach}}` | string | ID подхода ("ask_what_blocks", "smallest_step") |
| `{{mentor_memory.effective_approaches[].worked}}` | boolean | Сработало? |
| `{{mentor_memory.effective_approaches[].count}}` | number | Сколько раз использовался |
| `{{mentor_memory.ineffective_approaches}}` | array[object] | Что НЕ работает |
| `{{mentor_memory.ineffective_approaches[].approach}}` | string | ID подхода ("motivation_quotes") |

---

### 14.6 Mentor Memory — Инсайты и followups

> Используется в: chat, персонализация

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{mentor_memory.conversation_insights}}` | array[string] | Инсайты из разговоров ["Боится публиковать — страх оценки"] |
| `{{mentor_memory.pending_followups}}` | array[string] | Что нужно спросить ["Спросить про пост в блоге"] |

---

### 14.7 Mentor Memory — Streak Data

> Используется в: streak_recovery, milestone, evening

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{mentor_memory.streak_data.longest_streak}}` | number | Самый длинный streak за всё время |
| `{{mentor_memory.streak_data.current_streaks}}` | object | Текущие streaks {"зарядка": 7, "медитация": 3} |
| `{{mentor_memory.streak_data.recently_broken}}` | object/null | Недавно потерянный streak |
| `{{mentor_memory.streak_data.recently_broken.habit}}` | string | Название привычки |
| `{{mentor_memory.streak_data.recently_broken.was}}` | number | Какой был streak |
| `{{mentor_memory.streak_data.recently_broken.broken_date}}` | string | "YYYY-MM-DD" |

---

### 14.8 Welcome Sequence (Day 1-3)

> Используется в: welcome_sequence промпты

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{welcome.day}}` | number | День welcome-последовательности (1, 2, 3) |
| `{{welcome.onboarding_completed}}` | boolean | Онбординг завершён? |
| `{{welcome.first_task_selected}}` | string/null | Первая выбранная задача |
| `{{welcome.first_task_completed}}` | boolean | Первая задача выполнена? |
| `{{welcome.first_goal_created}}` | boolean | Первая цель создана? |
| `{{welcome.first_aha_moment}}` | object/null | Первый Aha-момент |
| `{{welcome.first_aha_moment.type}}` | string | "time_pattern", "task_pattern", "comparison", "streak" |
| `{{welcome.first_aha_moment.insight}}` | string | Текст инсайта |

**Типы Aha-моментов:**
| Тип | Пример |
|-----|--------|
| `time_pattern` | "Твой пик — утро" |
| `task_pattern` | "Мелкие задачи летят, большие стоят" |
| `comparison` | "Сделал больше, чем думал" |
| `streak` | "2 дня подряд — это уже старт" |

---

### 14.9 Streak Recovery

> Используется в: streak_recovery_notification

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{streak_recovery.habit_title}}` | string | Название привычки |
| `{{streak_recovery.streak_was}}` | number | Какой был streak до пропуска |
| `{{streak_recovery.days_since_break}}` | number | Дней с момента пропуска |
| `{{streak_recovery.streak_category}}` | string | "short" (7-14), "medium" (15-30), "long" (30+) |
| `{{streak_recovery.previous_longest}}` | number | Предыдущий лучший результат по этой привычке |

**Логика категорий:**
```
short (7-14 дней): "Один день — это не провал. Сегодня вернёшься?"
medium (15-30 дней): "N недель — это уже привычка. Один пропуск её не отменяет."
long (30+ дней): "Месяц+ без пропусков — это уже часть тебя."
```

---

### 14.10 Comeback Notification (Возвращение после паузы)

> Используется в: comeback_notification

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{comeback.days_absent}}` | number | Дней отсутствия |
| `{{comeback.absence_category}}` | string | "short" (3-6), "medium" (7-13), "long" (14+) |
| `{{comeback.last_activity_date}}` | string | "YYYY-MM-DD" |
| `{{comeback.last_completed_task}}` | string/null | Последняя завершённая задача |
| `{{comeback.active_goals_count}}` | number | Количество активных целей |
| `{{comeback.was_on_streak}}` | boolean | Был ли на streak перед уходом? |

---

### 14.11 Milestone Notification

> Используется в: milestone_notification

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{milestone.type}}` | string | "streak", "goal_completed", "reward_earned", "level_up" |
| `{{milestone.title}}` | string | Название достижения |
| `{{milestone.value}}` | number/string | Значение (7 дней, 100 XP, и т.д.) |
| `{{milestone.category}}` | string | Категория ("habit", "goal", "xp", "level") |

**Для streak milestone:**
| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{milestone.habit_title}}` | string | Название привычки |
| `{{milestone.streak_days}}` | number | 7, 14, 21, 30, 60, 90, 180, 365 |
| `{{milestone.is_personal_best}}` | boolean | Личный рекорд? |

**Для goal_completed milestone:**
| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{milestone.goal_title}}` | string | Название цели |
| `{{milestone.days_to_complete}}` | number | Сколько дней заняло |
| `{{milestone.steps_completed}}` | number | Количество шагов |

---

### 14.12 Journal Response

> Используется в: journal_response

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{journal_response.entry}}` | object | Запись дневника |
| `{{journal_response.entry.what_done}}` | string | Что сделал |
| `{{journal_response.entry.what_not_done}}` | string | Что не сделал |
| `{{journal_response.entry.why_not_done}}` | string | Почему |
| `{{journal_response.entry.reflection}}` | string | Рефлексия |
| `{{journal_response.entry.mood}}` | number | Настроение 1-10 |
| `{{journal_response.detected_sentiment}}` | string | "positive", "neutral", "negative" |
| `{{journal_response.detected_patterns}}` | array[string] | Обнаруженные паттерны |
| `{{journal_response.streak_days}}` | number | Серия дней дневника |

---

### 14.13 Monthly Review

> Используется в: monthly_review

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{monthly.month_name}}` | string | "Январь", "Февраль"... |
| `{{monthly.year}}` | number | 2025 |
| `{{monthly.tasks_completed}}` | number | Задач выполнено |
| `{{monthly.tasks_planned}}` | number | Задач запланировано |
| `{{monthly.habits_consistency}}` | object | Привычки за месяц |
| `{{monthly.habits_consistency[].title}}` | string | Название |
| `{{monthly.habits_consistency[].days_done}}` | number | Дней выполнено |
| `{{monthly.habits_consistency[].total_days}}` | number | Дней в месяце |
| `{{monthly.goals_completed}}` | array[object] | Завершённые цели |
| `{{monthly.goals_progress}}` | array[object] | Прогресс по активным целям |
| `{{monthly.xp_earned}}` | number | XP за месяц |
| `{{monthly.best_week}}` | object | Лучшая неделя |
| `{{monthly.worst_week}}` | object | Худшая неделя |
| `{{monthly.main_insight}}` | string | Главный инсайт месяца |
| `{{monthly.ssp_changes}}` | object | Изменения ССП за месяц |

---

### 14.14 Relationship Checkin

> Используется в: relationship_checkin (раз в 2 недели)

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{checkin.days_together}}` | number | Дней вместе |
| `{{checkin.weeks_together}}` | number | Недель вместе |
| `{{checkin.previous_response}}` | string/null | Предыдущий ответ на checkin |
| `{{checkin.improvements_made}}` | array[string] | Что улучшили после прошлого feedback |

---

### 14.15 Knowledge Base References (для интеграции)

> Используется в: chat, выбор интервенций

| Переменная | Тип | Описание |
|------------|-----|----------|
| `{{kb.detected_pattern}}` | object | Обнаруженный паттерн из базы |
| `{{kb.detected_pattern.id}}` | string | "repeated_postponement", "creative_block"... |
| `{{kb.detected_pattern.name}}` | string | Название паттерна |
| `{{kb.detected_pattern.likely_causes}}` | array[string] | Вероятные причины |
| `{{kb.recommended_techniques}}` | array[object] | Рекомендуемые техники |
| `{{kb.recommended_techniques[].id}}` | string | "ugly_first_draft", "smallest_step"... |
| `{{kb.recommended_techniques[].name}}` | string | Название техники |
| `{{kb.recommended_techniques[].intervention}}` | string | Пример интервенции |
| `{{kb.avoid_techniques}}` | array[string] | Техники, которые НЕ работают для этого пользователя |

---

## СПРАВОЧНИК HANDLEBARS СИНТАКСИСА

### Условия

```handlebars
{{#if variable}}
  Показать, если variable truthy
{{else}}
  Показать, если variable falsy
{{/if}}
```

### Итерация

```handlebars
{{#each array}}
  {{this.property}} — доступ к свойству элемента
  {{@index}} — индекс (0, 1, 2...)
  {{@first}} — true для первого элемента
  {{@last}} — true для последнего элемента
{{/each}}
```

### Вложенные условия

```handlebars
{{#if outer}}
  {{#if inner}}
    Оба условия true
  {{/if}}
{{/if}}
```

### Отрицание

```handlebars
{{#unless variable}}
  Показать, если variable falsy
{{/unless}}
```

---

## ПРАВИЛА НАИМЕНОВАНИЯ

1. **snake_case** для всех переменных
2. **Вложенность через точку:** `object.property`
3. **Массивы:** имя во множественном числе (`habits`, `goals_progress`)
4. **Булевы:** начинать с is/has/can (`is_filled`, `has_streak`, `can_send`)
5. **Счётчики:** заканчивать на _count, _total, _completed

---

## ЧЕКЛИСТ ПРИ СОЗДАНИИ НОВОГО ПРОМПТА

- [ ] Проверить имена переменных по этому справочнику
- [ ] Убедиться в правильном типе данных (string/number/boolean/array)
- [ ] Добавить условия `{{#if}}` для опциональных полей
- [ ] Использовать `{{#each}}` для массивов
- [ ] Добавить новые переменные в этот справочник
- [ ] Проверить Handlebars синтаксис
- [ ] Протестировать с пустыми/null значениями

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Изменение |
|------|-----------|
| 2025-01-20 | Создан первоначальный справочник |
| 2025-01-20 | Добавлены переменные из MENTOR_DEVELOPMENT_PLAN.md: mentor_memory, welcome_sequence, streak_recovery, comeback, milestone, journal_response, monthly_review, relationship_checkin, knowledge_base |

