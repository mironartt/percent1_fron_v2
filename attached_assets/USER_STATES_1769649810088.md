# Состояния пользователя

## Полный цикл

```
Регистрация → Trial (7 дней) → Trial истёк → Freemium
                                    ↓
                              Оплата → Paid
```

## Таблица состояний

| # | Состояние | Условие | Баннер | Модалка | Где показывать |
|---|-----------|---------|--------|---------|----------------|
| 1 | Trial (норма) | `is_trial && days_remaining > 3` | Нейтральный | — | Везде |
| 2 | Trial (warning) | `is_trial && days_remaining <= 3 && days_remaining > 1` | Warning (жёлтый) | — | Везде |
| 3 | Trial (danger) | `is_trial && days_remaining <= 1` | Danger (красный) | — | Везде |
| 4 | Trial истёк | `is_trial_expired && !shown_expired_modal` | — | TrialExpiredModal | Один раз |
| 5 | Freemium | `tariff === 'free' && !is_trial` | Ненавязчивый | При Pro-фичах | Только Dashboard |
| 6 | Paid | `tariff !== 'free'` | — | — | — |

## Детали по состояниям

### 1. Trial (7-4 дня осталось)

**Условие:**
```javascript
subscriptionStore.isTrial && subscriptionStore.daysRemaining > 3
```

**Поведение:**
- Показываем нейтральный баннер сверху
- Пользователь может закрыть баннер (опционально)
- Цвет: синий/фиолетовый (primary)

---

### 2. Trial Warning (3-2 дня осталось)

**Условие:**
```javascript
subscriptionStore.isTrial &&
subscriptionStore.daysRemaining <= 3 &&
subscriptionStore.daysRemaining > 1
```

**Поведение:**
- Показываем warning баннер
- Баннер нельзя закрыть
- Цвет: жёлтый/оранжевый (warning)

---

### 3. Trial Danger (последний день)

**Условие:**
```javascript
subscriptionStore.isTrial && subscriptionStore.daysRemaining <= 1
```

**Поведение:**
- Показываем danger баннер
- Баннер нельзя закрыть
- Цвет: красный (danger)

---

### 4. Trial истёк (переход на Freemium)

**Условие:**
```javascript
subscriptionStore.isTrialExpired &&
!localStorage.getItem('trial_expired_modal_shown')
```

**Поведение:**
- Показываем модалку TrialExpiredModal
- После закрытия сохраняем флаг в localStorage
- Модалка показывается только 1 раз

**localStorage ключ:** `trial_expired_modal_shown`

---

### 5. Freemium (после trial)

**Условие:**
```javascript
subscriptionStore.isFree && !subscriptionStore.isTrial
```

**Поведение:**
- Ненавязчивый баннер только на Dashboard
- При попытке использовать Pro-функции → UpgradeModal (уже реализован)
- Баннер можно скрыть на сессию (опционально)

---

### 6. Paid (платный тариф)

**Условие:**
```javascript
subscriptionStore.isPaid
```

**Поведение:**
- Никаких баннеров и модалок
- Полный доступ ко всем функциям

## Приоритет проверок

```javascript
function getSubscriptionState() {
  const store = subscriptionStore

  // 1. Платный тариф — ничего не показываем
  if (store.isPaid) return 'paid'

  // 2. Trial истёк — показываем модалку (если не показывали)
  if (store.isTrialExpired) return 'trial_expired'

  // 3. Trial — показываем баннер
  if (store.isTrial) {
    if (store.daysRemaining <= 1) return 'trial_danger'
    if (store.daysRemaining <= 3) return 'trial_warning'
    return 'trial_normal'
  }

  // 4. Freemium — ненавязчивый баннер
  if (store.isFree) return 'freemium'

  return 'unknown'
}
```
