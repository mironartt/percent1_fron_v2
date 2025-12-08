# Merge 20 - UX Унификация и Мобильная Оптимизация

**Дата:** 7 декабря 2025

## Обзор

Сессия посвящена унификации UI/UX элементов на всех страницах приложения для обеспечения консистентного пользовательского опыта на десктопе и мобильных устройствах.

---

## 1. Expandable Search в GoalsBank

**Проблема:** Строка поиска занимала много места в компактном фильтр-баре.

**Решение:** Заменена на иконку лупы с раскрывающимся полем поиска (паттерн Instagram/Spotify).

**Файлы:**
- `src/views/GoalsBank.vue`

**Изменения:**
- Добавлен компонент `.search-expandable` с состояниями collapsed/expanded
- Иконка лупы (36px) по умолчанию
- При клике — анимированное раскрытие в поле ввода (160px)
- Кнопка закрытия (X) для сброса поиска
- Автозакрытие при потере фокуса (если поле пустое)
- Адаптивные размеры для мобильных (32px иконка, 120px поле)

**Новые функции:**
```javascript
const showSearchInput = ref(false)
const searchInputRef = ref(null)

function toggleSearch() { ... }
function closeSearch() { ... }
function onSearchBlur() { ... }
```

---

## 2. Унификация Ширины Контента (Desktop)

**Проблема:** Ширина контейнеров различалась на разных страницах (800px, 900px, 1000px, 1200px, 1400px).

**Решение:** Введены глобальные CSS-переменные для консистентной ширины.

**Файлы:**
- `src/assets/main.css`
- Все страницы в `src/views/`

**Новые переменные в main.css:**
```css
--content-width-narrow: 900px;
--content-width-wide: 1200px;
```

**Narrow (900px) — для контент-ориентированных страниц:**
- Planning.vue
- BalancedScorecard.vue
- Profile.vue
- Habits.vue
- JournalHistory.vue
- LearningCenter.vue
- Settings.vue
- GoalEdit.vue
- GoalNew.vue
- Planner.vue

**Wide (1200px) — для страниц с сетками карточек:**
- GoalsBank.vue
- Goals.vue

---

## 3. Унификация Padding Контейнеров

**Проблема:** Отступы контейнеров различались (1rem, 1.5rem, 2rem).

**Решение:** Глобальные переменные для padding с автоматическим переключением на мобильных.

**Новые переменные в main.css:**
```css
--container-padding: 1.5rem;
--container-padding-mobile: 1rem;
```

**Глобальное мобильное правило:**
```css
@media (max-width: 768px) {
  :root {
    --container-padding: var(--container-padding-mobile);
  }
}
```

**Обновлённые страницы:**
Все основные страницы теперь используют `padding: var(--container-padding)` вместо жёстко заданных значений.

---

## 4. Скрытие Бургер-Меню при Скролле

**Проблема:** Бургер-кнопка перекрывала важный контент на мобильных страницах.

**Решение:** Реализован паттерн "hide on scroll down, show on scroll up" (Instagram/Twitter).

**Файл:**
- `src/components/Sidebar.vue`

**Изменения:**
- Добавлен state `isScrollHidden` для отслеживания состояния
- Функция `handleScroll()` с порогом 50px
- Слушатели scroll в `onMounted`/`onUnmounted`
- CSS класс `.scroll-hidden` с анимацией

**Логика:**
```javascript
function handleScroll() {
  if (!isMobile.value) return
  
  const currentScrollY = window.scrollY
  
  if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
    isScrollHidden.value = true  // Скролл вниз — скрыть
  } else if (currentScrollY < lastScrollY) {
    isScrollHidden.value = false // Скролл вверх — показать
  }
  
  lastScrollY = currentScrollY
}
```

**CSS:**
```css
.mobile-menu-btn.scroll-hidden {
  transform: translateY(-100px);
  opacity: 0;
  pointer-events: none;
}
```

---

## 5. Унификация Центрирования Заголовков

**Проблема:** Заголовки страниц были центрированы непоследовательно (center/left).

**Решение:** Все заголовки `.page-header` унифицированы к `text-align: center`.

**Обновлённые файлы:**
- `src/views/Planning.vue` — добавлен `text-align: center` к `.planning-header`
- `src/views/Settings.vue` — добавлен `text-align: center` к `.page-header`
- `src/views/Club.vue` — добавлен `text-align: center` к `.page-header`

**Уже были по центру:**
- BalancedScorecard, Habits, JournalHistory, LearningCenter, GoalsBank, Goals, Profile

**Исключения (намеренно):**
- GoalEdit, GoalNew — используют flexbox с кнопкой "назад" слева

---

## 6. Проверка Dashboard

**Анализ главной страницы:**

Блоки Dashboard и их источники данных:
- **Приветствие** — локальные вычисления (время суток)
- **XP Badge** — `xpStore` (localStorage)
- **Баланс жизни** — `store.sspData` (localStorage + backend sync)
- **Прогресс дня** — `DailyProgressBar` компонент
- **Фокус дня** — `store.todayScheduledTasks` (из Planning)
- **Мои цели** — `store.rawIdeas` (из GoalsBank)
- **AI Ментор** — `MentorWidget` компонент

**Статус:** Все блоки работают корректно. В демо-режиме показывают нули из-за отсутствия данных (бэкенд недоступен).

---

## Технические детали

### Изменённые файлы:
1. `src/assets/main.css` — глобальные переменные
2. `src/views/GoalsBank.vue` — expandable search
3. `src/views/Planning.vue` — ширина + padding + центрирование
4. `src/views/BalancedScorecard.vue` — ширина + padding
5. `src/views/Profile.vue` — ширина + padding
6. `src/views/Habits.vue` — ширина + padding
7. `src/views/JournalHistory.vue` — ширина + padding
8. `src/views/LearningCenter.vue` — ширина + padding
9. `src/views/Settings.vue` — ширина + padding + центрирование
10. `src/views/GoalEdit.vue` — ширина + padding
11. `src/views/GoalNew.vue` — ширина + padding
12. `src/views/Planner.vue` — ширина + padding
13. `src/views/Goals.vue` — ширина + padding
14. `src/views/Club.vue` — центрирование
15. `src/components/Sidebar.vue` — scroll hide логика

### Преимущества изменений:
- Единый источник истины для размеров (CSS-переменные)
- Изменение в одном месте применяется везде
- Консистентный UX на всех страницах
- Улучшенная мобильная навигация
- Экономия места на мобильных экранах

---

## Рекомендации для будущих задач

1. **Dashboard демо-данные** — добавить mock-данные для тестирования без бэкенда
2. **Проверить синхронизацию** — убедиться что все блоки Dashboard обновляются при изменении данных
3. **Тестирование на реальных устройствах** — проверить scroll hide на разных мобильных браузерах
