# Система утренних уведомлений OnePercent

## Описание

Система генерации персонализированных утренних уведомлений от AI-наставника для пользователей OnePercent. Уведомления адаптивной длины (2-6 предложений), обозначают план на день (задачи и привычки) и дают фокус или предупреждение при необходимости.

## Файлы

1. **morning_notification_system_prompt.md** — Системный промпт для AI
2. **morning_notification_user_prompt_template.md** — Шаблон юзер промпта с переменными
3. **morning_notification_examples.md** — 13 примеров для разных сценариев
4. **morning_notification_integration.json** — Готовая структура для API

## Ключевые принципы

### Обязательные элементы
**Задачи:** количество или конкретные названия (если 1-3)
**Привычки:** всегда упоминаются, указывается streak если значительный
**Фокус:** выделение приоритета или предупреждение о проблеме

### Структура (2-6 предложений)
1. **Приветствие + план** — сколько задач, какие привычки, время
2. **Фокус дня** — приоритеты ИЛИ перегруз ИЛИ паттерн
3. **Предупреждение/совет** — только при наличии рисков (опционально)
4. **Связь с контекстом** — вчерашний день, streak, баланс (опционально)

### Правило длины
- **2-3 предложения:** обычный день без особенностей
- **4-5 предложений:** перегруз, паттерн переносов, связь со вчерашним днём
- **6 предложений:** критическая ситуация с несколькими уровнями проблем

### Стиль
- ✅ Конкретные названия задач в кавычках: «Интеграция API»
- ✅ Всегда упоминать привычки
- ✅ Деловой тон, без мотивационных клише
- ❌ Без "давай, ты сможешь", "отличный день"
- ❌ Без эмодзи
- ❌ Без перечисления всех задач при большом количестве (7+)

## Быстрый старт

### 1. Базовая интеграция

```javascript
const generateMorningNotification = async (userData) => {
  const systemPrompt = `
    Ты генерируешь ОДНО утреннее уведомление для пользователя OnePercent от лица его AI-наставника.
    
    Цель:
    1. Обозначить план на день (задачи и привычки)
    2. Дать фокус или приоритет, если нужно
    3. Предупредить о перегрузе или паттернах
    
    Правила:
    - Длина: 2-6 предложений (адаптируется под ситуацию)
    - Всегда упоминай задачи и привычки
    - Задачи в кавычках: «Интеграция API»
    - Без клише ("давай", "ты сможешь")
    - Без эмодзи
    
    Правило длины:
    - 2-3 предложения: обычный день
    - 4-5 предложений: перегруз или паттерн
    - 6 предложений: критическая ситуация
  `;

  const userPrompt = `
    Имя: ${userData.user_name}
    День недели: ${userData.day_of_week}
    
    ПЛАН НА ДЕНЬ:
    - Задач: ${userData.planned_steps}
    - Время работы: ${userData.total_estimated_time}
    - Доступное время: ${userData.available_time}
    
    ${userData.task_list}
    
    Привычки:
    ${userData.habits_list}
    
    КОНТЕКСТ: ${userData.context_insights}
    Вчера выполнено: ${userData.yesterday_completion}%
    
    Создай утреннее уведомление (2-6 предложений). 
    Обязательно упомяни задачи и привычки.
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
      max_tokens: 300,
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
const prepareMorningData = async (userId) => {
  // Получаем план на сегодня
  const todayPlan = await getTodayPlan(userId);
  
  // Получаем привычки
  const habits = await getTodayHabits(userId);
  
  // Анализируем контекст
  const insights = await analyzeMorningContext(userId);
  
  // Форматируем список задач
  const taskList = formatTaskList(todayPlan.steps);
  
  // Форматируем список привычек
  const habitsList = formatHabitsList(habits);
  
  return {
    user_name: user.firstName,
    day_of_week: getDayName(),
    planned_steps: todayPlan.steps.length,
    total_estimated_time: calculateTotalTime(todayPlan.steps),
    available_time: user.availableTimeToday,
    task_list: taskList,
    habits_list: habitsList,
    context_insights: formatMorningInsights(insights),
    yesterday_completion: await getYesterdayCompletion(userId),
    communication_style: user.profile.communicationStyle
  };
};
```

### 3. Форматирование списка задач

```javascript
const formatTaskList = (steps) => {
  const count = steps.length;
  
  // Если задач 1-3: перечислить все
  if (count <= 3) {
    return 'Задачи: ' + steps.map(s => 
      `${s.title} (${s.estimatedTime})`
    ).join(', ');
  }
  
  // Если задач 4-6: количество + критичные
  if (count <= 6) {
    const critical = steps.filter(s => s.priority === 'high');
    const byGoal = groupByGoal(steps);
    return `${count} задачи в плане: ${describeGrouping(byGoal)}`;
  }
  
  // Если задач 7+: только количество + критичные
  const critical = steps
    .filter(s => s.priority === 'high' || s.goal?.important)
    .slice(0, 2);
  
  return `${count} задач, критичные: ` + critical.map(s =>
    `${s.title}${s.goal ? ` (цель: ${s.goal.title})` : ''}`
  ).join(', ');
};
```

### 4. Форматирование списка привычек

```javascript
const formatHabitsList = (habits) => {
  if (!habits || habits.length === 0) {
    return 'Нет привычек в плане';
  }
  
  return habits.map(h => {
    const streak = h.currentStreak >= 10 
      ? ` (streak: ${h.currentStreak} дней)` 
      : '';
    return `- ${h.title}${streak}`;
  }).join('\n');
};
```

### 5. Анализ утреннего контекста

```javascript
const analyzeMorningContext = async (userId) => {
  const insights = [];
  
  // Проверка перегруза
  const plan = await getTodayPlan(userId);
  const totalTime = calculateTotalTime(plan.steps);
  const available = await getAvailableTime(userId);
  
  if (totalTime > available * 1.5) {
    insights.push({
      type: 'overload',
      severity: 'critical',
      message: `⚠️ КРИТИЧЕСКИЙ ПЕРЕГРУЗ: ${totalTime} часов при ${available} свободных`
    });
  } else if (totalTime > available) {
    insights.push({
      type: 'overload',
      severity: 'warning',
      message: `⚠️ ПЕРЕГРУЗ: запланировано ${totalTime} часов при ${available} свободных`
    });
  }
  
  // Проверка паттернов переносов
  const postponed = await getPostponedSteps(userId, 3);
  if (postponed.length > 0) {
    postponed.forEach(step => {
      insights.push({
        type: 'pattern',
        message: `Паттерн: '${step.title}' переносится ${step.count} раз`
      });
    });
  }
  
  // Проверка дисбаланса ССП
  const sspBalance = await checkSSPBalance(userId, plan.steps);
  if (sspBalance.imbalance) {
    insights.push({
      type: 'ssp_imbalance',
      message: `Дисбаланс ССП: ${sspBalance.low} ${sspBalance.lowScore} vs ${sspBalance.high} ${sspBalance.highScore}`
    });
  }
  
  // Проверка застоя важных целей
  const stagnation = await checkGoalStagnation(userId);
  if (stagnation) {
    insights.push({
      type: 'goal_stagnation',
      message: `Застой важной цели: '${stagnation.title}' - ${stagnation.weeks} недель без движения`
    });
  }
  
  return insights;
};

const formatMorningInsights = (insights) => {
  if (insights.length === 0) {
    return 'Нет особенностей';
  }
  
  // Приоритет: критический перегруз > паттерн > обычный перегруз > остальное
  const sorted = insights.sort((a, b) => {
    const priority = {
      'overload_critical': 1,
      'pattern': 2,
      'overload_warning': 3,
      'ssp_imbalance': 4,
      'goal_stagnation': 5
    };
    return (priority[a.type] || 99) - (priority[b.type] || 99);
  });
  
  return sorted.map(i => i.message).join('. ');
};
```

### 6. Отправка уведомления

```javascript
const sendMorningNotification = async (userId) => {
  // Проверяем время (7:00-8:00 по локальному времени)
  const userTimezone = await getUserTimezone(userId);
  const currentHour = new Date().toLocaleString('en-US', {
    timeZone: userTimezone,
    hour: 'numeric',
    hour12: false
  });
  
  // Можно адаптировать под пик продуктивности
  const user = await getUser(userId);
  const optimalHour = user.profile.peakProductivity === 'утро' ? 7 : 8;
  
  if (currentHour !== optimalHour) {
    return; // Не время для уведомления
  }
  
  // Проверяем, не отправляли ли уже сегодня
  const alreadySent = await checkIfNotificationSentToday(userId, 'morning');
  if (alreadySent) return;
  
  // Подготавливаем данные
  const data = await prepareMorningData(userId);
  
  // Генерируем уведомление
  const notification = await generateMorningNotification(data);
  
  // Отправляем
  await sendPushNotification(userId, {
    title: 'План на день',
    body: notification,
    data: {
      type: 'morning_plan',
      action: 'open_planner'
    }
  });
  
  // Логируем
  await logNotificationSent(userId, 'morning', notification);
};
```

## Примеры вывода

### Обычный день (2 предложения)
```
Дима, на сегодня 5 задач, около 4 часов работы. Из привычек: зарядка и медитация.
```

### Обычный день с деталями (3 предложения)
```
Среда, 4 задачи в плане: 2 по MVP, 1 по почте, 1 по документации. Плюс зарядка. Времени достаточно, 3.5 часа работы при 5 свободных.
```

### Перегруз (4 предложения)
```
На сегодня 8 задач — это 7 часов работы при 4 свободных. Перегруз. Что реально критично? Я бы оставил «Интеграция API» и «Тестирование формы» — это двигает MVP вперёд.
```

### Паттерн переносов (3 предложения)
```
Сегодня 5 задач, среди них «Написать контент-план», который переносится четвёртый раз. Плюс зарядка и медитация. Может, сегодня закроешь этот пункт?
```

### День после провала (4 предложения)
```
Вчера 1 из 5, но сегодня новый день. В плане 4 задачи, начни с «Ответить на письма» — это 15 минут. Потом легче будет взяться за «Интеграцию API». Зарядка и медитация тоже в списке.
```

### Критический перегруз (6 предложений)
```
На сегодня 10 задач — это больше 8 часов при 4 свободных. Вчера тоже был перегруз, закрыл только 3 из 7. Так система не работает. Выбери 2-3 задачи, которые реально двигают MVP: «Интеграция API», «Тестирование формы». Остальное — когда будет время. Зарядка в плане — это единственное для здоровья, которое на 4.
```

## Определение перегруза

```javascript
const detectOverload = (totalTime, availableTime) => {
  const ratio = totalTime / availableTime;
  
  if (ratio >= 1.5) {
    return {
      level: 'critical',
      detected: true,
      message: `⚠️ КРИТИЧЕСКИЙ ПЕРЕГРУЗ: ${totalTime} часов при ${availableTime} свободных`
    };
  }
  
  if (ratio > 1.1) {
    return {
      level: 'warning',
      detected: true,
      message: `⚠️ ПЕРЕГРУЗ: запланировано ${totalTime} часов при ${availableTime} свободных`
    };
  }
  
  return {
    level: 'none',
    detected: false
  };
};
```

## Настройки

### Параметры генерации
```javascript
const GENERATION_CONFIG = {
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 300,
  temperature: 0.7,
  top_p: 0.9
};
```

### Время отправки
```javascript
const NOTIFICATION_CONFIG = {
  defaultHour: 7,  // 7:00 утра
  adaptToProductivity: true,  // Адаптировать под пик продуктивности
  maxPerDay: 1,
  retryAttempts: 2,
  retryDelay: 10 * 60 * 1000  // 10 минут
};

const PRODUCTIVITY_HOURS = {
  'утро': 7,
  'день': 9,
  'вечер': 8  // Раньше, чтобы успеть спланировать
};
```

### Fallback
```javascript
const FALLBACK_MORNING = (userName, planCount, habitsList) => 
  `${userName}, на сегодня ${planCount} задач. ${habitsList}`;
```

## Мониторинг

### Метрики
- Процент открытий утренних уведомлений
- Процент выполнения плана в дни с уведомлениями vs без
- Время отклика на уведомление
- Эффективность предупреждений о перегрузе

### A/B тесты
1. Время отправки (7:00 vs 8:00 vs адаптивное)
2. Детализация задач (все vs только приоритеты)
3. Упоминание streak (всегда vs при 10+)

## Troubleshooting

### Проблема: Уведомления игнорируются
**Решение:** 
- Проверь время отправки (адаптируй под пользователя)
- Убедись, что задачи и привычки упомянуты
- Сделай фокус более конкретным

### Проблема: Слишком много текста
**Решение:** При 7+ задачах не перечисляй все, только критичные

### Проблема: Не предупреждает о перегрузе
**Решение:** Проверь логику detectOverload, порог может быть слишком высоким

## Интеграция с вечерними уведомлениями

Утренние и вечерние уведомления должны работать в связке:

```javascript
// Утром: план на день
const morning = await generateMorningNotification(morningData);
// Вечером: итоги дня
const evening = await generateEveningNotification(eveningData);

// Связь через context
eveningData.morning_plan = morningData.planned_steps;
eveningData.morning_focus = extractFocus(morning);
```

## Roadmap

- [ ] Адаптивное время на основе фактического начала работы
- [ ] Предложение изменить план при систематическом перегрузе
- [ ] Интеграция с погодой (для привычек на улице)
- [ ] Умные напоминания о забытых привычках
- [ ] Еженедельный обзор в понедельник

## Контакты

Вопросы и предложения: через GitHub Issues или напрямую команде OnePercent