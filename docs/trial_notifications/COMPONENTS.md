# Компоненты для реализации

## Обзор

```
src/components/
├── subscription/
│   ├── TrialBanner.vue         # Баннер для trial и freemium
│   └── TrialExpiredModal.vue   # Модалка при истечении trial
```

---

## 1. TrialBanner.vue

**Расположение:** `src/components/subscription/TrialBanner.vue`

**Назначение:** Универсальный баннер сверху страницы для отображения статуса подписки.

### Props

| Prop | Тип | Описание |
|------|-----|----------|
| — | — | Компонент сам получает данные из subscriptionStore |

### Computed

```javascript
// Тип баннера
bannerType: 'trial_normal' | 'trial_warning' | 'trial_danger' | 'freemium' | null

// Показывать ли баннер
shouldShow: boolean

// Можно ли закрыть баннер
canDismiss: boolean
```

### Логика отображения

```javascript
const shouldShow = computed(() => {
  const store = useSubscriptionStore()

  // Не показываем для платных
  if (store.isPaid) return false

  // Показываем для trial
  if (store.isTrial) return true

  // Показываем для freemium только на dashboard
  if (store.isFree && route.path === '/app') return true

  return false
})
```

### Варианты отображения

**Trial Normal:**
- Фон: `var(--primary-color)` с opacity 0.1
- Иконка: Gift
- Текст: "Пробный период: осталось X дней"
- Кнопка: "Продлить подписку"

**Trial Warning:**
- Фон: `var(--warning-color)` с opacity 0.15
- Иконка: AlertTriangle
- Текст: "Пробный период заканчивается через X дней!"
- Кнопка: "Продлить"

**Trial Danger:**
- Фон: `var(--danger-color)` с opacity 0.15
- Иконка: Clock
- Текст: "Последний день пробного периода!"
- Кнопка: "Оформить подписку"

**Freemium:**
- Фон: `var(--bg-secondary)`
- Иконка: Package
- Текст: "Тариф: Freemium"
- Кнопка: "Перейти на Pro"

### Интеграция

Добавить в `App.vue` или в layout компонент:

```vue
<template>
  <div id="app">
    <TrialBanner />
    <Sidebar />
    <main>
      <router-view />
    </main>
  </div>
</template>
```

---

## 2. TrialExpiredModal.vue

**Расположение:** `src/components/subscription/TrialExpiredModal.vue`

**Назначение:** Модалка, которая показывается один раз когда trial период истёк.

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| modelValue | Boolean | false | v-model для показа/скрытия |

### Emits

| Event | Payload | Описание |
|-------|---------|----------|
| update:modelValue | boolean | Закрытие модалки |
| continue-free | — | Пользователь выбрал продолжить бесплатно |
| upgrade | — | Пользователь выбрал оформить подписку |

### Структура модалки

```
┌─────────────────────────────────────────┐
│ [X]                                     │  <- Кнопка закрытия
│                                         │
│                 ⏰                       │  <- Иконка Clock
│                                         │
│     Пробный период закончился           │  <- Заголовок h2
│                                         │
│  Спасибо, что попробовали OnePercent!   │  <- Подзаголовок
│  Теперь вы на бесплатном тарифе.        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Что стало недоступно:          │    │  <- Блок с фичами
│  │  ✕ AI ментор и помощник         │    │
│  │  ✕ Безлимитные цели             │    │
│  │  ✕ Аналитика привычек           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Продолжить бесплатно]  [⚡ Подписка]  │  <- Кнопки действий
└─────────────────────────────────────────┘
```

### Логика показа

```javascript
// В App.vue или Dashboard.vue
const showTrialExpiredModal = ref(false)

onMounted(() => {
  const store = useSubscriptionStore()
  const alreadyShown = localStorage.getItem('trial_expired_modal_shown')

  if (store.isTrialExpired && !alreadyShown) {
    showTrialExpiredModal.value = true
  }
})

function handleModalClose() {
  localStorage.setItem('trial_expired_modal_shown', 'true')
  showTrialExpiredModal.value = false
}

function handleUpgrade() {
  handleModalClose()
  router.push('/app/subscription')
}
```

### localStorage

**Ключ:** `trial_expired_modal_shown`
**Значение:** `'true'`
**Когда сбрасывать:** Не сбрасываем (модалка показывается только 1 раз)

---

## Существующие компоненты (уже реализованы)

### UpgradeModal.vue

**Расположение:** `src/components/UpgradeModal.vue`

**Используется когда:** Пользователь на Freemium пытается использовать Pro-функцию.

**Не требует изменений** — уже работает корректно.

---

## Порядок реализации

1. Создать папку `src/components/subscription/`
2. Создать `TrialBanner.vue`
3. Создать `TrialExpiredModal.vue`
4. Интегрировать `TrialBanner` в `App.vue`
5. Интегрировать `TrialExpiredModal` в `App.vue` или `Dashboard.vue`
6. Протестировать все состояния
