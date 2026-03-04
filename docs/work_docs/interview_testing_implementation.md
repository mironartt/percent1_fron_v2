# Итерационное AI интервью-тестирование — Frontend реализация

## Обзор

Фронтенд-интеграция итерационного AI интервью после онбординга. Пользователь отвечает на вопросы (по одному на экране), AI адаптивно подбирает следующую порцию (3-10 итераций), по завершении — сводка от AI ментора.

## Навигация

- **Авторедирект**: после завершения онбординга (`OnboardingNew.vue`) → `/app/interview`
- **CTA-баннер**: на дашборде при наличии активной сессии (`in_progress`)
- **Без пункта в sidebar/меню** — интервью запускается автоматически

## Созданные файлы

| Файл | Описание |
|------|----------|
| `src/views/InterviewTesting.vue` | Основной view — все экраны интервью |

## Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `src/services/api.js` | +5 API функций (`startInterviewSession`, `getInterviewSession`, `getInterviewIteration`, `submitInterviewIteration`, `createInterviewGoals`) |
| `src/router/index.js` | +lazy import `InterviewTesting`, +роут `/app/interview` |
| `src/components/OnboardingNew.vue` | Редирект после онбординга: `/app` → `/app/interview` (3 места) |
| `src/views/Dashboard.vue` | +CTA-баннер «Продолжить интервью» при активной сессии (`in_progress` или `analyzing`) |

## API эндпоинты

| Эндпоинт | Назначение |
|----------|------------|
| `POST /api/rest/front/app/interview/session/start/` | Начать сессию (запускает AI task) |
| `POST /api/rest/front/app/interview/session/get/` | Информация о сессии (или последней) |
| `POST /api/rest/front/app/interview/iteration/get/` | Текущая итерация с вопросами |
| `POST /api/rest/front/app/interview/iteration/submit/` | Отправить ответы на итерацию |
| `POST /api/rest/front/app/interview/goals/create/` | Создать цели из рекомендаций AI |

## Экраны (фазы)

| Phase | Описание |
|-------|----------|
| `idle` | Стартовый экран — кнопки «Начать» / «Продолжить» / «Пропустить» |
| `loading` | AI подбирает вопросы — прогресс-бар через WebSocket |
| `questions` | Ответ на вопрос (по одному) — варианты + свободный текст |
| `submitting` | Отправка ответов — лоадер |
| `analyzing` | AI генерирует саммари — прогресс-бар через WebSocket |
| `results` | Результаты: портрет, сильные стороны, зоны роста, рекомендованные цели с выбором |
| `error` | Ошибка — сообщение + кнопка retry |

## WebSocket интеграция

Используется существующий `aiTasksStore` (`src/stores/aiTasks.js`):
- Подключение: `aiTasksStore.connect()` в `onMounted`
- Watcher на `aiTasksStore.activeTasks` — отслеживание `pendingTaskId`
- `pendingTaskType` различает `'questions'` и `'summary'` задачи
- Task types: `interview_select_questions`, `interview_generate_summary`
- События: `task_started`, `task_progress`, `task_completed`, `task_failed`

## Reconnect логика

При перезагрузке страницы:
1. `getInterviewSession()` → проверка последней сессии
2. Если `in_progress` → `getInterviewIteration()` → восстановление состояния
3. `waiting_answers` → показать вопросы
4. `selecting` → показать loading, WS подхватит
5. `analyzing` → показать экран анализа, подключить WS для summary task
6. `completed` → показать результаты с ai_insights

## Phase 3: AI Анализ, Результаты и Создание Целей

### Analyzing фаза
- Переход после завершения последней итерации (`session_completed: true, analyzing: true`)
- Прогресс-бар через WebSocket (`pendingTaskType = 'summary'`)
- Reconnect: при перезагрузке проверка `summary_task_id` в сессии

### Results фаза — богатый экран результатов
На основе `ai_insights` отображается:
- **Mentor Message** — персональное обращение от Саши
- **Personality Profile** — портрет с `summary` и `key_traits` (бейджи)
- **Strengths** — сильные стороны по категориям (цвета сфер жизни)
- **Growth Areas** — зоны роста с приоритетами (priority: high)
- **Recommended Focus** — нумерованный список фокусов
- **Recommended Goals** — цели с чекбоксами для выбора

### Создание целей
- Все рекомендованные цели выбраны по умолчанию
- Пользователь может снять/поставить чекбоксы
- Кнопка «Создать N целей» → `POST /app/interview/goals/create/`
- `goal_indexes` — 0-based индексы выбранных целей
- После создания: success-блок с количеством целей и шагов
- Кнопка «Перейти к целям» → `/app/goals-bank`
- Защита от дублирования: `goalsCreated` flag

### Обработка ошибок целей

| Код | Действие |
|-----|---------|
| `interview_goals_already_created` | Toast info, `goalsCreated = true` |
| `interview_session_not_completed` | Toast warning |
| `interview_no_insights` | Toast warning |
| `interview_invalid_goal_index` | Toast error |

### Fallback
Если `ai_insights` отсутствует, но есть `ai_summary` — показывается простая карточка ментора (обратная совместимость).

## Обработка ошибок

| Код | Действие |
|-----|---------|
| `interview_no_ai_access` | Модалка апгрейда подписки |
| `interview_session_already_active` | Автоматическое восстановление сессии |
| `interview_deep_missing_answers` | Toast + остаться на вопросах |
| `interview_session_not_found` | Сброс в idle |
| Task failed (WS) | Экран ошибки + retry (различие для questions/summary) |

## Формат ответов

```javascript
// Каждый вопрос — объект:
{
  question_id: 15,
  selected_option_id: 42,    // ID выбранного варианта (nullable)
  free_text: "Комментарий"   // Свободный текст (nullable, max 5000)
}
```

Обязательно: `selected_option_id` ИЛИ `free_text` (или оба).
