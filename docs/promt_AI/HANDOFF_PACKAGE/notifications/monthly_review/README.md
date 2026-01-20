# Monthly Review — Документация

## Назначение

Monthly Review — ежемесячный обзор прогресса пользователя. Цель: дать объективную картину месяца, выделить ключевой паттерн и задать вектор на следующий месяц.

**Почему это важно:** Месячная рефлексия позволяет увидеть тренды, которые не видны в ежедневной рутине. Это момент для стратегического взгляда, а не тактических деталей.

---

## Структура файлов

```
monthly_review/
├── monthly_review_system_prompt.md   # Системный промпт
├── monthly_review_user_prompt.md     # User prompt с переменными
├── monthly_review_examples.md        # Примеры по типам месяцев
└── README.md                         # Этот файл
```

---

## Триггеры отправки

### 1. Конец месяца
```javascript
// В последний день месяца или первые 3 дня нового
const today = new Date();
const isEndOfMonth = today.getDate() >= 28 || today.getDate() <= 3;
const hasMonthlyData = user.monthly_stats && user.days_in_app >= 28;

if (isEndOfMonth && hasMonthlyData && !user.monthly_review_sent_this_month) {
  sendMonthlyReview();
  user.monthly_review_sent_this_month = true;
}
```

### 2. По запросу пользователя
```javascript
if (user.requested_monthly_review) {
  sendMonthlyReview();
}
```

**Время отправки:** Вечер (19:00-21:00) — время для рефлексии.

---

## Типы месяцев

| Тип | Условие | Фокус обзора |
|-----|---------|--------------|
| **first_month** | month_number === 1 | Начало положено, первые паттерны |
| **productive** | completion_rate >= 60% | Что работает, как закрепить |
| **difficult** | completion_rate < 40% | Факты без осуждения, что мешало |
| **growth** | completion_rate > previous + 10% | Что сработало, как сохранить |
| **decline** | completion_rate < previous - 10% | Что произошло, нужны ли изменения |
| **plateau** | \|completion_rate - previous\| <= 5% | Комфорт или застой |

---

## Требуемые данные от бэкенда

### Обязательные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `user_name` | string | Имя пользователя |
| `current_date` | string | Текущая дата |
| `month_number` | number | Номер месяца в приложении (1, 2, 3...) |
| `monthly_stats.tasks_planned` | number | Задач запланировано |
| `monthly_stats.tasks_completed` | number | Задач выполнено |
| `monthly_stats.completion_rate` | number | Процент выполнения |
| `monthly_stats.active_goals` | number | Активных целей |
| `monthly_stats.goals_completed` | number | Закрытых целей |
| `monthly_stats.steps_completed` | number | Шагов выполнено |

### Опциональные (для более глубокого обзора)

| Переменная | Тип | Описание |
|------------|-----|----------|
| `monthly_stats.tasks_by_time` | object | Задачи по времени суток |
| `monthly_stats.tasks_by_priority` | object | Задачи по приоритетам |
| `monthly_stats.goals_progress` | array | Прогресс по каждой цели |
| `monthly_stats.active_habits` | number | Активных привычек |
| `monthly_stats.habit_days` | number | Дней с выполненными привычками |
| `monthly_stats.habits_detail` | array | Детали по каждой привычке |
| `monthly_stats.longest_streak` | object | Лучший streak месяца |
| `monthly_stats.journal_entries` | number | Записей в дневнике |
| `monthly_stats.journal_streak` | number | Макс. streak дневника |
| `monthly_stats.xp_earned` | number | Заработано XP |
| `monthly_stats.current_level` | number | Текущий уровень |
| `monthly_stats.level_ups` | number | Повышений уровня |
| `previous_month_stats` | object | Статистика прошлого месяца |
| `comparison` | object | Сравнение с прошлым месяцем |
| `monthly_patterns` | array | Предрассчитанные паттерны |
| `notable_events` | array | Значимые события (если отмечены) |
| `relationship_stage` | string | Стадия отношений |
| `days_in_app` | number | Всего дней в приложении |

---

## Предрасчёт паттернов

Backend должен предрассчитать паттерны для промпта:

### Типы паттернов

| Тип | Описание | Пример |
|-----|----------|--------|
| `time_pattern` | Продуктивность по времени | "Лучшая продуктивность с 9 до 12" |
| `task_pattern` | Паттерны по типам задач | "Короткие задачи выполняются стабильнее" |
| `comparison` | Сравнение с прошлым | "Рост третий месяц подряд" |
| `streak` | Паттерны по стрикам | "Чтение — 30 дней без пропусков" |
| `habit_pattern` | Паттерны привычек | "Утренние привычки держатся лучше вечерних" |
| `goal_pattern` | Паттерны целей | "Маленькие цели закрываются, большие застревают" |

### Логика расчёта

```javascript
function calculateMonthlyPatterns(user, monthData) {
  const patterns = [];

  // Time pattern
  if (monthData.tasks_by_time) {
    const times = monthData.tasks_by_time;
    if (times.morning > times.afternoon && times.morning > times.evening) {
      patterns.push({
        type: 'time_pattern',
        description: 'Лучшая продуктивность утром (до 12:00)'
      });
    }
  }

  // Comparison pattern
  if (monthData.previous_month_stats) {
    const diff = monthData.completion_rate - monthData.previous_month_stats.completion_rate;
    if (diff > 10) {
      patterns.push({
        type: 'comparison',
        description: `Рост +${diff}% по сравнению с прошлым месяцем`
      });
    } else if (diff < -10) {
      patterns.push({
        type: 'comparison',
        description: `Снижение ${diff}% по сравнению с прошлым месяцем`
      });
    }
  }

  // Streak pattern
  if (monthData.longest_streak && monthData.longest_streak.days >= 14) {
    patterns.push({
      type: 'streak',
      description: `${monthData.longest_streak.habit} — ${monthData.longest_streak.days} дней подряд`
    });
  }

  return patterns;
}
```

---

## Структура обзора

1. **Открытие** (1 предложение)
   - Констатация: X-й месяц прошёл

2. **Ключевые цифры** (1-2 предложения)
   - 2-3 главных метрики, не все
   - Completion rate обязательно
   - Цели/шаги или лучший streak

3. **Инсайт** (1-2 предложения)
   - Один паттерн из monthly_patterns
   - Или наблюдение из сравнения

4. **Вопрос** (1 предложение)
   - Конкретный вопрос на следующий месяц
   - Адаптирован под тип месяца

---

## Адаптация по типу месяца

### Первый месяц
- Акцент на "начало положено"
- Показать первые паттерны (если есть)
- Вопрос: что хочешь развить?

### Продуктивный месяц
- Признать прогресс без восторга
- Показать, что работает
- Вопрос: как закрепить / что сохранить?

### Сложный месяц
- Факты без осуждения
- Возможные причины (если есть данные)
- Вопрос: что мешало? как адаптировать?

### Рост
- Показать конкретные цифры изменения
- Отметить тренд (если не первый раз)
- Вопрос: что сработало?

### Спад
- Констатировать без оценки
- Упомянуть внешние факторы (если есть)
- Вопрос: что произошло? нужны ли изменения?

### Плато
- Констатировать стабильность
- Не навязывать оценку
- Вопрос: комфорт или застой?

---

## Частота

- **Обязательно:** 1 раз в месяц (конец месяца / начало нового)
- **По запросу:** когда пользователь просит
- **Не отправлять:** если меньше 20 дней данных за месяц

---

## Метрики успеха

| Метрика | Цель | Как измерять |
|---------|------|--------------|
| Open rate | >60% | % открытых monthly review |
| Engagement after | +10% | Активность в первую неделю после обзора |
| Goal setting | >30% | % пользователей, создавших/изменивших цели после обзора |
| Retention | correlation | Корреляция monthly review с retention |

---

## Принципы

1. **Объективность** — цифры, не оценки
2. **Один фокус** — не перечислять всё
3. **Без сравнения с другими** — только с собой
4. **Вопрос, не вердикт** — пользователь делает выводы
5. **Краткость** — 5-8 предложений максимум

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создана первая версия Monthly Review |
