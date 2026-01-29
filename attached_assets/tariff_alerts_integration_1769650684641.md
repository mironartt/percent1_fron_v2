# Интеграция фронтенда с бэкендом: Уведомления о тарифах

Документация по интеграции системы уведомлений о триале и подписке.

---

## Обзор

Бэкенд предоставляет:
1. **Данные о подписке** в `get-user-data` — для баннеров и модалок
2. **API отметки модалки** — для предотвращения повторного показа
3. **Push-уведомления** — Telegram и WebSocket (опционально, управляется админкой)

---

## 1. Данные о подписке в get-user-data

### Запрос

```
POST /api/rest/front/get-user-data/
```

### Ответ (новые поля)

```json
{
  "status": "ok",
  "data": {
    // ... существующие поля ...

    "subscription": {
      // Статус из БД
      "status": "trial",                    // trial | active | expired | cancelled

      // Реальный статус с учётом истечения
      "effective_status": "trial",          // trial | active | expired

      // Текущий тариф из БД
      "tariff": {
        "id": 2,
        "code": "pro",                      // free | pro | premium | family
        "title": "Профессиональный"
      },

      // Реальный тариф (с учётом истечения — Free если подписка истекла)
      "effective_tariff": {
        "id": 2,
        "code": "pro",
        "title": "Профессиональный"
      },

      // Флаги состояния
      "is_trial": true,                     // Активен ли триал
      "is_trial_expired": false,            // Истёк ли триал
      "is_paid": false,                     // Активна ли платная подписка
      "is_paid_expired": false,             // Истекла ли платная подписка

      // Временные данные
      "days_remaining": 5,                  // Оставшиеся дни (int)
      "trial_end": "2025-02-15T00:00:00+03:00",  // Дата окончания триала ISO format (или null)
      "paid_end": null,                     // Дата окончания подписки ISO format (или null)

      // Доступные действия
      "can_upgrade": true,                  // Можно ли улучшить тариф
      "can_prolong": false,                 // Можно ли продлить подписку

      // Флаги модалок
      "should_show_trial_expired_modal": false,  // Показать модалку истечения триала?
      "should_show_paid_expired_modal": false    // Показать модалку истечения подписки?
    }
  }
}
```

---

## 2. Логика определения состояния

### Pinia Store (subscriptionStore)

```typescript
interface TariffInfo {
  id: number
  code: 'free' | 'pro' | 'premium' | 'family'
  title: string
}

interface SubscriptionState {
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  effectiveStatus: 'trial' | 'active' | 'expired'
  tariff: TariffInfo
  effectiveTariff: TariffInfo
  isTrial: boolean
  isTrialExpired: boolean
  isPaid: boolean
  isPaidExpired: boolean
  daysRemaining: number
  trialEnd: string | null
  paidEnd: string | null
  canUpgrade: boolean
  canProlong: boolean
  shouldShowTrialExpiredModal: boolean
  shouldShowPaidExpiredModal: boolean
}

// Computed getters
const isFree = computed(() =>
  state.tariff.code === 'free' && !state.isTrial
)

const isPaidTariff = computed(() =>
  state.tariff.code !== 'free'
)

const subscriptionState = computed(() => {
  // Платный тариф активен — ничего не показываем
  if (state.isPaid) return 'paid'

  // Платная подписка истекла — показать модалку (если не показывали)
  if (state.isPaidExpired) return 'paid_expired'

  // Trial истёк — показать модалку (если не показывали)
  if (state.isTrialExpired) return 'trial_expired'

  // Trial активен — показать баннер
  if (state.isTrial) {
    if (state.daysRemaining <= 1) return 'trial_danger'
    if (state.daysRemaining <= 3) return 'trial_warning'
    return 'trial_normal'
  }

  // Freemium — ненавязчивый баннер
  if (isFree.value) return 'freemium'

  return 'unknown'
})
```

---

## 3. Таблица состояний и UI

| Состояние | Условие | UI |
|-----------|---------|-----|
| `trial_normal` | `isTrial && daysRemaining > 3` | Нейтральный баннер (primary) |
| `trial_warning` | `isTrial && daysRemaining <= 3 && daysRemaining > 1` | Warning баннер (жёлтый) |
| `trial_danger` | `isTrial && daysRemaining <= 1` | Danger баннер (красный) |
| `trial_expired` | `isTrialExpired && shouldShowTrialExpiredModal` | Модалка (1 раз) |
| `paid_expired` | `isPaidExpired && shouldShowPaidExpiredModal` | Модалка (1 раз) |
| `freemium` | `!isTrial && tariff.code === 'free'` | Ненавязчивый баннер на Dashboard |
| `paid` | `isPaid` | Ничего не показываем |

---

## 4. API отметки модалки как показанной

После закрытия модалки `TrialExpiredModal` вызвать:

### Запрос

```
POST /api/rest/front/app/subscription/modal-shown/
Content-Type: application/json

{
  "modal_type": "trial_expired"
}
```

**modal_type:**
- `trial_expired` — модалка истечения триала
- `paid_expired` — модалка истечения платной подписки

### Ответ (успех)

```json
{
  "status": "ok",
  "data": {
    "success": true,
    "modal_type": "trial_expired"
  }
}
```

### Ответ (уже была показана)

```json
{
  "status": "ok",
  "data": {
    "success": false,
    "modal_type": "trial_expired"
  }
}
```

### Ответ (ошибка)

```json
{
  "status": "error",
  "error_data": {
    "error": "invalid_modal_type",
    "message": "Неверный тип модалки"
  }
}
```

---

## 5. Пример интеграции модалки

### App.vue (или Dashboard.vue)

```vue
<template>
  <div id="app">
    <!-- Баннер триала/подписки -->
    <TrialBanner />

    <!-- Модалка истечения триала -->
    <TrialExpiredModal
      v-model="showTrialExpiredModal"
      @continue-free="handleContinueFree"
      @upgrade="handleUpgrade"
    />

    <!-- Остальной контент -->
    <Sidebar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import { apiSubscriptionModalShown } from '@/api/subscription'
import TrialBanner from '@/components/subscription/TrialBanner.vue'
import TrialExpiredModal from '@/components/subscription/TrialExpiredModal.vue'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const showTrialExpiredModal = ref(false)
const showPaidExpiredModal = ref(false)

onMounted(() => {
  // Проверяем нужно ли показать модалку истечения триала
  if (subscriptionStore.shouldShowTrialExpiredModal) {
    showTrialExpiredModal.value = true
  }
  // Или модалку истечения платной подписки
  else if (subscriptionStore.shouldShowPaidExpiredModal) {
    showPaidExpiredModal.value = true
  }
})

async function handleContinueFree() {
  // Отмечаем модалку как показанную
  await apiSubscriptionModalShown('trial_expired')
  showTrialExpiredModal.value = false

  // Обновляем данные в store
  subscriptionStore.setShouldShowTrialExpiredModal(false)
}

async function handleUpgrade() {
  // Отмечаем модалку как показанную
  await apiSubscriptionModalShown('trial_expired')
  showTrialExpiredModal.value = false

  // Редирект на страницу подписки
  router.push('/app/subscription')
}
</script>
```

---

## 6. API функция

### api/subscription.ts

```typescript
import { apiPost } from './base'

interface ModalShownResponse {
  success: boolean
  modal_type: string
}

export async function apiSubscriptionModalShown(
  modalType: 'trial_expired' | 'paid_expired'
): Promise<ModalShownResponse> {
  const response = await apiPost('/app/subscription/modal-shown/', {
    modal_type: modalType
  })
  return response.data
}
```

---

## 7. Важные замечания

### localStorage НЕ используется

Флаги показа модалок хранятся на сервере:
- `UserSubscription.trial_expired_modal_shown` — модалка истечения триала
- `UserSubscription.paid_expired_modal_shown` — модалка истечения платной подписки

**Преимущества:**
- Работает на всех устройствах
- Не сбрасывается при очистке браузера
- Консистентность данных

### Порядок вызовов

1. При входе в приложение → `get-user-data`
2. Проверить `shouldShowTrialExpiredModal`
3. Если `true` → показать модалку
4. После закрытия модалки → вызвать `modal-shown`
5. При следующем `get-user-data` → `shouldShowTrialExpiredModal: false`

### Кэширование

Данные подписки НЕ кэшируются на фронтенде отдельно от `userStore`.
При каждом вызове `get-user-data` получаем актуальные данные.

---

## 8. Push-уведомления (Telegram/WebSocket)

Бэкенд отправляет push-уведомления автоматически:
- За N дней до окончания триала (настраивается в админке)
- За N дней до окончания платной подписки

**Пользователь получает:**
- Сообщение в Telegram-бот (если привязан)
- Уведомление в AI-чат (WebSocket)

**Управление:**
- Включение/выключение в `ProjectSettings.tariff_alerts_telegram_enabled`
- Дни предупреждений в `ProjectSettings.tariff_warning_days` (например `[3, 1]`)

---

## 9. Структура компонентов

```
src/components/subscription/
├── TrialBanner.vue           # Баннер сверху страницы
└── TrialExpiredModal.vue     # Модалка при истечении триала
```

**TrialBanner:**
- Автоматически определяет тип (trial_normal, trial_warning, trial_danger, freemium)
- Показывается везде для trial, только на Dashboard для freemium

**TrialExpiredModal (или SubscriptionExpiredModal):**
- Показывается 1 раз при `shouldShowTrialExpiredModal: true` или `shouldShowPaidExpiredModal: true`
- После закрытия вызывает `modal-shown` API с соответствующим `modal_type`
- Для `paid_expired` рекомендуется показывать другой текст (акцент на продлении)

---

## 10. Чек-лист интеграции

- [ ] Обновить Pinia store с данными subscription
- [ ] Создать `TrialBanner.vue`
- [ ] Создать `TrialExpiredModal.vue` (или универсальную `SubscriptionExpiredModal.vue`)
- [ ] Добавить API функцию `apiSubscriptionModalShown`
- [ ] Интегрировать компоненты в App.vue
- [ ] Протестировать все состояния триала (trial_normal → trial_warning → trial_danger → trial_expired)
- [ ] Протестировать состояние paid_expired (истечение платной подписки)
- [ ] Проверить состояние freemium (бесплатный тариф без триала)
- [ ] Проверить что модалка показывается только 1 раз (флаг на сервере)
- [ ] Проверить работу на разных устройствах (синхронизация через сервер)
