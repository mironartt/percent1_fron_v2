# Интеграция онбординг-интервью с бэкендом

**Дата:** 2026-02-18
**Задача:** Интеграция фронтенд-компонента OnboardingNew.vue с бэкенд API интервью-онбординга (v3)

## Что было сделано

### 1. API функции (`src/services/api.js`)

Добавлены 2 новые функции:
- `getInterviewQuestions()` — `POST /api/rest/front/app/onboard/interview/get/`
- `submitInterviewAnswers(answers)` — `POST /api/rest/front/app/onboard/interview/submit/`

### 2. Store (`src/stores/app.js`)

**Новое состояние:**
- `interviewData` ref — хранит загруженные вопросы, статус загрузки, флаг already_completed

**Новые методы:**
- `loadInterviewQuestions()` — загружает вопросы интервью из API, заполняет interviewData
- `submitInterviewToBackend(answers)` — отправляет массив ответов, автоматически устанавливает finish_onboarding=true при успехе

**Экспорт:** `interviewData`, `loadInterviewQuestions`, `submitInterviewToBackend`

### 3. Компонент (`src/components/OnboardingNew.vue`)

**Стратегия:** Backend-first с fallback на хардкод.

**Новое поведение:**
1. При mount загружаются вопросы с бэкенда (`loadInterviewQuestions`)
2. Если загрузка успешна — UI строится на данных бэкенда (динамические computed)
3. Если ошибка — UI работает на хардкоде из `sphereScenarios.js` (как раньше)

**Ключевые изменения:**

- **Динамические computed вместо хардкода:**
  - `dynamicMotivationOptions` — опции мотивации из бэкенда (вопрос с category=null) или хардкод
  - `dynamicSphereOrder` — порядок сфер из бэкенда или хардкод
  - `dynamicSphereScenarios` — сценарии для каждой сферы из бэкенда или хардкод

- **Сбор ответов:** `interviewAnswersMap` ref хранит ответы в формате `{ question_id, selected_option_id, free_text }` для каждого вопроса

- **Единый submit:** В backend-режиме при нажатии "Начать" отправляется один запрос `submitInterviewToBackend(answers)`, который на бэкенде атомарно создаёт SSP оценки + завершает онбординг

- **Fallback:** Если submit не прошёл или вопросы не загрузились, используется старая логика (3 отдельных запроса: saveMotivation + saveSphereScores + completeOnboarding)

**Маппинг категорий:**
```
Backend → Frontend
work → career
health_sport → health
welfare → wealth
family → love
environment → friendship
hobby → hobbies
```

## Файлы изменены

| Файл | Изменение |
|------|-----------|
| `src/services/api.js` | +2 функции (getInterviewQuestions, submitInterviewAnswers) |
| `src/stores/app.js` | +1 ref (interviewData), +2 метода, +2 импорта, +3 экспорта |
| `src/components/OnboardingNew.vue` | Рефакторинг script setup: динамические computed, interviewAnswersMap, единый submit с fallback |

## Файл без изменений

- `src/data/sphereScenarios.js` — остаётся как fallback

## Логика работы

```
mount → loadInterviewQuestions()
  OK → backendQuestions = questions (useBackend = true)
  FAIL → backendQuestions = null (useBackend = false, fallback)

welcome → benefits → motivation:
  backend: answer_options из вопроса с category=null
  fallback: motivationOptions из хардкода

motivation → scenarios (6 сфер):
  backend: answer_options из вопросов с category!=null
  fallback: sphereScenarios из хардкода

scenarios → result → "Начать":
  backend: submitInterviewToBackend(answers) — 1 запрос
  fallback: completeOnboardingWithBackend() — 3 запроса
```

## Верификация

- Build проходит без ошибок (`npm run build`)
- Fallback-режим полностью совместим со старым поведением
- Backend-режим требует наличия management command `init_interview_questions` на бэкенде
