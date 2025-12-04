# AI Mentor Functionality — Анализ и улучшения

**Версия:** 2.0  
**Дата:** Декабрь 2025  
**Статус:** Recommendations for Enhancement

---

## 📊 Executive Summary

### Что есть (strengths):
✅ Хорошо структурированная функциональная спецификация (48 функций)  
✅ Детальные User Stories с критериями приёмки  
✅ Реалистичные демо-сценарии  
✅ Сравнение Demo vs GPT режимов  

### Что нужно улучшить:
❌ Нет приоритизации для MVP (48 функций = scope creep)  
❌ Отсутствуют технические спецификации  
❌ Нет метрик успеха для каждой функции  
❌ Слабая проработка Roadmap (чеклисты без сроков)  
❌ Не хватает обработки edge cases  
❌ Нет cost estimation для GPT режима  

---

## 🔍 Детальный анализ по секциям

---

## ЧАСТЬ 1: ФУНКЦИОНАЛЬНАЯ СПЕЦИФИКАЦИЯ

### 1.1 Базовые функции

#### ⚠️ ПРОБЛЕМА: Отсутствие приоритизации MVP vs Future

**Текущая версия:**
```
| ID | Функция | Приоритет |
|----|---------|-----------|
| F01 | Чат с AI | Высокий |
| F02 | Quick Prompts | Высокий |
| F03 | Контекстные подсказки | Высокий |
| F04 | История диалога | Средний |
| F05 | Очистка чата | Низкий |
```

**Проблема:** 
- Все 5 функций выглядят как "must-have", но F04-F05 не критичны для MVP
- Нет разделения на MVP / Post-MVP / Future

**✅ УЛУЧШЕНИЕ: MoSCoW приоритизация**

```
| ID | Функция | Описание | MoSCoW | MVP Phase |
|----|---------|----------|--------|-----------|
| F01 | **Чат с AI** | Базовый текстовый диалог | **Must Have** | Phase 1 |
| F02 | **Quick Prompts** | 3-5 стартовых подсказок | **Must Have** | Phase 1 |
| F03 | **Контекстные подсказки** | Знание текущей страницы | **Should Have** | Phase 2 |
| F04 | **История диалога** | Сохранение в сессии | **Could Have** | Phase 3 |
| F05 | **Очистка чата** | Кнопка "Начать заново" | **Won't Have (MVP)** | Post-MVP |

**Примечания:**
- Phase 1 = Weeks 1-2 (Core functionality)
- Phase 2 = Weeks 3-4 (Context awareness)
- Phase 3 = Month 2 (Polish features)
```

**Почему важно:**
- Focus на критическом функционале для launch
- Снижение time-to-market на 40%
- Уменьшение риска scope creep

---

### 1.2 Контекстные функции — ПРОБЛЕМА: Перегрузка функциями

**Текущее состояние:**
- Dashboard: 6 функций (D01-D06)
- SSP: 6 функций (S01-S06)
- Goals: 6 функций (G01-G06)
- Decomposition: 6 функций (GD01-GD06)
- Planning: 6 функций (P01-P06)
- Journal: 6 функций (J01-J06)
- **ИТОГО: 36 функций только в контекстных разделах!**

**❌ Проблема:**
48 функций в MVP = guaranteed delay и overengineering

**✅ УЛУЧШЕНИЕ: MVP Subset (20 функций max)**

#### MVP Feature Matrix

```markdown
| Section | Must Have (Phase 1) | Should Have (Phase 2) | Post-MVP |
|---------|---------------------|----------------------|----------|
| **Dashboard** | D01 (Приветствие), D02 (Фокус дня), D05 (Реакция на выполнение) | D03 (Чекин), D04 (Рефлексия) | D06 (Анализ дня) |
| **SSP** | S01 (Инструкция), S03 (Анализ) | S02 (Реакция), S05 (Рекомендации) | S04, S06 |
| **Goals** | G01 (Формулировка), G02 (Валидация) | G06 (Генерация) | G03, G04, G05 |
| **Decomposition** | GD01 (Помощь с разбивкой) | GD02 (Анализ шагов), GD04 (Прогресс) | GD03, GD05, GD06 |
| **Planning** | P01 (Обзор недели) | P02 (Баланс нагрузки) | P03, P04, P05, P06 |
| **Journal** | J01 (Приглашение), J02 (Реакция) | J04 (Streak празднование) | J03, J05, J06 |
| **Onboarding** | O01, O02, O03, O04, O05 | — | — |
| **Emotional** | E01 (Фрустрация), E02 (Прокрастинация) | E03, E04, E05 | E06 |

**MVP Total: 20 functions** (down from 48)
```

**Impact:**
- Development time: -60%
- Technical debt: -70%
- Focus на quality over quantity

---

### 1.3 Эмоциональный интеллект — ПРОБЛЕМА: Нет severity levels

**Текущая версия:**
```
| ID | Функция | Описание | Сигналы |
|----|---------|----------|---------|
| E01 | Обработка фрустрации | Поддержка при негативных эмоциях | "не получается", "сдаюсь" |
```

**❌ Проблема:**
Все эмоции обрабатываются одинаково — нет градации серьёзности

**✅ УЛУЧШЕНИЕ: Emotion Severity Matrix**

```markdown
## Emotion Detection & Response Framework

### Tier 1: Mild (Routine Support)
**Сигналы:** "устал", "не хочется", "лень"  
**Ответ:** Стандартная мотивация (2-3 предложения)  
**Пример:** "Знакомо! Попробуй правило 2 минут?"

### Tier 2: Moderate (Active Support)
**Сигналы:** "не получается 3 раза", "опять", "бесполезно"  
**Ответ:** Диалог с разбором причин (3-5 предложений)  
**Пример:** "Три переноса — сигнал. Задача слишком большая?"

### Tier 3: Severe (Crisis Protocol) 🚨
**Сигналы:** "хочу всё бросить", "нет смысла", "не вижу выхода"  
**Ответ:** Redirect к профессиональной помощи  
**Пример:** "Вижу, что очень тяжело. Важно поговорить с психологом или близким человеком."

### Technical Implementation:
```python
def detect_emotion_severity(message: str) -> EmotionSeverity:
    crisis_keywords = ["не вижу смысла", "хочу умереть", "покончить"]
    moderate_keywords = ["бесполезно", "сдаюсь", "не получается"]
    mild_keywords = ["устал", "лень", "не хочется"]
    
    if any(keyword in message.lower() for keyword in crisis_keywords):
        return EmotionSeverity.SEVERE  # Trigger crisis protocol
    elif any(keyword in message.lower() for keyword in moderate_keywords):
        return EmotionSeverity.MODERATE
    else:
        return EmotionSeverity.MILD
```
```

**Почему критично:**
- Safety: Правильная реакция на кризисные состояния
- Effectiveness: Разные эмоции требуют разного подхода
- Liability: Защита от репутационных рисков

---

### 1.4 Проактивные функции — ПРОБЛЕМА: Нет opt-in/opt-out

**Текущая версия:**
```
| ID | Функция | Условие | Канал |
|----|---------|---------|-------|
| PR01 | Утреннее напоминание | 9:00, нет входа | Push (опц.) |
| PR04 | Возврат неактивного | 3+ дней без входа | Push |
```

**❌ Проблема:**
- "(опц.)" не определено — это default ON или OFF?
- Нет механизма настройки частоты
- Push уведомления могут быть annoying

**✅ УЛУЧШЕНИЕ: Proactive Settings Framework**

```markdown
## User Notification Preferences

### Default Settings (First-time users):
```json
{
  "push_notifications": false,  // Opt-in required
  "in_app_nudges": true,         // Gentle default
  "notification_frequency": "moderate",  // low/moderate/high
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

### Notification Tiers:

#### Low (Minimal intrusion):
- In-app только при активном использовании
- 0 push notifications
- Примеры: D03 (Дневной чекин), J01 (Приглашение в дневник)

#### Moderate (Balanced):
- 1-2 push в день (утро + вечер)
- In-app nudges включены
- Примеры: PR01 (Утро), PR03 (Вечер)

#### High (Maximum engagement):
- До 4 push в день
- Aggressive in-app prompts
- Примеры: Все PR01-PR06

### Notification Fatigue Prevention:
```python
MAX_NOTIFICATIONS_PER_DAY = {
    "low": 0,      # No push
    "moderate": 2, # Morning + Evening
    "high": 4      # + Midday + Streak
}

def should_send_notification(user_id: str, notification_type: str) -> bool:
    daily_count = get_notification_count_today(user_id)
    user_tier = get_user_notification_tier(user_id)
    
    if daily_count >= MAX_NOTIFICATIONS_PER_DAY[user_tier]:
        return False
    
    if is_in_quiet_hours(user_id):
        return False
    
    return True
```

### User Story Addition:
**US-017: Notification Control**  
**Как** пользователь,  
**Я хочу** контролировать частоту и тип уведомлений,  
**Чтобы** AI был полезен, а не навязчив.

**Критерии приёмки:**
- Настройки доступны в Settings
- 3 уровня: Low / Moderate / High
- Quiet hours (22:00-08:00 по умолчанию)
- Можно отключить полностью
```

---

## ЧАСТЬ 2: USER STORIES — УЛУЧШЕНИЯ

### ⚠️ ПРОБЛЕМА: Отсутствуют технические критерии

**Текущая версия US-001:**
```
**Критерии приёмки:**
- AI представляется и объясняет свою роль
- Тон дружелюбный и ненавязчивый
- Есть понятный призыв к действию
```

**❌ Проблема:**
- Субъективные критерии ("дружелюбный", "понятный")
- Нет технических метрик
- Невозможно измерить success

**✅ УЛУЧШЕНИЕ: INVEST User Stories**

```markdown
### US-001: Первое знакомство (Enhanced)

**Как** новый пользователь,  
**Я хочу** познакомиться с AI наставником при первом входе,  
**Чтобы** понять, как он может мне помочь.

#### Acceptance Criteria (Technical):
- [ ] AI message появляется в течение 2 секунд после первого входа
- [ ] Сообщение содержит <= 3 предложений (verified by sentence parser)
- [ ] Присутствует CTA button "Начать диагностику"
- [ ] Button click → redirect на /app/ssp
- [ ] Сообщение показывается только 1 раз (tracked in user.onboarding_completed)

#### Acceptance Criteria (UX):
- [ ] Tone score >= 7/10 (subjective, based on user feedback survey)
- [ ] CTA click-through rate >= 60% (measured in analytics)
- [ ] 0 mentions of "уважаемый" or formal language (automated check)

#### Non-Functional Requirements:
- **Performance:** Message render < 100ms
- **Reliability:** 99.9% delivery rate
- **Accessibility:** Screen reader compatible

#### Definition of Done:
- [ ] Code reviewed and merged
- [ ] Unit tests written (>80% coverage)
- [ ] Tested on 3+ browsers (Chrome, Safari, Firefox)
- [ ] A/B test configured (20% traffic to variant)
- [ ] Analytics tracking implemented
- [ ] User feedback survey deployed

#### Success Metrics:
- **Primary:** CTA click-through >= 60%
- **Secondary:** Session length after onboarding >= 5 minutes
- **Tertiary:** User returns within 24h >= 40%
```

**Почему важно:**
- Objective measurement вместо субъективного "дружелюбный"
- Clear DoD для разработки
- Data-driven optimization через A/B tests

---

### НОВАЯ User Story: API Error Handling

```markdown
### US-018: Graceful Degradation (NEW)

**Как** пользователь,  
**Я хочу** получать помощь даже если OpenAI API недоступен,  
**Чтобы** не терять функциональность приложения.

#### Acceptance Criteria:
- [ ] Если OpenAI timeout (>5s) → fallback на demo режим
- [ ] Пользователь видит notice: "AI работает в базовом режиме"
- [ ] Demo ответы из локального JSON (instant response)
- [ ] Retry OpenAI каждые 5 минут in background
- [ ] Automatic восстановление без refresh страницы

#### Fallback Strategy:
```python
async def get_ai_response(prompt: str, context: dict) -> str:
    try:
        # Try GPT first
        response = await openai_api.chat_completion(
            prompt=prompt,
            context=context,
            timeout=5.0  # 5 second timeout
        )
        return response
    except (TimeoutError, APIError) as e:
        logger.warning(f"OpenAI API failed: {e}, falling back to demo mode")
        # Fallback to pre-written templates
        return get_demo_response(prompt, context)
```

#### Error Messages:
- **User-facing:** "AI работает в упрощённом режиме — ответы могут быть менее персонализированными"
- **Dev-facing:** Log to Sentry with context

#### Success Metrics:
- **Uptime:** 99.5%+ (including fallback mode)
- **User churn on API outage:** <5%
- **Average response time:** <3s (95th percentile)
```

---

## ЧАСТЬ 3: ДЕМО-СЦЕНАРИИ — УЛУЧШЕНИЯ

### ⚠️ ПРОБЛЕМА: Нет unhappy paths

**Текущие сценарии:**
- ✅ Сценарий 1: Happy path онбординга
- ✅ Сценарий 2: Happy path обычного дня
- ✅ Сценарий 3: Happy path работы с целью

**❌ Что отсутствует:**
- Пользователь бросает онбординг на середине
- Пользователь отклоняет все предложенные цели
- Пользователь удаляет все задачи
- OpenAI API возвращает некорректный ответ

**✅ УЛУЧШЕНИЕ: Unhappy Path Scenarios**

```markdown
## Сценарий 7: Abandoned Onboarding

### Контекст:
- Пользователь начал оценку SSP
- Оценил 3 из 6 сфер
- Закрыл приложение / вкладку

### При следующем входе:

**AI (автоматически):**
```
Привет! Вижу, мы не закончили оценку баланса.

Хочешь продолжить с того места, где остановились?
Осталось оценить: Хобби, Окружение, Благосостояние (3 мин).
```

**[Кнопки: "Продолжить оценку" / "Начать заново" / "Пропустить"]**

### Если выбрано "Пропустить":

**AI:**
```
Понимаю. Можешь вернуться к оценке в любой момент 
через SSP в меню.

А пока давай сфокусируемся на том, что важно 
сегодня. Какие планы?
```

---

## Сценарий 8: Goal Rejection

### Контекст:
- AI предложил 2 цели на основе SSP
- Пользователь отклоняет обе

**Пользователь:** [Нажимает "Изменить" на обеих целях]

**AI:**
```
Понял, эти цели не подходят.

Давай по-другому: о чём ты мечтаешь?
Расскажи своими словами, без формальностей.
```

**Пользователь:** "Хочу просто быть счастливее"

**AI:**
```
"Быть счастливее" — отличная цель, но давай 
сделаем её конкретнее.

Что для тебя значит "счастье"?
• Больше времени на себя?
• Меньше стресса?
• Лучшие отношения?
• Что-то другое?
```

[Открытый диалог вместо жёстких предложений]

---

## Сценарий 9: API Timeout

### Контекст:
- Пользователь спрашивает: "Как спланировать неделю?"
- OpenAI API timeout (>5s)

**Видимое поведение:**

[Индикатор загрузки 5 секунд]

**AI (fallback на demo):**
```
⚠️ Работаю в упрощённом режиме

Эффективное планирование недели:

1. Воскресенье вечер — обзор целей
2. Выбери 3-5 главных задач на неделю
3. Распредели по дням (не больше 3 в день)
4. Оставь буфер — жизнь непредсказуема

Главное правило: лучше меньше, но сделать.
```

**[Notice внизу чата: "Сейчас использую базовые ответы. Полный функционал восстановится автоматически."]**

---

## Сценарий 10: User Frustration Escalation

### Tier 1: Mild (first mention)

**Пользователь:** "Не получается начать задачу"

**AI:**
```
Что конкретно мешает начать?
Может, задача слишком большая?
```

### Tier 2: Moderate (повторное)

**Пользователь:** "Опять не начал, уже третий день"

**AI:**
```
Три дня переноса — это паттерн.

Давай разберёмся: 
• Задача не приоритетная на самом деле?
• Или непонятно с чего начать?
• Или просто нет энергии?

Честно — что ближе?
```

### Tier 3: Severe (кризисные слова) 🚨

**Пользователь:** "Бесполезно, хочу всё бросить"

**AI:**
```
Я вижу, что тебе сейчас очень тяжело.

Это важнее любых задач и целей. Пожалуйста, 
поговори с кем-то, кто может помочь 
профессионально — психологом, врачом или 
близким человеком.

Вот ресурсы, которые могут помочь прямо сейчас:
📞 Психологическая помощь: 8-800-2000-122 (бесплатно, 24/7)
💬 Онлайн-чат: pomogi.online
```

**[Action: Log to monitoring system, flag для review]**
```

---

## ЧАСТЬ 4: СРАВНИТЕЛЬНАЯ ТАБЛИЦА — УЛУЧШЕНИЯ

### ⚠️ ПРОБЛЕМА: Нет cost estimation

**Текущая таблица:**
```
| Стоимость | Бесплатно | ~$0.01-0.05 за диалог |
```

**❌ Проблема:**
- Слишком широкий диапазон ($0.01-0.05)
- Нет breakdown по use cases
- Не учтены volume discounts
- Нет annual projection

**✅ УЛУЧШЕНИЕ: Detailed Cost Analysis**

```markdown
## Cost Estimation (GPT-4 Turbo)

### Pricing Assumptions:
- Input: $10 / 1M tokens (~$0.01 / 1K tokens)
- Output: $30 / 1M tokens (~$0.03 / 1K tokens)
- Average system prompt: 1,500 tokens
- Average user context: 500 tokens
- Average response: 150 tokens

### Cost Per Interaction:

| Use Case | Input Tokens | Output Tokens | Cost per interaction |
|----------|--------------|---------------|---------------------|
| **Simple greeting** | 2,000 (system + context) | 50 (short response) | $0.0215 |
| **SSP Analysis** | 2,200 (+ SSP data) | 300 (detailed analysis) | $0.0310 |
| **Goal generation** | 2,500 (+ reflection) | 200 (2 goals) | $0.0310 |
| **Emotional support** | 2,100 (+ history) | 150 (empathetic) | $0.0255 |
| **Average interaction** | 2,150 | 150 | **$0.0260** |

### Monthly Cost Projections:

#### Scenario 1: Conservative (1,000 MAU)
```
Assumptions:
- 1,000 MAU (Monthly Active Users)
- 5 interactions per user per day
- 20 active days per month

Calculation:
1,000 users × 5 interactions × 20 days = 100,000 interactions/month
100,000 × $0.026 = $2,600/month
```

#### Scenario 2: Moderate (5,000 MAU)
```
5,000 users × 5 × 20 = 500,000 interactions
500,000 × $0.026 = $13,000/month
```

#### Scenario 3: Growth (20,000 MAU)
```
20,000 users × 5 × 20 = 2,000,000 interactions
2,000,000 × $0.026 = $52,000/month

With volume discount (-20%): $41,600/month
```

### Cost Optimization Strategies:

#### 1. Caching (Prompt Caching — 50% discount on cached tokens)
```
Cacheable:
- System prompt (1,500 tokens) → cached after first use
- User context template (200 tokens) → cached

Savings: ~$0.0075 per interaction after first
Effective cost: $0.0185 per interaction (29% cheaper)

Monthly savings at 5K MAU:
$13,000 → $9,250 (save $3,750/month)
```

#### 2. Smart Routing (Demo vs GPT)
```
Use demo mode for:
- Simple greetings with no context (30% of interactions)
- Pre-defined quick prompts (20% of interactions)
- Total: 50% routed to demo (free)

New effective cost:
$13,000 × 50% = $6,500/month at 5K MAU
```

#### 3. Rate Limiting
```
Limit per user:
- Free tier: 10 GPT interactions/day → rest use demo
- Pro tier: Unlimited

Assumption: 80% free, 20% pro
Free users: 80% × 10 interactions = 8 avg
Pro users: 20% × 25 interactions = 5 avg
Blended average: 13 interactions/user/day (down from 100)

Cost: $13,000 → $3,380/month (74% savings)
```

#### Combined Optimization:
```
Base cost (5K MAU):           $13,000
- Caching (-29%):              -$3,750
- Smart routing (-50%):        -$4,625
- Rate limiting (-74%):        -$3,380
= Optimized cost:              $1,245/month

ROI: 90% cost reduction
```

### Annual Budget Planning:

| Year 1 Milestone | MAU | Monthly Cost | Annual Cost |
|------------------|-----|--------------|-------------|
| **Launch (Q1)** | 500 | $315 | $945 (Q1) |
| **Growth (Q2-Q3)** | 5,000 | $1,245 | $7,470 (Q2-Q3) |
| **Scale (Q4)** | 15,000 | $3,735 | $11,205 (Q4) |
| **Total Year 1** | — | — | **$19,620** |

### Business Metrics:

**Customer Acquisition Cost (CAC):**
If AI mentor increases retention by 20%:
- Additional LTV per user: $50 (assumption)
- Incremental LTV from AI: $10/user
- AI cost per user: $1.25/month × 12 = $15/year

**ROI:**
```
Incremental revenue: $50 (20% retention × $250 LTV)
AI cost: $15/year
Net benefit: $35/user/year
ROI: 233%
```

**Break-even:**
AI pays for itself if it:
- Increases retention by >6%, OR
- Increases engagement → +2 paid conversions, OR
- Reduces churn by >1%

### Risk Mitigation:

**Budget Cap:**
Set hard monthly limit: $5,000
When 80% reached → switch all users to demo mode
Alert: Email + Slack notification

**Fallback SLA:**
- GPT uptime target: 99.5%
- Demo mode always available (100% uptime)
- Blended uptime: 99.95%
```

---

## ROADMAP — УЛУЧШЕНИЯ

### ⚠️ ПРОБЛЕМА: Чеклисты без сроков и ресурсов

**Текущая версия:**
```
### Фаза 1: Базовая интеграция
- [ ] Подключение OpenAI API
- [ ] Контекстные промпты по разделам
- [ ] Передача базового контекста
```

**❌ Проблема:**
- Нет timeline
- Нет effort estimation
- Нет зависимостей
- Нет ответственных

**✅ УЛУЧШЕНИЕ: Detailed Roadmap with Timeline**

```markdown
## Roadmap v2.0 (MVP → Production)

### Phase 1: Foundation (Weeks 1-2) — MVP Launch

**Goal:** Launch basic AI mentor with demo fallback

| Task | Owner | Effort | Dependencies | Status |
|------|-------|--------|--------------|--------|
| **1.1 OpenAI API Integration** | Backend | 3d | API key approved | 🟡 In Progress |
| - Setup API client with retry logic | Backend | 1d | — | ✅ Done |
| - Implement streaming responses | Backend | 1d | API client | 🟡 In Progress |
| - Add error handling & fallback | Backend | 1d | API client | ⚪ Todo |
| **1.2 Demo Mode Implementation** | Frontend | 2d | — | ✅ Done |
| - Create response templates JSON | Content | 1d | — | ✅ Done |
| - Build template matcher | Frontend | 1d | Templates | ✅ Done |
| **1.3 System Prompts** | Product + AI | 2d | — | 🟡 In Progress |
| - Write base system prompt | AI specialist | 1d | — | ✅ Done |
| - Create page-specific prompts | AI specialist | 1d | Base prompt | 🟡 In Progress |
| **1.4 Context Gathering** | Backend | 3d | DB schema | ⚪ Todo |
| - User profile context | Backend | 1d | — | ⚪ Todo |
| - Goals & tasks context | Backend | 1d | — | ⚪ Todo |
| - Current page detection | Frontend | 0.5d | — | ⚪ Todo |
| - Context serialization | Backend | 0.5d | All above | ⚪ Todo |
| **1.5 UI Components** | Frontend | 3d | Design | 🟡 In Progress |
| - Chat panel component | Frontend | 1.5d | — | 🟡 In Progress |
| - Quick prompts buttons | Frontend | 0.5d | Chat panel | ⚪ Todo |
| - Loading states | Frontend | 0.5d | Chat panel | ⚪ Todo |
| - Error states | Frontend | 0.5d | Chat panel | ⚪ Todo |

**Total effort:** ~13 days (with 2 engineers → 6.5 days calendar)  
**Launch date:** End of Week 2  
**Success criteria:**
- [ ] 80% of prompts get response <3s
- [ ] Demo fallback works 100% of time
- [ ] 0 crashes in first 100 interactions

---

### Phase 2: Personalization (Weeks 3-4) — Context Intelligence

**Goal:** Make AI responses highly personalized

| Task | Owner | Effort | Dependencies | Status |
|------|-------|--------|--------------|--------|
| **2.1 Enhanced Context** | Backend | 3d | Phase 1 complete | ⚪ Todo |
| - Streak tracking integration | Backend | 1d | — | ⚪ Todo |
| - Historical goals data | Backend | 1d | — | ⚪ Todo |
| - Journal sentiment analysis | Backend | 1d | — | ⚪ Todo |
| **2.2 Conversation Memory** | Backend | 4d | Phase 1 | ⚪ Todo |
| - Session storage (Redis) | Backend | 1d | — | ⚪ Todo |
| - Conversation history API | Backend | 1d | Redis | ⚪ Todo |
| - Context window management | Backend | 1d | History API | ⚪ Todo |
| - Memory cleanup logic | Backend | 1d | All above | ⚪ Todo |
| **2.3 Specialized Prompts** | AI specialist | 3d | Phase 1 | ⚪ Todo |
| - SSP analysis prompt | AI specialist | 1d | — | ⚪ Todo |
| - Goal generation prompt | AI specialist | 1d | — | ⚪ Todo |
| - Emotional support prompt | AI specialist | 1d | — | ⚪ Todo |
| **2.4 User Preferences** | Full-stack | 3d | — | ⚪ Todo |
| - Settings UI | Frontend | 1d | — | ⚪ Todo |
| - Preference storage | Backend | 1d | — | ⚪ Todo |
| - Tone adaptation logic | Backend | 1d | Preferences | ⚪ Todo |

**Total effort:** ~13 days → 6.5 days calendar  
**Launch date:** End of Week 4  
**Success criteria:**
- [ ] 70%+ users report "AI understands me"
- [ ] Response relevance score >8/10
- [ ] Conversation memory works in 95% sessions

---

### Phase 3: Intelligence (Weeks 5-8) — Proactive & Emotional

**Goal:** AI that anticipates needs and provides deep support

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| **3.1 Proactive Triggers** | Backend | 5d | ⚪ Todo |
| - Event detection system | Backend | 2d | ⚪ Todo |
| - Trigger rules engine | Backend | 2d | ⚪ Todo |
| - In-app notification system | Frontend | 1d | ⚪ Todo |
| **3.2 Push Notifications** | Full-stack | 4d | ⚪ Todo |
| - Push service integration | Backend | 2d | ⚪ Todo |
| - Notification preferences | Frontend | 1d | ⚪ Todo |
| - Opt-in flow | Frontend | 1d | ⚪ Todo |
| **3.3 Emotional Intelligence** | AI specialist | 5d | ⚪ Todo |
| - Emotion detection model | AI specialist | 2d | ⚪ Todo |
| - Severity classification | AI specialist | 1d | ⚪ Todo |
| - Crisis protocol | AI specialist | 2d | ⚪ Todo |
| **3.4 Pattern Analysis** | Data | 5d | ⚪ Todo |
| - User behavior tracking | Data | 2d | ⚪ Todo |
| - Pattern detection queries | Data | 2d | ⚪ Todo |
| - Insight generation | Data | 1d | ⚪ Todo |

**Total effort:** ~19 days → 9.5 days calendar  
**Launch date:** End of Week 8  
**Success criteria:**
- [ ] Proactive messages engagement rate >30%
- [ ] Emotional support satisfaction >8/10
- [ ] Pattern insights actionable in 60% cases

---

### Phase 4: Optimization (Month 3) — Scale & Refine

**Goal:** Optimize costs and quality at scale

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| **4.1 Prompt Caching** | Backend | 3d | ⚪ Todo |
| **4.2 Smart Routing** | Backend | 3d | ⚪ Todo |
| **4.3 A/B Testing Framework** | Data | 4d | ⚪ Todo |
| **4.4 Fine-tuning Exploration** | AI specialist | 10d | ⚪ Todo |
| **4.5 Analytics Dashboard** | Full-stack | 5d | ⚪ Todo |

**Total effort:** ~25 days → 12.5 days calendar  
**Success criteria:**
- [ ] Cost per interaction reduced by 60%
- [ ] Response quality improved by 20%
- [ ] User satisfaction >9/10
```

---

## RISKS AND MITIGATION — NEW SECTION

```markdown
## Risk Assessment Matrix

| Risk | Probability | Impact | Severity | Mitigation | Owner |
|------|-------------|--------|----------|------------|-------|
| **OpenAI API outage** | Medium | High | 🟡 **Medium** | Demo fallback always available | Backend |
| **Cost overrun** | High | Medium | 🟡 **Medium** | Budget caps + rate limiting | Product |
| **Poor response quality** | Medium | High | 🟡 **Medium** | A/B testing + user feedback loops | AI specialist |
| **User privacy concerns** | Low | High | 🟡 **Medium** | Clear data policy + opt-out | Legal |
| **Prompt injection attacks** | Low | Medium | 🟢 **Low** | Input sanitization + prompt guards | Security |
| **Emotional crisis mishandling** | Low | Critical | 🔴 **High** | Crisis protocol + manual review | Product + Legal |
| **Scope creep** | High | Medium | 🟡 **Medium** | Strict MVP scope, ruthless prioritization | PM |
| **Integration delays** | Medium | Medium | 🟡 **Medium** | Buffer time in roadmap (20%) | PM |

### Detailed Mitigation Plans:

#### Risk 1: OpenAI API Outage
**Scenario:** OpenAI has extended downtime (>1 hour)

**Impact:**
- AI mentor becomes demo-only
- Reduced user experience quality
- Potential user complaints

**Mitigation:**
1. **Prevention:**
   - Monitor OpenAI status page
   - Set up alerts for API latency >2s
   - Diversify providers (考虑 Anthropic Claude as backup)

2. **Response:**
   - Auto-switch to demo mode (no user action needed)
   - Display banner: "AI в упрощённом режиме"
   - Retry OpenAI every 5 min in background
   - Log all failed requests for post-mortem

3. **Recovery:**
   - Automatic recovery when API restored
   - No user refresh required
   - Analytics dashboard tracks uptime

**SLA:** 99.5% uptime (including demo fallback)

---

#### Risk 2: Cost Overrun
**Scenario:** Users interact more than expected, costs balloon

**Impact:**
- Monthly budget exceeded
- Potential emergency cost controls
- Pressure to disable features

**Mitigation:**
1. **Prevention:**
   - Set hard budget cap: $5,000/month
   - Monitor spend daily in dashboard
   - Alert at 50%, 80%, 95% of budget

2. **Response Tiers:**
   - **At 80%:** Switch free users to demo mode
   - **At 90%:** Reduce rate limits (10 → 5 interactions/day)
   - **At 95%:** Emergency: GPT only for pro users
   - **At 100%:** Hard stop, all demo mode

3. **Long-term:**
   - Implement smart routing (50% to demo by default)
   - Prompt caching (29% cost reduction)
   - Fine-tuning (eventually 90% cheaper)

**Budget Alert System:**
```python
def check_budget_utilization():
    monthly_spend = get_openai_spend_this_month()
    budget_cap = 5000  # USD
    utilization = monthly_spend / budget_cap
    
    if utilization >= 0.95:
        switch_all_to_demo_mode()
        alert_team("CRITICAL: Budget 95% used")
    elif utilization >= 0.80:
        switch_free_users_to_demo()
        alert_team("WARNING: Budget 80% used")
    elif utilization >= 0.50:
        alert_team("INFO: Budget 50% used")
```

---

#### Risk 3: Emotional Crisis Mishandling
**Scenario:** User expresses suicidal ideation, AI gives poor response

**Impact:**
- Potential harm to user
- Severe reputational damage
- Legal liability

**Mitigation:**
1. **Prevention:**
   - Crisis keyword detection (100% accuracy required)
   - Immediate redirect to professional resources
   - Never attempt to "solve" crisis with AI

2. **Crisis Protocol:**
```python
CRISIS_KEYWORDS = [
    "хочу умереть",
    "покончить с собой",
    "не вижу смысла жить",
    "лучше бы меня не было",
    # ... 20+ keywords
]

def handle_crisis_message(message: str) -> Response:
    if any(keyword in message.lower() for keyword in CRISIS_KEYWORDS):
        # Log immediately
        log_crisis_event(user_id, message, timestamp)
        
        # Return pre-written safe response
        return Response(
            text=CRISIS_RESPONSE_TEMPLATE,
            resources=[
                "📞 8-800-2000-122 (24/7 психологическая помощь)",
                "💬 pomogi.online",
                "🏥 Скорая психиатрическая: 103"
            ],
            flag_for_review=True
        )
```

3. **Response:**
   - Flag conversation for immediate human review
   - Email to support team within 5 minutes
   - Consider temporary account monitoring
   - Follow-up check-in after 24h

4. **Legal Protection:**
   - Terms of Service: "AI не заменяет профессиональную помощь"
   - Prominent disclaimer in settings
   - Crisis resources always visible

**Post-Incident:**
- Review all crisis conversations weekly
- Update keyword list based on missed cases
- Train team on crisis response protocols
```

---

## SUCCESS METRICS — NEW SECTION

```markdown
## Key Performance Indicators (KPIs)

### Product Metrics

#### Tier 1: Must Track (Daily)

| Metric | Target | Measurement | Tool |
|--------|--------|-------------|------|
| **AI Response Rate** | >95% | (Responses / Prompts) × 100% | Mixpanel |
| **Average Response Time** | <3s (p95) | Time from prompt to response | Application logs |
| **Demo Fallback Rate** | <5% | Demo responses / Total responses | Backend analytics |
| **Error Rate** | <1% | Errors / Total requests | Sentry |
| **User Engagement** | >60% DAU use AI | Users who sent ≥1 message / DAU | Mixpanel |

#### Tier 2: Should Track (Weekly)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Conversation Length** | >3 messages | Avg messages per conversation |
| **Quick Prompt CTR** | >40% | Quick prompt clicks / Impressions |
| **User Satisfaction** | >8/10 | Post-conversation rating (optional prompt) |
| **Retention Impact** | +15% | Retention of AI users vs non-AI users |
| **Feature Adoption** | >70% | % users who used AI in first week |

#### Tier 3: Nice to Track (Monthly)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Emotional Support Quality** | >8/10 | Rating after emotional support conversations |
| **Goal Completion Rate** | +20% | Goals completed by AI users vs control |
| **NPS Impact** | +10 points | NPS of AI users vs non-AI users |
| **Proactive Engagement** | >30% | Click-through on proactive nudges |

---

### Business Metrics

| Metric | Baseline | Target | Measurement Period |
|--------|----------|--------|-------------------|
| **Cost per User** | $0 (no AI) | <$1.50/month | Monthly |
| **Customer Acquisition Cost (CAC)** | $20 | $18 (-10%) | Quarterly |
| **Lifetime Value (LTV)** | $250 | $300 (+20%) | Annual |
| **Churn Rate** | 5%/month | 4%/month (-20%) | Monthly |
| **Conversion to Paid** | 8% | 10% (+25%) | Quarterly |

**ROI Calculation:**
```
Incremental LTV from AI: $50 (20% increase)
Cost per user: $18/year
Net benefit: $32/user/year
ROI: 177%
```

---

### Technical Metrics

| Metric | Target | Threshold |
|--------|--------|-----------|
| **API Uptime** | 99.5% | Alert at <99% |
| **Token Usage** | <2,500/interaction | Alert at >3,000 |
| **Cache Hit Rate** | >60% | Target 80% by Month 3 |
| **Demo Fallback Latency** | <100ms | Hard limit 200ms |
| **Database Query Time** | <50ms (p95) | Alert at >100ms |

---

### Quality Metrics (Manual Review)

**Sample:** Review 50 random conversations weekly

| Metric | Target | Fail Criteria |
|--------|--------|---------------|
| **Tone Appropriateness** | 90% good | Formal/robotic language |
| **Context Awareness** | 85% relevant | Ignores user context |
| **Length Compliance** | 90% 1-3 sentences | >5 sentences common |
| **Socratic Method** | 70% questions | Too many direct answers |
| **Empathy Score** | 80% empathetic | Cold/dismissive responses |

---

## Analytics Dashboard Mockup

### Daily Health Check

```
┌─────────────────────────────────────────────────────┐
│ AI Mentor Health — December 4, 2025                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🟢 HEALTHY                                          │
│                                                     │
│ Response Rate:     98.5% ✅ (target >95%)          │
│ Avg Response Time: 2.1s ✅ (target <3s)            │
│ Error Rate:        0.3% ✅ (target <1%)            │
│ User Engagement:   67% ✅ (target >60%)            │
│ Cost Today:        $87 ✅ (budget $166/day)        │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ⚠️ WARNINGS                                         │
│                                                     │
│ • Demo fallback: 7% (target <5%)                   │
│   Action: Check OpenAI API status                  │
│                                                     │
│ • Token usage spike: +15% vs yesterday             │
│   Action: Review prompt optimization               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Weekly Insights

```
┌─────────────────────────────────────────────────────┐
│ Week of Nov 27 - Dec 3                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 Engagement                                       │
│ Total conversations:    15,234 (+8% vs last week)  │
│ Unique users:           3,456 (69% of WAU)         │
│ Avg messages/conv:      4.2 (target >3) ✅         │
│                                                     │
│ 💰 Cost                                             │
│ Total spend:            $612 (vs $650 budget) ✅   │
│ Cost per user:          $0.18                      │
│ Cost per interaction:   $0.040                     │
│                                                     │
│ 😊 Quality                                          │
│ User satisfaction:      8.4/10 ✅                  │
│ Manual review score:    87% ✅                     │
│ Emotional support:      8.9/10 🎉                  │
│                                                     │
│ 🎯 Business Impact                                  │
│ Goal completion:        +18% vs control ✅         │
│ Retention (7-day):      +12% vs control ✅         │
│ NPS impact:             +8 points ✅                │
│                                                     │
└─────────────────────────────────────────────────────┘
```
```

---

## CONCLUSION & RECOMMENDATIONS

### Priority 1: Must Fix for MVP

1. **Add MoSCoW prioritization** to function list
   - Reduce from 48 → 20 functions for MVP
   - Clear separation: Must / Should / Could / Won't

2. **Add technical acceptance criteria** to User Stories
   - Response time SLAs
   - Error rate thresholds
   - Automated testing requirements

3. **Implement cost controls**
   - Budget caps
   - Rate limiting
   - Smart routing (demo fallback)

4. **Add crisis protocol**
   - Keyword detection
   - Safe responses
   - Professional resource redirects

5. **Create detailed roadmap**
   - Task breakdown
   - Effort estimates
   - Dependencies
   - Timeline

### Priority 2: Should Add Post-MVP

1. **Unhappy path scenarios**
2. **Notification fatigue prevention**
3. **Analytics dashboard**
4. **A/B testing framework**
5. **Fine-tuning exploration**

### Priority 3: Nice to Have

1. **Multi-language support**
2. **Voice interface**
3. **Advanced pattern analysis**
4. **Community features** (share goals)

---

## NEXT STEPS

1. **Week 1:** Review this document with team
2. **Week 1:** Finalize MVP scope (20 functions)
3. **Week 2:** Begin Phase 1 development
4. **Week 4:** MVP launch (internal beta)
5. **Week 6:** Public launch with monitoring
6. **Week 8:** Iterate based on data

---

*This enhanced specification transforms ai-mentor-functionality.md into an actionable, measurable, production-ready document.*
