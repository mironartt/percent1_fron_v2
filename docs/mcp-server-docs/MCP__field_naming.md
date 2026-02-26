# Canonical Field Naming

Единый справочник именования полей для MCP actions.

**Важно:** Используй ТОЛЬКО указанные здесь имена полей. Модель не должна путаться между синонимами.

---

## Идентификаторы сущностей

| Сущность | Каноническое поле | НЕ использовать |
|----------|-------------------|-----------------|
| Цель | `goal_id` | ~~id~~, ~~goalId~~, ~~goal~~ |
| Шаг | `step_id` | ~~id~~, ~~stepId~~, ~~step~~, ~~task_id~~ |
| Привычка | `habit_id` | ~~id~~, ~~habitId~~, ~~habit~~ |
| Запись дневника | `diary_id` | ~~id~~, ~~diaryId~~, ~~entry_id~~ |

**Примеры:**
```json
// Правильно
{"action": "goal.update", "params": {"goal_id": 123, "title": "..."}}
{"action": "step.complete", "params": {"step_id": 456}}
{"action": "habit.delete", "params": {"habit_id": 789}}
{"action": "diary.update_entry", "params": {"diary_id": 111}}

// НЕПРАВИЛЬНО
{"action": "goal.update", "params": {"id": 123}}  // НЕТ!
{"action": "step.complete", "params": {"task_id": 456}}  // НЕТ!
```

---

## Дата и время

| Назначение | Каноническое поле | Формат | НЕ использовать |
|------------|-------------------|--------|-----------------|
| Запланированная дата шага | `dt` | YYYY-MM-DD | ~~date~~, ~~deadline~~, ~~scheduled_date~~, ~~due_date~~ |
| Дата привычки/дневника | `date` | YYYY-MM-DD | ~~dt~~, ~~entry_date~~, ~~completion_date~~ |
| Начало периода (snapshot) | `date_from` | YYYY-MM-DD | ~~from~~, ~~start~~, ~~start_date~~ |
| Конец периода (snapshot) | `date_to` | YYYY-MM-DD | ~~to~~, ~~end~~, ~~end_date~~ |

**Важно:**
- Шаги используют `dt` (сокращение от datetime)
- Привычки и дневник используют `date`
- Snapshot использует `date_from` / `date_to`

**Примеры:**
```json
// Шаг — используем dt
{"action": "step.create", "params": {"goal_id": 1, "title": "...", "dt": "2026-01-29"}}
{"action": "step.update", "params": {"step_id": 456, "dt": "2026-01-30"}}

// Привычка — используем date
{"action": "habit.mark_completed", "params": {"habit_id": 789, "date": "2026-01-28"}}

// Дневник — используем date (для создания на конкретную дату)
{"action": "diary.create_entry", "params": {"date": "2026-01-28", "what_done": "..."}}

// Snapshot — используем date_from/date_to
{"include": ["schedule"], "date_from": "2026-01-28", "date_to": "2026-02-04"}
```

---

## Цели (Goals)

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `title` | string | Название цели | ✅ create |
| `category` | enum | Сфера жизни | ❌ |
| `why_important` | string | Почему важна | ❌ |
| `why_give_me` | string | Что даст достижение | ❌ |
| `why_about_me` | string | Что говорит обо мне | ❌ |

**category enum:**
```
work          — Работа и карьера
health_sport  — Здоровье и спорт
welfare       — Благосостояние (финансы)
family        — Семья и отношения
environment   — Дружба и окружение
hobby         — Хобби и увлечения
```

**НЕ использовать:**
- ~~description~~ → используй `why_important`
- ~~sphere~~ → используй `category`
- ~~name~~ → используй `title`

---

## Шаги (Steps)

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `goal_id` | int | ID родительской цели | ✅ create |
| `title` | string | Название шага | ✅ create |
| `description` | string | Описание | ❌ |
| `priority` | enum | Приоритет | ❌ |
| `time_duration` | enum | Длительность | ❌ |
| `dt` | date | Запланированная дата | ❌ |
| `order` | int | Порядок сортировки | ❌ |

**priority enum:**
```
critical   — Критично (красный)
important  — Важно (оранжевый)
attention  — Внимание (жёлтый)
optional   — Опционально (серый)
```

**time_duration enum:**
```
half   — 30 минут
one    — 1 час
two    — 2 часа
three  — 3 часа
four   — 4 часа
```

**НЕ использовать:**
- ~~name~~ → используй `title`
- ~~date~~, ~~deadline~~ → используй `dt`
- ~~high~~, ~~medium~~, ~~low~~ → используй `critical`, `important`, `attention`, `optional`
- ~~30~~, ~~60~~, ~~120~~ → используй `half`, `one`, `two`

---

## Привычки (Habits)

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `name` | string | Название привычки | ✅ create |
| `icon` | string | Эмодзи иконка | ❌ |
| `xp_reward` | int | XP за выполнение | ❌ (default: 10) |
| `xp_penalty` | int | XP штраф за пропуск | ❌ (default: 5) |
| `frequency_type` | enum | Тип расписания | ❌ (default: daily) |
| `schedule_days` | array | Дни недели [0-6] | ❌ |

**frequency_type enum:**
```
daily     — Каждый день (Пн-Вс)
weekdays  — Будни (Пн-Пт)
weekends  — Выходные (Сб-Вс)
custom    — Свой график (см. schedule_days)
```

**schedule_days format (для custom):**
```
[0, 1, 2, 3, 4]     — Пн-Пт
[5, 6]              — Сб-Вс
[0, 2, 4]           — Пн, Ср, Пт
```

**НЕ использовать:**
- ~~title~~ → используй `name`
- ~~reward~~ → используй `xp_reward`
- ~~penalty~~ → используй `xp_penalty`
- ~~everyday~~, ~~work_days~~ → используй `daily`, `weekdays`

---

## Дневник (Diary)

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `what_done` | string | Что сделано | ❌* |
| `what_not_done` | string | Что не сделано | ❌* |
| `reflection` | string | Рефлексия, выводы | ❌* |
| `plans` | string | Планы на завтра | ❌* |
| `date` | date | Дата записи | ❌ (default: сегодня) |

*Минимум одно из полей `what_done`, `what_not_done`, `reflection`, `plans` должно быть заполнено.

**НЕ использовать:**
- ~~content~~ → используй конкретные поля `what_done`, `reflection` и т.д.
- ~~mood~~ — не существует в модели
- ~~text~~ → используй конкретные поля
- ~~entry~~ → используй конкретные поля

---

## Привычки: отметки выполнения

### habit.mark_completed

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `habit_id` | int | ID привычки | ✅ |
| `date` | date | Дата выполнения | ✅ |

### habit.mark_missed

| Поле | Тип | Описание | Обязательно |
|------|-----|----------|-------------|
| `habit_id` | int | ID привычки | ✅ |
| `date` | date | Дата пропуска | ✅ |
| `excuse_reason` | string | Причина пропуска | ❌ |

**Важно:**
- С `excuse_reason` — XP не списывается
- Без `excuse_reason` — применяется штраф `xp_penalty`

---

## Статусы целей

| Значение | Описание |
|----------|----------|
| `work` | В работе (активная) |
| `complete` | Завершена |

Используется в:
- `get_user_snapshot` параметр `goals_status`
- Ответ snapshot: `goal.status`

---

## Трассировка

| Поле | Где используется | Описание |
|------|------------------|----------|
| `client_action_id` | preview_actions | UUID для трассировки каждого action |
| `idempotency_key` | apply_actions | UUID для защиты от дублей |
| `preview_id` | apply_actions, cancel_preview | UUID preview для применения/отмены |

**Формат UUID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Пример полного action

```json
{
  "action": "step.create",
  "client_action_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "params": {
    "goal_id": 123,
    "title": "Прочитать главу 5",
    "description": "Включая практические задания",
    "priority": "important",
    "time_duration": "one",
    "dt": "2026-01-29"
  }
}
```

---

## Чеклист перед формированием action

- [ ] ID сущности: `goal_id`, `step_id`, `habit_id`, `diary_id` (не просто `id`)
- [ ] Дата шага: `dt` (не `date`, не `deadline`)
- [ ] Дата привычки/дневника: `date`
- [ ] Название цели: `title` (не `name`)
- [ ] Название привычки: `name` (не `title`)
- [ ] Приоритет: `critical`/`important`/`attention`/`optional` (не `high`/`medium`/`low`)
- [ ] Длительность: `half`/`one`/`two`/`three`/`four` (не числа)
- [ ] Дневник: `what_done`/`what_not_done`/`reflection`/`plans` (не `content`/`mood`)
