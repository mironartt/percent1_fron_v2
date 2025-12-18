<template>
  <div class="billing-result-container">
    <div class="result-card fail">
      <div class="result-icon">
        <XCircle :size="64" />
      </div>
      <h1>Оплата не прошла</h1>
      <p class="result-message">
        К сожалению, платёж не был завершён. Это может произойти по разным причинам: отмена оплаты, недостаточно средств или технические неполадки.
      </p>
      <div class="result-actions">
        <router-link to="/app/subscription" class="btn btn-primary btn-lg">
          Попробовать снова
        </router-link>
        <router-link to="/app" class="btn btn-secondary">
          Вернуться в приложение
        </router-link>
      </div>
      <p class="help-text">
        Если проблема повторяется, напишите нам в поддержку
      </p>
    </div>
  </div>
</template>

<script setup>
import { XCircle } from 'lucide-vue-next'
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

.result-card.fail .result-icon {
  color: var(--danger-color);
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

.help-text {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
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
