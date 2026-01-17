<template>
  <div class="widget" :class="{ expanded }">
    <button
      class="widget-header"
      @click="toggle"
      :aria-expanded="expanded"
      :aria-controls="contentId"
    >
      <div class="widget-left">
        <span class="widget-icon">
          <slot name="icon" />
        </span>
        <span class="widget-title">{{ title }}</span>
      </div>
      <div class="widget-right">
        <slot name="badge">
          <span v-if="count !== null" class="widget-count">{{ count }}</span>
        </slot>
        <ChevronDown
          class="widget-chevron"
          :class="{ rotated: expanded }"
          :size="16"
          :stroke-width="1.5"
        />
      </div>
    </button>

    <Transition name="collapse">
      <div v-show="expanded" :id="contentId" class="widget-content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  count: { type: [Number, String], default: null },
  defaultExpanded: { type: Boolean, default: false },
  persistKey: { type: String, default: null } // localStorage key for persisting state
})

const emit = defineEmits(['toggle'])

// Generate unique ID for accessibility
const contentId = `widget-content-${Math.random().toString(36).slice(2, 9)}`

const expanded = ref(props.defaultExpanded)

// Load persisted state
onMounted(() => {
  if (props.persistKey) {
    const saved = localStorage.getItem(`widget-${props.persistKey}`)
    if (saved !== null) {
      expanded.value = saved === 'true'
    }
  }
})

// Save state when changed
watch(expanded, (newValue) => {
  if (props.persistKey) {
    localStorage.setItem(`widget-${props.persistKey}`, String(newValue))
  }
})

function toggle() {
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}
</script>

<style scoped>
.widget {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.widget.expanded {
  border-color: var(--primary-color);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  min-height: var(--touch-target);
  text-align: left;
  transition: background 0.15s ease;
}

.widget-header:hover {
  background: var(--bg-tertiary);
}

.widget-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.widget-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-light);
  border-radius: var(--radius-md);
  color: var(--primary-color);
}

.widget-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.widget-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-count {
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.widget-chevron {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.widget-chevron.rotated {
  transform: rotate(180deg);
}

.widget-content {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--border-color);
}

/* Collapse animation */
.collapse-enter-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.collapse-leave-active {
  transition: all 0.2s ease-in;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .widget,
  .widget-header,
  .widget-chevron,
  .collapse-enter-active,
  .collapse-leave-active {
    transition: none;
  }
}
</style>
