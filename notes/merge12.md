# Merge 12 — Исправление бесконечного цикла онбординга

**Дата:** 3 декабря 2025

## Обзор изменений

Критическое исправление бага, при котором пользователи застревали в бесконечном цикле онбординга после его завершения. Также добавлена синхронизация целей с бэкендом при завершении урока в Банке целей.

---

## 1. Исправление бесконечного цикла онбординга (OnboardingAI.vue)

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

## Связанные файлы

| Файл | Роль |
|------|------|
| `src/components/OnboardingAI.vue` | UI онбординга, вызов backend |
| `src/stores/app.js` | State management, shouldShowOnboarding |
| `src/views/Dashboard.vue` | Conditional render OnboardingAI vs content |
| `src/components/PlanReview.vue` | Overlay для подтверждения AI-целей |
| `src/router/index.js` | Auth guards, checkUserAuth() |
| `src/services/api.js` | updateOnboardingData() |
