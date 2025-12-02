# Merge 11 — UI/UX улучшения MentorPanel и мобильной навигации

**Дата:** 2 декабря 2025

## Обзор изменений

В этой сессии были внесены улучшения в интерфейс AI Ментора и исправлены проблемы с наложением элементов на мобильных устройствах.

---

## 1. Исправление наложения контента на MentorPanel (App.vue)

### Проблема
Центральный контент страницы накладывался на свёрнутую панель AI Ментора справа (56px). Использовался `padding-right`, который не сдвигал контент, а только добавлял внутренний отступ.

### Решение
Заменён `padding-right` на `margin-right` по аналогии с сайдбаром (который использует `margin-left`).

### Изменённый файл
**src/App.vue** (строки 98-107)

```css
/* Было */
@media (min-width: 1024px) {
  #app.has-mentor-panel .main-content {
    padding-right: 460px;
  }
  #app.has-mentor-panel.mentor-collapsed .main-content {
    padding-right: 56px;
  }
}

/* Стало */
@media (min-width: 1024px) {
  #app.has-mentor-panel .main-content {
    margin-right: 460px;
    transition: margin-left 0.3s ease, margin-right 0.3s ease;
  }
  #app.has-mentor-panel.mentor-collapsed .main-content {
    margin-right: 56px;
  }
}
```

---

## 2. Скрытие плавающей кнопки X при открытом drawer (MentorPanel.vue)

### Проблема
На мобильных устройствах плавающая кнопка закрытия (X) накладывалась на кнопку отправки сообщения в чате.

### Решение
Плавающая кнопка теперь показывается только когда drawer закрыт (для открытия чата). Когда drawer открыт — кнопка скрывается, так как в заголовке панели уже есть кнопка "Свернуть".

### Изменённый файл
**src/components/MentorPanel.vue** (строки 12-18)

```vue
<!-- Было -->
<button 
  v-if="isMobile"
  class="mentor-mobile-btn"
  :class="{ active: isMobileOpen }"
  @click="toggleMobile"
>
  <Bot v-if="!isMobileOpen" :size="24" :stroke-width="1.5" />
  <X v-else :size="24" :stroke-width="1.5" />
</button>

<!-- Стало -->
<button 
  v-if="isMobile && !isMobileOpen"
  class="mentor-mobile-btn"
  @click="toggleMobile"
>
  <Bot :size="24" :stroke-width="1.5" />
</button>
```

---

## 3. Удаление кнопки "Очистить чат" (MentorPanel.vue)

### Проблема
Кнопка "Очистить чат" (корзина) располагалась слишком близко к кнопке "Свернуть панель", что могло привести к случайному удалению истории чата.

### Решение
Кнопка "Очистить чат" полностью удалена из заголовка панели. Осталась только кнопка "Свернуть панель".

### Изменённый файл
**src/components/MentorPanel.vue** (строки 46-54)

```vue
<!-- Было -->
<div class="header-actions">
  <button 
    v-if="messages.length > 0" 
    class="icon-btn"
    @click="clearChat"
    title="Очистить чат"
  >
    <Trash2 :size="16" :stroke-width="1.5" />
  </button>
  <button 
    class="icon-btn collapse-btn"
    @click="togglePanel"
    title="Свернуть панель"
  >
    <PanelRightClose :size="18" :stroke-width="1.5" />
  </button>
</div>

<!-- Стало -->
<div class="header-actions">
  <button 
    class="icon-btn collapse-btn"
    @click="togglePanel"
    title="Свернуть панель"
  >
    <PanelRightClose :size="18" :stroke-width="1.5" />
  </button>
</div>
```

---

## 4. Автозакрытие AI drawer при открытии сайдбара (Sidebar.vue)

### Проблема
На мобильных устройствах при открытом AI drawer клик на бургер-меню открывал сайдбар, но он отображался под панелью AI Ментора (конфликт z-index).

### Решение
При открытии сайдбара (бургер-меню) AI drawer автоматически закрывается. Два overlay не могут быть открыты одновременно.

### Изменённый файл
**src/components/Sidebar.vue** (строки 181-189)

```javascript
// Было
function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobileOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Стало
function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobileOpen.value) {
    document.body.style.overflow = 'hidden'
    store.closeMentorMobile()  // Закрываем AI drawer
  } else {
    document.body.style.overflow = ''
  }
}
```

---

## Сводка изменённых файлов

| Файл | Тип изменения |
|------|---------------|
| `src/App.vue` | CSS: padding-right → margin-right |
| `src/components/MentorPanel.vue` | Условие показа плавающей кнопки, удаление кнопки "Очистить чат" |
| `src/components/Sidebar.vue` | Добавлен вызов closeMentorMobile() |

---

## Результат

1. **Контент не накладывается на MentorPanel** — правильный отступ справа на десктопе
2. **Чистый интерфейс чата** — нет конфликтующих кнопок, нет риска случайного удаления
3. **Корректная мобильная навигация** — сайдбар и AI drawer не конфликтуют
4. **Единообразное поведение** — все изменения применены глобально ко всем /app/* страницам
