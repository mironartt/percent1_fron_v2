# OnePercent MVP - Design Guidelines

## Design Approach

**Selected System**: Material Design with Linear-inspired minimalism
**Rationale**: Productivity application requiring clear data hierarchy, comprehensive form components, and efficient workflows for goal management and life tracking.

**Design Principles**:
- Clarity over decoration: Information-dense interface with breathing room
- Purposeful hierarchy: Clear visual distinction between primary/secondary actions
- Data-first: Progress indicators and metrics take visual priority
- Focused interactions: Minimal distractions, maximum productivity

---

## Typography

**Font Stack**: System fonts via `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`

**Hierarchy**:
- Page Headers (h1): 2.5rem (40px), font-weight 700
- Section Headers (h2): 2rem (32px), font-weight 600  
- Card Titles (h3): 1.5rem (24px), font-weight 600
- Subsections (h4): 1.25rem (20px), font-weight 500
- Body Text: 1rem (16px), font-weight 400
- Secondary Text: 0.875rem (14px), font-weight 400
- Labels/Captions: 0.75rem (12px), font-weight 500, uppercase tracking

**Line Heights**: 1.5 for body, 1.2 for headings

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4 (16px) 
- Section spacing: p-6, gap-6 (24px)
- Large spacing: p-8, gap-8 (32px)
- Extra large: p-12 (48px), p-16 (64px)

**Container Widths**:
- Dashboard: max-w-7xl mx-auto
- Content areas: max-w-6xl
- Forms/modals: max-w-2xl
- Sidebars: w-64 (256px) or w-72 (288px)

**Grid Patterns**:
- Dashboard stats: grid-cols-2 md:grid-cols-3 lg:grid-cols-6 (for 6 life spheres)
- Goals list: grid-cols-1 md:grid-cols-2 gap-4
- Task items: Single column with consistent card height

---

## Component Library

### Navigation
- **Top Bar**: Sticky header with logo, main navigation links, user profile
- **Sidebar** (optional): Collapsible module navigation (Dashboard, ССП, Goals, Planner)
- **Breadcrumbs**: Show current location in deep navigation

### Data Display

**Life Sphere Cards** (ССП module):
- Card with sphere icon (emoji 💪, 💼, 💰, etc.), name, and rating
- Range slider (0-10) with clear visual feedback
- Expandable notes textarea
- Progress indicator showing balance vs average

**Goal Cards**:
- Title, category badge, deadline
- Linear progress bar with percentage
- Steps checklist (expandable)
- MVP and "why" sections (collapsible)
- Action buttons (edit, delete) on hover/focus

**Task Items**:
- Checkbox with task title
- Priority badge (high/medium/low with distinct visual weight)
- Energy level indicator
- Time block badge (morning/afternoon/evening)
- Goal association tag when linked

### Forms

**Input Fields**:
- Consistent height (h-12)
- Clear labels above inputs
- Placeholder text for guidance
- Error states with helper text below
- Focus states with visible outline

**Textareas**:
- Minimum height (min-h-32)
- Auto-resize for long content
- Character count when relevant

**Sliders** (for ratings):
- Full-width with clear tick marks
- Current value displayed prominently
- Gradient track showing low→high progression

**Buttons**:
- Primary: Filled, high contrast (h-12, px-6, rounded-lg)
- Secondary: Outlined (h-12, px-6, rounded-lg)
- Icon-only: Square (h-10 w-10, rounded-lg)
- Destructive: Distinct visual treatment for delete actions

### Data Visualization

**Progress Bars**:
- Linear bars with percentage text
- Rounded caps (rounded-full)
- Height: h-2 for compact, h-4 for prominent

**Radar Chart** (for life balance):
- SVG-based hexagon showing 6 life spheres
- Filled area showing current ratings
- Gridlines for reference
- Labels for each sphere

**Statistics Cards**:
- Large number (text-3xl font-bold)
- Descriptive label below
- Optional trend indicator (↑↓)
- Minimal card design with subtle border

### Modals & Overlays

**Dialogs**:
- Centered overlay with backdrop blur
- Max-width constraint (max-w-2xl)
- Header with title and close button
- Content area with adequate padding (p-6)
- Footer with aligned action buttons

**AI Assistant Chat**:
- Fixed position bottom-right (when active)
- Message bubbles (user vs AI differentiated)
- Input field at bottom
- Scrollable conversation area
- Toggle minimize/maximize

### Cards & Containers

**Standard Card**:
- Border or subtle shadow (not both)
- Rounded corners (rounded-xl)
- Padding p-6
- Hover state for interactive cards

**Section Containers**:
- Subtle background differentiation
- Clear visual separation between sections
- Consistent inner spacing

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column layouts)
- Tablet: 768px - 1024px (2-column where appropriate)
- Desktop: > 1024px (full multi-column layouts)

**Mobile Adaptations**:
- Hamburger menu for navigation
- Full-width cards
- Simplified data visualizations
- Bottom sheet modals instead of centered dialogs
- Touch-friendly tap targets (min h-12)

---

## Accessibility

**Focus Management**:
- Visible focus rings (ring-2 ring-offset-2)
- Logical tab order
- Skip navigation link

**Color Independence**:
- Icons + text labels (not icon-only buttons)
- Pattern/shape differentiation beyond color
- Sufficient text contrast ratios

**Interactive States**:
- Clear hover/focus/active states for all interactive elements
- Disabled state visually distinct
- Loading states with appropriate feedback

---

## Animations

**Use Sparingly**:
- Micro-interactions: Button hover scale (scale-105)
- State changes: Smooth opacity/transform transitions (transition-all duration-200)
- Page transitions: Subtle fade-in for route changes
- **Avoid**: Gratuitous scroll animations, parallax effects, complex sequences

---

## Images

No hero images required for this application. Focus on:
- Icon library: Use Heroicons via CDN for consistent icon set throughout
- User avatars: Circular placeholders with initials
- Empty states: Simple illustrations or icons with explanatory text