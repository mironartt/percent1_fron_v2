<template>
  <div
    class="compact-card"
    :class="{ completed, clickable, [`priority-${priority}`]: priority }"
    @click="clickable && $emit('click')"
  >
    <!-- Checkbox -->
    <button
      v-if="showCheckbox"
      class="check-btn touch-extend"
      :class="{ checked: completed }"
      @click.stop="$emit('toggle')"
      :aria-label="completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'"
    >
      <Check v-if="completed" :size="14" :stroke-width="2.5" />
    </button>

    <!-- Sphere indicator -->
    <span v-if="sphere" class="sphere-dot" :class="sphere"></span>

    <!-- Content -->
    <div class="card-content">
      <span class="card-title">{{ title }}</span>
      <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
    </div>

    <!-- Meta slot -->
    <div class="card-meta">
      <slot name="meta">
        <!-- Date badge -->
        <span v-if="date" class="meta-badge date-badge">
          <Calendar :size="12" :stroke-width="1.5" />
          {{ formatDate(date) }}
        </span>
        <!-- Time badge -->
        <span v-if="time" class="meta-badge time-badge">
          <Clock :size="12" :stroke-width="1.5" />
          {{ time }}
        </span>
      </slot>
    </div>

    <!-- Priority dot -->
    <span v-if="priority" class="priority-dot" :class="priority"></span>

    <!-- Arrow for clickable cards -->
    <ChevronRight
      v-if="clickable && showArrow"
      :size="16"
      :stroke-width="1.5"
      class="card-arrow"
    />
  </div>
</template>

<script setup>
import { Check, Calendar, Clock, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  showCheckbox: { type: Boolean, default: true },
  clickable: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: false },
  priority: {
    type: String,
    default: null,
    validator: v => ['critical', 'important', 'attention', 'optional', null].includes(v)
  },
  sphere: { type: String, default: null },
  date: { type: String, default: null },
  time: { type: String, default: null }
})

defineEmits(['click', 'toggle'])

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.compact-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  min-height: var(--touch-target);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
}

.compact-card.clickable {
  cursor: pointer;
}

.compact-card.clickable:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.compact-card.clickable:active {
  transform: scale(0.99);
}

.compact-card.completed {
  opacity: 0.6;
}

.compact-card.completed .card-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

/* Priority border */
.compact-card.priority-critical {
  border-left: 3px solid var(--danger-color);
}

.compact-card.priority-important {
  border-left: 3px solid var(--warning-color);
}

.compact-card.priority-attention {
  border-left: 3px solid var(--primary-color);
}

.compact-card.priority-optional {
  border-left: 3px solid var(--text-tertiary);
}

/* Checkbox */
.check-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  color: white;
}

.check-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.check-btn.checked {
  background: var(--success-color);
  border-color: var(--success-color);
}

/* Sphere dot */
.sphere-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sphere-dot.wealth, .sphere-dot.welfare { background: var(--sphere-wealth); }
.sphere-dot.hobbies, .sphere-dot.hobby { background: var(--sphere-hobbies); }
.sphere-dot.friendship, .sphere-dot.environment { background: var(--sphere-friendship); }
.sphere-dot.health, .sphere-dot.health_sport { background: var(--sphere-health); }
.sphere-dot.career, .sphere-dot.work { background: var(--sphere-career); }
.sphere-dot.love, .sphere-dot.family { background: var(--sphere-love); }

/* Content */
.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Meta badges */
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  color: var(--text-secondary);
}

.date-badge {
  color: var(--primary-color);
}

/* Priority dot */
.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.critical { background: var(--danger-color); }
.priority-dot.important { background: var(--warning-color); }
.priority-dot.attention { background: var(--primary-color); }
.priority-dot.optional { background: var(--text-tertiary); }

/* Arrow */
.card-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .compact-card,
  .check-btn {
    transition: none;
  }
}
</style>
