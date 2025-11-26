# Merge 3: UI Customization — Сворачиваемый сайдбар и переключение темы

**Дата:** 26 ноября 2025

## Обзор изменений

В этом обновлении реализованы две ключевые функции кастомизации интерфейса:
1. **Сворачиваемый сайдбар** — уменьшение ширины с 280px до 72px (только иконки)
2. **Переключатель тёмной/светлой темы** — с автоопределением системных предпочтений

---

## 1. Сворачиваемый сайдбар

### 1.1 Изменения в Sidebar.vue

#### Добавлена кнопка сворачивания
```vue
<button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? 'Развернуть' : 'Свернуть'">
  <ChevronLeft class="collapse-icon" :class="{ 'rotated': isCollapsed }" :size="20" :stroke-width="1.5" />
</button>
```

#### Добавлен emit для уведомления App.vue
```javascript
const emit = defineEmits(['collapse-change'])

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
  emit('collapse-change', isCollapsed.value)
}
```

#### Восстановление состояния при загрузке
```javascript
onMounted(() => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true'
    emit('collapse-change', isCollapsed.value)
  }
  // ... theme logic
})
```

#### CSS для свёрнутого состояния
```css
.sidebar.collapsed {
  width: 72px;
}

.sidebar.collapsed .nav-label,
.sidebar.collapsed .user-info,
.sidebar.collapsed .logo-subtitle {
  display: none;
}

.sidebar.collapsed .logo-title {
  font-size: 0.9rem;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}
```

---

## 2. Переключатель темы

### 2.1 Изменения в Sidebar.vue

#### Кнопка переключения темы
```vue
<div class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Светлая тема' : 'Тёмная тема'">
  <Sun v-if="isDark" class="theme-icon" :size="20" :stroke-width="1.5" />
  <Moon v-else class="theme-icon" :size="20" :stroke-width="1.5" />
  <span class="nav-label">{{ isDark ? 'Светлая тема' : 'Тёмная тема' }}</span>
</div>
```

#### Логика переключения с автоопределением
```javascript
onMounted(() => {
  // ... collapsed logic
  
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // Автоопределение системных предпочтений
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
```

### 2.2 CSS-переменные для тёмной темы (main.css)

```css
:root.dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #1f2937;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --border-color: #374151;
  --accent-primary: #6366f1;
  --accent-secondary: #818cf8;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

---

## 3. Изменения в App.vue

### 3.1 Новая архитектура CSS с классом has-sidebar

**Проблема:** При использовании `!important` для переопределения стилей возникали конфликты специфичности на страницах авторизации и мобильных устройствах.

**Решение:** Введён класс `has-sidebar`, который применяется только когда сайдбар отображается.

#### Template
```vue
<template>
  <div id="app" :class="appClasses">
    <Sidebar v-if="hasSidebar" @collapse-change="onCollapseChange" />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
```

#### Script
```javascript
const hasSidebar = computed(() => !isAuthPage.value)

const appClasses = computed(() => ({
  'has-sidebar': hasSidebar.value,
  'sidebar-collapsed': hasSidebar.value && sidebarCollapsed.value
}))

function onCollapseChange(collapsed) {
  sidebarCollapsed.value = collapsed
}
```

#### Scoped CSS
```css
.main-content {
  flex: 1;
  margin-left: 0;
  padding: 0;
  background: var(--bg-secondary);
  transition: margin-left 0.3s ease;
}

#app.has-sidebar .main-content {
  margin-left: 280px;
  padding: 2rem;
}

#app.has-sidebar.sidebar-collapsed .main-content {
  margin-left: 72px;
}

@media (max-width: 768px) {
  #app.has-sidebar .main-content,
  #app.has-sidebar.sidebar-collapsed .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
```

---

## 4. Lucide иконки

### Добавленные иконки
- `ChevronLeft` — кнопка сворачивания сайдбара
- `Sun` — иконка светлой темы
- `Moon` — иконка тёмной темы

### Импорт в Sidebar.vue
```javascript
import { 
  // ... existing icons
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-vue-next'
```

---

## 5. Сохранение состояния в localStorage

| Ключ | Значения | Описание |
|------|----------|----------|
| `sidebar-collapsed` | `'true'` / `'false'` | Состояние сворачивания сайдбара |
| `theme` | `'dark'` / `'light'` | Выбранная тема (если не задано — системные предпочтения) |

---

## 6. Затронутые файлы

| Файл | Изменения |
|------|-----------|
| `src/components/Sidebar.vue` | Кнопка сворачивания, переключатель темы, emit события, CSS для collapsed состояния |
| `src/App.vue` | Класс `has-sidebar`, обработчик `collapse-change`, рефакторинг CSS без `!important` |
| `src/assets/main.css` | CSS-переменные для тёмной темы (`:root.dark`) |
| `replit.md` | Документация новых функций |

---

## 7. Поведение на разных экранах

### Десктоп (> 768px)
- Сайдбар: 280px (развёрнут) или 72px (свёрнут)
- Контент: отступ слева соответствует ширине сайдбара

### Мобильные устройства (≤ 768px)
- Сайдбар: скрыт (margin-left: 0)
- Контент: занимает всю ширину экрана

### Страницы авторизации
- Сайдбар: не отображается
- Контент: занимает всю ширину без отступов

---

## 8. Автоопределение системной темы

При первом посещении, если пользователь не выбирал тему ранее:
1. Проверяется `localStorage.getItem('theme')`
2. Если null — используется `window.matchMedia('(prefers-color-scheme: dark)')`
3. Тема применяется автоматически

---

---

## Часть 2: Исправления модуля Декомпозиции

**Дата:** 26 ноября 2025 (вторая сессия)

### Обзор проблем

При работе с модулем Декомпозиции были обнаружены следующие проблемы:
1. **Потеря шагов при смене цели** — введённые шаги исчезали при переключении между целями в режиме практики
2. **Невидимый progress bar** — индикатор шагов урока (1, 2, 3) был обрезан из-за конфликта CSS-классов
3. **Неправильное выравнивание текста** — контент урока был выровнен по левому краю вместо центра

---

## 9. Исправление потери шагов при смене цели

### 9.1 Проблема

Массив `practiceSteps` хранился как массив строк. При переключении между целями шаги не сохранялись, а при удалении шага нарушалось соответствие индексов.

### 9.2 Решение: объекты вместо строк

Изменена структура `practiceSteps` с массива строк на массив объектов:

```javascript
// Было:
const practiceSteps = ref(['', '', ''])

// Стало:
const practiceSteps = ref([
  { id: 'new-1', title: '', completed: false },
  { id: 'new-2', title: '', completed: false },
  { id: 'new-3', title: '', completed: false }
])
```

### 9.3 Функция сохранения шагов перед переключением

```javascript
function saveCurrentPracticeSteps() {
  if (selectedGoalForPractice.value) {
    const updatedSteps = practiceSteps.value
      .filter(s => s.title && s.title.trim())
      .map(step => ({
        id: step.id || ('temp-' + Date.now() + Math.random().toString(36).substr(2, 5)),
        title: step.title,
        completed: step.completed || false
      }))
    
    const goalIndex = goals.value.findIndex(g => g.id === selectedGoalForPractice.value.id)
    if (goalIndex !== -1) {
      store.updateGoal(selectedGoalForPractice.value.id, { steps: updatedSteps })
      selectedGoalForPractice.value.steps = updatedSteps
    }
  }
}
```

### 9.4 Функция выбора цели с загрузкой шагов

```javascript
function selectGoalForPractice(goal) {
  saveCurrentPracticeSteps()  // Сохраняем текущие шаги
  
  selectedGoalForPractice.value = { ...goal }
  if (goal.steps && goal.steps.length > 0) {
    practiceSteps.value = goal.steps.map((s, index) => ({
      id: s.id || ('legacy-' + index),  // Поддержка старых данных
      title: s.title || (typeof s === 'string' ? s : ''),
      completed: s.completed || false
    }))
  } else {
    practiceSteps.value = [
      { id: 'new-1', title: '', completed: false },
      { id: 'new-2', title: '', completed: false },
      { id: 'new-3', title: '', completed: false }
    ]
  }
}
```

### 9.5 Финализация ID при завершении урока

```javascript
function completeLesson() {
  if (selectedGoalForPractice.value) {
    const filteredSteps = practiceSteps.value
      .filter(s => s.title && s.title.trim())
      .map(step => {
        // Временные ID заменяются на постоянные только при сохранении
        const needsNewId = !step.id || 
          step.id.startsWith('new-') || 
          step.id.startsWith('temp-') || 
          step.id.startsWith('legacy-')
        return {
          id: needsNewId ? Date.now().toString() + Math.random().toString(36).substr(2, 9) : step.id,
          title: step.title,
          completed: step.completed || false
        }
      })
    
    store.updateGoal(selectedGoalForPractice.value.id, {
      steps: filteredSteps,
      progress: 0
    })
  }
  
  store.completeDecompositionLesson()
}
```

### 9.6 Обновление шаблона

```vue
<!-- Было -->
<input v-model="practiceSteps[index]" ... />

<!-- Стало -->
<input v-model="step.title" ... />

<!-- Обзор шагов (Step 3) -->
<div v-for="(step, index) in practiceSteps.filter(s => s.title.trim())" :key="step.id">
  <span>{{ step.title }}</span>
</div>
```

---

## 10. Исправление видимости Progress Bar

### 10.1 Проблема

Класс `.progress-bar` использовался для двух разных элементов:
1. **Индикатор шагов урока** (1, 2, 3) — с display: flex
2. **Полоса прогресса целей** — с height: 8px и overflow: hidden

CSS второго элемента переопределял первый, скрывая индикатор шагов.

### 10.2 Решение: переименование класса

HTML:
```vue
<!-- Было -->
<div class="progress-bar">

<!-- Стало -->
<div class="lesson-progress-bar">
```

CSS:
```css
/* Было */
.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

/* Стало */
.lesson-progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 0 2rem;
}
```

Медиа-запрос:
```css
@media (max-width: 768px) {
  /* Было */
  .progress-bar { padding: 0 0.5rem; }
  
  /* Стало */
  .lesson-progress-bar { padding: 0 0.5rem; }
}
```

---

## 11. Центрирование контента урока

### 11.1 Preview секция (до начала урока)

```css
.lesson-preview {
  text-align: center;  /* Было: left */
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.lesson-preview h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.preview-steps {
  display: inline-flex;  /* Было: flex */
  flex-direction: column;
  gap: 1rem;
  text-align: left;  /* Текст внутри шагов — слева */
}
```

### 11.2 Контент шагов урока

```css
.step-content h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  text-align: center;  /* Добавлено */
}

.intro-text {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;   /* Добавлено */
  margin-right: auto;  /* Добавлено */
  text-align: center;  /* Добавлено */
}

.rules-section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  text-align: center;  /* Добавлено */
}
```

---

## 12. Типы временных ID

| Префикс | Назначение | Когда создаётся |
|---------|------------|-----------------|
| `new-*` | Новый пустой шаг | При начале практики или добавлении шага |
| `temp-*` | Сохранённый временный | При saveCurrentPracticeSteps без существующего ID |
| `legacy-*` | Старые данные | При загрузке данных без ID (миграция) |

Все временные ID заменяются на постоянные (timestamp + random) только в `completeLesson()`.

---

## 13. Затронутые файлы (сессия 2)

| Файл | Изменения |
|------|-----------|
| `src/views/Goals.vue` | Объектная структура practiceSteps, saveCurrentPracticeSteps(), ID-based tracking, переименование .progress-bar → .lesson-progress-bar, центрирование контента |

---

## 14. Ошибки в консоли (ожидаемые)

```
Failed to load resource: 500 (Internal Server Error)
[API] CSRF cookie not set after request
```

Эти ошибки ожидаемы при разработке UI без запущенного Django-бэкенда. Флаг `SKIP_AUTH_CHECK=true` в `local_settings.js` позволяет работать с интерфейсом без подключения к серверу.

---

## Итог

### Часть 1: UI Customization
- Сворачиваемый сайдбар с сохранением состояния
- Переключатель темы с автоопределением системных предпочтений
- Чистая CSS-специфичность через класс `has-sidebar` (без `!important`)
- Корректное поведение на мобильных устройствах и страницах авторизации

### Часть 2: Decomposition Module Fixes
- Шаги сохраняются при переключении между целями
- ID-based tracking предотвращает путаницу при удалении/перемещении шагов
- Поддержка legacy данных (миграция старых строковых массивов)
- Исправлена видимость индикатора шагов урока
- Контент урока центрирован
