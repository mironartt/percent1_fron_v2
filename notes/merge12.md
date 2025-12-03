# Merge 12 — Исправление бесконечного цикла онбординга

**Дата:** 3 декабря 2025

## Обзор изменений

Критическое исправление бага, при котором пользователи застревали в бесконечном цикле онбординга после его завершения. Проблема была в двух местах:
1. OnboardingAI не отправлял данные на backend при завершении
2. При загрузке страницы `finish_onboarding` из user data НЕ синхронизировался с `onboarding.completed`

---

## 1. Синхронизация user.finish_onboarding → onboarding.completed (app.js)

### Проблема
Backend корректно возвращал `finish_onboarding: true` в `/api/rest/front/get-user-data/`, но:
- `setUser()` устанавливал только `user.value.finish_onboarding`
- `onboarding.value.completed` оставался `false`
- `shouldShowOnboarding` проверял ОБА флага: `user.finish_onboarding || onboarding.completed`
- При любой перезаписи `onboarding.value` онбординг снова показывался

### Решение #1: Синхронизация в setUser()

```javascript
function setUser(userData) {
  // ... existing code ...
  
  // ДОБАВЛЕНО: синхронизация onboarding.completed
  if (userData.finish_onboarding) {
    onboarding.value.completed = true
    if (DEBUG_MODE) {
      console.log('[Store] Synced onboarding.completed = true from user.finish_onboarding')
    }
  }
}
```

### Решение #2: Guard в loadOnboardingFromBackend()

```javascript
async function loadOnboardingFromBackend() {
  // ДОБАВЛЕНО: early return если онбординг уже завершён
  if (user.value.finish_onboarding) {
    if (DEBUG_MODE) {
      console.log('[Store] Skipping onboarding load - user.finish_onboarding is true')
    }
    onboarding.value.completed = true
    onboarding.value.loading = false
    return onboarding.value
  }
  
  // ... existing code ...
  
  // ИЗМЕНЕНО: fallback на user.finish_onboarding
  const isCompleted = data.is_complete ?? user.value.finish_onboarding ?? false
}
```

---

## 2. Отправка данных на backend при завершении (OnboardingAI.vue)

### Симптомы
После завершения онбординга и подтверждения AI-целей в PlanReview, пользователи снова видели экран "Ваши первые цели" с кнопкой "Сделать первый +1%". Это создавало бесконечный цикл без возможности попасть в личный кабинет.

### Корневая причина
Функция `completeOnboarding()` в OnboardingAI.vue обновляла только **локальное состояние** (`onboarding.value.completed = true`), но **не отправляла данные на backend** для установки `is_complete=true` и `finish_onboarding=true`.

При любой последующей проверке авторизации (navigation guard, refresh) backend возвращал `finish_onboarding=false`, что делало `shouldShowOnboarding = true` и снова показывало онбординг.

### Решение
Добавлен вызов `store.completeOnboardingWithBackend()` перед обновлением локального состояния. Это отправляет данные на backend с `is_complete: true`.

### Fallback для ошибок
Добавлена новая функция `setUserFinishOnboarding()` в store. При ошибке backend'а флаг устанавливается локально, чтобы предотвратить цикл и позволить пользователю продолжить работу.

### Изменённые файлы

**src/components/OnboardingAI.vue** (строки 593-622)

```javascript
// Было
store.completeOnboarding({
  surveyData: surveyData.value,
  sphereRatings: localSpheres.value.map(s => ({ id: s.id, score: s.score })),
  aiGoals: aiGoals.value,
  completedAt: new Date().toISOString()
})

// Стало
const onboardingData = {
  reason_joined: surveyData.value.reason,
  desired_changes: surveyData.value.desiredChanges,
  growth_comfort_zones: surveyData.value.growthZones,
  current_state: surveyData.value.currentState,
  goal_state: surveyData.value.goalState,
  why_important: surveyData.value.whyImportant
}

if (!SKIP_AUTH_CHECK) {
  try {
    await store.completeOnboardingWithBackend(onboardingData)
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] Onboarding saved to backend successfully')
    }
  } catch (error) {
    console.error('[OnboardingAI] Failed to save onboarding to backend:', error)
    store.setUserFinishOnboarding(true) // Fallback
  }
}

store.completeOnboarding({...})
```

**src/stores/app.js** (строки 550-556, 2702)

```javascript
// Новая функция
function setUserFinishOnboarding(value) {
  user.value.finish_onboarding = value
  if (DEBUG_MODE) {
    console.log('[Store] User finish_onboarding set to:', value)
  }
  saveToLocalStorage()
}

// Добавлен экспорт
return {
  // ...
  setUserFinishOnboarding,
  // ...
}
```

---

## 2. Flow после исправления

```
1. Пользователь завершает OnboardingAI (шаг 5)
2. completeOnboarding() вызывает completeOnboardingWithBackend()
3. Backend устанавливает is_complete=true, finish_onboarding=true
4. Локально обновляется onboarding.value.completed = true
5. initAIRecommendations() устанавливает showPlanReview = true
6. router.push('/app') → Dashboard
7. shouldShowOnboarding = false (onboarding.completed = true)
8. Dashboard рендерится, PlanReview overlay показывается
9. После подтверждения целей → showPlanReview = false
10. Dashboard показывается без overlay, цикл НЕ повторяется
```

---

## 3. Логика shouldShowOnboarding (справка)

```javascript
const shouldShowOnboarding = computed(() => {
  if (FORCE_SHOW_ONBOARDING) return true
  if (!user.value.is_authenticated) return false
  
  const isCompleted = user.value.finish_onboarding || onboarding.value.completed
  return !isCompleted
})
```

Теперь при успешном вызове backend'а `user.value.finish_onboarding` становится `true`, что гарантирует `shouldShowOnboarding = false` даже после refresh страницы.

---

## 4. Backend API используемый

**Endpoint:** `POST /api/rest/front/app/onboard/update/`

**Payload:**
```json
{
  "reason_joined": "...",
  "desired_changes": "...",
  "growth_comfort_zones": "...",
  "current_state": "...",
  "goal_state": "...",
  "why_important": "...",
  "is_complete": true
}
```

**Response:** При `is_complete: true` backend обновляет `finish_onboarding=true` в профиле пользователя.

---

## 5. Демо-режим (SKIP_AUTH_CHECK)

При `SKIP_AUTH_CHECK=true` (демо без backend):
- Backend вызов пропускается
- Локальное состояние обновляется как обычно
- `onboarding.value.completed = true` сохраняется в localStorage
- Цикл не возникает пока пользователь не очистит localStorage

---

## Тестирование

### Основной сценарий
1. Регистрация нового пользователя
2. Прохождение OnboardingAI (5 шагов)
3. Подтверждение AI-целей в PlanReview
4. Проверка что Dashboard показывается корректно
5. Refresh страницы — онбординг НЕ должен показаться снова

### Edge cases
- Backend недоступен → fallback устанавливает флаг локально
- Пользователь закрывает браузер между шагами → продолжает с сохранённого прогресса
- Демо-режим → всё работает локально без backend

---

## 6. Онбординг Банка Целей (GoalsBank.vue)

### Требование
"Онбординг банка целей" (3-шаговый урок с "Формирование банка целей") должен показываться ТОЛЬКО если `/api/rest/front/app/goals/get/` возвращает 0 целей.

### Реализация

```javascript
// API loading state
const isGoalsLoading = computed(() => goalsApiData.value?.loading ?? false)
const isGoalsLoaded = computed(() => goalsApiData.value?.loaded ?? false)

// Show empty state (onboarding) only when:
// 1. Goals are loaded from backend
// 2. Backend returned 0 goals
// 3. Lesson is not currently in progress
const showEmptyState = computed(() => {
  if (lessonStarted.value) return false
  if (!isGoalsLoaded.value) return false
  const totalItems = apiPagination.value?.totalItems ?? 0
  return totalItems === 0 && rawIdeas.value.length === 0
})

// Show summary (main goals table) when:
// 1. There are goals from backend, OR
// 2. Lesson is started (user is creating goals)
const showSummary = computed(() => {
  if (lessonStarted.value) return false
  if (!isGoalsLoaded.value) return false
  const totalItems = apiPagination.value?.totalItems ?? 0
  return totalItems > 0 || rawIdeas.value.length > 0
})
```

### Логика отображения

| Состояние | Что показывается |
|-----------|-----------------|
| `isGoalsLoading && !isGoalsLoaded` | Спиннер загрузки |
| `showEmptyState` | Онбординг (3 шага урока) |
| `showSummary` | Таблица целей с фильтрами |
| `lessonStarted` | Режим урока (шаги 1-3) |

---

## Связанные файлы

| Файл | Роль |
|------|------|
| `src/components/OnboardingAI.vue` | UI онбординга, вызов backend |
| `src/stores/app.js` | State management, shouldShowOnboarding |
| `src/views/Dashboard.vue` | Conditional render OnboardingAI vs content |
| `src/components/PlanReview.vue` | Overlay для подтверждения AI-целей |
| `src/views/GoalsBank.vue` | Банк целей с условным онбордингом |
| `src/router/index.js` | Auth guards, checkUserAuth() |
| `src/services/api.js` | updateOnboardingData() |
