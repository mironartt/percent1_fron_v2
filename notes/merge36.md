# Merge 36: LandingVersion7 — Интеграция с бэкендом и назначение основным лендингом

**Дата:** 31 декабря 2025

## Обзор

В этой сессии выполнена интеграция секции тарифов LandingVersion7 с Django REST API для динамического отображения цен, исправлены все неработающие ссылки, и страница назначена основным лендингом приложения.

---

## Выполненные работы

### 1. Интеграция секции тарифов с бэкендом

**Файл:** `src/views/land/LandingVersion7.vue`

#### Добавленные импорты:
```javascript
import { useSubscriptionStore } from '@/stores/subscription'
```

#### Добавленные переменные и функции:
```javascript
const subscriptionStore = useSubscriptionStore()
const selectedTerm = ref(null)

const pricingTariffs = computed(() => subscriptionStore.tariffs)
const pricingTerms = computed(() => subscriptionStore.terms)

function selectTerm(termId) {
  const term = pricingTerms.value.find(t => t.id === termId)
  if (term) {
    selectedTerm.value = term
    billingCycle.value = term.months || 1
  }
}

function getTariffPrice(tariff) {
  if (!selectedTerm.value || !tariff.prices) {
    return { price: tariff.base_price || 0, period: '/ месяц' }
  }
  const priceEntry = tariff.prices.find(p => p.term_id === selectedTerm.value.id)
  if (priceEntry) {
    return { 
      price: priceEntry.price_per_month, 
      period: '/ месяц' 
    }
  }
  return { price: tariff.base_price || 0, period: '/ месяц' }
}

function getTariffSavings(tariff) {
  if (!selectedTerm.value || !tariff.prices || selectedTerm.value.months <= 1) return 0
  const baseMonthly = tariff.base_price || 0
  const priceEntry = tariff.prices.find(p => p.term_id === selectedTerm.value.id)
  if (priceEntry && baseMonthly > 0) {
    const totalWithoutDiscount = baseMonthly * selectedTerm.value.months
    const totalWithDiscount = priceEntry.price_per_month * selectedTerm.value.months
    return Math.round(totalWithoutDiscount - totalWithDiscount)
  }
  return 0
}

function getSortedFeatureItems(tariff) {
  if (!tariff.feature_items) return []
  return [...tariff.feature_items].sort((a, b) => (a.order || 0) - (b.order || 0))
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
```

#### Обновлён onMounted:
```javascript
onMounted(() => {
  subscriptionStore.loadTariffs(true).then(() => {
    if (pricingTerms.value.length > 0 && !selectedTerm.value) {
      const defaultTerm = pricingTerms.value.find(t => t.months === 1) || pricingTerms.value[0]
      if (defaultTerm) {
        selectTerm(defaultTerm.id)
      }
    }
  })
  // ... остальной код
})
```

#### Обновлён шаблон секции тарифов:
- **Селектор периодов:** Теперь использует `pricingTerms` из store с fallback на статичные `pricingPeriods`
- **Карточки тарифов:** Динамически рендерятся из `pricingTariffs` с поддержкой:
  - `is_popular` — выделение популярного тарифа
  - `is_soon` — тариф "Скоро" (неактивная кнопка)
  - `code === 'free'` — бесплатный тариф
- **Fallback:** При отсутствии данных с API показываются статические карточки

---

### 2. Исправление ссылок в футере

**Файл:** `src/views/land/LandingVersion7.vue`

#### Было (неправильно):
```html
<router-link to="/policy/privacy">Политика конфиденциальности</router-link>
<router-link to="/policy/terms">Пользовательское соглашение</router-link>
<router-link to="/policy/disclaimer">Отказ от ответственности</router-link>
```

#### Стало (правильно):
```html
<router-link to="/privacy">Политика конфиденциальности</router-link>
<router-link to="/termspolicy">Пользовательское соглашение</router-link>
<router-link to="/disclaimer">Отказ от ответственности</router-link>
```

---

### 3. Назначение LandingVersion7 основным лендингом

**Файл:** `src/router/index.js`

#### Изменения маршрутов:

| Путь | Было | Стало |
|------|------|-------|
| `/` | `LandingVersion5` | `LandingVersion7` |
| `/land/old_v5` | (не существовал) | `LandingVersion5` |
| `/land/version7` | `LandingVersion7` | `redirect: '/'` |

#### Код изменений:
```javascript
// Публичный лендинг (версия 7 - основная)
{
  path: '/',
  name: 'landing',
  component: LandingVersion7,
  meta: { title: 'OnePercent — Системный рост в жизни', public: true }
},

// Предыдущий лендинг (версия 5)
{
  path: '/land/old_v5',
  name: 'landing-old-v5',
  component: LandingVersion5,
  meta: { title: 'OnePercent - Система управления жизнью', public: true }
},

// Редирект со старого пути
{
  path: '/land/version7',
  redirect: '/'
},
```

---

## Проверенные ссылки и кнопки

| Элемент | Путь | Результат |
|---------|------|-----------|
| Кнопка "Войти" (хедер) | `/login` → `/auth/login` | ✓ Работает |
| Кнопка "Начать" (хедер) | `/register` → `/auth/register` | ✓ Работает |
| CTA "Сделать +1% уже сегодня" | `/register` → `/auth/register` | ✓ Работает |
| Ссылка "Политика конфиденциальности" | `/privacy` | ✓ Работает |
| Ссылка "Пользовательское соглашение" | `/termspolicy` | ✓ Работает |
| Ссылка "Отказ от ответственности" | `/disclaimer` | ✓ Работает |
| Главная страница | `/` | ✓ LandingVersion7 |

---

## Структура лендингов после изменений

```
/                   → LandingVersion7 (основной)
/land/old_v5        → LandingVersion5 (предыдущий основной)
/land/old_v1        → Landing (самый первый)
/land/version2      → LandingVersion2 (persona-driven)
/land/version3      → LandingVersion3 (pain-driven)
/land/version4      → LandingVersion4 (product journey)
/land/version6      → LandingVersion6 (bento design)
/land/version7      → redirect → /
```

---

## Технические заметки

1. **Fallback для API:** Если API тарифов недоступен, отображаются статические карточки с захардкоженными данными
2. **Tailwind CSS:** Загружается через CDN (`cdn.tailwindcss.com`) динамически при монтировании компонента
3. **Синхронизация billingCycle:** Функция `selectTerm()` обеспечивает синхронизацию `selectedTerm` и `billingCycle` для корректного расчёта цен
