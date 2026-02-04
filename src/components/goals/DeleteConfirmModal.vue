<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="cancel">
        <div class="confirm-modal">
          <div class="confirm-icon danger">
            <AlertTriangle :size="32" />
          </div>
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="cancel">
              Отмена
            </button>
            <button class="btn btn-danger" @click="confirm">
              <Trash2 :size="16" />
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Удалить?'
  },
  message: {
    type: String,
    default: 'Это действие нельзя отменить.'
  },
  confirmText: {
    type: String,
    default: 'Удалить'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function cancel() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1rem;
}

.confirm-modal {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.confirm-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger, #ef4444);
}

.confirm-modal h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.confirm-modal p {
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.btn-secondary {
  background: var(--hover-bg, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.btn-secondary:hover {
  background: var(--border-color, #e5e7eb);
}

.btn-danger {
  background: var(--danger, #ef4444);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .confirm-modal,
.modal-fade-leave-active .confirm-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .confirm-modal,
.modal-fade-leave-to .confirm-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
