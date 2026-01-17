# UI/UX Design Research: Productivity & Goal Tracking Apps 2024-2025

## Executive Summary

This document contains comprehensive research on design patterns, trends, and specific design values from top SaaS productivity applications (Notion, Linear, Todoist, Things 3, Sunsama, Reclaim.ai, Motion, Habitify, Streaks, Any.do, Asana, Monday.com) with actionable recommendations for the OnePercent Vue 3 application.

---

## 1. Typography

### Industry Standard: Inter Font

**Most productivity apps use Inter**, including:
- Notion
- Linear
- Figma
- GitLab
- Mozilla

**Why Inter?**
- Tall x-height and open apertures optimized for screen readability
- Wide character spacing improves reading comfort
- Variable font with weights from 100 (Thin) to 900 (Black)
- Optical size axis adapts for all font sizes

### Recommended Typography Scale (Radix Design System)

| Step | Font Size | Letter Spacing | Line Height | Use Case |
|------|-----------|----------------|-------------|----------|
| 1 | 12px | 0.0025em | 16px | Captions, labels |
| 2 | 14px | 0em | 20px | Body small, secondary text |
| 3 | 16px | 0em | 24px | Body default |
| 4 | 18px | -0.0025em | 26px | Body large |
| 5 | 20px | -0.005em | 28px | Heading 4 |
| 6 | 24px | -0.00625em | 30px | Heading 3 |
| 7 | 28px | -0.0075em | 36px | Heading 2 |
| 8 | 35px | -0.01em | 40px | Heading 1 |
| 9 | 60px | -0.025em | 60px | Display |

**Font Weights:**
- Light: 300
- Regular: 400
- Medium: 500
- Bold: 700

---

## 2. Color Palettes

### Light Mode Color Schemes

**Notion:**
- Primary: #000000 (Black)
- Background: #FFFFFF (White)
- Accent: #1DB954 (Green)
- Philosophy: Clean, minimalist

**Todoist:**
- Text/Headers: #25221E (Zeus - dark gray)
- Background: #FEFDFC (Fantasy - warm white)
- Highlights: #F0F6DF (Frost - soft green-white)
- Primary Accent: Vibrant Red (energy/urgency)

**Sunsama:**
- Background: White
- Muted color palette
- Calm, zen-like aesthetic

### Dark Mode Best Practices

**Recommended Background Colors (NOT pure black):**
- Material Design default: #121212
- Spotify gradient: #181818 to #404040
- Linear: Uses LCH color space for consistent lightness

**Key Principles:**
- Never use pure black (#000000) for backgrounds - creates eye strain
- Desaturate colors for dark backgrounds
- Use dark grays (#121212, #181818) for default surfaces
- Reduce contrast slightly - white text on dark gray is easier to read

---

## 3. Border Radius

### Modern Trends 2024-2025

**Common Values:**
- Subtle elements (buttons, inputs): 4px - 8px
- Cards and containers: 12px - 16px
- Modals and dialogs: 16px - 24px
- Fully rounded (pills, badges): 9999px or 50%

**Bento Card Standard:**
```css
border-radius: 16px;
```

---

## 4. Shadows (Elevation System)

### Modern Shadow Best Practices

**Small Elevation (subtle cards, buttons):**
```css
box-shadow: 0.5px 1px 1px hsl(220deg 60% 50% / 0.7);
```

**Medium Elevation (cards, dropdowns):**
```css
box-shadow:
  1px 2px 2px hsl(220deg 60% 50% / 0.333),
  2px 4px 4px hsl(220deg 60% 50% / 0.333),
  3px 6px 6px hsl(220deg 60% 50% / 0.333);
```

**Large Elevation (modals, dialogs):**
```css
box-shadow:
  1px 2px 2px hsl(220deg 60% 50% / 0.2),
  2px 4px 4px hsl(220deg 60% 50% / 0.2),
  4px 8px 8px hsl(220deg 60% 50% / 0.2),
  8px 16px 16px hsl(220deg 60% 50% / 0.2),
  16px 32px 32px hsl(220deg 60% 50% / 0.2);
```

**Key Principles:**
- Use layered shadows for more realistic depth
- Match shadow color to background hue (not pure black)
- Maintain consistent light direction (typically 1:2 ratio for x:y offset)
- Reduce opacity as elevation increases

---

## 5. Spacing & Grid System

### 8px Grid System (Industry Standard)

Used by Apple Human Interface Guidelines and Google Material Design.

**Spacing Scale:**
```css
--space-1: 4px;   /* Half-step for fine adjustments */
--space-2: 8px;   /* Base unit */
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Component Padding Guidelines

| Component | Padding |
|-----------|---------|
| Buttons | 8px 16px (sm), 12px 24px (md), 16px 32px (lg) |
| Cards | 16px - 24px |
| Inputs | 8px 12px |
| List items | 12px 16px |
| Modals | 24px |
| Sidebar items | 8px 12px |

---

## 6. Sidebar Navigation Design

### Dimensions

**Expanded Sidebar:** 240px - 300px width
**Collapsed Sidebar:** 48px - 64px width

### Best Practices

1. **Combine icons with text labels** for comprehension
2. **Use familiar symbols** that align with common UX patterns
3. **Add expandable/collapsible sections** (Notion style)
4. **Allow users to resize** the sidebar
5. **Vertical alignment** - maintain consistent spacing between items

**Recommendation:**
```css
--sidebar-width-expanded: 260px;
--sidebar-width-collapsed: 56px;
--sidebar-item-height: 36px;
--sidebar-item-padding: 8px 12px;
--sidebar-icon-size: 20px;
--sidebar-gap: 4px;
```

---

## 7. Progress Visualization

### Key Principles

1. **Give credit for action already taken** - start progress bars slightly filled (Zeigarnik effect)
2. **Break goals into smaller steps** - increases completion rates
3. **Real-time updates** - immediate visual feedback
4. **Use color changes** for status (green = success, red = overdue)

### Progress Bar Types

**Determinate:** When duration is known - show percentage
**Indeterminate:** When duration is unknown - spinning/loading animation

### Gamification Elements (Habitica/Streaks Style)

- **Streak counters** - consecutive days
- **XP points** - for task completion
- **Badges/achievements** - milestone rewards
- **Level progress** - visual character/avatar progression

---

## 8. Tags, Badges & Category Indicators

### Component Types

| Component | Purpose | Interactive |
|-----------|---------|-------------|
| **Badges** | Status indicators (new, pending, draft) | No |
| **Tags** | Categories, labels, filters | Yes/No |
| **Chips** | Selection, filtering, removable items | Yes |
| **Pills** | Visual style - fully rounded tags/chips | Yes |

### Priority Indicators (Goal Tracking)

| Priority | Color | Label |
|----------|-------|-------|
| Critical | Red (#EF4444) | |
| Important | Orange (#F97316) | |
| Normal | Blue (#3B82F6) | |
| Optional | Gray (#9CA3AF) | |

---

## 9. Micro-interactions & Animations

### 2025 Trends

1. **Hover animations** on buttons and cards
2. **Scroll-triggered fade-ins**
3. **Skeleton loaders** and shimmer effects
4. **Live validation** in form fields
5. **Toggle switches** with elastic effect
6. **Celebratory animations** (Asana style) when completing tasks

### Timing Guidelines

**Standard duration:** 200ms - 500ms
**Hover transitions:** 150ms - 300ms
**Page transitions:** 300ms - 500ms

### Button Hover Example

```css
.button {
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Card Hover ("Magnetic" Effect)

```css
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

---

## 10. App-Specific Design Insights

### Linear
- **Color System:** LCH color space (perceptually uniform)
- **Theme Variables:** Only 3 needed (base, accent, contrast)
- **Typography:** Inter Display for headings, Inter for body
- **Focus:** Reduced visual noise, improved density

### Notion
- **Font:** Inter (tall x-height, wide letter spacing)
- **Colors:** Black (#000000), White (#FFFFFF), minimal accent
- **Philosophy:** Ultra-minimalist, content-first

### Todoist
- **Colors:** Zeus (#25221E), Fantasy (#FEFDFC), Frost (#F0F6DF)
- **Accent:** Vibrant red for urgency

### Sunsama
- **Aesthetic:** Zen-like, calming
- **Background:** White with muted color palette
- **Features:** Focus mode, daily shutdown rituals

### Habitify
- **Organization:** Habits grouped by time of day (Morning, Afternoon, Evening)
- **Interface:** Modern, clean, intuitive

---

## 11. Summary

The key trends for productivity and goal tracking apps in 2024-2025 are:

1. **Minimalism** - Clean interfaces with ample whitespace
2. **Subtle depth** - Layered shadows, not flat design
3. **Perceptually uniform colors** - LCH color space adoption
4. **Inter font dominance** - De facto standard for productivity apps
5. **8px grid system** - Consistent spacing
6. **Meaningful micro-interactions** - 200-500ms animations
7. **Dark mode** - Using dark grays, not pure black
8. **Progress gamification** - Streaks, XP, achievements
9. **Collapsible navigation** - User-controlled sidebar
10. **Card-based layouts** - Bento grids with 16px radius

---

## 12. Design Resources

### Figma Community Resources
- [Linear Design System](https://www.figma.com/community/file/1222872653732371433/linear-design-system)
- [Todoist Dashboard Redesign Challenge](https://www.figma.com/community/file/1349269555742175321/todoist-dashboard-redesign-challenge)

### Dribbble Inspiration
- [Goal Tracker Designs](https://dribbble.com/tags/goal-tracker)
- [Habit Tracker Designs](https://dribbble.com/tags/habit-tracker)
- [Best Dashboard Design 2024](https://dribbble.com/tags/best-dashboard-design-2024)

### Documentation
- [Radix UI Themes Typography](https://www.radix-ui.com/themes/docs/theme/typography)
- [Material Design Color System](https://m2.material.io/design/color/applying-color-to-ui.html)
- [Josh W. Comeau - Designing Shadows](https://www.joshwcomeau.com/css/designing-shadows/)
