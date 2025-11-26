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

## Итог

Реализованы две функции кастомизации UI с правильной архитектурой CSS:
- Сворачиваемый сайдбар с сохранением состояния
- Переключатель темы с автоопределением системных предпочтений
- Чистая CSS-специфичность через класс `has-sidebar` (без `!important`)
- Корректное поведение на мобильных устройствах и страницах авторизации
