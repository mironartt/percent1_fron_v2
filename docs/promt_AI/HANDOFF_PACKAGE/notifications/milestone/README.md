# Milestone Notification — Документация

## Назначение

Milestone Notification — сообщение при достижении значимой вехи (цель, streak milestone, уровень). Цель: помочь зафиксировать и осознать достижение.

**Почему это важно:** Люди склонны обесценивать свои успехи и бежать дальше. Фиксация достижения критична для долгосрочной мотивации и формирования позитивной связи с приложением.

---

## Структура файлов

```
milestone/
├── milestone_system_prompt.md   # Системный промпт
├── milestone_user_prompt.md     # User prompt с переменными
├── milestone_examples.md        # Примеры по типам
└── README.md                    # Этот файл
```

---

## Триггеры отправки

### 1. Goal Completed
```javascript
if (goal.status === 'completed' && goal.just_completed) {
  sendMilestoneNotification('goal_completed', goal);
}
```

### 2. Streak Milestone
```javascript
const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

if (STREAK_MILESTONES.includes(habit.current_streak) && !habit.milestone_shown) {
  sendMilestoneNotification('streak_milestone', habit);
  habit.milestone_shown = true;
}
```

### 3. Level Up
```javascript
if (user.level > user.previous_level) {
  sendMilestoneNotification('level_up', {
    new_level: user.level,
    previous_level: user.previous_level
  });
}
```

### 4. First Achievement
```javascript
if (user.goals_completed_count === 1) {
  sendMilestoneNotification('first_achievement', { type: 'first_goal' });
}

if (user.first_streak_7 && !user.first_streak_7_shown) {
  sendMilestoneNotification('first_achievement', { type: 'first_streak_7' });
}
```

**Время отправки:** Сразу после события (real-time) или в ближайшее окно активности.

---

## Типы Milestone

| Тип | Триггер | Тон | Акцент |
|-----|---------|-----|--------|
| **goal_completed** | Цель закрыта | Весомый | Путь, шаги, время |
| **streak_7** | 7 дней streak | Лёгкий | Начало, первая неделя |
| **streak_14** | 14 дней streak | Чуть серьёзнее | Система, не случайность |
| **streak_30** | 30 дней streak | Значимый | Формирование привычки |
| **streak_60** | 60 дней streak | Серьёзный | Укоренение |
| **streak_90** | 90 дней streak | Весомый | Решение, подтверждённое временем |
| **streak_180** | 180 дней streak | Торжественный | Полгода |
| **streak_365** | 365 дней streak | Исключительный | Год, часть личности |
| **level_up** | Новый уровень XP | Игровой, лёгкий | Накопленный опыт |
| **first_achievement** | Первая цель/streak | Поддерживающий | Начало положено |

---

## Требуемые данные от бэкенда

### Общие

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `user_name` | string | Да | Имя пользователя |
| `current_date` | string | Да | Текущая дата |
| `milestone.type` | string | Да | Тип: goal_completed, streak_milestone, level_up, first_achievement |
| `milestone.title` | string | Да | Название (цель/привычка/уровень) |

### Для goal_completed

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `milestone.goal_data.title` | string | Да | Название цели |
| `milestone.goal_data.sphere` | string | Да | Сфера жизни |
| `milestone.goal_data.total_steps` | number | Да | Всего шагов |
| `milestone.goal_data.completed_steps` | number | Да | Выполнено шагов |
| `milestone.goal_data.days_in_work` | number | Да | Дней в работе |
| `milestone.goal_data.was_rescheduled` | boolean | Нет | Были переносы? |
| `milestone.goal_data.reschedule_count` | number | Нет | Количество переносов |

### Для streak_milestone

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `milestone.streak_data.habit_title` | string | Да | Название привычки |
| `milestone.streak_data.current_streak` | number | Да | Текущий streak |
| `milestone.streak_data.milestone_category` | string | Да | week_1, week_2, month_1, month_2, month_3, half_year, year |
| `milestone.streak_data.previous_record` | number | Нет | Предыдущий рекорд |
| `milestone.streak_data.is_new_record` | boolean | Нет | Это новый рекорд? |

### Для level_up

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `milestone.level_data.new_level` | number | Да | Новый уровень |
| `milestone.level_data.previous_level` | number | Да | Предыдущий уровень |
| `milestone.level_data.total_xp` | number | Нет | Всего XP |
| `milestone.level_data.xp_last_month` | number | Нет | XP за месяц |

### Для first_achievement

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `milestone.first_achievement.type` | string | Да | first_goal, first_streak_7, first_level |

---

## Логика определения категории streak

```javascript
function getStreakMilestoneCategory(streak) {
  if (streak === 365) return 'year';
  if (streak === 180) return 'half_year';
  if (streak === 90) return 'month_3';
  if (streak === 60) return 'month_2';
  if (streak === 30) return 'month_1';
  if (streak === 14) return 'week_2';
  if (streak === 7) return 'week_1';
  return null; // не milestone
}
```

---

## Метрики успеха

| Метрика | Цель | Как измерять |
|---------|------|--------------|
| Open rate | >70% | % открытых milestone уведомлений |
| Response rate | >30% | % ответов на вопрос в конце |
| Continuation rate | >80% | % пользователей, продолживших активность после milestone |
| Satisfaction score | >4.0 | Оценка релевантности (если собираем) |

---

## Принципы

1. **Сначала признание** — не торопить к следующему
2. **Конкретика** — цифры, названия, факты
3. **Вопрос о смысле** — помочь осознать значение
4. **Без сахара** — без "молодец", "супер", "потрясающе"
5. **Адаптация по типу** — streak_7 легче, чем goal_completed

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создана первая версия Milestone Notification |
