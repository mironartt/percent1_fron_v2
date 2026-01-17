# OnePercent Design Comparison: Current State vs Best Practices

## 1. Typography

| Parameter | OnePercent Current | Best Practice | Status |
|-----------|-------------------|---------------|--------|
| Font | Inter | Inter | OK |
| H1 | 36px, weight 700, letter-spacing -0.01em | 35px, weight 700, -0.01em | DONE |
| H2 | 30px, letter-spacing -0.0075em | 28px, -0.0075em | DONE |
| H3 | 24px, letter-spacing -0.00625em | 24px, -0.00625em | DONE |
| Body | 15px (0.9375rem) | 16px | OK |

---

## 2. Border Radius

| Parameter | OnePercent Current | Best Practice | Status |
|-----------|-------------------|---------------|--------|
| `--radius-sm` | 4px (0.25rem) | 4px | DONE |
| `--radius-md` | 8px (0.5rem) | 8px | OK |
| `--radius-lg` | 12px (0.75rem) | 12px | OK |
| `--radius-xl` | 16px (1rem) | 16px | OK |
| `--radius-full` | 9999px | 9999px | DONE |

---

## 3. Shadows (Elevation System)

| Parameter | OnePercent Current | Best Practice | Status |
|-----------|-------------------|---------------|--------|
| `--shadow-sm` | Multi-layer | Multi-layer | DONE |
| `--shadow-md` | Multi-layer | Multi-layer | DONE |
| `--shadow-lg` | Multi-layer | Multi-layer | DONE |
| `--shadow-xl` | Multi-layer | Multi-layer | DONE |
| `--shadow-hover` | Added | For card hover | DONE |

### Current Implementation:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-hover: 0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08);
```

---

## 4. Hover Effects

| Component | OnePercent Current | Best Practice | Status |
|-----------|-------------------|---------------|--------|
| Buttons | translateY(-2px) + shadow-lg | translateY(-2px) + shadow | DONE |
| Cards | translateY(-4px) + shadow-hover | translateY(-4px) + shadow | DONE |
| List items | translateX(4px) + border-left | translateX(4px) + indicator | DONE |
| Sidebar items | translateX(4px) | translateX(4px) | DONE |

---

## 5. Life Sphere Colors

| Sphere | Frontend ID | Color | Background | Status |
|--------|-------------|-------|------------|--------|
| Wealth | welfare | #10B981 | rgba(16, 185, 129, 0.1) | DONE |
| Hobbies | hobby | #8B5CF6 | rgba(139, 92, 246, 0.1) | DONE |
| Friendship | environment | #F59E0B | rgba(245, 158, 11, 0.1) | DONE |
| Health | health_sport | #EF4444 | rgba(239, 68, 68, 0.1) | DONE |
| Career | work | #3B82F6 | rgba(59, 130, 246, 0.1) | DONE |
| Love | family | #EC4899 | rgba(236, 72, 153, 0.1) | DONE |

---

## 6. Dark Mode

| Parameter | OnePercent Current | Best Practice | Status |
|-----------|-------------------|---------------|--------|
| `--bg-primary` | #121212 | #121212 (Material) | DONE |
| `--bg-secondary` | #1a1a1a | #1a1a1a | DONE |
| `--bg-tertiary` | #242424 | #242424 | DONE |
| `--card-bg` | #1e1e1e | #1e1e1e | DONE |
| `--border-color` | #2e2e2e | #2e2e2e | DONE |

---

## 7. Transitions

| Parameter | Value | Status |
|-----------|-------|--------|
| `--transition-fast` | 150ms ease | DONE |
| `--transition-normal` | 200ms ease | DONE |
| `--transition-slow` | 300ms ease | DONE |

---

## 8. Animations

| Animation | Purpose | Status |
|-----------|---------|--------|
| `task-complete` | Bounce on task completion | DONE |
| `task-check-pop` | Checkbox pop effect | DONE |

---

## 9. Progress Circle Component

```css
.progress-circle {
  --progress: 0;
  --size: 48px;
  --stroke-width: 6px;
}
```
Variants: `.sm` (32px), `.lg` (64px)

Status: DONE

---

## 10. Files Modified

| File | Changes |
|------|---------|
| `src/assets/main.css` | CSS variables, shadows, typography, sphere colors, animations |
| `src/views/Dashboard.vue` | Card hover effects, item hover |
| `src/views/GoalsBank.vue` | Goal card hover |
| `src/views/Planning.vue` | Task card hover |
| `src/views/GoalEdit.vue` | Step card hover |
| `src/components/Sidebar.vue` | Nav item hover |

---

## Summary

All planned design improvements have been implemented:

- Multi-layer shadows for realistic depth
- Life sphere color system with CSS variables
- Improved typography with negative letter-spacing
- Dark mode with Material Design #121212 background
- Hover effects on all interactive cards and items
- Task completion animations
- Circular progress component
- Standardized transitions
