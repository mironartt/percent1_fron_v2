# Merge 21 - Исправления настроек геймификации и интеграция API амнистии

**Дата:** 8 декабря 2024

---

## 1. Исправление имён полей настроек геймификации

### Проблема
Фронтенд отправлял неправильные имена полей для настроек штрафов:
- Отправлялось: `xp_penalty_planning`, `xp_penalty_journal`
- Бэкенд ожидает: `planning_penalty_enabled`, `planning_penalty_amount`, `journal_penalty_enabled`, `journal_penalty_amount`

### Решение

#### Файл: `src/views/Habits.vue`

**saveGameSettings()** - обновлено формирование объекта настроек:
```javascript
// Было:
const backendSettings = {
  difficulty_mode: gameSettings.value.difficultyMode,
  xp_penalty_planning: gameSettings.value.planningPenaltyAmount || 0,
  xp_penalty_journal: gameSettings.value.journalPenaltyAmount || 0
}

// Стало:
const backendSettings = {
  difficulty_mode: gameSettings.value.difficultyMode,
  planning_penalty_enabled: gameSettings.value.planningPenalty ?? false,
  planning_penalty_amount: gameSettings.value.planningPenalty ? (gameSettings.value.planningPenaltyAmount ?? 10) : 0,
  journal_penalty_enabled: gameSettings.value.journalPenalty ?? false,
  journal_penalty_amount: gameSettings.value.journalPenalty ? (gameSettings.value.journalPenaltyAmount ?? 10) : 0
}
```

**loadGameSettings()** - обновлено чтение данных:
```javascript
// Было:
if (result.data.xp_penalty_planning !== undefined) {
  gameSettings.value.planningPenaltyAmount = result.data.xp_penalty_planning || 10
}

// Стало:
if (result.data.planning_penalty_enabled !== undefined) {
  gameSettings.value.planningPenalty = result.data.planning_penalty_enabled
  gameSettings.value.planningPenaltyAmount = result.data.planning_penalty_amount ?? 10
}
```

#### Файл: `src/stores/habits.js`

**settings ref** - обновлены дефолтные значения:
```javascript
// Было:
const settings = ref({
  difficulty_mode: 'balanced',
  xp_penalty_planning: 50,
  xp_penalty_journal: 50,
  ...
})

// Стало:
const settings = ref({
  difficulty_mode: 'balanced',
  planning_penalty_enabled: true,
  planning_penalty_amount: 10,
  journal_penalty_enabled: true,
  journal_penalty_amount: 10,
  ...
})
```

**resetStore()** - аналогичное обновление дефолтов.

### Важно
- Используется `??` вместо `||` для сохранения нулевых значений (0 XP)
- Когда штраф выключен, отправляется `amount: 0`

---

## 2. Интеграция API для модального окна амнистии

### Новый эндпоинт бэкенда
```
POST /api/rest/front/app/habits/amnesty/available-days/
```

### Структура ответа
```json
{
  "status": "ok",
  "data": {
    "week_start": "2025-12-08",
    "week_end": "2025-12-14",
    "amnesty_available": {
      "total": 1,
      "used": 0,
      "remaining": 1
    },
    "days": [
      {
        "date": "2025-12-08",
        "weekday": 1,
        "is_amnestied": false,
        "can_apply": true,
        "total_penalty": 25,
        "missed_habits_count": 2
      }
    ]
  }
}
```

### Изменения

#### Файл: `src/services/habitsApi.js`

Добавлен новый метод:
```javascript
/**
 * Получить доступные дни для амнистии
 * @param {string} [weekStart] - Начало недели (YYYY-MM-DD), опционально
 */
export async function getAmnestyAvailableDays(weekStart = null) {
  const params = weekStart ? { week_start: weekStart } : {}
  return habitsRequest('/amnesty/available-days/', params)
}
```

Обновлён комментарий секции: `// 4. АМНИСТИЯ (3 endpoints)` (было 2)

#### Файл: `src/stores/habits.js`

Добавлено реактивное состояние:
```javascript
const amnestyData = ref({
  week_start: null,
  week_end: null,
  amnesty_available: {
    total: 1,
    used: 0,
    remaining: 1
  },
  days: []
})
const amnestyDataLoading = ref(false)
```

Добавлен метод загрузки:
```javascript
async function loadAmnestyAvailableDays(weekStart = null) {
  amnestyDataLoading.value = true
  
  try {
    const result = await habitsApi.getAmnestyAvailableDays(weekStart)
    
    if (result.success) {
      amnestyData.value = {
        week_start: result.data.week_start,
        week_end: result.data.week_end,
        amnesty_available: result.data.amnesty_available || { total: 1, used: 0, remaining: 1 },
        days: result.data.days || []
      }
      
      if (result.data.amnesty_available?.remaining !== undefined) {
        settings.value.amnesty_remaining = result.data.amnesty_available.remaining
      }
      
      return { success: true, data: amnestyData.value }
    }
    return { success: false, error: result.error }
  } catch (e) {
    return { success: false, error: { message: e.message } }
  } finally {
    amnestyDataLoading.value = false
  }
}
```

Экспортированы новые переменные и метод.

#### Файл: `src/views/Habits.vue`

**Импорты** - добавлена иконка Loader2:
```javascript
import { ..., Loader2 } from 'lucide-vue-next'
```

**Функция открытия модального окна:**
```javascript
async function openAmnestyModal() {
  showAmnestyModal.value = true
  await habitsStore.loadAmnestyAvailableDays()
}
```

**Обновлённые вычисляемые свойства:**

`maxAmnesties` - приоритет API данных:
```javascript
const maxAmnesties = computed(() => {
  if (habitsStore.amnestyData.amnesty_available?.total !== undefined) {
    return habitsStore.amnestyData.amnesty_available.total
  }
  // fallback к локальным данным...
})
```

`amnestiesRemaining` - приоритет API данных:
```javascript
const amnestiesRemaining = computed(() => {
  if (habitsStore.amnestyData.amnesty_available?.remaining !== undefined) {
    return habitsStore.amnestyData.amnesty_available.remaining
  }
  // fallback к локальным данным...
})
```

`missedDaysForAmnesty` - использует API данные:
```javascript
const missedDaysForAmnesty = computed(() => {
  const apiDays = habitsStore.amnestyData.days || []
  if (apiDays.length > 0) {
    return apiDays
      .filter(day => day.can_apply && !day.is_amnestied && day.missed_habits_count > 0)
      .map(day => ({
        date: day.date,
        dayName: dayNames[dayOfWeek] + ', ' + date.getDate(),
        missedCount: day.missed_habits_count,
        penaltyXp: day.total_penalty
      }))
  }
  // fallback к локальным вычислениям...
})
```

`amnestiedDaysInWeek` - использует API данные:
```javascript
const amnestiedDaysInWeek = computed(() => {
  const apiDays = habitsStore.amnestyData.days || []
  if (apiDays.length > 0) {
    return apiDays
      .filter(day => day.is_amnestied)
      .map(day => ({...}))
  }
  // fallback к локальным вычислениям...
})
```

**Обновлённые функции:**

`applyAmnestyForDay()` - теперь использует store и перезагружает данные:
```javascript
async function applyAmnestyForDay(dateStr) {
  if (amnestiesRemaining.value <= 0) {
    toast.showToast({ type: 'warning', title: 'Нет доступных амнистий' })
    return
  }
  
  const dayInfo = missedDaysForAmnesty.value.find(d => d.date === dateStr)
  const xpRecovered = dayInfo?.penaltyXp || 0
  
  const result = await habitsStore.applyAmnesty(dateStr)
  
  if (result.success) {
    const actualXp = result.xpRestored || xpRecovered
    toast.showToast({ type: 'success', title: `Амнистия применена! Возвращено ${actualXp} XP` })
    await habitsStore.loadAmnestyAvailableDays()
    habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка применения амнистии' })
  }
}
```

`cancelAmnestyFromModal()` - аналогично использует store:
```javascript
async function cancelAmnestyFromModal(dateStr) {
  const dayInfo = amnestiedDaysInWeek.value.find(d => d.date === dateStr)
  const xpPenalty = dayInfo?.penaltyXp || 0
  
  const result = await habitsStore.revokeAmnesty(dateStr)
  
  if (result.success) {
    toast.showToast({ type: 'info', title: `Амнистия отменена. Штраф -${xpPenalty} XP` })
    await habitsStore.loadAmnestyAvailableDays()
    habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка отмены амнистии' })
  }
}
```

**Шаблон модального окна:**

Добавлен индикатор загрузки:
```html
<div class="modal-content">
  <div v-if="habitsStore.amnestyDataLoading" class="amnesty-loading">
    <Loader2 :size="24" :stroke-width="1.5" class="spinning" />
    <span>Загрузка данных...</span>
  </div>
  
  <template v-else>
    <!-- содержимое модального окна -->
  </template>
</div>
```

Кнопка открытия изменена:
```html
<!-- Было -->
@click="showAmnestyModal = true"

<!-- Стало -->
@click="openAmnestyModal"
```

**Стили:**

Добавлены стили для индикатора загрузки:
```css
.amnesty-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.amnesty-loading .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Файлы изменены

| Файл | Изменения |
|------|-----------|
| `src/services/habitsApi.js` | Добавлен `getAmnestyAvailableDays()`, обновлён комментарий секции |
| `src/stores/habits.js` | Добавлены `amnestyData`, `amnestyDataLoading`, `loadAmnestyAvailableDays()`, обновлены дефолты settings |
| `src/views/Habits.vue` | Обновлены computed properties, функции амнистии, добавлен loading state, импорт Loader2 |
| `replit.md` | Добавлена документация по интеграции API амнистии |

---

## Принцип работы

1. При клике на кнопку амнистии вызывается `openAmnestyModal()`
2. Модальное окно открывается и показывает спиннер загрузки
3. Вызывается `habitsStore.loadAmnestyAvailableDays()`
4. API возвращает точные данные с бэкенда (XP штрафы, кол-во пропусков, статус амнистии)
5. Вычисляемые свойства автоматически обновляются и отображают данные из API
6. При применении/отмене амнистии данные перезагружаются
7. Если API недоступен — используется fallback на локальные вычисления
