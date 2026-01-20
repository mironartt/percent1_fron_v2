# ЧЕКЛИСТ РЕАЛИЗАЦИИ AI MENTOR

> **Цель:** Пошаговый план реализации улучшений ментора согласно исследованиям и плану разработки.
> **Статус:** В работе

---

## ФАЗА 0: КРИТИЧЕСКИЕ ПЕРВЫЕ ДНИ (Приоритет #1) ✅ ЗАВЕРШЕНО

> **Почему первое:** 80% пользователей уходят в первые 3 дня. Это самый высокий ROI.

### 0.1 Welcome Sequence (Day 1-3) ✅
- [x] Создать `welcome_sequence/` папку
- [x] Написать `welcome_day1_system_prompt.md`
- [x] Написать `welcome_day1_user_prompt.md`
- [x] Написать `welcome_day2_system_prompt.md`
- [x] Написать `welcome_day2_user_prompt.md`
- [x] Написать `welcome_day3_system_prompt.md` (первый Aha-момент)
- [x] Написать `welcome_day3_user_prompt.md`
- [x] Создать `welcome_examples.md` (3+ примера для каждого дня)
- [x] Создать `README.md` с документацией

**Расположение:** `docs/promt_AI/notifications/welcome_sequence/`

### 0.2 Aha-момент система ✅
- [x] Определить 4 типа Aha-моментов (time_pattern, task_pattern, comparison, streak)
- [x] Описать логику определения каждого типа
- [x] Добавить примеры для каждого типа
- [x] Интегрировать в welcome_day3

**Интегрировано в:** `welcome_day3_system_prompt.md` и `welcome_examples.md`

---

## ФАЗА 1: ЗАЩИТА ОТ ОТТОКА (Приоритет #2) ✅ ЗАВЕРШЕНО

> **Почему второе:** 44% уходят после потери streak, 52% — в первые 30 дней.

### 1.1 Streak Recovery Notification ✅
- [x] Создать `streak_recovery/` папку
- [x] Написать `streak_recovery_system_prompt.md`
- [x] Написать `streak_recovery_user_prompt.md`
- [x] Логика для 3 категорий: short (7-14), medium (15-30), long (30+)
- [x] Создать `streak_recovery_examples.md`
- [x] Создать `README.md`

**Расположение:** `docs/promt_AI/notifications/streak_recovery/`

### 1.2 Comeback Notification ✅
- [x] Создать `comeback_notification/` папку
- [x] Написать `comeback_system_prompt.md`
- [x] Написать `comeback_user_prompt.md`
- [x] Логика для 3 категорий: short (3-6 дней), medium (7-13), long (14+)
- [x] Создать `comeback_examples.md`
- [x] Создать `README.md`

**Расположение:** `docs/promt_AI/notifications/comeback_notification/`

---

## ФАЗА 2: ФУНДАМЕНТ ПЕРСОНАЛИЗАЦИИ (Приоритет #3) ✅ ЗАВЕРШЕНО

> **Почему третье:** Без этого глубокая персонализация чата невозможна.

### 2.1 MENTOR_PERSONA.md ✅
- [x] Определить имя ментора (Саша)
- [x] Описать характер и ценности
- [x] Определить речевые маркеры (фирменные фразы)
- [x] Описать границы (что НЕ делает)
- [x] Написать 5-10 примеров диалогов в разных ситуациях
- [x] Описать адаптацию тона по стадиям отношений

**Расположение:** `docs/promt_AI/MENTOR_PERSONA.md`

### 2.2 База коучинговых техник (18 техник) ✅
- [x] Создать `knowledge_base/` структуру
- [x] Техники прокрастинации (Micro-step, Time Boxing)
- [x] Техники перфекционизма (Worst-Case Scenario, Permission Granting)
- [x] Техники выгорания (Energy Audit, Permission Granting)
- [x] Техники мотивации (Celebration Anchoring, Progress Visualization)
- [x] Техники страхов/блоков (Worst-Case Scenario, Obstacle Anticipation)
- [x] Для каждой: суть, когда применять, triggers, пример, ключевой вопрос, научное обоснование

**Расположение:** `docs/promt_AI/knowledge_base/COACHING_TECHNIQUES.md`

### 2.3 База паттернов поведения (12 паттернов) ✅
- [x] Создать структуру в knowledge_base
- [x] Паттерны с задачами (вечный_перенос, перегруз_планирования, подготовка_вместо_действия)
- [x] Паттерны с привычками (streak_зависимость, all_or_nothing)
- [x] Эмоциональные паттерны (burnout_spiral, comparison_trap)
- [x] Паттерны взаимодействия (notification_fatigue, planning_addiction, external_validation)
- [x] Для каждого: сигналы в данных, сигналы в словах, причины, интервенции по стадиям

**Расположение:** `docs/promt_AI/knowledge_base/BEHAVIOR_PATTERNS.md`

---

## ФАЗА 3: ПОЗИТИВНОЕ ПОДКРЕПЛЕНИЕ (Приоритет #4) ✅ ЗАВЕРШЕНО

> **Почему четвёртое:** Увеличивает engagement и motivation.

### 3.1 Milestone Notification ✅
- [x] Создать `milestone/` папку
- [x] Написать system prompt
- [x] Написать user prompt
- [x] Типы: streak (7, 14, 30, 60, 90, 180, 365), goal_completed, level_up, first_achievement
- [x] Создать examples для каждого типа
- [x] Создать README.md

**Расположение:** `docs/promt_AI/notifications/milestone/`

### 3.2 Journal Response ✅
- [x] Создать `journal_response/` папку
- [x] Написать system prompt
- [x] Написать user prompt
- [x] Логика типов записей (positive, negative, mixed, insight, formal, burnout)
- [x] Создать examples
- [x] Создать README.md

**Расположение:** `docs/promt_AI/notifications/journal_response/`

---

## ФАЗА 4: ГЛУБОКАЯ ПЕРСОНАЛИЗАЦИЯ (Приоритет #5) ✅ ЗАВЕРШЕНО

> **Почему пятое:** Требует данных и базы знаний из предыдущих фаз.

### 4.1 Обновление chat_bot_response_system.md ✅
- [x] Интегрировать MENTOR_PERSONA
- [x] Добавить секцию mentor_memory
- [x] Добавить relationship_stage логику
- [x] Добавить интеграцию с базой техник
- [x] Добавить интеграцию с базой паттернов
- [x] Обновить примеры

**Расположение:** `docs/promt_AI/other_promt/chat_bot_response_system_v2.md`

### 4.2 Relationship Checkin ✅
- [x] Создать `relationship_checkin/` папку
- [x] Написать промпты (system + user)
- [x] Логика: раз в 2 недели + triggered
- [x] Обработка ответов (positive/neutral/negative)
- [x] Создать examples
- [x] Создать README.md

**Расположение:** `docs/promt_AI/notifications/relationship_checkin/`

### 4.3 Monthly Review ✅
- [x] Создать `monthly_review/` папку
- [x] Написать промпты (system + user)
- [x] Структура: цифры месяца, главный инсайт, вопрос на следующий месяц
- [x] Создать examples
- [x] Создать README.md

**Расположение:** `docs/promt_AI/notifications/monthly_review/`

---

## ФАЗА 5: ТЕСТИРОВАНИЕ

### 5.1 Синтетические пользователи
- [ ] Создать `knowledge_base/personas/synthetic_users.json`
- [ ] Минимум 5 персон:
  - [ ] Перфекционист Петя
  - [ ] Выгоревшая Вера
  - [ ] Прокрастинатор Паша
  - [ ] Загруженная Лена
  - [ ] Новичок Николай
- [ ] Для каждого: типичное поведение, journal_examples, effective/ineffective approaches

**Зависимости:** База паттернов и техник
**Оценка:** ~2 часа

### 5.2 Тестирование промптов
- [ ] Протестировать welcome_sequence на 3 персонах
- [ ] Протестировать streak_recovery на разных категориях
- [ ] Протестировать comeback на разных сроках отсутствия
- [ ] Протестировать milestone на разных типах
- [ ] Проверить chat_bot на разных режимах работы
- [ ] Зафиксировать и исправить проблемы

**Зависимости:** Все промпты готовы
**Оценка:** ~2-3 часа

---

## СВОДКА

| Фаза | Название | Задач | Оценка времени |
|------|----------|-------|----------------|
| 0 | Critical First Days | 10 | ~3-4 часа |
| 1 | Защита от оттока | 12 | ~3 часа |
| 2 | Фундамент персонализации | 18 | ~8-10 часов |
| 3 | Позитивное подкрепление | 12 | ~3 часа |
| 4 | Глубокая персонализация | 12 | ~6-7 часов |
| 5 | Тестирование | 8 | ~4-5 часа |
| **ИТОГО** | | **72 задачи** | **~27-32 часа** |

---

## ЗАВИСИМОСТИ ОТ БЭКЕНДА

Для полной реализации бэкенд должен предоставлять:

| Данные | Нужно для | Приоритет |
|--------|-----------|-----------|
| `days_in_app` | Welcome, Relationship | Высокий |
| `streak_data` (current, broken) | Streak Recovery, Milestone | Высокий |
| `days_absent` | Comeback | Высокий |
| `journal_entry` + sentiment | Journal Response | Средний |
| `mentor_memory` (facts, patterns) | Chat персонализация | Средний |
| `relationship_stage` | Все промпты | Средний |
| `monthly_stats` | Monthly Review | Низкий |

**Вопрос к команде:** Какие данные уже доступны? Какие нужно реализовать?

---

## ПРЕДЛАГАЕМЫЙ ПОРЯДОК РАБОТЫ

**Неделя 1:**
- Фаза 0: Welcome Sequence (можно сразу)
- Фаза 1: Streak Recovery, Comeback (можно сразу)
- Фаза 2.1: MENTOR_PERSONA (можно сразу)

**Неделя 2:**
- Фаза 2.2-2.3: База техник и паттернов
- Фаза 3: Milestone, Journal Response
- Фаза 5.1: Синтетические пользователи

**Неделя 3:**
- Фаза 4: Обновление чата, Relationship Checkin, Monthly Review
- Фаза 5.2: Тестирование всего

---

## ВОПРОСЫ НА СОГЛАСОВАНИЕ

1. **Согласен ли с приоритетами фаз?**
   - Фаза 0 (Welcome) первая — потому что 80% уходят в Day 1-3
   - Фаза 1 (Streak/Comeback) вторая — потому что 44% уходят после потери streak

2. **Согласен ли с порядком работы?**
   - Сначала "простые" промпты без зависимостей
   - Потом фундамент (persona, база знаний)
   - Потом сложная персонализация чата

3. **Какие данные бэкенд уже может предоставить?**
   - Это определит, какие промпты можно запускать сразу

4. **Нужно ли добавить что-то в чеклист?**

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Изменение |
|------|-----------|
| 2025-01-20 | Создан первоначальный чеклист |
| 2025-01-20 | ✅ Завершена Фаза 0: Welcome Sequence (8 файлов) |
| 2025-01-20 | ✅ Завершена Фаза 1: Streak Recovery + Comeback (8 файлов) |
| 2025-01-20 | ✅ Завершена Фаза 2: MENTOR_PERSONA + Knowledge Base (3 файла) |
| 2025-01-20 | ✅ Завершена Фаза 3: Milestone + Journal Response (8 файлов) |
| 2025-01-20 | ✅ Завершена Фаза 4: chat_bot_v2 + Relationship Checkin + Monthly Review (9 файлов) |

