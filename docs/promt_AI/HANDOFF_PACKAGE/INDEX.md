# AI Mentor — Пакет для передачи разработчикам

> **Версия:** 1.0
> **Дата:** 2025-01-20
> **Статус:** Готов к интеграции

---

## Содержание пакета

### 1. Уведомления (`notifications/`)

| Папка | Назначение | Файлы |
|-------|------------|-------|
| `welcome_sequence/` | Приветствие Day 1-3 + Aha-момент | 9 файлов |
| `streak_recovery/` | Потеря streak (7-14, 15-30, 30+ дней) | 4 файла |
| `comeback_notification/` | Возвращение после отсутствия (3-6, 7-13, 14+ дней) | 4 файла |
| `milestone/` | Достижения (streak, goal, level_up) | 4 файла |
| `journal_response/` | Отклик на запись в дневнике | 4 файла |
| `relationship_checkin/` | Проверка качества взаимодействия | 4 файла |
| `monthly_review/` | Ежемесячный обзор прогресса | 4 файла |

**Структура каждой папки:**
- `*_system_prompt.md` — инструкции для LLM
- `*_user_prompt.md` — шаблон с переменными (Handlebars)
- `*_examples.md` — примеры вход/выход
- `README.md` — документация, триггеры, требуемые данные

---

### 2. База знаний (`knowledge_base/`)

| Файл | Назначение |
|------|------------|
| `COACHING_TECHNIQUES.md` | 18 коучинговых техник с триггерами |
| `BEHAVIOR_PATTERNS.md` | 12 паттернов поведения пользователей |

**Использование:** Для RAG или прямой интеграции в chat_bot_response_system_v2.md

---

### 3. Главный промпт чата (`other_promt/`)

| Файл | Назначение |
|------|------------|
| `chat_bot_response_system_v2.md` | Обновлённый системный промпт для чата |

**Включает:**
- Интеграцию MENTOR_PERSONA
- Секцию mentor_memory
- Логику relationship_stage
- Интеграцию с базой техник и паттернов

---

### 4. Документация (корневой уровень)

| Файл | Назначение |
|------|------------|
| `MENTOR_PERSONA.md` | Личность ментора "Саша" |
| `PROMPT_VARIABLES_REFERENCE.md` | Справочник всех переменных |
| `PROMPT_DEVELOPMENT_GUIDELINES.md` | Гайдлайны написания промптов |
| `IMPLEMENTATION_CHECKLIST.md` | Чеклист реализации (завершён на 85%) |

---

## Приоритет интеграции

### Высокий приоритет (влияет на retention)
1. `welcome_sequence/` — 80% уходят в Day 1-3
2. `streak_recovery/` — 44% уходят после потери streak
3. `comeback_notification/` — возврат ушедших пользователей

### Средний приоритет (улучшает engagement)
4. `milestone/` — позитивное подкрепление
5. `journal_response/` — отклик на рефлексию
6. `chat_bot_response_system_v2.md` — персонализированный чат

### Низкий приоритет (долгосрочное улучшение)
7. `relationship_checkin/` — раз в 2 недели
8. `monthly_review/` — раз в месяц

---

## Требования к бэкенду

### Обязательные данные

| Переменная | Где используется | Приоритет |
|------------|------------------|-----------|
| `user_name` | Все промпты | Высокий |
| `days_in_app` | Welcome, Relationship | Высокий |
| `current_date` | Все промпты | Высокий |
| `streak_data` | Streak Recovery, Milestone | Высокий |
| `days_absent` | Comeback | Высокий |

### Опциональные данные (улучшают качество)

| Переменная | Где используется | Приоритет |
|------------|------------------|-----------|
| `relationship_stage` | Все промпты | Средний |
| `mentor_memory` | Chat | Средний |
| `journal_entry` | Journal Response | Средний |
| `monthly_stats` | Monthly Review | Низкий |
| `task_stats` | Welcome Day 3, Milestone | Средний |

---

## Relationship Stage

Все промпты адаптируются под 4 стадии:

| Стадия | Период | Тон |
|--------|--------|-----|
| `introduction` | День 1-7 | Мягкий, осторожный |
| `building_trust` | Неделя 2-4 | Больше инициативы |
| `deep_partnership` | Месяц 2-3 | Прямой feedback |
| `maintained` | Месяц 4+ | Партнёрский диалог |

**Формула расчёта:**
```javascript
function getRelationshipStage(daysInApp, engagementScore) {
  if (daysInApp <= 7) return 'introduction';
  if (daysInApp <= 30) return 'building_trust';
  if (daysInApp <= 90) return 'deep_partnership';
  return 'maintained';
}
```

---

## Шаблонизация (Handlebars)

Все user_prompt используют Handlebars синтаксис:

```handlebars
{{user_name}}                    // Простая переменная
{{#if variable}}...{{/if}}       // Условие
{{#each array}}{{this}}{{/each}} // Цикл
{{#unless variable}}...{{/unless}} // Отрицание
```

---

## Тестирование

### Рекомендуемые сценарии

1. **Welcome:** Новый пользователь, день 1/2/3
2. **Streak Recovery:** Потеря streak 10/20/45 дней
3. **Comeback:** Отсутствие 5/10/20 дней
4. **Milestone:** Streak 7/30 дней, goal completed, level up
5. **Journal:** Позитивная/негативная/burnout запись
6. **Chat:** Прокрастинация, перфекционизм, выгорание

### Синтетические пользователи (Фаза 5 — не завершена)

Рекомендуется создать 5 тестовых персон:
- Перфекционист Петя
- Выгоревшая Вера
- Прокрастинатор Паша
- Загруженная Лена
- Новичок Николай

---

## Контакты

При вопросах по интеграции обращаться к автору документации.

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создан пакет для передачи |
