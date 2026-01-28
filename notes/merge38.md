# Merge 38 - Улучшения страницы обучения и мобильной версии

**Дата:** 28 января 2026

## Обзор изменений

В этой сессии были внесены улучшения в страницу обучения (Learning Center), страницу достижений и страницу Колеса баланса. Основной фокус — улучшение пользовательского опыта на мобильных устройствах и добавление ознакомительного видео.

---

## Внесённые изменения

### 1. Добавлено ознакомительное видео на страницу обучения

**Файл:** `src/views/LearningCenter.vue`

**Что сделано:**
- Добавлена карточка "Ознакомительное видео" в список уроков
- Карточка оформлена в едином стиле с остальными уроками
- При клике на карточку открывается модальное окно с RuTube-видео
- Видео: `https://rutube.ru/play/embed/f5edee9e1b0de1103bcda9862e62fd96`
- Указана длительность: 15 минут

**Технические детали:**
- Добавлен импорт иконки `Play` из lucide-vue-next
- Добавлена переменная `showVideoModal` для управления модальным окном
- Добавлен Teleport с модальным окном для видео
- Добавлены CSS стили: `.video-card`, `.video-icon`, `.video-modal`, `.video-modal-header`, `.video-modal-content`, `.video-container`, `.video-modal-footer`

---

### 2. Убран текст на странице обучения

**Файл:** `src/views/LearningCenter.vue`

**Что сделано:**
- Удалён текст "Изучите все возможности системы и методологию 1%" из заголовка страницы

---

### 3. Убран текст на странице достижений

**Файл:** `src/views/Profile.vue`

**Что сделано:**
- Удалён текст "Ваш прогресс и награды" из заголовка страницы

---

### 4. Выравнивание хлебных крошек на странице достижений (мобильная версия)

**Файл:** `src/views/Profile.vue`

**Что сделано:**
- Хлебные крошки (breadcrumbs) теперь выравниваются по левому краю на мобильных устройствах
- Убраны боковые отступы `padding-left` и `padding-right` в media query для 768px

**CSS изменения:**
```css
@media (max-width: 768px) {
  .page-header {
    padding-left: 0;
    padding-right: 0;
    text-align: left;
  }
}
```

---

### 5. Убран текст на странице Колеса баланса

**Файл:** `src/views/BalancedScorecard.vue`

**Что сделано:**
- Удалён текст "Оценка и анализ сфер вашей жизни" из заголовка страницы
- Удалён весь блок `<header class="ssp-header">` с этим текстом

---

### 6. Исправлено перекрытие контента нижним меню (страница SSP)

**Файл:** `src/views/BalancedScorecard.vue`

**Что сделано:**
- Добавлен отступ внизу контейнера на мобильных устройствах
- Контент больше не обрезается нижним меню навигации

**CSS изменения:**
```css
@media (max-width: 768px) {
  .ssp-container {
    padding: 1rem;
    padding-bottom: 100px;
  }
}
```

---

### 7. Исправлено перекрытие контента нижним меню (страница обучения)

**Файл:** `src/views/LearningCenter.vue`

**Что сделано:**
- Добавлен отступ внизу контейнера на мобильных устройствах
- Контент больше не обрезается нижним меню навигации

**CSS изменения:**
```css
@media (max-width: 768px) {
  .learning-center {
    padding-bottom: 100px;
  }
}
```

---

## Затронутые файлы

| Файл | Тип изменения |
|------|---------------|
| `src/views/LearningCenter.vue` | Добавлено видео, модальное окно, убран текст, исправлен padding |
| `src/views/Profile.vue` | Убран текст, исправлено выравнивание breadcrumbs |
| `src/views/BalancedScorecard.vue` | Убран текст, исправлен padding |

---

## Коммиты

1. `88cbcb18` - Add introductory video to the learning center page
2. `ad011d91` - Make introductory video appear as a modal window on click
3. `3508d3db` - Update video lesson duration and integrate it into the main lesson grid
4. `4488ad1f` - Remove introductory text from the learning center page
5. `8f4d8e8e` - Remove progress and awards text from the achievements page
6. `95aa8fae` - Align breadcrumbs to the left on mobile devices
7. `7a4cecac` - Remove unnecessary text and adjust mobile layout for better viewing
8. `236bff94` - Add spacing to prevent content from being cut off at the bottom

---

## Итоги

- Улучшен UX мобильной версии: контент больше не перекрывается нижним меню
- Добавлено ознакомительное видео в раздел обучения
- Упрощены заголовки страниц: убраны избыточные подзаголовки
- Единообразный дизайн карточек в разделе обучения
