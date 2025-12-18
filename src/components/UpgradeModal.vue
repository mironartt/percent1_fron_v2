<template>
  <Teleport to="body">
    <div class="upgrade-modal-overlay" @click.self="close">
      <div class="upgrade-modal">
        <button class="close-btn" @click="close">
          <X :size="20" />
        </button>
        
        <div class="modal-icon">
          <Sparkles :size="48" />
        </div>
        
        <h2>{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>
        
        <div v-if="limitInfo" class="limit-info">
          <span class="limit-current">{{ limitInfo.current }}</span>
          <span class="limit-separator">/</span>
          <span class="limit-max">{{ limitInfo.max }}</span>
          <span class="limit-label">{{ limitInfo.label }}</span>
        </div>
        
        <div class="features-preview">
          <h3>С Pro вы получите:</h3>
          <ul>
            <li><Check :size="16" /> Безлимитные цели и привычки</li>
            <li><Check :size="16" /> AI ментор и помощь</li>
            <li><Check :size="16" /> Аналитика привычек</li>
            <li><Check :size="16" /> Приоритетная поддержка</li>
          </ul>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="close">
            Позже
          </button>
          <router-link to="/app/subscription" class="btn btn-primary" @click="close">
            <Zap :size="18" />
            Перейти на Pro
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X, Sparkles, Check, Zap } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    default: 'Функция доступна на Pro'
  },
  message: {
    type: String,
    default: 'Эта функция доступна только на платных тарифах. Оформите подписку, чтобы разблокировать все возможности.'
  },
  limitInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.upgrade-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.upgrade-modal {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-icon {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.upgrade-modal h2 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.modal-message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.limit-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.limit-current {
  font-size: 2rem;
  font-weight: 700;
  color: var(--danger-color);
}

.limit-separator {
  font-size: 1.5rem;
  color: var(--text-tertiary);
}

.limit-max {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.limit-label {
  margin-left: 0.5rem;
  color: var(--text-secondary);
}

.features-preview {
  text-align: left;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-md);
}

.features-preview h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.features-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-preview li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.features-preview li svg {
  color: var(--success-color);
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .upgrade-modal {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
