# Merge 22 - Landing Page "Цели" Preview Tab

**Дата:** 8 декабря 2024

## Обзор

Добавлен новый таб "Цели" (Банк целей) в секцию "Посмотри, как это выглядит" на маркетинговом лендинге. Таб демонстрирует функционал управления целями потенциальным пользователям.

## Изменённые файлы

### src/views/Landing.vue

#### 1. Новый элемент в массиве `previewTabs`

```javascript
{
  icon: '🏦',
  name: 'Цели',
  title: 'Банк целей',
  description: 'Ставь цели по SMART, разбивай на шаги с помощью AI, отслеживай прогресс. Все цели привязаны к сферам жизни.',
  features: [
    'AI-декомпозиция целей на шаги',
    'Привязка к сферам жизни',
    'Визуальные карточки с прогрессом',
    'Чеклисты и мини-дневник цели'
  ]
}
```

**Позиция:** Индекс 1 (между ССП и Планирование)

#### 2. Sidebar mockup - новый пункт меню

```html
<div class="sidebar-item" :class="{ active: activePreview === 1 }" @click="activePreview = 1">
  <span class="sidebar-icon">🏦</span>
  <span>Цели</span>
</div>
```

#### 3. Обновлённые индексы существующих табов

| Таб | Старый индекс | Новый индекс |
|-----|---------------|--------------|
| ССП | 0 | 0 |
| Цели | — | 1 (NEW) |
| Планирование | 1 | 2 |
| Привычки | 2 | 3 |
| Достижения | 3 | 4 |

#### 4. Новый preview-screen для целей

```html
<div v-else-if="activePreview === 1" class="preview-screen goals-screen">
  <div class="preview-header">Банк целей</div>
  <div class="goals-preview">
    <div class="goal-card">
      <div class="goal-header">
        <span class="goal-sphere">💼</span>
        <span class="goal-title">Получить повышение на работе</span>
      </div>
      <div class="goal-progress">
        <div class="progress-bar"><span style="width: 60%"></span></div>
        <span class="progress-text">3/5 шагов</span>
      </div>
    </div>
    <div class="goal-card">
      <div class="goal-header">
        <span class="goal-sphere">❤️</span>
        <span class="goal-title">Улучшить отношения с семьёй</span>
      </div>
      <div class="goal-progress">
        <div class="progress-bar"><span style="width: 25%"></span></div>
        <span class="progress-text">1/4 шага</span>
      </div>
    </div>
  </div>
  <div class="ai-hint">✨ AI поможет разбить цель на конкретные шаги</div>
</div>
```

#### 5. Новые CSS стили

```css
.goals-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.goal-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.goal-sphere {
  font-size: 1rem;
}

.goal-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1a2e;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.goal-progress .progress-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 3px;
}

.goal-progress .progress-text {
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
}

.ai-hint {
  font-size: 0.75rem;
  color: #7c3aed;
  text-align: center;
  padding: 0.5rem;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 6px;
}
```

### replit.md

Добавлена запись в секцию "Recent Changes":

```markdown
### Landing Page "Goals" Preview Tab (December 8, 2024)
Added new "Цели" (Goals) tab to landing page preview section:
- New previewTabs entry with icon 🏦, title "Банк целей", description and 4 features
- Sidebar mockup shows new "Цели" menu item with active state
- Preview screen displays goal cards with sphere icons, titles, progress bars
- AI decomposition hint at bottom of preview
- CSS styles for .goals-preview, .goal-card, .goal-header, .goal-progress, .ai-hint
- Updated indices: ССП=0, Цели=1, Планирование=2, Привычки=3, Достижения=4
```

## Визуальный результат

Превью экран "Цели" показывает:
- Заголовок "Банк целей"
- 2 карточки целей с:
  - Иконкой сферы (💼 Карьера, ❤️ Отношения)
  - Названием цели
  - Прогресс-баром с градиентом
  - Текстом прогресса (X/Y шагов)
- Подсказка про AI-декомпозицию внизу

## UX/UI решения

1. **Иконка 🏦** — банк целей как хранилище всех целей пользователя
2. **Прогресс-бар с градиентом** — визуальное единство с остальными компонентами приложения
3. **AI-подсказка** — акцент на ключевую ценность (AI-декомпозиция)
4. **Два примера целей** — показывают разные сферы жизни (карьера + отношения)

## Тестирование

- [x] Таб отображается в списке кнопок
- [x] Sidebar-item кликабелен и подсвечивается
- [x] Preview-screen переключается при выборе таба
- [x] CSS стили применяются корректно
- [x] LSP без ошибок
