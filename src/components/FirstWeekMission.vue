<template>
  <Teleport to="body">
    <div class="mission-overlay" @click.self="handleBackdropClick">
      <div class="mission-modal" :class="{ 'celebration': showCelebration }">
        <div class="mission-header">
          <div class="ai-badge">
            <Sparkles :size="16" :stroke-width="1.5" />
            AI Ментор
          </div>
          <button class="close-btn" @click="handleClose" v-if="!isFirstVisit">
            <X :size="20" :stroke-width="1.5" />
          </button>
        </div>
        
        <div class="mission-content">
          <div class="mission-intro">
            <h2>Добро пожаловать в OnePercent!</h2>
            <p class="intro-text">
              Я проанализировал твои ответы и подготовил цели. 
              Выполни эти простые задания, чтобы начать путь к +1% каждый день.
            </p>
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">Твой прогресс</span>
              <span class="progress-value">{{ completedCount }}/{{ totalCount }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <div class="xp-reward" v-if="!isAllCompleted">
              <Zap :size="14" :stroke-width="1.5" />
              <span>+{{ totalXP }} XP за все задания</span>
            </div>
          </div>
          
          <div class="tasks-list">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="task-item"
              :class="{ completed: task.completed, current: !task.completed && isNextTask(task) }"
            >
              <div class="task-check" :class="{ checked: task.completed }">
                <Check v-if="task.completed" :size="16" :stroke-width="2.5" />
                <span v-else class="task-number">{{ getTaskNumber(task) }}</span>
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
              </div>
              <button 
                v-if="!task.completed"
                class="task-action"
                @click="goToTask(task)"
              >
                <ArrowRight :size="18" :stroke-width="1.5" />
              </button>
              <div v-else class="task-xp">
                <Zap :size="12" :stroke-width="1.5" />
                +{{ task.xpReward }}
              </div>
            </div>
          </div>
          
          <div class="mission-footer" v-if="isAllCompleted">
            <div class="celebration-content">
              <div class="celebration-icon">
                <Trophy :size="48" :stroke-width="1.5" />
              </div>
              <h3>Отлично! Миссия выполнена!</h3>
              <p>Теперь ты готов к системному росту. Продолжай в том же духе!</p>
              <button class="btn btn-primary" @click="handleComplete">
                Начать день
              </button>
            </div>
          </div>
          
          <div class="mission-footer" v-else-if="!isFirstVisit">
            <button class="btn btn-secondary" @click="handleClose">
              Продолжить позже
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivationStore } from '@/stores/activation'
import { 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Zap, 
  Trophy,
  Crosshair,
  Flame,
  Target,
  BookOpen
} from 'lucide-vue-next'

const props = defineProps({
  isFirstVisit: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

const router = useRouter()
const activationStore = useActivationStore()

const showCelebration = ref(false)

const tasks = computed(() => activationStore.tasks)
const completedCount = computed(() => activationStore.completedCount)
const totalCount = computed(() => activationStore.totalCount)
const progress = computed(() => activationStore.progress)
const isAllCompleted = computed(() => activationStore.isAllCompleted)
const nextTask = computed(() => activationStore.nextTask)

const totalXP = computed(() => {
  return tasks.value.reduce((sum, task) => sum + task.xpReward, 0)
})

function isNextTask(task) {
  return nextTask.value?.id === task.id
}

function getTaskNumber(task) {
  return tasks.value.findIndex(t => t.id === task.id) + 1
}

function goToTask(task) {
  activationStore.dismissModal()
  router.push(task.route)
  emit('close')
}

function handleClose() {
  activationStore.dismissModal()
  emit('close')
}

function handleComplete() {
  emit('complete')
  emit('close')
}

function handleBackdropClick() {
  if (!props.isFirstVisit) {
    handleClose()
  }
}

onMounted(() => {
  if (isAllCompleted.value) {
    showCelebration.value = true
  }
})
</script>

<style scoped>
.mission-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.mission-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.mission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e5e5;
  color: #1a1a2e;
}

.mission-content {
  padding: 1.5rem;
}

.mission-intro {
  text-align: center;
  margin-bottom: 1.5rem;
}

.mission-intro h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem 0;
}

.intro-text {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.progress-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #64748b;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.xp-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 500;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.task-item.current {
  border-color: #10b981;
  background: #f0fdf4;
}

.task-item.completed {
  background: #f0fdf4;
  opacity: 0.8;
}

.task-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.task-check.checked {
  background: #10b981;
  color: white;
}

.task-number {
  font-size: 0.875rem;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.task-description {
  font-size: 0.8rem;
  color: #64748b;
}

.task-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #10b981;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.task-action:hover {
  background: #059669;
  transform: translateX(2px);
}

.task-xp {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
}

.mission-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.celebration-content {
  text-align: center;
  padding: 1rem 0;
}

.celebration-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #f59e0b;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.celebration-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
}

.celebration-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.mission-modal.celebration {
  animation: celebrate 0.5s ease-out;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@media (max-width: 480px) {
  .mission-modal {
    max-height: 95vh;
    border-radius: 16px;
  }
  
  .mission-content {
    padding: 1.25rem;
  }
  
  .mission-intro h2 {
    font-size: 1.25rem;
  }
  
  .task-item {
    padding: 0.875rem;
  }
}
</style>
