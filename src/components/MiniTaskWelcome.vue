<template>
  <div class="mini-task-welcome">
    <div class="welcome-card">
      <div class="welcome-icon">
        <Target :size="80" :stroke-width="1.5" />
      </div>
      
      <h1 class="welcome-title">Добро пожаловать в OnePercent!</h1>
      <p class="welcome-subtitle">Сейчас мы проведём тебя через твоё первое мини-задание</p>

      <div class="steps-list">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3 class="step-title">Мозговой штурм</h3>
            <p class="step-description">Выгрузи всё, что крутится в голове (7 минут)</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3 class="step-title">Структурирование</h3>
            <p class="step-description">Разложи мысли по категориям (5 минут)</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3 class="step-title">Выбор дел</h3>
            <p class="step-description">Выбери 1-3 дела для выполнения</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3 class="step-title">Твоя первая ачивка!</h3>
            <p class="step-description step-with-icon">Получишь первый +1% <PartyPopper :size="16" :stroke-width="1.5" class="inline-icon" /></p>
          </div>
        </div>
      </div>

      <button class="btn-start" @click="startMiniTask">
        Начать!
      </button>
    </div>
  </div>
</template>

<script setup>
import { Target, PartyPopper } from 'lucide-vue-next'

const emit = defineEmits(['start'])

function startMiniTask() {
  emit('start')
}
</script>

<style scoped>
.mini-task-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 2rem;
}

.welcome-card {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.welcome-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
  color: #9ca3af;
  display: flex;
  justify-content: center;
}

.step-with-icon {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.inline-icon {
  color: #9ca3af;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.75rem;
}

.welcome-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2.5rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.step-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.step-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.btn-start {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-start:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 2rem 1.5rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-icon {
    font-size: 4rem;
  }
}
</style>
