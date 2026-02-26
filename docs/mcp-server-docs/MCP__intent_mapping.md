# Intent → Actions Mapping

Маппинг пользовательских намерений (фраз) на MCP actions.

---

## Цели (Goals)

### goal.create

| Фраза пользователя | Actions |
|--------------------|---------|
| "Создай цель выучить Python" | `[{action: "goal.create", params: {title: "Выучить Python", category: "work"}}]` |
| "Хочу похудеть на 10 кг" | `[{action: "goal.create", params: {title: "Похудеть на 10 кг", category: "health_sport"}}]` |
| "Добавь цель — накопить на машину" | `[{action: "goal.create", params: {title: "Накопить на машину", category: "welfare"}}]` |
| "Новая цель: проводить больше времени с семьёй" | `[{action: "goal.create", params: {title: "Проводить больше времени с семьёй", category: "family"}}]` |

**Определение category по контексту:**

| Ключевые слова | category |
|----------------|----------|
| работа, карьера, повышение, зарплата, проект | `work` |
| здоровье, спорт, фитнес, похудеть, бег, зал | `health_sport` |
| деньги, накопить, инвестиции, доход, финансы | `welfare` |
| семья, дети, родители, отношения, брак | `family` |
| друзья, общение, нетворкинг, окружение | `environment` |
| хобби, путешествия, творчество, музыка, книги | `hobby` |

### goal.update

| Фраза пользователя | Actions |
|--------------------|---------|
| "Переименуй цель {id} в 'Изучить Django'" | `[{action: "goal.update", params: {goal_id: {id}, title: "Изучить Django"}}]` |
| "Измени категорию этой цели на работу" | `[{action: "goal.update", params: {goal_id: {id}, category: "work"}}]` |
| "Добавь описание: хочу стать senior разработчиком" | `[{action: "goal.update", params: {goal_id: {id}, why_important: "Хочу стать senior разработчиком"}}]` |

### goal.complete

| Фраза пользователя | Actions |
|--------------------|---------|
| "Я достиг цели!" | `[{action: "goal.complete", params: {goal_id: {id}}}]` |
| "Цель выполнена" | `[{action: "goal.complete", params: {goal_id: {id}}}]` |
| "Отметь цель как достигнутую" | `[{action: "goal.complete", params: {goal_id: {id}}}]` |
| "Закончил с целью Python" | `[{action: "goal.complete", params: {goal_id: {id}}}]` |

### goal.delete

| Фраза пользователя | Actions |
|--------------------|---------|
| "Удали эту цель" | `[{action: "goal.delete", params: {goal_id: {id}}}]` |
| "Убери цель про Python" | `[{action: "goal.delete", params: {goal_id: {id}}}]` |
| "Эта цель больше не актуальна, удаляй" | `[{action: "goal.delete", params: {goal_id: {id}}}]` |

---

## Шаги (Steps)

### step.create

| Фраза пользователя | Actions |
|--------------------|---------|
| "Добавь шаг к цели: пройти первый модуль" | `[{action: "step.create", params: {goal_id: {id}, title: "Пройти первый модуль"}}]` |
| "Создай задачу 'Прочитать документацию' на завтра" | `[{action: "step.create", params: {goal_id: {id}, title: "Прочитать документацию", dt: "2026-01-29"}}]` |
| "Добавь важный шаг: сдать экзамен" | `[{action: "step.create", params: {goal_id: {id}, title: "Сдать экзамен", priority: "critical"}}]` |
| "Новый шаг на час: написать код" | `[{action: "step.create", params: {goal_id: {id}, title: "Написать код", time_duration: "one"}}]` |

### step.update

| Фраза пользователя | Actions |
|--------------------|---------|
| "Перенеси этот шаг на пятницу" | `[{action: "step.update", params: {step_id: {id}, dt: "2026-01-31"}}]` |
| "Поставь этому шагу приоритет критично" | `[{action: "step.update", params: {step_id: {id}, priority: "critical"}}]` |
| "Измени время на 2 часа" | `[{action: "step.update", params: {step_id: {id}, time_duration: "two"}}]` |
| "Переименуй шаг в 'Изучить ORM'" | `[{action: "step.update", params: {step_id: {id}, title: "Изучить ORM"}}]` |

### step.complete

| Фраза пользователя | Actions |
|--------------------|---------|
| "Шаг выполнен" | `[{action: "step.complete", params: {step_id: {id}}}]` |
| "Я сделал эту задачу" | `[{action: "step.complete", params: {step_id: {id}}}]` |
| "Отметь шаг готовым" | `[{action: "step.complete", params: {step_id: {id}}}]` |
| "Закончил с этим шагом" | `[{action: "step.complete", params: {step_id: {id}}}]` |

### step.delete

| Фраза пользователя | Actions |
|--------------------|---------|
| "Удали этот шаг" | `[{action: "step.delete", params: {step_id: {id}}}]` |
| "Убери задачу" | `[{action: "step.delete", params: {step_id: {id}}}]` |
| "Этот шаг не нужен" | `[{action: "step.delete", params: {step_id: {id}}}]` |

---

## Привычки (Habits)

### habit.create

| Фраза пользователя | Actions |
|--------------------|---------|
| "Создай привычку делать зарядку" | `[{action: "habit.create", params: {name: "Делать зарядку", frequency_type: "daily"}}]` |
| "Добавь привычку читать по 30 минут каждый день" | `[{action: "habit.create", params: {name: "Читать 30 минут", frequency_type: "daily"}}]` |
| "Хочу привычку медитировать по будням" | `[{action: "habit.create", params: {name: "Медитировать", frequency_type: "weekdays"}}]` |
| "Новая привычка: бегать, 20 XP" | `[{action: "habit.create", params: {name: "Бегать", xp_reward: 20, frequency_type: "daily"}}]` |

### habit.update

| Фраза пользователя | Actions |
|--------------------|---------|
| "Измени название привычки на 'Утренняя зарядка'" | `[{action: "habit.update", params: {habit_id: {id}, name: "Утренняя зарядка"}}]` |
| "Поставь этой привычке 25 XP" | `[{action: "habit.update", params: {habit_id: {id}, xp_reward: 25}}]` |
| "Сделай привычку только по будням" | `[{action: "habit.update", params: {habit_id: {id}, frequency_type: "weekdays"}}]` |

### habit.mark_completed

| Фраза пользователя | Actions |
|--------------------|---------|
| "Сделал зарядку!" | `[{action: "habit.mark_completed", params: {habit_id: {id}, date: "2026-01-28"}}]` |
| "Отметь привычку выполненной" | `[{action: "habit.mark_completed", params: {habit_id: {id}, date: "2026-01-28"}}]` |
| "Привычка сделана" | `[{action: "habit.mark_completed", params: {habit_id: {id}, date: "2026-01-28"}}]` |
| "Отметь вчерашнюю медитацию" | `[{action: "habit.mark_completed", params: {habit_id: {id}, date: "2026-01-27"}}]` |

### habit.mark_missed

| Фраза пользователя | Actions |
|--------------------|---------|
| "Пропустил зарядку сегодня" | `[{action: "habit.mark_missed", params: {habit_id: {id}, date: "2026-01-28"}}]` |
| "Не смог сделать, был болен" | `[{action: "habit.mark_missed", params: {habit_id: {id}, date: "2026-01-28", excuse_reason: "Болезнь"}}]` |
| "Отметь пропуск с причиной: командировка" | `[{action: "habit.mark_missed", params: {habit_id: {id}, date: "2026-01-28", excuse_reason: "Командировка"}}]` |

### habit.delete

| Фраза пользователя | Actions |
|--------------------|---------|
| "Удали эту привычку" | `[{action: "habit.delete", params: {habit_id: {id}}}]` |
| "Убери привычку про бег" | `[{action: "habit.delete", params: {habit_id: {id}}}]` |

---

## Дневник (Diary)

### diary.create_entry

| Фраза пользователя | Actions |
|--------------------|---------|
| "Запиши в дневник: сегодня продуктивный день" | `[{action: "diary.create_entry", params: {what_done: "Продуктивный день"}}]` |
| "Заполни дневник за сегодня" | Диалог: спросить что сделал, что не сделал, рефлексию |
| "Сделал 3 задачи, не успел позвонить маме" | `[{action: "diary.create_entry", params: {what_done: "Сделал 3 задачи", what_not_done: "Не успел позвонить маме"}}]` |
| "Рефлексия: нужно лучше планировать время" | `[{action: "diary.create_entry", params: {reflection: "Нужно лучше планировать время"}}]` |

### diary.update_entry

| Фраза пользователя | Actions |
|--------------------|---------|
| "Дополни запись: забыл упомянуть встречу" | `[{action: "diary.update_entry", params: {diary_id: {id}, what_done: "... + встреча с командой"}}]` |
| "Добавь план на завтра: закончить отчёт" | `[{action: "diary.update_entry", params: {diary_id: {id}, plans: "Закончить отчёт"}}]` |

---

## Комплексные сценарии

### Утреннее планирование

| Фраза | Actions |
|-------|---------|
| "Запланируй мне день" | 1. `get_user_snapshot(include: ["schedule", "habits"])` <br> 2. Показать план <br> 3. Спросить про изменения |
| "Перенеси всё на завтра" | `[{action: "step.update", params: {step_id: X, dt: "..."}}, ...]` для каждого шага |

### Вечерний обзор

| Фраза | Actions |
|-------|---------|
| "Подведи итоги дня" | 1. `get_user_snapshot(include: ["habits", "diary", "xp"])` <br> 2. Спросить про пропуски <br> 3. Заполнить дневник |
| "Отметь все привычки сделанными" | `[{action: "habit.mark_completed", ...}, ...]` для каждой привычки |

### Создание цели с шагами

| Фраза | Actions |
|-------|---------|
| "Создай цель Python с 3 шагами" | `[{action: "goal.create", ...}, {action: "step.create", ...}, {action: "step.create", ...}, {action: "step.create", ...}]` |

---

## Определение ID сущностей

Перед формированием actions с ID, ВСЕГДА используй `get_user_snapshot` для получения актуальных ID:

```
User: "Удали цель про Python"

1. get_user_snapshot(include: ["goals"])
2. Найти цель с title содержащим "Python" → goal_id: 123
3. preview_actions([{action: "goal.delete", params: {goal_id: 123}}])
```

**НИКОГДА не угадывай ID** — всегда получай их из snapshot!

---

## Неоднозначные фразы

| Фраза | Что делать |
|-------|------------|
| "Сделай что-нибудь с целью" | Уточни: "Что именно сделать с целью? Обновить, завершить, удалить?" |
| "Добавь задачу" | Уточни: "К какой цели добавить шаг? Вот твои активные цели: ..." |
| "Отметь" | Уточни: "Что отметить — шаг выполненным или привычку сделанной?" |
| "Удали" | Уточни: "Что удалить? Вот что я нашёл: ..." |

---

## Синонимы и вариации

### Создание

| Синонимы |
|----------|
| создай, добавь, новый, новая, хочу, запиши, внеси |

### Обновление

| Синонимы |
|----------|
| измени, обнови, переименуй, поменяй, перенеси, поставь |

### Завершение

| Синонимы |
|----------|
| выполнено, готово, сделано, закончил, достиг, отметь выполненным |

### Удаление

| Синонимы |
|----------|
| удали, убери, уничтожь, не нужно, отмени |

### Пропуск (привычки)

| Синонимы |
|----------|
| пропустил, не сделал, не смог, забыл, скип |
