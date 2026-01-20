# Система вечерних уведомлений OnePercent

## Описание

Система генерации персонализированных вечерних уведомлений от AI-наставника для пользователей OnePercent. Уведомления адаптивной длины (2-6 предложений в зависимости от сложности ситуации), конкретные и соответствуют стилю ментора из основного промпта.

## Файлы

1. **evening_notification_system_prompt.md** — Системный промпт для AI
2. **evening_notification_user_prompt_template.md** — Шаблон юзер промпта с переменными
3. **evening_notification_examples.md** — 10+ примеров для разных сценариев
4. **evening_notification_integration.json** — Готовая структура для API

## Ключевые принципы

### Приоритет #1: Дневник
Если пользователь не заполнил дневник — это ВСЕГДА главный фокус уведомления. Всё остальное вторично.

### Структура (2-6 предложений)
1. **Факт дня** — констатация с цифрами
2. **Основной инсайт** — призыв к дневнику ИЛИ паттерн
3. **Дополнительный контекст** — только для сложных паттернов (опционально)
4. **Вопрос** — опционально, только при явной проблеме

### Правило длины
- **2-3 предложения:** простые ситуации, дневник не заполнен, один очевидный паттерн
- **4-5 предложений:** комплексные паттерны, нужен контекст для понимания
- **6 предложений:** критические или системные ситуации с несколькими уровнями

### Стиль
- ✅ Прямо, без воды
- ✅ Конкретные цифры и факты
- ✅ Один основной фокус на уведомление
- ❌ Без клише ("молодец", "отличная работа")
- ❌ Без эмодзи
- ❌ Без излишней многословности (7+ предложений)

## Быстрый старт

### 1. Базовая интеграция

```javascript
const generateEveningNotification = async (userData) => {
  const systemPrompt = `
    Ты генерируешь ОДНО вечернее уведомление для пользователя OnePercent от лица его AI-наставника.
    
    Цель:
    1. Подвести итог дня на основе данных
    2. Мотивировать заполнить дневник (если ещё не заполнен)
    3. Дать один конкретный инсайт
    
    Правила:
    - Длина: 2-6 предложений (адаптируется под сложность)
    - Конкретные цифры из статистики
    - Без клише ("молодец", "отличная работа")
    - Без эмодзи
    - Один основной фокус
    
    Правило длины:
    - 2-3 предложения: простые ситуации
    - 4-5 предложений: комплексные паттерны
    - 6 предложений: критические ситуации
    
    Если дневник не заполнен — это ВСЕГДА главный приоритет.
  `;

  const userPrompt = `
    Имя: ${userData.user_name}
    Дата: ${userData.date}
    Дневник заполнен: ${userData.journal_filled}
    
    ИТОГИ ДНЯ:
    - Запланировано: ${userData.planned_steps}
    - Выполнено: ${userData.completed_steps}
    - Процент: ${userData.completion_rate}%
    - XP: ${userData.xp_earned}
    - Привычки: ${userData.habits_done}/${userData.habits_total}
    - Streak: ${userData.current_streak} дней
    
    ИНСАЙТЫ: ${userData.context_insights}
    
    СТИЛЬ: ${userData.communication_style}
    
    Создай короткое вечернее уведомление (2-3 предложения).
  `;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 300,  // Увеличено для поддержки до 6 предложений
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
};
```

### 2. Подготовка данных

```javascript
const prepareNotificationData = async (userId) => {
  // Получаем статистику дня
  const todayStats = await getTodayStats(userId);
  
  // Проверяем заполнен ли дневник
  const journalFilled = await isJournalFilledToday(userId);
  
  // Анализируем паттерны
  const insights = await analyzePatterns(userId);
  
  return {
    user_name: user.firstName,
    date: new Date().toISOString().split('T')[0],
    journal_filled: journalFilled,
    planned_steps: todayStats.planned,
    completed_steps: todayStats.completed,
    completion_rate: todayStats.rate,
    xp_earned: todayStats.xp,
    habits_done: todayStats.habits.done,
    habits_total: todayStats.habits.total,
    current_streak: user.currentStreak,
    context_insights: formatInsights(insights),
    communication_style: user.profile.communicationStyle,
    peak_productivity: user.profile.peakProductivity
  };
};
```

### 3. Форматирование инсайтов

```javascript
const formatInsights = (analysis) => {
  const insights = [];
  
  // Приоритет 1: Паттерны переносов
  if (analysis.postponedSteps?.length > 0) {
    const step = analysis.postponedSteps[0];
    insights.push(
      `Паттерн: задача '${step.title}' переносится ${step.count} раз`
    );
  }
  
  // Приоритет 2: Дисбаланс ССП
  else if (analysis.sspImbalance) {
    insights.push(
      `Дисбаланс ССП: ${analysis.sspImbalance.low} ${analysis.sspImbalance.lowScore} vs ${analysis.sspImbalance.high} ${analysis.sspImbalance.highScore}`
    );
  }
  
  // Приоритет 3: Застой цели
  else if (analysis.goalStagnation) {
    insights.push(
      `Застой цели: '${analysis.goalStagnation.title}' - ${analysis.goalStagnation.weeks} недель без прогресса`
    );
  }
  
  // Приоритет 4: Перегруз
  else if (analysis.overload) {
    insights.push(
      `Перегруз: запланировано ${analysis.overload.planned} часов при ${analysis.overload.available} свободных`
    );
  }
  
  // Приоритет 5: Streak под угрозой
  else if (analysis.streakAtRisk) {
    insights.push('Streak под угрозой: день без активности');
  }
  
  // Нет инсайтов
  else {
    insights.push('Нет явных паттернов');
  }
  
  return insights.join('. ');
};
```

### 4. Отправка уведомления

```javascript
const sendEveningNotification = async (userId) => {
  // Проверяем время (21:00-22:00 по локальному времени)
  const userTimezone = await getUserTimezone(userId);
  const currentHour = new Date().toLocaleString('en-US', {
    timeZone: userTimezone,
    hour: 'numeric',
    hour12: false
  });
  
  if (currentHour < 21 || currentHour >= 22) {
    return; // Не время для уведомления
  }
  
  // Проверяем, не отправляли ли уже сегодня
  const alreadySent = await checkIfNotificationSentToday(userId);
  if (alreadySent) return;
  
  // Подготавливаем данные
  const data = await prepareNotificationData(userId);
  
  // Генерируем уведомление
  const notification = await generateEveningNotification(data);
  
  // Отправляем через push/email/in-app
  await sendPushNotification(userId, {
    title: 'Итоги дня',
    body: notification,
    data: {
      type: 'evening_summary',
      action: 'open_journal'
    }
  });
  
  // Логируем отправку
  await logNotificationSent(userId, notification);
};
```

## Примеры вывода

### Дневник не заполнен, нормальный день (2 предложения)
```
Дима, 3 из 5 задач закрыл, +45 XP. Запиши в дневник, что помешало с двумя оставшимися?
```

### Дневник не заполнен, провал (2 предложения)
```
Сегодня 0 из 4 — или задачи были не те, или энергии не было. Запиши в дневник, что на самом деле произошло?
```

### Дневник заполнен, есть паттерн (3 предложения)
```
День на 60%, но «Написать пост» переносится четвёртый раз. Страшно публиковать или задача вообще не про результат?
```

### Дневник заполнен, дисбаланс ССП (3 предложения)
```
Все 5 задач по работе закрыл, +70 XP. Но здоровье на 4, а карьера на 8 — третий день без зарядки.
```

### Дневник заполнен, всё отлично (2 предложения)
```
5 из 5, все привычки закрыл, streak 15 дней. Система работает.
```

### Дневник заполнен, комплексный паттерн выгорания (5 предложений)
```
За неделю выполнение упало с 70% до 40%, здоровье снизилось до 3, и три дня подряд в дневнике про усталость. Это не лень — это сигнал, что организм просит паузу. Что сейчас поможет реально восстановиться?
```

### Дневник заполнен, критическая системная проблема (6 предложений)
```
Месяц без движения по «Запуску MVP», при этом здоровье на 3 и completion rate 25% последние две недели. За это время закрыл 15 шагов, но все по мелким целям вроде «Навести порядок» и «Почитать книгу». Это классическое избегание через псевдопродуктивность. MVP страшный? Или на самом деле не нужен?
```

## Анализ паттернов

### Переносы задач
```javascript
const analyzePostponements = async (userId) => {
  const steps = await getStepsWithHistory(userId);
  const postponed = steps
    .filter(s => s.postponeCount >= 3)
    .sort((a, b) => b.postponeCount - a.postponeCount);
  
  return postponed.length > 0 ? postponed[0] : null;
};
```

### Дисбаланс ССП
```javascript
const analyzeSSPBalance = async (userId) => {
  const ssp = await getSSPScores(userId);
  const scores = Object.entries(ssp);
  const sorted = scores.sort((a, b) => a[1] - b[1]);
  
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const gap = highest[1] - lowest[1];
  
  if (gap >= 3) {
    return {
      low: lowest[0],
      lowScore: lowest[1],
      high: highest[0],
      highScore: highest[1]
    };
  }
  
  return null;
};
```

### Застой цели
```javascript
const analyzeGoalStagnation = async (userId) => {
  const goals = await getActiveGoals(userId);
  
  for (const goal of goals) {
    const weeksSinceUpdate = getWeeksSince(goal.lastProgressDate);
    const hasOnlyPreparationSteps = goal.steps.every(
      s => s.isCompleted && s.tags.includes('preparation')
    );
    
    if (weeksSinceUpdate >= 3 && hasOnlyPreparationSteps) {
      return {
        title: goal.title,
        weeks: weeksSinceUpdate
      };
    }
  }
  
  return null;
};
```

## Настройки

### Параметры генерации
```javascript
const GENERATION_CONFIG = {
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 300,  // Поддержка до 6 предложений
  temperature: 0.7,
  top_p: 0.9
};
```

### Время отправки
```javascript
const NOTIFICATION_CONFIG = {
  startHour: 21,  // 21:00
  endHour: 22,    // 22:00
  maxPerDay: 1,   // Максимум уведомлений в день
  retryAttempts: 3,
  retryDelay: 5 * 60 * 1000 // 5 минут
};
```

### Fallback
```javascript
const FALLBACK_NOTIFICATION = (userName) => 
  `${userName}, день завершён. Запиши итоги в дневник?`;
```

### Персонализация
```javascript
const TONE_BY_DAYS = {
  0-7: 'мягкий',      // Первая неделя
  8-30: 'нейтральный', // Первый месяц
  31: 'прямой'         // После месяца
};
```

## Мониторинг

### Метрики
- Процент открытий уведомлений
- Процент заполнений дневника после уведомления
- Время отклика на уведомление
- Качество генерации (ручная проверка выборки)

### A/B тесты
1. Время отправки (21:00 vs 22:00)
2. Длина уведомления (2 vs 3 предложения)
3. Тональность (мягкий vs прямой)
4. Наличие XP в тексте

## Troubleshooting

### Проблема: Уведомления слишком общие
**Решение:** Проверь качество входных данных, особенно context_insights

### Проблема: Уведомления игнорируются
**Решение:** 
- Проверь время отправки
- Увеличь конкретику (больше цифр и названий задач)
- Уменьши частоту

### Проблема: Тон не соответствует ситуации
**Решение:** Убедись, что communication_style передаётся корректно

## Roadmap

- [ ] Адаптивное время отправки на основе активности пользователя
- [ ] Поддержка голосовых уведомлений
- [ ] Интеграция с контекстом из чата с ментором
- [ ] Персональные триггеры (custom insights)
- [ ] ML для оптимизации времени отправки

## Контакты

Вопросы и предложения: через GitHub Issues или напрямую команде OnePercent