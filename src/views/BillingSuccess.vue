<template>
  <div class="billing-result-container">
    <div class="result-card success">
      <div class="result-icon">
        <CheckCircle :size="64" />
      </div>
      <h1>Оплата прошла успешно!</h1>
      <p class="result-message">
        Спасибо за оформление подписки. Ваш аккаунт уже активирован с полным доступом ко всем функциям.
      </p>
      <div class="result-actions">
        <router-link to="/app" class="btn btn-primary btn-lg">
          Перейти в приложение
        </router-link>
        <router-link to="/app/subscription" class="btn btn-secondary">
          Посмотреть подписку
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'
import { useSubscriptionStore } from '@/stores/subscription'

const route = useRoute()
const subscriptionStore = useSubscriptionStore()

onMounted(() => {
  subscriptionStore.loadSubscription()
})
</script>

<style scoped>
.billing-result-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-card {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.result-card.success .result-icon {
  color: var(--success-color);
}

.result-icon {
  margin-bottom: 1.5rem;
}

.result-card h1 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.result-message {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .result-card {
    padding: 2rem;
  }
  
  .result-card h1 {
    font-size: 1.5rem;
  }
}
</style>
