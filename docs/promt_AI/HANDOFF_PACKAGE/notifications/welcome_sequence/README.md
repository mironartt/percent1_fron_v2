# Welcome Sequence — Документация

## Назначение

Welcome Sequence — цепочка из 3 сообщений в первые 3 дня после регистрации. Цель: активировать пользователя и дать первый Aha-момент до Day 3.

**Почему это критично:** 80% пользователей уходят в первые 3 дня. Первое впечатление и первый инсайт определяют, останется ли человек.

---

## Структура файлов

```
welcome_sequence/
├── welcome_day1_system_prompt.md    # Системный промпт Day 1
├── welcome_day1_user_prompt.md      # User prompt Day 1 с переменными
├── welcome_day2_system_prompt.md    # Системный промпт Day 2
├── welcome_day2_user_prompt.md      # User prompt Day 2 с переменными
├── welcome_day3_system_prompt.md    # Системный промпт Day 3 (Aha-момент)
├── welcome_day3_user_prompt.md      # User prompt Day 3 с переменными
├── welcome_examples.md              # Примеры для каждого дня
└── README.md                        # Этот файл
```

---

## Логика по дням

| День | Время отправки | Цель | Фокус |
|------|----------------|------|-------|
| **Day 1** | Сразу после онбординга | Познакомиться | Выбрать одну задачу |
| **Day 2** | Утро (08:00-10:00) | Дать feedback | Что на сегодня? |
| **Day 3** | Вечер (18:00-20:00) | Первый Aha-момент | Инсайт из данных |

---

## Требуемые данные от бэкенда

### Day 1

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `user_name` | string | Да | Имя пользователя |
| `registration_date` | string | Да | Дата регистрации |
| `current_time` | string | Да | Текущее время |
| `welcome.onboarding_completed` | boolean | Да | Онбординг завершён? |
| `goals_created` | array | Нет | Цели из онбординга |
| `tasks_available` | array | Нет | Доступные задачи |
| `habits_created` | array | Нет | Созданные привычки |

### Day 2

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `user_name` | string | Да | Имя пользователя |
| `current_time` | string | Да | Текущее время |
| `welcome.first_task_selected` | string/null | Да | Выбранная задача Day 1 |
| `welcome.first_task_completed` | boolean | Да | Задача выполнена? |
| `today_tasks` | array | Нет | Задачи на сегодня |
| `habits_today` | array | Нет | Привычки на сегодня |

### Day 3

| Переменная | Тип | Обязательно | Описание |
|------------|-----|-------------|----------|
| `user_name` | string | Да | Имя пользователя |
| `current_time` | string | Да | Текущее время |
| `stats_3days.tasks_planned` | number | Да | Задач запланировано за 3 дня |
| `stats_3days.tasks_completed` | number | Да | Задач выполнено за 3 дня |
| `stats_3days.tasks_by_time` | object | Нет | Распределение по времени |
| `stats_3days.tasks_by_duration` | object | Нет | Распределение по длительности |
| `stats_3days.habits` | array | Нет | Привычки за 3 дня |
| `stats_3days.day1/day2/day3` | object | Нет | Статистика по дням |
| `welcome.first_aha_moment` | object | Нет | Предрассчитанный инсайт |

---

## Типы Aha-моментов (Day 3)

| Тип | Триггер | Пример инсайта |
|-----|---------|----------------|
| `time_pattern` | Явный пик по времени суток | "4 из 5 задач — до обеда" |
| `task_pattern` | Разница по типам задач | "Короткие летят, длинные стоят" |
| `comparison` | План vs факт | "Закрыл 5 из 8 — больше половины" |
| `streak` | Повторяющееся действие | "Зарядка 3 из 3 дней" |
| `fallback` | Мало данных | "Присматриваюсь к паттернам" |

**Приоритет:** time_pattern > comparison > task_pattern > streak > fallback

---

## Интеграция

### Триггеры отправки

```javascript
// Day 1: сразу после онбординга
if (user.onboarding_completed && user.days_in_app === 1) {
  sendWelcomeDay1();
}

// Day 2: утром второго дня
if (user.days_in_app === 2 && currentHour >= 8 && currentHour <= 10) {
  sendWelcomeDay2();
}

// Day 3: вечером третьего дня
if (user.days_in_app === 3 && currentHour >= 18 && currentHour <= 20) {
  sendWelcomeDay3();
}
```

### Формирование данных Day 3

```javascript
function calculateAhaMoment(stats) {
  // 1. Проверяем time_pattern
  if (stats.tasks_by_time) {
    const { morning, afternoon, evening } = stats.tasks_by_time;
    const total = morning + afternoon + evening;
    if (morning >= total * 0.6) {
      return { type: 'time_pattern', insight: `${morning} из ${total} задач — до обеда` };
    }
  }

  // 2. Проверяем comparison
  if (stats.tasks_completed > stats.tasks_planned * 0.5) {
    return { type: 'comparison', insight: `${stats.tasks_completed} из ${stats.tasks_planned}` };
  }

  // 3. Проверяем task_pattern
  if (stats.tasks_by_duration) {
    const { short, long } = stats.tasks_by_duration;
    if (short.completed > 0 && long.completed === 0) {
      return { type: 'task_pattern', insight: 'короткие летят, длинные стоят' };
    }
  }

  // 4. Проверяем streak
  if (stats.habits) {
    const consistentHabit = stats.habits.find(h => h.completed_days >= 2);
    if (consistentHabit) {
      return { type: 'streak', insight: `${consistentHabit.title} ${consistentHabit.completed_days} из 3` };
    }
  }

  // 5. Fallback
  return { type: 'fallback', insight: null };
}
```

---

## Метрики успеха

| Метрика | Цель | Как измерять |
|---------|------|--------------|
| Day 3 retention | >40% | % юзеров, активных на Day 3 |
| Aha-момент доставлен | >80% | % юзеров, получивших non-fallback инсайт |
| Первая задача выбрана | >60% | % юзеров, выбравших задачу Day 1 |
| Первая задача выполнена | >40% | % юзеров, выполнивших задачу Day 1-2 |

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создана первая версия Welcome Sequence |
