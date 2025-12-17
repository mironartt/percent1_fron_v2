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
            <label class="policy-checkbox-label">
              <input
                v-model="acceptTerms"
                type="checkbox"
                class="policy-checkbox-input"
                :disabled="isSubmitting"
              />
              <span class="policy-checkbox-text">
                Я принимаю 
                <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer" class="policy-link">
                  условия использования
                  <ExternalLink :size="12" :stroke-width="2" class="policy-link-icon" />
                </a>
              </span>
            </label>
            
            <label class="policy-checkbox-label">
              <input
                v-model="acceptPrivacy"
                type="checkbox"
                class="policy-checkbox-input"
                :disabled="isSubmitting"
              />
              <span class="policy-checkbox-text">
                Я принимаю 
                <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer" class="policy-link">
                  политику конфиденциальности
                  <ExternalLink :size="12" :stroke-width="2" class="policy-link-icon" />
                </a>
              </span>
            </label>
            
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
  Loader2,
  ExternalLink
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
      
      window.location.reload()
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.policy-modal-container {
  background: var(--bg-primary, #ffffff);
  border-radius: 20px;
  max-width: 440px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
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
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  color: white;
  padding: 2rem 1.5rem;
  text-align: center;
}

.policy-modal-icon-wrapper {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.policy-modal-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}

.policy-modal-body {
  padding: 1.75rem;
  background: var(--bg-primary, #ffffff);
}

.policy-modal-description {
  color: var(--text-secondary, #64748b);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.policy-api-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
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

.policy-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  cursor: pointer;
  user-select: none;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  transition: all 0.2s ease;
}

.policy-checkbox-label:hover {
  border-color: #a855f7;
  background: var(--bg-tertiary, #f1f5f9);
}

.policy-checkbox-input {
  width: 20px;
  height: 20px;
  margin-top: 1px;
  cursor: pointer;
  accent-color: #8b5cf6;
  flex-shrink: 0;
}

.policy-checkbox-text {
  font-size: 0.9375rem;
  color: var(--text-primary, #1e293b);
  line-height: 1.5;
  flex: 1;
}

.policy-link {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
}

.policy-link:hover {
  color: #7c3aed;
  text-decoration: underline;
}

.policy-link-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.policy-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
}

.policy-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
}

.policy-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.policy-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.policy-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:root[data-theme="dark"] .policy-modal-container,
.dark .policy-modal-container {
  background: #1e1e2e;
}

:root[data-theme="dark"] .policy-modal-body,
.dark .policy-modal-body {
  background: #1e1e2e;
}

:root[data-theme="dark"] .policy-modal-description,
.dark .policy-modal-description {
  color: #a1a1aa;
}

:root[data-theme="dark"] .policy-checkbox-label,
.dark .policy-checkbox-label {
  background: #27273a;
  border-color: #3f3f5a;
}

:root[data-theme="dark"] .policy-checkbox-label:hover,
.dark .policy-checkbox-label:hover {
  background: #2d2d44;
  border-color: #a855f7;
}

:root[data-theme="dark"] .policy-checkbox-text,
.dark .policy-checkbox-text {
  color: #e4e4e7;
}

:root[data-theme="dark"] .policy-api-error,
.dark .policy-api-error {
  background: #3b1c1c;
  border-color: #7f1d1d;
}

@media (max-width: 480px) {
  .policy-modal-overlay {
    padding: 0.75rem;
  }
  
  .policy-modal-container {
    border-radius: 16px;
  }
  
  .policy-modal-header {
    padding: 1.5rem 1.25rem;
  }
  
  .policy-modal-icon-wrapper {
    width: 56px;
    height: 56px;
  }
  
  .policy-modal-title {
    font-size: 1.25rem;
  }
  
  .policy-modal-body {
    padding: 1.25rem;
  }
  
  .policy-checkbox-label {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .policy-checkbox-text {
    font-size: 0.875rem;
  }
}
</style>
