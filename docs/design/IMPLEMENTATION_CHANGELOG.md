# Design Implementation Changelog

## Date: January 2025

### Overview
Complete design system update based on industry best practices research from Linear, Notion, Todoist, Habitify, and other top productivity SaaS applications.

---

## Changes Made

### 1. main.css - CSS Variables

#### Added to `:root`:

```css
--primary-light: rgba(99, 102, 241, 0.1);
--info-color: #3b82f6;

/* Shadows - multi-layer for realistic depth */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-hover: 0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08);

/* Border radius */
--radius-sm: 0.25rem;
--radius-full: 9999px;

/* Life Spheres Colors */
--sphere-wealth: #10B981;
--sphere-wealth-bg: rgba(16, 185, 129, 0.1);
--sphere-wealth-border: rgba(16, 185, 129, 0.2);
--sphere-hobbies: #8B5CF6;
--sphere-hobbies-bg: rgba(139, 92, 246, 0.1);
--sphere-hobbies-border: rgba(139, 92, 246, 0.2);
--sphere-friendship: #F59E0B;
--sphere-friendship-bg: rgba(245, 158, 11, 0.1);
--sphere-friendship-border: rgba(245, 158, 11, 0.2);
--sphere-health: #EF4444;
--sphere-health-bg: rgba(239, 68, 68, 0.1);
--sphere-health-border: rgba(239, 68, 68, 0.2);
--sphere-career: #3B82F6;
--sphere-career-bg: rgba(59, 130, 246, 0.1);
--sphere-career-border: rgba(59, 130, 246, 0.2);
--sphere-love: #EC4899;
--sphere-love-bg: rgba(236, 72, 153, 0.1);
--sphere-love-border: rgba(236, 72, 153, 0.2);

/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

#### Modified in `:root.dark`:

```css
--primary-light: rgba(129, 140, 248, 0.15);
--info-color: #60a5fa;

/* Dark mode backgrounds - Material Design standard */
--bg-primary: #121212;
--bg-secondary: #1a1a1a;
--bg-tertiary: #242424;
--bg-hover: #2a2a2a;
--card-bg: #1e1e1e;
--border-color: #2e2e2e;

/* Shadows for dark mode - multi-layer */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
--shadow-hover: 0 12px 24px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.4);

/* Life Spheres - brighter for dark mode */
--sphere-wealth: #34d399;
--sphere-wealth-bg: rgba(52, 211, 153, 0.15);
--sphere-wealth-border: rgba(52, 211, 153, 0.25);
--sphere-hobbies: #a78bfa;
--sphere-hobbies-bg: rgba(167, 139, 250, 0.15);
--sphere-hobbies-border: rgba(167, 139, 250, 0.25);
--sphere-friendship: #fbbf24;
--sphere-friendship-bg: rgba(251, 191, 36, 0.15);
--sphere-friendship-border: rgba(251, 191, 36, 0.25);
--sphere-health: #f87171;
--sphere-health-bg: rgba(248, 113, 113, 0.15);
--sphere-health-border: rgba(248, 113, 113, 0.25);
--sphere-career: #60a5fa;
--sphere-career-bg: rgba(96, 165, 250, 0.15);
--sphere-career-border: rgba(96, 165, 250, 0.25);
--sphere-love: #f472b6;
--sphere-love-bg: rgba(244, 114, 182, 0.15);
--sphere-love-border: rgba(244, 114, 182, 0.25);
```

---

### 2. main.css - Typography

```css
/* Typography - with negative letter-spacing for headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

h1 { font-size: 2.25rem; letter-spacing: -0.01em; }
h2 { font-size: 1.875rem; letter-spacing: -0.0075em; }
h3 { font-size: 1.5rem; letter-spacing: -0.00625em; font-weight: 600; }
h4 { font-size: 1.25rem; letter-spacing: -0.005em; font-weight: 600; }
h5 { font-size: 1.125rem; font-weight: 600; }
h6 { font-size: 1rem; font-weight: 600; }
```

---

### 3. main.css - Button Hover

```css
.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

### 4. main.css - Card Hover

```css
.card {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card-interactive:hover,
.card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
```

---

### 5. main.css - Sphere Badge Classes

```css
.sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.sphere-badge.wealth, .sphere-welfare { ... }
.sphere-badge.hobbies, .sphere-hobby { ... }
.sphere-badge.friendship, .sphere-environment { ... }
.sphere-badge.health, .sphere-health_sport { ... }
.sphere-badge.career, .sphere-work { ... }
.sphere-badge.love, .sphere-family { ... }
```

---

### 6. main.css - Sphere Indicator (Left Border)

```css
.sphere-indicator {
  border-left: 3px solid transparent;
  transition: border-color var(--transition-fast);
}

.sphere-indicator.wealth { border-left-color: var(--sphere-wealth); }
/* ... etc for all spheres */
```

---

### 7. main.css - Sphere Dot

```css
.sphere-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sphere-dot.wealth { background: var(--sphere-wealth); }
/* ... etc for all spheres */
```

---

### 8. main.css - Task Completion Animations

```css
@keyframes task-complete {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes task-check-pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.task-just-completed {
  animation: task-complete 0.3s ease;
}

.check-animated {
  animation: task-check-pop 0.25s ease;
}
```

---

### 9. main.css - Circular Progress Component

```css
.progress-circle {
  --progress: 0;
  --size: 48px;
  --stroke-width: 6px;
  --circle-color: var(--primary-color);
  --track-color: var(--bg-tertiary);

  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: conic-gradient(
    var(--circle-color) calc(var(--progress) * 1%),
    var(--track-color) 0
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle::before {
  content: '';
  position: absolute;
  inset: var(--stroke-width);
  background: var(--bg-primary);
  border-radius: 50%;
}

.progress-circle-value {
  position: relative;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-circle.sm { --size: 32px; --stroke-width: 4px; }
.progress-circle.lg { --size: 64px; --stroke-width: 8px; }
```

---

### 10. Dashboard.vue - Scoped Styles

```css
.card {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.focus-card:hover,
.goals-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.focus-item {
  transition: all var(--transition-normal);
  border-left: 3px solid transparent;
}

.focus-item:hover {
  transform: translateX(4px);
  border-left-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.goal-item {
  transition: background-color var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
  border-left: 3px solid transparent;
}

.goal-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
  border-left-color: var(--primary-color);
}

.focus-check.just-checked {
  animation: task-check-pop 0.25s ease;
}

.focus-item.just-completed {
  animation: task-complete 0.3s ease;
}
```

---

### 11. GoalsBank.vue - Scoped Styles

```css
.goal-card {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-fast);
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
```

---

### 12. Planning.vue - Scoped Styles

```css
.task-card {
  transition: transform var(--transition-normal), background-color var(--transition-fast), box-shadow var(--transition-normal);
}

.task-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}
```

---

### 13. GoalEdit.vue - Scoped Styles

```css
.step-card {
  transition: transform var(--transition-normal), background-color var(--transition-fast), box-shadow var(--transition-normal);
}

.step-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}
```

---

### 14. Sidebar.vue - Scoped Styles

```css
.nav-item {
  transition: background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.nav-item:hover {
  transform: translateX(4px);
}
```

---

## Usage Examples

### Circular Progress
```vue
<div class="progress-circle" :style="{ '--progress': 75 }">
  <span class="progress-circle-value">75%</span>
</div>
```

### Sphere Badge
```vue
<span class="sphere-badge wealth">Финансы</span>
<span class="sphere-badge career">Карьера</span>
```

### Sphere Indicator (on cards)
```vue
<div class="goal-card sphere-indicator" :class="goal.category">
  <!-- card content -->
</div>
```

### Sphere Dot
```vue
<span class="sphere-dot" :class="goal.category"></span>
```
