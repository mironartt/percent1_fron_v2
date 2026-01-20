# ПРИМЕРЫ: Monthly Review

---

## ПЕРВЫЙ МЕСЯЦ

### Пример 1.1: Хороший старт

**Входные данные:**
```json
{
  "user_name": "Дмитрий",
  "month_number": 1,
  "monthly_stats": {
    "tasks_completed": 45,
    "tasks_planned": 60,
    "completion_rate": 75,
    "active_goals": 4,
    "goals_completed": 1,
    "steps_completed": 23,
    "active_habits": 3,
    "habit_days": 22,
    "total_days": 30,
    "longest_streak": {
      "habit": "Утренняя зарядка",
      "days": 18
    },
    "journal_entries": 20,
    "xp_earned": 1250,
    "current_level": 5
  },
  "monthly_patterns": [
    {"type": "time_pattern", "description": "Лучшая продуктивность с 9 до 12 утра"},
    {"type": "task_pattern", "description": "Короткие задачи (до 30 мин) выполняются стабильнее"}
  ]
}
```

**Ожидаемый результат:**
```
Первый месяц — 30 дней в системе.

Ключевые цифры: 75% задач выполнено, 23 шага по целям закрыто, streak по зарядке — 18 дней.

Заметил паттерн: утро (9-12) — твоё продуктивное время. Короткие задачи до 30 минут идут стабильнее длинных.

На следующий месяц: что хочешь развить — утреннюю продуктивность или научиться справляться с длинными задачами?
```

---

### Пример 1.2: Сложный старт

**Входные данные:**
```json
{
  "user_name": "Ольга",
  "month_number": 1,
  "monthly_stats": {
    "tasks_completed": 15,
    "tasks_planned": 50,
    "completion_rate": 30,
    "active_goals": 3,
    "goals_completed": 0,
    "steps_completed": 8,
    "active_habits": 2,
    "habit_days": 10,
    "total_days": 30,
    "journal_entries": 12,
    "xp_earned": 450,
    "current_level": 2
  },
  "monthly_patterns": [
    {"type": "task_pattern", "description": "Много переносов задач — возможно, перегруз планирования"}
  ]
}
```

**Ожидаемый результат:**
```
Первый месяц прошёл. 30% задач выполнено, 8 шагов по целям.

Начало — это уже результат. Данные показывают много переносов. Возможно, планы были слишком амбициозными для старта.

Вопрос на следующий месяц: что мешало больше всего — объём задач, время, или что-то другое?
```

---

## ПРОДУКТИВНЫЙ МЕСЯЦ (completion >60%)

### Пример 2.1: Стабильно высокий

**Входные данные:**
```json
{
  "user_name": "Максим",
  "month_number": 4,
  "monthly_stats": {
    "tasks_completed": 85,
    "tasks_planned": 100,
    "completion_rate": 85,
    "active_goals": 5,
    "goals_completed": 2,
    "steps_completed": 42,
    "active_habits": 4,
    "habit_days": 28,
    "total_days": 30,
    "longest_streak": {
      "habit": "Чтение",
      "days": 30
    },
    "journal_entries": 25,
    "xp_earned": 2100,
    "current_level": 12
  },
  "previous_month_stats": {
    "completion_rate": 82,
    "tasks_completed": 78,
    "xp_earned": 1950
  },
  "comparison": {
    "completion_rate_change": "+3%",
    "tasks_change": "+7",
    "xp_change": "+150"
  },
  "monthly_patterns": [
    {"type": "streak", "description": "Чтение — 30 дней подряд, полный месяц"}
  ]
}
```

**Ожидаемый результат:**
```
Четвёртый месяц. 85% задач, 2 цели закрыты, чтение — 30 дней подряд без пропусков.

Рост по сравнению с прошлым месяцем: +3% completion rate, +7 задач. Система работает стабильно.

Вопрос: что из текущего подхода хочешь сохранить, а что — попробовать изменить?
```

---

### Пример 2.2: Прорыв после застоя

**Входные данные:**
```json
{
  "user_name": "Анна",
  "month_number": 3,
  "monthly_stats": {
    "tasks_completed": 70,
    "tasks_planned": 90,
    "completion_rate": 78,
    "active_goals": 4,
    "goals_completed": 1,
    "steps_completed": 35,
    "xp_earned": 1800,
    "current_level": 8
  },
  "previous_month_stats": {
    "completion_rate": 45,
    "tasks_completed": 40,
    "xp_earned": 900
  },
  "comparison": {
    "completion_rate_change": "+33%",
    "tasks_change": "+30",
    "xp_change": "+900"
  },
  "monthly_patterns": [
    {"type": "comparison", "description": "Резкий рост после смены подхода к планированию"}
  ]
}
```

**Ожидаемый результат:**
```
Третий месяц — прорыв. 78% completion rate против 45% в прошлом месяце. Почти вдвое больше задач.

Что-то явно изменилось. Данные показывают другой подход к планированию.

Что именно сработало? Это стоит зафиксировать и сохранить.
```

---

## СЛОЖНЫЙ МЕСЯЦ (completion <40%)

### Пример 3.1: Спад

**Входные данные:**
```json
{
  "user_name": "Игорь",
  "month_number": 5,
  "monthly_stats": {
    "tasks_completed": 25,
    "tasks_planned": 80,
    "completion_rate": 31,
    "active_goals": 6,
    "goals_completed": 0,
    "steps_completed": 12,
    "active_habits": 3,
    "habit_days": 8,
    "total_days": 30,
    "journal_entries": 5,
    "xp_earned": 350,
    "current_level": 10
  },
  "previous_month_stats": {
    "completion_rate": 65,
    "tasks_completed": 55,
    "xp_earned": 1400
  },
  "comparison": {
    "completion_rate_change": "-34%",
    "tasks_change": "-30",
    "xp_change": "-1050"
  }
}
```

**Ожидаемый результат:**
```
Пятый месяц. 31% задач выполнено, против 65% в прошлом. Заметное снижение.

Это не приговор — это данные. Месяц мог быть сложным по разным причинам: внешние обстоятельства, усталость, потеря фокуса.

Что происходило в этом месяце? И нужно ли что-то менять в подходе?
```

---

### Пример 3.2: Объективные причины

**Входные данные:**
```json
{
  "user_name": "Елена",
  "month_number": 2,
  "monthly_stats": {
    "tasks_completed": 20,
    "tasks_planned": 60,
    "completion_rate": 33,
    "active_goals": 3,
    "goals_completed": 0,
    "steps_completed": 10,
    "journal_entries": 8,
    "xp_earned": 280
  },
  "notable_events": [
    "Болела 2 недели",
    "Переезд в новую квартиру"
  ]
}
```

**Ожидаемый результат:**
```
Второй месяц. 33% задач на фоне болезни и переезда.

Это не провал — это реальность. Когда жизнь вмешивается, планы отходят. 10 шагов по целям всё равно сделано.

На следующий месяц: восстановление или сразу к прежнему темпу?
```

---

## РОСТ (vs прошлый месяц)

### Пример 4.1: Стабильный рост

**Входные данные:**
```json
{
  "user_name": "Виктория",
  "month_number": 6,
  "monthly_stats": {
    "tasks_completed": 75,
    "tasks_planned": 95,
    "completion_rate": 79,
    "goals_completed": 2,
    "steps_completed": 38,
    "xp_earned": 1900
  },
  "previous_month_stats": {
    "completion_rate": 72,
    "tasks_completed": 65,
    "xp_earned": 1650
  },
  "comparison": {
    "completion_rate_change": "+7%",
    "tasks_change": "+10",
    "xp_change": "+250"
  },
  "monthly_patterns": [
    {"type": "comparison", "description": "Третий месяц подряд — рост"}
  ]
}
```

**Ожидаемый результат:**
```
Шестой месяц. 79% completion rate, +7% к прошлому месяцу. Третий месяц роста подряд.

Это не случайность — это тренд. 2 цели закрыты, 38 шагов.

Вопрос: что поддерживает этот рост? Стоит осознать, чтобы не потерять.
```

---

## PLATEAU (стабильность)

### Пример 5.1: Комфортное плато

**Входные данные:**
```json
{
  "user_name": "Сергей",
  "month_number": 7,
  "monthly_stats": {
    "tasks_completed": 60,
    "tasks_planned": 80,
    "completion_rate": 75,
    "goals_completed": 1,
    "steps_completed": 30,
    "xp_earned": 1500
  },
  "previous_month_stats": {
    "completion_rate": 74,
    "tasks_completed": 58,
    "xp_earned": 1480
  },
  "comparison": {
    "completion_rate_change": "+1%",
    "tasks_change": "+2",
    "xp_change": "+20"
  }
}
```

**Ожидаемый результат:**
```
Седьмой месяц. 75% — примерно как в прошлом. Стабильность.

Плато может быть разным: комфортный круиз-контроль или застой перед следующим шагом.

Вопрос: это осознанный темп или хочется чего-то другого?
```

---

### Пример 5.2: Застой

**Входные данные:**
```json
{
  "user_name": "Николай",
  "month_number": 4,
  "monthly_stats": {
    "tasks_completed": 40,
    "tasks_planned": 80,
    "completion_rate": 50,
    "goals_completed": 0,
    "steps_completed": 18,
    "xp_earned": 800
  },
  "previous_month_stats": {
    "completion_rate": 52,
    "tasks_completed": 42
  },
  "comparison": {
    "completion_rate_change": "-2%",
    "tasks_change": "-2"
  },
  "monthly_patterns": [
    {"type": "task_pattern", "description": "Третий месяц на уровне 50% — возможно, потолок текущего подхода"}
  ]
}
```

**Ожидаемый результат:**
```
Четвёртый месяц. 50% — третий месяц на этом уровне. Ни роста, ни падения.

Это может быть потолком текущего подхода. Или просто устойчивый режим.

Вопрос: 50% — это то, к чему стремишься, или хочется выше?
```

---

## ОСОБЫЕ ДОСТИЖЕНИЯ

### Пример 6.1: Level Up

**Входные данные:**
```json
{
  "user_name": "Павел",
  "month_number": 3,
  "monthly_stats": {
    "tasks_completed": 90,
    "tasks_planned": 100,
    "completion_rate": 90,
    "goals_completed": 3,
    "steps_completed": 50,
    "xp_earned": 2500,
    "current_level": 15,
    "level_ups": 3
  },
  "monthly_patterns": [
    {"type": "streak", "description": "Все 4 привычки — минимум 20 дней каждая"}
  ]
}
```

**Ожидаемый результат:**
```
Третий месяц — рекордный. 90% completion, 3 цели закрыты, 3 уровня за месяц.

Все 4 привычки держатся стабильно: минимум 20 дней каждая. Это серьёзная база.

Вопрос: как сохранить этот темп или это был спринт, после которого нужен отдых?
```

---

## АНТИПРИМЕРЫ (как НЕ надо)

### Плохо: Перечисление всех метрик
```
В этом месяце ты выполнил 75 задач из 100 (75%), закрыл 2 цели, сделал 38 шагов, вёл дневник 25 дней, заработал 1900 XP, поднялся на 12 уровень, твой лучший streak — 18 дней по чтению, ты был активен 28 дней из 30...
```

### Плохо: Оценочные суждения
```
Отличный месяц! Ты большой молодец! Так держать! Невероятный прогресс!
```

### Плохо: Сравнение с другими
```
Ты в топ-10% пользователей по продуктивности! Большинство делают меньше.
```

### Плохо: Игнорирование спада
```
Месяц был разным, но главное — ты продолжаешь! Всё будет лучше!
```

### Плохо: Слишком много вопросов
```
Что сработало? Что не сработало? Как планируешь следующий месяц? Какие привычки хочешь добавить? Какие цели в приоритете?
```

---

## ЧЕКЛИСТ КАЧЕСТВА

Перед отправкой проверь:

- [ ] 5-8 предложений (не больше)
- [ ] 2-3 ключевых метрики (не все подряд)
- [ ] Один инсайт/паттерн
- [ ] Один вопрос на следующий месяц
- [ ] Нет "молодец", "супер", "отлично"
- [ ] Адаптировано под тип месяца
- [ ] Если спад — без осуждения
- [ ] Если рост — без восторга
- [ ] Конкретные цифры из данных
