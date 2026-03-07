<template>
  <Teleport to="body">
    <Transition name="aim-slide">
      <div v-if="show" class="aim-overlay" @click.self="$emit('close')">
        <div
          class="aim-modal"
          ref="modalRef"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag Handle for mobile -->
          <div class="aim-drag-handle">
            <div class="aim-drag-indicator"></div>
          </div>

          <!-- Header -->
          <div class="aim-header">
            <div class="aim-header-title">
              <Sparkles :size="20" :stroke-width="1.5" class="aim-header-icon" />
              <h3>{{ title }}</h3>
            </div>
            <button class="aim-close" @click="$emit('close')">
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="aim-body">
            <!-- Intro (default slot or built-in) -->
            <template v-if="step === 'intro'">
              <div class="aim-intro">
                <div class="aim-intro-icon">
                  <Sparkles :size="40" />
                </div>
                <h4>{{ subtitle }}</h4>
                <p class="aim-intro-desc">{{ description }}</p>
                <div class="aim-features" v-if="features && features.length">
                  <div
                    v-for="(f, i) in features"
                    :key="i"
                    class="aim-feature"
                  >
                    <component :is="f.icon" :size="18" />
                    <span>{{ f.text }}</span>
                  </div>
                </div>
                <!-- Extra slot for options (like overdue tasks toggle) -->
                <slot name="intro-options"></slot>
              </div>
            </template>

            <!-- Loading -->
            <template v-else-if="step === 'loading'">
              <div class="aim-loading">
                <div class="aim-loading-icon">
                  <Bot :size="32" class="aim-pulse" />
                </div>
                <h4>{{ loadingText || 'Анализирую...' }}</h4>
                <div v-if="loadingPercent !== null" class="aim-progress-wrap">
                  <div class="aim-progress-track">
                    <div class="aim-progress-fill" :style="{ width: loadingPercent + '%' }"></div>
                  </div>
                  <span class="aim-progress-pct">{{ loadingPercent }}%</span>
                </div>
                <div v-else class="aim-spinner"></div>
                <p class="aim-loading-hint">Это займёт несколько секунд</p>
              </div>
            </template>

            <!-- Custom content (result, selection, etc.) -->
            <template v-else>
              <slot :name="step" :step="step"></slot>
            </template>
          </div>

          <!-- Footer -->
          <div class="aim-footer">
            <template v-if="step === 'intro'">
              <button class="aim-btn aim-btn-primary aim-btn-full" @click="$emit('start')">
                <Sparkles :size="18" />
                <span>{{ buttonText }}</span>
              </button>
            </template>
            <template v-else>
              <slot name="footer" :step="step"></slot>
            </template>
          </div>

          <!-- Skip intro checkbox -->
          <div v-if="step === 'intro' && skipKey" class="aim-skip-row">
            <label class="aim-skip-label">
              <input
                type="checkbox"
                :checked="skipChecked"
                @change="$emit('update:skipChecked', $event.target.checked)"
              />
              <span>Не показывать больше</span>
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Sparkles, X, Bot } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'AI ментор' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  features: { type: Array, default: () => [] },
  buttonText: { type: String, default: 'Начать' },
  step: { type: String, default: 'intro' },
  loadingText: { type: String, default: '' },
  loadingPercent: { type: Number, default: null },
  skipKey: { type: String, default: '' },
  skipChecked: { type: Boolean, default: false }
})

defineEmits(['close', 'start', 'update:skipChecked'])

const modalRef = ref(null)
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isDragging = ref(false)

function handleTouchStart(e) {
  if (e.target.closest('.aim-scrollable')) return
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

function handleTouchMove(e) {
  if (!isDragging.value) return
  touchCurrentY.value = e.touches[0].clientY
  const diff = touchCurrentY.value - touchStartY.value
  if (diff > 0 && modalRef.value) {
    modalRef.value.style.transform = `translateY(${Math.min(diff, 200)}px)`
  }
}

function handleTouchEnd() {
  if (!isDragging.value) return
  const diff = touchCurrentY.value - touchStartY.value
  if (diff > 100) {
    // emit close
    modalRef.value?.closest('.aim-overlay')?.click()
  } else if (modalRef.value) {
    modalRef.value.style.transform = ''
  }
  isDragging.value = false
  touchStartY.value = 0
  touchCurrentY.value = 0
}
</script>

<style scoped>
/* ═══════════════════════════════════
   AI MENTOR MODAL — Unified Shell
   ═══════════════════════════════════ */

.aim-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.aim-modal {
  background: var(--bg-primary, #fff);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

/* Drag Handle */
.aim-drag-handle {
  display: none;
  justify-content: center;
  padding: 12px 0 4px;
}

.aim-drag-indicator {
  width: 36px;
  height: 4px;
  background: var(--border-color, #d1d5db);
  border-radius: 2px;
}

/* Header */
.aim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0;
}

.aim-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.aim-header-icon {
  color: var(--success-color, #10b981);
}

.aim-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.aim-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  transition: all 0.15s;
}

.aim-close:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

/* Body */
.aim-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

/* ── Intro Section ── */
.aim-intro {
  text-align: center;
}

.aim-intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-radius: 50%;
  color: #fff;
}

.aim-intro h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text-primary, #1f2937);
}

.aim-intro-desc {
  color: var(--text-secondary, #6b7280);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}

.aim-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.aim-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: color-mix(in srgb, var(--success-color, #10b981) 8%, transparent);
  border-radius: 10px;
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
}

.aim-feature svg {
  color: var(--success-color, #10b981);
  flex-shrink: 0;
}

/* ── Loading Section ── */
.aim-loading {
  text-align: center;
  padding: 2rem 0;
}

.aim-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  color: #10b981;
}

.aim-pulse {
  animation: aim-pulse 1.5s ease-in-out infinite;
}

@keyframes aim-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.aim-loading h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--text-primary, #1f2937);
}

.aim-progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 280px;
  margin: 0 auto 1rem;
}

.aim-progress-track {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.aim-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #22c55e);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.aim-progress-pct {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
}

.aim-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-secondary, #e5e7eb);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 1.25rem;
  animation: aim-spin 0.8s linear infinite;
}

@keyframes aim-spin {
  to { transform: rotate(360deg); }
}

.aim-loading-hint {
  color: var(--text-tertiary, #9ca3af);
  font-size: 0.8125rem;
  margin: 0;
}

/* ── Footer ── */
.aim-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
  flex-shrink: 0;
  border-radius: 0 0 20px 20px;
}

.aim-footer:empty {
  display: none;
}

/* ── Buttons ── */
.aim-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
  font-family: inherit;
}

.aim-btn-full { width: 100%; }

.aim-btn-primary {
  background: var(--success-color, #10b981);
  color: #fff;
}

.aim-btn-primary:hover:not(:disabled) {
  background: #059669;
}

.aim-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.aim-btn-secondary {
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  border: 1px solid var(--border-color, #e5e7eb);
}

.aim-btn-secondary:hover {
  background: var(--bg-tertiary, #f3f4f6);
}

/* ── Skip Checkbox ── */
.aim-skip-row {
  display: flex;
  justify-content: center;
  padding: 0.5rem 1.25rem 1rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 0 0 20px 20px;
}

.aim-skip-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary, #9ca3af);
  cursor: pointer;
}

.aim-skip-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--success-color, #10b981);
}

/* ── Animations ── */
.aim-slide-enter-active,
.aim-slide-leave-active {
  transition: opacity 0.25s ease;
}

.aim-slide-enter-active .aim-modal,
.aim-slide-leave-active .aim-modal {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.aim-slide-enter-from,
.aim-slide-leave-to {
  opacity: 0;
}

.aim-slide-enter-from .aim-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.aim-slide-leave-to .aim-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

/* ══════════════════════
   MOBILE — Bottom Sheet
   ══════════════════════ */
@media (max-width: 480px) {
  .aim-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .aim-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
  }

  .aim-drag-handle {
    display: flex;
  }

  .aim-header {
    padding-top: 0.5rem;
  }

  .aim-body {
    padding: 1rem;
  }

  .aim-intro-icon {
    width: 64px;
    height: 64px;
  }

  .aim-intro-icon svg {
    width: 32px;
    height: 32px;
  }

  .aim-intro h4 {
    font-size: 1.125rem;
  }

  .aim-intro-desc {
    font-size: 0.875rem;
  }

  .aim-feature {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .aim-feature svg {
    width: 16px;
    height: 16px;
  }

  .aim-footer {
    padding: 0.875rem 1rem;
    border-radius: 0;
  }

  .aim-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .aim-skip-row {
    border-radius: 0;
  }

  .aim-slide-enter-from .aim-modal {
    transform: translateY(100%);
  }

  .aim-slide-leave-to .aim-modal {
    transform: translateY(100%);
  }
}
</style>
