<template>
  <div class="plan-review-overlay" @click.self="$emit('close')">
    <div class="plan-review-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <Sparkles :size="24" />
          </div>
          <div class="header-text">
            <h2>Ваш план на неделю</h2>
            <p>AI подготовил рекомендации на основе вашего баланса жизни</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-body">
        <div class="stats-bar">
          <div class="stat">
            <Check :size="16" class="text-success" />
            <span>{{ acceptedCount }} принято</span>
          </div>
          <div class="stat">
            <Clock :size="16" class="text-warning" />
            <span>{{ pendingCount }} ожидает</span>
          </div>
          <div class="stat">
            <XCircle :size="16" class="text-muted" />
            <span>{{ rejectedCount }} пропущено</span>
          </div>
        </div>

        <div class="tasks-list">
          <div 
            v-for="(tasks, sphereId) in groupedTasks" 
            :key="sphereId"
            class="sphere-group"
          >
            <div class="sphere-header" :style="{ '--sphere-color': getSphereColor(sphereId) }">
              <component :is="getSphereIcon(sphereId)" :size="18" />
              <span>{{ getSphereName(sphereId) }}</span>
            </div>

            <div class="sphere-tasks">
              <div 
                v-for="task in tasks" 
                :key="task.id"
                class="task-card"
                :class="{ 
                  'accepted': task.status === 'accepted',
                  'rejected': task.status === 'rejected',
                  'editing': editingTaskId === task.id
                }"
                :style="{ '--task-color': getSphereColor(sphereId) }"
              >
                <div class="task-day-badge">{{ task.day }}</div>
                
                <div class="task-main">
                  <template v-if="editingTaskId === task.id">
                    <input 
                      v-model="editForm.title" 
                      class="edit-input"
                      placeholder="Название задачи"
                    />
                    <input 
                      v-model="editForm.description" 
                      class="edit-input small"
                      placeholder="Описание"
                    />
                    <div class="edit-row">
                      <select v-model="editForm.day" class="edit-select">
                        <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
                      </select>
                      <input 
                        v-model="editForm.duration" 
                        class="edit-input duration"
                        placeholder="Время"
                      />
                    </div>
                    <div class="edit-actions">
                      <button class="btn-small btn-primary" @click="saveEdit(task)">
                        <Check :size="14" />
                        Сохранить
                      </button>
                      <button class="btn-small btn-secondary" @click="cancelEdit">
                        Отмена
                      </button>
                    </div>
                  </template>
                  <template v-else>
                    <h4>{{ task.title }}</h4>
                    <p>{{ task.description }}</p>
                    <div class="task-meta">
                      <span class="duration">
                        <Clock :size="12" />
                        {{ task.duration }}
                      </span>
                      <span v-if="task.status === 'accepted'" class="status-badge accepted">
                        <Check :size="12" />
                        Принято
                      </span>
                      <span v-else-if="task.status === 'rejected'" class="status-badge rejected">
                        Пропущено
                      </span>
                    </div>
                  </template>
                </div>

                <div v-if="task.status === 'pending' && editingTaskId !== task.id" class="task-actions">
                  <button 
                    class="action-btn accept" 
                    @click="acceptTask(task)"
                    title="Принять"
                  >
                    <Check :size="18" />
                  </button>
                  <button 
                    class="action-btn edit" 
                    @click="startEdit(task)"
                    title="Изменить"
                  >
                    <Pencil :size="18" />
                  </button>
                  <button 
                    class="action-btn reject" 
                    @click="rejectTask(task)"
                    title="Пропустить"
                  >
                    <X :size="18" />
                  </button>
                  <button 
                    class="action-btn replace" 
                    @click="replaceTask(task)"
                    title="Другой вариант"
                  >
                    <RefreshCw :size="18" />
                  </button>
                </div>

                <div v-else-if="task.status !== 'pending'" class="task-actions-done">
                  <button 
                    class="action-btn-small undo" 
                    @click="resetTask(task)"
                    title="Отменить"
                  >
                    <RotateCcw :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="skipAll">
          Пропустить всё
        </button>
        <button class="btn btn-primary" @click="confirmPlan" :disabled="acceptedCount === 0">
          <Check :size="18" />
          Подтвердить план ({{ acceptedCount }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import {
  Sparkles,
  X,
  Check,
  Clock,
  XCircle,
  Pencil,
  RefreshCw,
  RotateCcw,
  Wallet,
  Palette,
  Users,
  Heart,
  Briefcase,
  Home,
  Target
} from 'lucide-vue-next'

const emit = defineEmits(['close', 'confirmed'])
const store = useAppStore()

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const editingTaskId = ref(null)
const editForm = ref({
  title: '',
  description: '',
  day: '',
  duration: ''
})

const sphereColors = {
  wealth: '#10b981',
  hobbies: '#f59e0b',
  friendship: '#8b5cf6',
  health: '#ef4444',
  career: '#3b82f6',
  love: '#ec4899'
}

const sphereNames = {
  wealth: 'Финансы',
  hobbies: 'Хобби',
  friendship: 'Друзья',
  health: 'Здоровье',
  career: 'Карьера',
  love: 'Семья'
}

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: Home
}

const alternativeTemplates = {
  wealth: [
    { title: 'Отложить сбережения', description: 'Переведите небольшую сумму на накопления', duration: '5 мин' },
    { title: 'Изучить инвестиции', description: 'Прочитайте статью о базовых инвестициях', duration: '15 мин' },
    { title: 'Проверить подписки', description: 'Отмените неиспользуемые подписки', duration: '10 мин' }
  ],
  hobbies: [
    { title: 'Медитация', description: 'Короткая сессия осознанности', duration: '10 мин' },
    { title: 'Творческий перерыв', description: 'Порисуйте или послушайте музыку', duration: '15 мин' },
    { title: 'Прочитать книгу', description: 'Уделите время любимой книге', duration: '20 мин' }
  ],
  friendship: [
    { title: 'Голосовое сообщение', description: 'Отправьте голосовое сообщение другу', duration: '5 мин' },
    { title: 'Запланировать встречу', description: 'Договоритесь о встрече с другом', duration: '10 мин' },
    { title: 'Помочь другу', description: 'Предложите помощь кому-то из близких', duration: '15 мин' }
  ],
  health: [
    { title: 'Стакан воды', description: 'Выпейте стакан воды прямо сейчас', duration: '1 мин' },
    { title: 'Растяжка', description: 'Сделайте короткую разминку', duration: '5 мин' },
    { title: 'Ранний сон', description: 'Лягте спать на 30 минут раньше', duration: '30 мин' }
  ],
  career: [
    { title: 'Inbox Zero', description: 'Разберите входящие письма', duration: '15 мин' },
    { title: 'Онлайн-курс', description: 'Посмотрите один урок по вашей теме', duration: '20 мин' },
    { title: 'Networking', description: 'Напишите коллеге из другой сферы', duration: '10 мин' }
  ],
  love: [
    { title: 'Совместный ужин', description: 'Приготовьте ужин вместе с близкими', duration: '45 мин' },
    { title: 'Объятия', description: 'Обнимите близкого человека', duration: '1 мин' },
    { title: 'Совместная прогулка', description: 'Погуляйте вместе без телефонов', duration: '20 мин' }
  ]
}

const recommendations = computed(() => store.aiRecommendations)

const groupedTasks = computed(() => {
  const grouped = {}
  recommendations.value.forEach(task => {
    if (!grouped[task.sphereId]) {
      grouped[task.sphereId] = []
    }
    grouped[task.sphereId].push(task)
  })
  return grouped
})

const acceptedCount = computed(() => 
  recommendations.value.filter(t => t.status === 'accepted').length
)

const pendingCount = computed(() => 
  recommendations.value.filter(t => t.status === 'pending').length
)

const rejectedCount = computed(() => 
  recommendations.value.filter(t => t.status === 'rejected').length
)

function getSphereColor(id) {
  return sphereColors[id] || '#6b7280'
}

function getSphereIcon(id) {
  return sphereIcons[id] || Target
}

function getSphereName(id) {
  return sphereNames[id] || id
}

function acceptTask(task) {
  store.updateRecommendationStatus(task.id, 'accepted')
}

function rejectTask(task) {
  store.updateRecommendationStatus(task.id, 'rejected')
}

function resetTask(task) {
  store.updateRecommendationStatus(task.id, 'pending')
}

function startEdit(task) {
  editingTaskId.value = task.id
  editForm.value = {
    title: task.title,
    description: task.description,
    day: task.day,
    duration: task.duration
  }
}

function cancelEdit() {
  editingTaskId.value = null
  editForm.value = { title: '', description: '', day: '', duration: '' }
}

function saveEdit(task) {
  store.updateRecommendation(task.id, {
    title: editForm.value.title,
    description: editForm.value.description,
    day: editForm.value.day,
    duration: editForm.value.duration,
    status: 'accepted'
  })
  cancelEdit()
}

function replaceTask(task) {
  const alternatives = alternativeTemplates[task.sphereId] || []
  if (alternatives.length === 0) return
  
  const usedTitles = recommendations.value
    .filter(t => t.sphereId === task.sphereId)
    .map(t => t.title)
  
  const available = alternatives.filter(a => !usedTitles.includes(a.title))
  const newTask = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : alternatives[Math.floor(Math.random() * alternatives.length)]
  
  store.updateRecommendation(task.id, {
    title: newTask.title,
    description: newTask.description,
    duration: newTask.duration,
    replaced: true
  })
}

function skipAll() {
  recommendations.value.forEach(task => {
    if (task.status === 'pending') {
      store.updateRecommendationStatus(task.id, 'rejected')
    }
  })
  emit('close')
}

function confirmPlan() {
  store.confirmAIRecommendations()
  emit('confirmed')
  emit('close')
}
</script>

<style scoped>
.plan-review-overlay {
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

.plan-review-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
}

.header-content {
  display: flex;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.text-success { color: var(--success-color); }
.text-warning { color: var(--warning-color); }
.text-muted { color: var(--text-tertiary); }

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sphere-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--task-color);
  padding: 0.5rem 0;
}

.sphere-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--task-color);
  transition: all 0.2s ease;
}

.task-card.accepted {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.task-card.rejected {
  opacity: 0.5;
}

.task-card.editing {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.task-day-badge {
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-main h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.task-main p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
}

.status-badge.accepted {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-badge.rejected {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn.accept:hover {
  border-color: var(--success-color);
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.action-btn.reject:hover {
  border-color: var(--text-tertiary);
  color: var(--text-tertiary);
}

.action-btn.replace:hover {
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.task-actions-done {
  display: flex;
  align-items: flex-start;
}

.action-btn-small {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn-small:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.edit-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.edit-input.small {
  font-size: 0.8125rem;
  padding: 0.375rem 0.625rem;
}

.edit-input.duration {
  width: 80px;
}

.edit-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.edit-select {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 0.8125rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-small.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-small.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

@media (max-width: 600px) {
  .plan-review-modal {
    max-height: 95vh;
  }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .task-card {
    flex-wrap: wrap;
  }
  
  .task-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>
