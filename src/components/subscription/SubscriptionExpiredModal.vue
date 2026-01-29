<template>
  <Teleport to="body">
    <div v-if="modelValue" class="expired-modal-overlay" @click.self="handleContinueFree">
      <div class="expired-modal">
        <button class="close-btn" @click="handleContinueFree">
          <X :size="20" />
        </button>
        
        <div class="modal-icon" :class="iconClass">
          <Clock :size="48" />
        </div>
        
        <h2>{{ title }}</h2>
        <p class="modal-subtitle">{{ subtitle }}</p>
        
        <div class="features-block">
          <h3>{{ featuresTitle }}</h3>
          <ul>
            <li v-for="feature in features" :key="feature">
              <XCircle :size="16" class="feature-icon" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="handleContinueFree" :disabled="loading">
            Продолжить бесплатно
          </button>
          <button class="btn btn-primary" @click="handleUpgrade" :disabled="loading">
            <Zap :size="18" />
            {{ isPaidExpired ? 'Продлить подписку' : 'Оформить подписку' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import { X, Clock, XCircle, Zap } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'trial_expired',
    validator: (value) => ['trial_expired', 'paid_expired'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'continue-free', 'upgrade'])

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const loading = ref(false)

const isPaidExpired = computed(() => props.type === 'paid_expired')

const iconClass = computed(() => isPaidExpired.value ? 'icon-warning' : 'icon-primary')

const title = computed(() => {
  return isPaidExpired.value 
    ? 'Подписка закончилась' 
    : 'Пробный период закончился'
})

const subtitle = computed(() => {
  return isPaidExpired.value
    ? 'Ваша подписка истекла. Продлите её, чтобы продолжить пользоваться всеми возможностями OnePercent.'
    : 'Спасибо, что попробовали OnePercent! Теперь вы на бесплатном тарифе.'
})

const featuresTitle = computed(() => {
  return isPaidExpired.value
    ? 'Что стало недоступно:'
    : 'Что стало недоступно:'
})

const features = [
  'AI ментор и помощник',
  'Безлимитные цели',
  'Аналитика привычек',
  'Приоритетная поддержка'
]

async function handleContinueFree() {
  if (loading.value) return
  
  loading.value = true
  
  try {
    await subscriptionStore.markModalAsShown(props.type)
    emit('continue-free')
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}

async function handleUpgrade() {
  if (loading.value) return
  
  loading.value = true
  
  try {
    await subscriptionStore.markModalAsShown(props.type)
    emit('upgrade')
    emit('update:modelValue', false)
    router.push('/app/subscription')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.expired-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.expired-modal {
  position: relative;
  background: var(--bg-primary, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 2rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 4px);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary, #111827);
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal-icon.icon-primary {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color, #6366f1);
}

.modal-icon.icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.expired-modal h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.modal-subtitle {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.features-block {
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.features-block h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0 0 0.75rem;
}

.features-block ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-block li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.feature-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-actions .btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md, 8px);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.modal-actions .btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary, #111827);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary, #e5e7eb);
}

.btn-primary {
  background: var(--primary-color, #6366f1);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

@media (max-width: 480px) {
  .expired-modal {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
