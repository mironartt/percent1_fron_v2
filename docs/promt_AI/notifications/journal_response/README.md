# Journal Response — Документация

## Назначение

Journal Response — отклик ментора на запись в дневнике. Цель: дать осмысленную реакцию на содержание, помочь углубить рефлексию.

**Почему это важно:** Дневник — один из главных инструментов осознанности. Качественный отклик показывает, что ментор "читает" и "понимает", а не просто реагирует на триггеры.

---

## Структура файлов

```
journal_response/
├── journal_response_system_prompt.md   # Системный промпт
├── journal_response_user_prompt.md     # User prompt с переменными
├── journal_response_examples.md        # Примеры по типам записей
└── README.md                           # Этот файл
```

---

## Триггер отправки

Отклик отправляется когда:
- Пользователь сохранил запись в дневнике
- Заполнено хотя бы одно поле

```javascript
if (journal_entry.saved && (journal_entry.done || journal_entry.not_done || journal_entry.learned || journal_entry.tomorrow)) {
  generateJournalResponse(journal_entry);
}
```

**Время отправки:** Сразу после сохранения записи (или при следующем открытии приложения).

---

## Поля дневника

| Поле | Вопрос | Тип |
|------|--------|-----|
| `done` | Что было сделано сегодня? | string |
| `not_done` | Что не получилось? | string |
| `learned` | Что я понял/узнал? | string |
| `tomorrow` | Планы на завтра? | string |

---

## Типы записей

| Тип | Сигналы | Реакция ментора |
|-----|---------|-----------------|
| **Позитивная** | "получилось", "закрыл", "доволен" | Признать конкретику + спросить что помогло |
| **Негативная** | "не получилось", "устал", "провал" | Признать чувства + мягкий вопрос |
| **Смешанная** | И хорошее, и плохое | Подсветить контраст |
| **Инсайт** | "понял", "заметил", "осознал" | Усилить + спросить о применении |
| **Формальная** | "норм", "ок", короткие ответы | Не давить, мягкий вопрос |
| **Burnout** | "устал", "нет сил", "бессмысленно" | Признать + разрешение на паузу |

---

## Требуемые данные от бэкенда

### Обязательные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `user_name` | string | Имя пользователя |
| `current_date` | string | Текущая дата |
| `journal_entry.date` | string | Дата записи |
| `journal_entry.done` | string/null | Что сделано |
| `journal_entry.not_done` | string/null | Что не получилось |
| `journal_entry.learned` | string/null | Инсайты |
| `journal_entry.tomorrow` | string/null | Планы |

### Опциональные (для контекста)

| Переменная | Тип | Описание |
|------------|-----|----------|
| `user_context.days_in_app` | number | Дней в приложении |
| `user_context.journal_streak` | number | Дней подряд ведёт дневник |
| `user_context.relationship_stage` | string | Стадия отношений |
| `context.today_completion_rate` | number | % выполнения сегодня |
| `context.active_goals` | array | Активные цели |
| `context.previous_journal_entry` | object | Предыдущая запись |
| `context.emotional_signals` | string | Эмоциональные сигналы (burnout, frustration, etc.) |

---

## Алгоритм генерации

```javascript
function generateJournalResponse(entry, context) {
  // 1. Определить тип записи
  const entryType = classifyJournalEntry(entry);

  // 2. Выбрать фокус (самое важное)
  const focus = selectFocus(entry, entryType);

  // 3. Проверить контекст
  const hasRelevantContext = checkContext(context);

  // 4. Сгенерировать отклик
  return {
    entry_type: entryType,
    focus: focus,
    include_context: hasRelevantContext
  };
}

function classifyJournalEntry(entry) {
  const text = [entry.done, entry.not_done, entry.learned, entry.tomorrow].join(' ');

  // Burnout сигналы — приоритет
  if (/устал|нет сил|выгорание|бессмысленно|зачем всё это/i.test(text)) {
    return 'burnout';
  }

  // Инсайт
  if (entry.learned && entry.learned.length > 20) {
    return 'insight';
  }

  // Формальная
  if (text.length < 50 || /норм|ок|как обычно|то же/i.test(text)) {
    return 'formal';
  }

  // Смешанная
  if (entry.done && entry.not_done && entry.done.length > 20 && entry.not_done.length > 20) {
    return 'mixed';
  }

  // Негативная
  if (/не получилось|провал|не успел|плохо/i.test(text) && !entry.done) {
    return 'negative';
  }

  // Позитивная
  return 'positive';
}
```

---

## Метрики успеха

| Метрика | Цель | Как измерять |
|---------|------|--------------|
| Response relevance | >80% | Субъективная оценка релевантности |
| User reply rate | >20% | % пользователей, ответивших на вопрос |
| Journal continuation | >60% | % пользователей, написавших следующую запись |
| Satisfaction | >4.0 | Средняя оценка (если собираем) |

---

## Принципы

1. **Один фокус** — не комментировать всё, выбрать главное
2. **Конкретика** — реакция на содержание, не общие слова
3. **Вопрос для углубления** — помочь осознать, не дать готовый ответ
4. **Без оценки** — не "молодец", не "жаль"
5. **Адаптация по типу** — burnout требует другого тона, чем позитив

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-01-20 | 1.0 | Создана первая версия Journal Response |
