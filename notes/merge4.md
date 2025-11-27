# Merge 4: WheelOfLife и Reflection Accordion Improvements

**Дата:** 27 ноября 2025

## Обзор

В этом обновлении проведена работа над визуальной частью модуля ССП (Система сбалансированных показателей):
1. Переработка компонента WheelOfLife для соответствия референсу
2. Профессиональный редизайн блока "Ваша рефлексия" с заменой эмодзи на Lucide-иконки

---

## 1. WheelOfLife Component Redesign

### Файл: `src/components/WheelOfLife.vue`

#### 1.1 Структура колеса изменена на:
- **Внешний круг** (outerRadius: 320px) — граница всего колеса
- **Сетка 1-10** (gridRadius: 240px) — область для цветных сегментов с оценками
- **Внешнее кольцо** — зона между сеткой и краем для размещения надписей

#### 1.2 Изогнутый текст по дуге (textPath)
Надписи сфер теперь следуют кривой линии вдоль границы каждого сектора:

```javascript
// Создание дугового пути для каждого сектора
function getTextArcPath(index) {
  const startAngle = getAngle(index)
  const endAngle = getAngle(index + 1)
  const midAngle = getMidAngle(index)
  
  // Инверсия для нижней половины колеса (читаемость)
  const isBottomHalf = midAngle > 0 && midAngle < Math.PI
  
  let arcStart, arcEnd
  if (isBottomHalf) {
    arcStart = endAngle
    arcEnd = startAngle
  } else {
    arcStart = startAngle
    arcEnd = endAngle
  }
  
  // SVG arc path
  const sweepFlag = isBottomHalf ? 0 : 1
  return `M ${x1} ${y1} A ${labelRadius} ${labelRadius} 0 0 ${sweepFlag} ${x2} ${y2}`
}
```

#### 1.3 SVG структура с textPath:
```html
<defs>
  <path v-for="..." :id="`text-arc-${index}`" :d="getTextArcPath(index)" />
</defs>

<text v-for="...">
  <textPath :href="`#text-arc-${index}`" startOffset="50%" text-anchor="middle">
    {{ sphere.name.toUpperCase() }}
  </textPath>
</text>
```

#### 1.4 Параметры:
- `svgSize`: 700px
- `outerRadius`: 320px (граница колеса)
- `gridRadius`: 240px (область сетки 1-10)
- `labelRadius`: ~290px (позиция надписей)
- `font-size`: 14px (11px на мобильных)
- `font-weight`: 700
- `letter-spacing`: 2px

---

## 2. Reflection Accordion Professional Redesign

### Файл: `src/views/BalancedScorecard.vue`

#### 2.1 Новые импорты Lucide-иконок:
```javascript
import { 
  Wallet, 
  Palette, 
  Users, 
  Heart, 
  Briefcase, 
  HeartHandshake,
  ChevronDown
} from 'lucide-vue-next'
```

#### 2.2 Маппинг иконок и цветов:
```javascript
const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: HeartHandshake
}

const sphereColors = {
  wealth: '#e63946',    // красный
  hobbies: '#f4a261',   // оранжевый
  friendship: '#e9c46a', // жёлтый
  health: '#2a9d8f',    // бирюзовый
  career: '#264653',    // тёмно-синий
  love: '#9b5de5'       // фиолетовый
}
```

#### 2.3 Обновлённая структура accordion-item:

**Было:**
```html
<span class="sphere-icon">{{ sphere.icon }}</span>
<span class="score-badge">{{ sphere.score }}/10</span>
<span class="accordion-arrow">▼</span>
```

**Стало:**
```html
<div class="sphere-icon-wrapper" :style="{ color: getSphereColor(sphere.id) }">
  <component :is="getSphereIcon(sphere.id)" :size="24" :stroke-width="2" />
</div>
<span class="score-badge-neutral">{{ sphere.score }}/10</span>
<ChevronDown :size="20" class="accordion-chevron" />
```

#### 2.4 CSS-стили:

**Цветная полоска слева:**
```css
.accordion-item {
  position: relative;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--sphere-color, var(--border-color));
}
```

**Иконка в цветном контейнере:**
```css
.sphere-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, currentColor 10%, transparent);
}
```

**Нейтральный бейдж оценки:**
```css
.score-badge-neutral {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0.15rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}
```

**Hover-эффекты:**
```css
.accordion-item:hover {
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.accordion-item:hover .sphere-icon-wrapper {
  background: color-mix(in srgb, currentColor 15%, transparent);
}
```

---

## 3. Мелкие правки

### 3.1 Убран эмодзи из заголовка
**Файл:** `src/views/BalancedScorecard.vue`

**Было:** `<h3>📝 Ваша рефлексия</h3>`
**Стало:** `<h3>Ваша рефлексия</h3>`

### 3.2 Единый дизайн на Step 3 (Рефлексия)
Применён тот же профессиональный дизайн к аккордеону на этапе "Глубокая рефлексия" (currentStep === 3):
- Lucide-иконки
- Цветные полоски
- Нейтральные бейджи
- ChevronDown

---

## Итоговый список изменённых файлов

| Файл | Изменения |
|------|-----------|
| `src/components/WheelOfLife.vue` | Полная переработка: textPath для изогнутых надписей, увеличенный viewBox, надписи во внешнем кольце |
| `src/views/BalancedScorecard.vue` | Lucide-импорты, маппинг иконок/цветов, обновлённые шаблоны для Summary и Step 3 accordion, новые CSS-стили |

---

## Визуальные улучшения

### WheelOfLife:
- Надписи читаются легко, не перекрываются с цветными сегментами
- Текст "облегает" колесо по дуге
- Автоматический переворот для нижней половины (читаемость слева направо)

### Reflection Accordion:
- Профессиональные линейные иконки вместо эмодзи
- Визуальная связь с колесом через цветовую кодировку
- Сдержанный, минималистичный дизайн
- Интерактивные hover-эффекты
