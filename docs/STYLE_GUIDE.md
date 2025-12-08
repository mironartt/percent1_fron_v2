# OnePercent Design System & Style Guide

Руководство по стилям и компонентам для разработки интерфейса OnePercent MVP.

---

## Важно: Структура стилей проекта

### Где находятся стили

| Тип стилей | Расположение | Описание |
|------------|--------------|----------|
| **Глобальные CSS переменные** | `src/assets/main.css` | Цвета, тени, радиусы, типографика |
| **Глобальные классы** | `src/assets/main.css` | `.btn`, `.btn-primary`, `.card`, `.form-input` |
| **Компонентные стили** | `src/components/*.vue` | Scoped стили внутри `<style scoped>` |
| **Страничные стили** | `src/views/*.vue` | Scoped стили для конкретных страниц |

### Как использовать этот документ

1. **CSS переменные** (раздел 1) — используйте напрямую, они глобальные
2. **Глобальные классы** (`.btn`, `.card`, `.form-input`) — доступны везде
3. **Паттерны компонентов** — это ЦЕЛЕВЫЕ стили для новых страниц; копируйте структуру и адаптируйте

### Ключевые файлы

```
src/
├── assets/
│   └── main.css              # Глобальные стили и переменные
├── components/
│   ├── Sidebar.vue           # Боковая навигация
│   └── MentorPanel.vue       # AI Ментор панель
└── views/
    ├── Planning.vue          # Эталон: Week Bar, Stats Panel
    ├── GoalsBank.vue         # Эталон: Карточки целей, статусы
    ├── BalancedScorecard.vue # Эталон: Табы, колесо баланса
    └── Settings.vue          # Эталон: Формы, секции
```

---

## Содержание

1. [Цветовая палитра](#1-цветовая-палитра)
2. [Типографика](#2-типографика)
3. [Кнопки](#3-кнопки)
4. [Карточки и контейнеры](#4-карточки-и-контейнеры)
5. [Формы](#5-формы)
6. [Табы и навигация](#6-табы-и-навигация)
7. [Чипы и бейджи](#7-чипы-и-бейджи)
8. [Анимации и переходы](#8-анимации-и-переходы)
9. [Тени (Elevation)](#9-тени-elevation)
10. [Модальные окна и Bottom Sheets](#10-модальные-окна-и-bottom-sheets)
11. [AI Ментор панель](#11-ai-ментор-панель)
12. [Sidebar](#12-sidebar)
13. [Сферы жизни ССП](#13-сферы-жизни-ссп)
14. [Прогресс-бары](#14-прогресс-бары)
15. [Week Bar (календарь недели)](#15-week-bar-календарь-недели)
16. [Empty States](#16-empty-states)
17. [Page Header](#17-page-header)
18. [Stats Panel](#18-stats-panel)
19. [Тосты и уведомления](#19-тосты-и-уведомления)
20. [Скелетоны загрузки](#20-скелетоны-загрузки)
21. [Иконки Lucide](#21-иконки-lucide)
22. [Сетка и отступы](#22-сетка-и-отступы)
23. [Мобильная адаптация](#23-мобильная-адаптация)
24. [Доступность (a11y)](#24-доступность-a11y)
25. [Do's and Don'ts](#25-dos-and-donts)

---

## 1. Цветовая палитра

### Основные цвета

| Название | Light Theme | Dark Theme | CSS Variable |
|----------|-------------|------------|--------------|
| Primary | `#6366f1` | `#818cf8` | `--primary-color` |
| Primary Dark | `#4f46e5` | `#6366f1` | `--primary-dark` |
| Secondary | `#8b5cf6` | `#a78bfa` | `--secondary-color` |

### Семантические цвета

| Название | Light Theme | Dark Theme | CSS Variable |
|----------|-------------|------------|--------------|
| Success | `#10b981` | `#34d399` | `--success-color` |
| Warning | `#f59e0b` | `#fbbf24` | `--warning-color` |
| Danger | `#ef4444` | `#f87171` | `--danger-color` |

### Фоновые цвета

| Название | Light Theme | Dark Theme | CSS Variable |
|----------|-------------|------------|--------------|
| BG Primary | `#ffffff` | `#1f2937` | `--bg-primary` |
| BG Secondary | `#f9fafb` | `#111827` | `--bg-secondary` |
| BG Tertiary | `#f3f4f6` | `#374151` | `--bg-tertiary` |
| BG Hover | `#e5e7eb` | `#4b5563` | `--bg-hover` |
| Card BG | `#ffffff` | `#1f2937` | `--card-bg` |

### Текстовые цвета

| Название | Light Theme | Dark Theme | CSS Variable |
|----------|-------------|------------|--------------|
| Text Primary | `#111827` | `#f9fafb` | `--text-primary` |
| Text Secondary | `#6b7280` | `#d1d5db` | `--text-secondary` |
| Text Tertiary | `#9ca3af` | `#9ca3af` | `--text-tertiary` |

### Статусные цвета (для бейджей и чипов)

| Статус | Light BG | Light Text | Dark BG | Dark Text |
|--------|----------|------------|---------|-----------|
| Success | `#e8f5e9` | `#2e7d32` | `rgba(52,211,153,0.15)` | `#34d399` |
| Info | `#e3f2fd` | `#1565c0` | `rgba(96,165,250,0.15)` | `#60a5fa` |
| Warning | `#fff3e0` | `#e65100` | `rgba(251,191,36,0.15)` | `#fbbf24` |
| Danger | `#ffebee` | `#c62828` | `rgba(248,113,113,0.15)` | `#f87171` |
| Purple | `#f3e8ff` | `#7c3aed` | `rgba(167,139,250,0.15)` | `#a78bfa` |

### Прочие

| Название | Light Theme | Dark Theme | CSS Variable |
|----------|-------------|------------|--------------|
| Border | `#e5e7eb` | `#374151` | `--border-color` |

---

## 2. Типографика

### Шрифт

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Размеры заголовков

| Элемент | Размер | Font Weight | Line Height |
|---------|--------|-------------|-------------|
| H1 | `2.25rem` (36px) | 600 | 1.2 |
| H2 | `1.875rem` (30px) | 600 | 1.2 |
| H3 | `1.5rem` (24px) | 600 | 1.2 |
| H4 | `1.25rem` (20px) | 600 | 1.2 |
| H5 | `1.125rem` (18px) | 600 | 1.2 |
| H6 | `1rem` (16px) | 600 | 1.2 |

### Текст

| Тип | Размер | Line Height |
|-----|--------|-------------|
| Body | `1rem` (16px) | 1.6 |
| Small | `0.875rem` (14px) | 1.5 |
| XSmall | `0.75rem` (12px) | 1.4 |

### Пример использования

```vue
<h1>Заголовок страницы</h1>
<p class="text-secondary">Описание или подзаголовок</p>
```

---

## 3. Кнопки

### Типы кнопок

#### Primary Button
Основная CTA-кнопка. Используется для главных действий.

```css
.btn-primary {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  border: 2px solid white;
}
```

```vue
<button class="btn btn-primary">
  <Plus :size="18" />
  Добавить цель
</button>
```

#### Secondary Button
Второстепенные действия.

```css
.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

#### Outline Button
Альтернативные действия без заливки.

```css
.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}
```

#### Ghost Button
Минималистичная кнопка без границ.

```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

### Размеры кнопок

| Размер | Padding | Font Size | Класс |
|--------|---------|-----------|-------|
| Small | `0.5rem 1rem` | `0.875rem` | `.btn-sm` |
| Default | `0.625rem 1.25rem` | `0.9375rem` | `.btn` |
| Large | `0.875rem 1.75rem` | `1.0625rem` | `.btn-lg` |

### Состояния

```css
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

---

## 4. Карточки и контейнеры

### Базовая карточка

```css
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);  /* 0.75rem */
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}
```

### Структура карточки

```vue
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Заголовок</h3>
  </div>
  <div class="card-body">
    <!-- Контент -->
  </div>
</div>
```

### Секция страницы

```css
.section-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}
```

### Border Radius Scale

| Название | Значение | CSS Variable |
|----------|----------|--------------|
| Small | `0.375rem` (6px) | `--radius-sm` |
| Medium | `0.5rem` (8px) | `--radius-md` |
| Large | `0.75rem` (12px) | `--radius-lg` |
| XLarge | `1rem` (16px) | `--radius-xl` |

---

## 5. Формы

### Input Field

```css
.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:hover:not(:focus) {
  border-color: var(--text-tertiary);
}
```

### Label

```css
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}
```

### Textarea

```css
.form-textarea {
  min-height: 100px;
  resize: vertical;
}
```

### Структура формы

```vue
<div class="form-group">
  <label class="form-label">Имя</label>
  <input type="text" class="form-input" placeholder="Ваше имя">
</div>
```

---

## 6. Табы и навигация

> **Эталонный файл:** `src/views/BalancedScorecard.vue` — секция табов "Колесо / Рефлексия / История"

### Tab Container

```css
.tab-container {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: var(--bg-hover);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}
```

### Пример использования

```vue
<div class="tab-container">
  <button 
    v-for="tab in tabs" 
    :key="tab.id"
    class="tab-btn"
    :class="{ active: activeTab === tab.id }"
    @click="activeTab = tab.id"
  >
    <component :is="tab.icon" :size="16" />
    {{ tab.label }}
  </button>
</div>
```

---

## 7. Чипы и бейджи

> **Эталонный файл:** `src/views/GoalsBank.vue` — статусы целей, `src/views/Planning.vue` — фильтры

### Status Chip (статус элемента)

```css
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-chip.success {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.status-chip.warning {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.status-chip.danger {
  background: var(--status-danger-bg);
  color: var(--status-danger-text);
}

.status-chip.info {
  background: var(--status-info-bg);
  color: var(--status-info-text);
}

.status-chip.purple {
  background: var(--status-purple-bg);
  color: var(--status-purple-text);
}
```

### Filter Chip (фильтры)

```css
.chip-filter {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-filter:hover {
  background: var(--bg-hover);
}

.chip-filter.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
```

### Count Badge

```css
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--primary-color);
  color: white;
}
```

---

## 8. Анимации и переходы

### Стандартные переходы

```css
/* Быстрый переход для hover */
transition: all 0.2s ease;

/* Средний переход для состояний */
transition: all 0.3s ease;

/* Медленный переход для появления */
transition: all 0.4s ease;
```

### Timing Functions

| Название | Значение | Использование |
|----------|----------|---------------|
| Ease | `ease` | По умолчанию |
| Ease-in-out | `ease-in-out` | Модальные окна |
| Ease-out | `ease-out` | Появление элементов |

### Hover эффекты

```css
/* Поднятие карточки */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Кнопка */
.btn-primary:hover {
  transform: translateY(-1px);
}
```

### Появление элементов (Vue)

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
```

---

## 9. Тени (Elevation)

### Уровни теней

| Уровень | Light Theme | Dark Theme | CSS Variable |
|---------|-------------|------------|--------------|
| Small | `0 1px 2px 0 rgba(0,0,0,0.05)` | `0 1px 2px 0 rgba(0,0,0,0.3)` | `--shadow-sm` |
| Medium | `0 4px 6px -1px rgba(0,0,0,0.1)` | `0 4px 6px -1px rgba(0,0,0,0.4)` | `--shadow-md` |
| Large | `0 10px 15px -3px rgba(0,0,0,0.1)` | `0 10px 15px -3px rgba(0,0,0,0.4)` | `--shadow-lg` |
| XLarge | `0 20px 25px -5px rgba(0,0,0,0.1)` | `0 20px 25px -5px rgba(0,0,0,0.4)` | `--shadow-xl` |

### Правила использования

| Элемент | Тень |
|---------|------|
| Карточки (default) | `--shadow-sm` |
| Карточки (hover) | `--shadow-md` |
| Dropdown меню | `--shadow-lg` |
| Модальные окна | `--shadow-xl` |

---

## 10. Модальные окна и Bottom Sheets

> **Эталонные файлы:** `src/views/BalancedScorecard.vue` (модальное окно переоценки), `src/views/GoalsBank.vue` (Bottom Sheet)

### Modal Overlay

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
```

### Modal Container

```css
.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 1.25rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
```

### Bottom Sheet (Mobile)

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
  box-shadow: var(--shadow-xl);
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0 auto 1rem;
}
```

---

## 11. AI Ментор панель

> **Эталонный файл:** `src/components/MentorPanel.vue`

### Структура

```css
.mentor-panel {
  width: 320px;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.mentor-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mentor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mentor-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--success-color);
}
```

### Сообщения чата

```css
.chat-message {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  max-width: 85%;
  font-size: 0.875rem;
  line-height: 1.5;
}

.chat-message.user {
  background: var(--primary-color);
  color: white;
  margin-left: auto;
}

.chat-message.assistant {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

### Quick Actions

```css
.quick-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}
```

---

## 12. Sidebar

> **Эталонный файл:** `src/components/Sidebar.vue`

### Структура

```css
.sidebar {
  width: 260px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.sidebar-tagline {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
```

### Навигация

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  margin: 0.125rem 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--status-purple-bg);
  color: var(--primary-color);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 0 2px 2px 0;
}
```

### Coming Soon Badge

```css
.badge-soon {
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
}
```

---

## 13. Сферы жизни ССП

### Цветовая кодировка 8 сфер

| Сфера | Цвет | HEX |
|-------|------|-----|
| Здоровье | Красный | `#ef4444` |
| Любовь, семья, отношения | Розовый | `#ec4899` |
| Друзья, окружение | Оранжевый | `#f97316` |
| Работа и карьера | Синий | `#3b82f6` |
| Финансы, благосостояние | Зелёный | `#10b981` |
| Хобби, творчество, отдых | Жёлтый | `#eab308` |
| Духовность, личностный рост | Фиолетовый | `#8b5cf6` |
| Образование, самообразование | Голубой | `#06b6d4` |

### Использование в компонентах

```vue
<span class="sphere-icon" :style="{ background: sphere.color }">
  {{ sphere.emoji }}
</span>
```

```css
.sphere-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
```

---

## 14. Прогресс-бары

### Стандартный прогресс-бар

```css
.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

### Прогресс цели

```css
.goal-progress {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 9999px;
}

.goal-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}
```

### Прогресс с процентом

```vue
<div class="progress-container">
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
  </div>
  <span class="progress-text">{{ progress }}%</span>
</div>
```

---

## 15. Week Bar (календарь недели)

> **Эталонный файл:** `src/views/Planning.vue` — компонент недельного календаря

### Структура

```css
.week-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
}

.day-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
}

.day-tab:hover {
  background: var(--bg-hover);
}

.day-tab.active {
  background: var(--primary-color);
  color: white;
}

.day-name {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.day-tab.active .day-name {
  color: rgba(255, 255, 255, 0.8);
}

.day-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.day-tab.active .day-number {
  color: white;
}
```

### Навигация по неделям

```css
.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.week-nav-btn {
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
}

.week-nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.week-range {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

---

## 16. Empty States

> **Эталонные файлы:** `src/views/Planning.vue`, `src/views/GoalsBank.vue`

### Структура

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  max-width: 300px;
  margin-bottom: 1.5rem;
}
```

### Пример использования

```vue
<div class="empty-state">
  <Calendar class="empty-state-icon" :size="80" />
  <h3 class="empty-state-title">Нет задач на этот день</h3>
  <p class="empty-state-description">
    Добавьте шаги из целей ниже
  </p>
  <button class="btn btn-primary">
    <Plus :size="18" />
    Добавить задачу
  </button>
</div>
```

**Важно:** Используйте только Lucide-иконки, не эмодзи!

---

## 17. Page Header

### Структура страницы

```css
.page-container {
  max-width: var(--content-width-narrow);  /* 900px */
  margin: 0 auto;
  padding: var(--container-padding);  /* 1.5rem */
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto;
}
```

### Пример

```vue
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">Планирование</h1>
    <p class="page-subtitle">8 дек. — 14 дек.</p>
  </div>
  <!-- Контент страницы -->
</div>
```

**Правило:** Заголовок страницы — только текст, без иконок рядом.

---

## 18. Stats Panel

> **Эталонный файл:** `src/views/Planning.vue` — чипы "X шагов", "Y выполнено"

### Стиль (как на странице Планирование)

```css
.stats-panel {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}
```

### Пример

```vue
<div class="stats-panel">
  <div class="stat-chip">
    <span class="stat-value">5</span> шагов
  </div>
  <div class="stat-chip">
    <span class="stat-value">2</span> выполнено
  </div>
</div>
```

**Правило:** Минималистичный стиль без ярких цветных иконок. Нейтральные чипы с текстом.

---

## 19. Тосты и уведомления

### Базовый стиль

```css
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background: var(--success-color);
  color: white;
}

.toast.error {
  background: var(--danger-color);
  color: white;
}

.toast.info {
  background: var(--primary-color);
  color: white;
}

.toast.warning {
  background: var(--warning-color);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 20. Скелетоны загрузки

### Базовый скелетон

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
  margin-bottom: 1rem;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-card {
  height: 120px;
  margin-bottom: 1rem;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 21. Иконки Lucide

### Библиотека

Используем **Lucide Vue Next** — минималистичные линейные иконки.

```bash
npm install lucide-vue-next
```

### Стандартные размеры

| Контекст | Размер | Пример |
|----------|--------|--------|
| В кнопках | 18px | `<Plus :size="18" />` |
| В навигации | 20px | `<Home :size="20" />` |
| В карточках | 24px | `<Target :size="24" />` |
| Empty State | 64-80px | `<Calendar :size="80" />` |

### Правила использования

1. **Всегда используйте Lucide** — не эмодзи, не другие иконки
2. **Монохромные иконки** — используйте `color: var(--text-secondary)` или `currentColor`
3. **Консистентные размеры** — придерживайтесь таблицы выше

### Частоиспользуемые иконки

```vue
import {
  Home, Target, Calendar, BookOpen, Flame,
  Award, Settings, Plus, Check, X, ChevronLeft,
  ChevronRight, MoreVertical, Edit, Trash2,
  Clock, Star, Zap, Heart, BarChart3
} from 'lucide-vue-next'
```

---

## 22. Сетка и отступы

### Spacing Scale

| Название | Значение | Использование |
|----------|----------|---------------|
| 0.25rem | 4px | Минимальные gaps |
| 0.5rem | 8px | Внутренние отступы чипов |
| 0.75rem | 12px | Gap между элементами |
| 1rem | 16px | Стандартный отступ |
| 1.25rem | 20px | Padding карточек |
| 1.5rem | 24px | Container padding |
| 2rem | 32px | Секционные отступы |
| 3rem | 48px | Большие отступы |

### Container Widths

| Название | Значение | CSS Variable |
|----------|----------|--------------|
| Narrow | 900px | `--content-width-narrow` |
| Wide | 1200px | `--content-width-wide` |

### Container Padding

| Контекст | Значение | CSS Variable |
|----------|----------|--------------|
| Desktop | 1.5rem | `--container-padding` |
| Mobile | 1rem | `--container-padding-mobile` |

---

## 23. Мобильная адаптация

### Breakpoints

| Название | Значение | Описание |
|----------|----------|----------|
| Mobile | < 640px | Телефоны |
| Tablet | 640px - 1024px | Планшеты |
| Desktop | > 1024px | Десктоп |

### Правила адаптации

```css
/* Mobile First подход */
.element {
  padding: 1rem;
}

@media (min-width: 640px) {
  .element {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .element {
    padding: 2rem;
  }
}
```

### Sidebar на мобильных

- Скрывается по умолчанию
- Открывается по кнопке-гамбургеру
- Занимает полную ширину экрана
- Имеет overlay для закрытия

### AI Ментор на мобильных

- Скрывается по умолчанию
- Открывается по floating button
- Занимает полную ширину как Bottom Sheet

---

## 24. Доступность (a11y)

### Focus States

```css
/* Видимый focus для клавиатурной навигации */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Убираем outline для мыши */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Контрастность

- Текст на фоне: минимум 4.5:1
- Крупный текст: минимум 3:1
- Интерактивные элементы: минимум 3:1

### ARIA атрибуты

```vue
<button 
  aria-label="Закрыть модальное окно"
  @click="closeModal"
>
  <X :size="20" />
</button>

<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Заголовок</h2>
</div>
```

### Клавиатурная навигация

- Tab для перемещения между элементами
- Enter/Space для активации кнопок
- Escape для закрытия модальных окон
- Arrow keys для навигации в списках

---

## 25. Do's and Don'ts

### Заголовки страниц

| Do | Don't |
|----|-------|
| `<h1>Планирование</h1>` | `<h1>📅 Планирование</h1>` |
| Только текст | Эмодзи рядом с заголовком |

### Empty State иконки

| Do | Don't |
|----|-------|
| `<Calendar :size="80" />` (Lucide) | 🔥 (Эмодзи) |
| Монохромная Lucide-иконка | Цветная эмодзи |

### Stats Panel

| Do | Don't |
|----|-------|
| Нейтральные текстовые чипы | Яркие цветные иконки |
| `5 шагов`, `2 выполнено` | ⚡️ 5 | ✅ 2 |

### Кнопки

| Do | Don't |
|----|-------|
| Одна CTA-кнопка на экране | Несколько Primary кнопок |
| Иконка слева от текста | Только иконка без tooltip |

### Цвета

| Do | Don't |
|----|-------|
| CSS-переменные | Хардкоженные HEX-коды |
| `var(--primary-color)` | `#6366f1` напрямую |

### Тёмная тема

| Do | Don't |
|----|-------|
| Все элементы адаптированы | Только основные контейнеры |
| Полупрозрачные статусные фоны | Те же solid цвета |

### Hover эффекты

| Do | Don't |
|----|-------|
| Subtle transform + shadow | Резкая смена цвета |
| `transition: all 0.2s ease` | Без transition |

---

## Changelog

| Дата | Изменения |
|------|-----------|
| 2024-12-08 | Создание документа |

---

*Документ поддерживается командой OnePercent. При добавлении новых компонентов обновляйте соответствующие разделы.*
