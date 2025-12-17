<template>
  <Teleport to="body">
    <div v-if="show" class="policy-modal-overlay">
      <div class="policy-modal-container">
        <div class="policy-modal-header">
          <div class="policy-modal-icon-wrapper">
            <Shield :size="28" :stroke-width="1.5" />
          </div>
          <h2 class="policy-modal-title">Согласие с политиками</h2>
        </div>
        
        <div class="policy-modal-body">
          <p class="policy-modal-description">
            Для продолжения работы необходимо принять условия использования и политику конфиденциальности.
          </p>
          
          <div v-if="apiError" class="policy-api-error">
            <AlertCircle :size="16" :stroke-width="1.5" />
            <span>{{ apiError }}</span>
          </div>
          
          <form class="policy-form" @submit.prevent="handleAccept">
            <div class="policy-checkbox-group">
              <label class="policy-checkbox-label">
                <input
                  v-model="acceptTerms"
                  type="checkbox"
                  class="policy-checkbox-input"
                  :disabled="isSubmitting"
                />
                <span class="policy-checkbox-text">
                  Я согласен с
                  <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer" class="policy-link">условиями использования</a>
                </span>
              </label>
            </div>
            
            <div class="policy-checkbox-group">
              <label class="policy-checkbox-label">
                <input
                  v-model="acceptPrivacy"
                  type="checkbox"
                  class="policy-checkbox-input"
                  :disabled="isSubmitting"
                />
                <span class="policy-checkbox-text">
                  Я согласен с
                  <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer" class="policy-link">политикой конфиденциальности</a>
                </span>
              </label>
            </div>
            
            <button 
              type="submit" 
              class="policy-submit-btn" 
              :disabled="!canSubmit || isSubmitting"
            >
              <Loader2 v-if="isSubmitting" :size="18" :stroke-width="1.5" class="policy-spinner" />
              <CheckCircle v-else :size="18" :stroke-width="1.5" />
              {{ isSubmitting ? 'Сохранение...' : 'Подтвердить' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { updateUserData } from '@/services/api'
import { 
  Shield,
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['accepted'])

const store = useAppStore()

const acceptTerms = ref(false)
const acceptPrivacy = ref(false)
const isSubmitting = ref(false)
const apiError = ref('')

const canSubmit = computed(() => acceptTerms.value && acceptPrivacy.value)

async function handleAccept() {
  if (!canSubmit.value || isSubmitting.value) return
  
  isSubmitting.value = true
  apiError.value = ''
  
  try {
    const result = await updateUserData({
      is_terms_accepted: true,
      is_privacy_accepted: true
    })
    
    if (result.status === 'ok') {
      store.setPolicyAccepted()
      emit('accepted')
    } else {
      apiError.value = result.error_data?.message || 'Произошла ошибка при сохранении'
    }
  } catch (error) {
    apiError.value = 'Ошибка сети. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.policy-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.policy-modal-container {
  background: white;
  border-radius: var(--radius-xl, 16px);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.policy-modal-header {
  background: linear-gradient(135deg, var(--primary-color, #10b981), var(--secondary-color, #059669));
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.policy-modal-icon-wrapper {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.policy-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.policy-modal-body {
  padding: 1.5rem;
}

.policy-modal-description {
  color: var(--text-secondary, #64748b);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  text-align: center;
}

.policy-api-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md, 8px);
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.policy-api-error svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.policy-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.policy-checkbox-group {
  display: flex;
  align-items: flex-start;
}

.policy-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.policy-checkbox-input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: var(--primary-color, #10b981);
  flex-shrink: 0;
}

.policy-checkbox-text {
  font-size: 0.9375rem;
  color: var(--text-primary, #1e293b);
  line-height: 1.4;
}

.policy-link {
  color: var(--primary-color, #10b981);
  text-decoration: none;
  font-weight: 500;
}

.policy-link:hover {
  text-decoration: underline;
}

.policy-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #10b981), var(--secondary-color, #059669));
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.policy-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.policy-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.policy-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .policy-modal-container {
    margin: 0.5rem;
  }
  
  .policy-modal-header {
    padding: 1.25rem;
  }
  
  .policy-modal-body {
    padding: 1.25rem;
  }
}
</style>
