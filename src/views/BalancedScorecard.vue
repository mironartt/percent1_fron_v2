<template>
  <div class="ssp-container">
    <header class="ssp-header">
      <h1>Колесо баланса</h1>
      <p class="subtitle">Оценка и анализ сфер вашей жизни</p>
    </header>

    <div class="ssp-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="18" />
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'wheel'" class="wheel-tab">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="color: var(--primary-color)">
              <TrendingUp :size="20" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
              <div class="stat-label">Средний балл</div>
            </div>
          </div>

          <div class="stat-card" v-if="strongestSphere">
            <div class="stat-icon" :style="{ color: getSphereColor(strongestSphere.id) }">
              <component :is="getSphereIcon(strongestSphere.id)" :size="20" />
            </div>
            <div class="stat-info">
              <div class="stat-value-text">{{ strongestSphere.name }}</div>
              <div class="stat-label">Сильная</div>
            </div>
          </div>

          <div class="stat-card" v-if="weakestSphere">
            <div class="stat-icon" :style="{ color: getSphereColor(weakestSphere.id) }">
              <component :is="getSphereIcon(weakestSphere.id)" :size="20" />
            </div>
            <div class="stat-info">
              <div class="stat-value-text">{{ weakestSphere.name }}</div>
              <div class="stat-label">Зона роста</div>
            </div>
          </div>
        </div>

        <div class="wheel-card card">
          <div class="wheel-visualization">
            <WheelOfLife 
              :spheres="lifeSpheres" 
              :readonly="true"
            />
          </div>
          <p class="last-assessment" v-if="lastAssessmentDate">
            Последняя оценка: {{ formatDate(lastAssessmentDate) }}
          </p>
        </div>

        <div class="wheel-actions">
          <button class="btn btn-primary btn-lg" @click="openReassessment">
            <RefreshCcw :size="18" />
            Переоценить
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'reflection'" class="reflection-tab">
        <div class="reflection-accordion">
          <div 
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="accordion-item"
            :class="{ expanded: expandedSpheres.includes(sphere.id) }"
            :style="{ '--sphere-color': getSphereColor(sphere.id) }"
          >
            <div class="accordion-header" @click="toggleSphereExpand(sphere.id)">
              <div class="accordion-left">
                <div class="sphere-icon" :style="{ color: getSphereColor(sphere.id) }">
                  <component :is="getSphereIcon(sphere.id)" :size="22" />
                </div>
                <div class="sphere-info">
                  <span class="sphere-name">{{ sphere.name }}</span>
                  <span class="sphere-score">{{ sphere.score }}/10</span>
                </div>
              </div>
              <ChevronDown 
                :size="20" 
                class="chevron" 
                :class="{ rotated: expandedSpheres.includes(sphere.id) }" 
              />
            </div>

            <div class="accordion-content" v-show="expandedSpheres.includes(sphere.id)">
              <div v-if="editingSphereId === sphere.id" class="edit-form">
                <div class="form-group">
                  <label>Почему такой балл?</label>
                  <textarea v-model="editingReflection.why" rows="2" placeholder="Ваш ответ..."></textarea>
                </div>
                <div class="form-group">
                  <label>Что нужно для 10?</label>
                  <textarea v-model="editingReflection.ten" rows="2" placeholder="Идеальное состояние..."></textarea>
                </div>
                <div class="form-group">
                  <label>Что мешает?</label>
                  <textarea v-model="editingReflection.prevents" rows="2" placeholder="Препятствия..."></textarea>
                </div>
                <div class="form-group">
                  <label>Желаемое состояние</label>
                  <textarea v-model="editingReflection.desired" rows="2" placeholder="Как хотите..."></textarea>
                </div>
                <div class="edit-actions">
                  <button class="btn btn-secondary btn-sm" @click="cancelEditReflection">
                    <X :size="16" /> Отмена
                  </button>
                  <button class="btn btn-primary btn-sm" @click="saveEditReflection(sphere.id)">
                    <Check :size="16" /> Сохранить
                  </button>
                </div>
              </div>

              <div v-else class="reflection-view">
                <div v-if="hasReflectionContent(sphere)" class="reflection-answers">
                  <div class="answer-item" v-if="sphere.reflection?.why">
                    <div class="answer-label">Почему такой балл?</div>
                    <div class="answer-text">{{ sphere.reflection.why }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.ten">
                    <div class="answer-label">Что нужно для 10?</div>
                    <div class="answer-text">{{ sphere.reflection.ten }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.prevents">
                    <div class="answer-label">Что мешает?</div>
                    <div class="answer-text">{{ sphere.reflection.prevents }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.desired">
                    <div class="answer-label">Желаемое состояние</div>
                    <div class="answer-text">{{ sphere.reflection.desired }}</div>
                  </div>
                </div>
                <div v-else class="no-reflection">
                  <span>Рефлексия не заполнена</span>
                </div>

                <div class="sphere-actions">
                  <button class="btn btn-ghost btn-sm" @click.stop="startEditReflection(sphere)">
                    <Pencil :size="14" /> Редактировать
                  </button>
                  <button 
                    class="btn btn-ghost btn-sm" 
                    @click.stop="openGoalModal(sphere)"
                    :style="{ color: getSphereColor(sphere.id) }"
                  >
                    <Plus :size="14" /> Создать цель
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="history-tab">
        <div v-if="sspHistory.length === 0" class="empty-history">
          <History :size="48" />
          <p>История оценок пока пуста</p>
          <span>После переоценки здесь появятся данные о динамике</span>
        </div>

        <div v-else class="history-content">
          <div class="history-chart card">
            <h3>Динамика среднего балла</h3>
            <div class="mini-chart">
              <div 
                v-for="(entry, index) in sspHistory.slice(-10)" 
                :key="index"
                class="chart-bar"
                :style="{ height: `${entry.average * 10}%` }"
                :title="`${formatDate(entry.date)}: ${entry.average.toFixed(1)}`"
              >
                <span class="bar-value">{{ entry.average.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <div class="sphere-trends">
            <h3>Изменения по сферам</h3>
            <div 
              v-for="sphere in lifeSpheres" 
              :key="sphere.id"
              class="trend-item"
            >
              <div class="trend-left">
                <component :is="getSphereIcon(sphere.id)" :size="18" :style="{ color: getSphereColor(sphere.id) }" />
                <span>{{ sphere.name }}</span>
              </div>
              <div class="trend-right">
                <span class="current-score">{{ sphere.score }}</span>
                <span class="trend-indicator" :class="getTrendClass(sphere.id)">
                  {{ getTrendText(sphere.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReassessmentSheet" class="bottom-sheet-overlay" @click.self="closeReassessment">
      <div class="bottom-sheet">
        <div class="sheet-header">
          <h3>Переоценка сфер</h3>
          <button class="btn-close" @click="closeReassessment">
            <X :size="24" />
          </button>
        </div>
        
        <div class="sheet-content">
          <div 
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="reassess-item"
          >
            <div class="reassess-header">
              <component :is="getSphereIcon(sphere.id)" :size="20" :style="{ color: getSphereColor(sphere.id) }" />
              <span class="reassess-name">{{ sphere.name }}</span>
              <span class="reassess-score">{{ reassessScores[sphere.id] }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              v-model.number="reassessScores[sphere.id]"
              class="score-slider"
              :style="{ '--slider-color': getSphereColor(sphere.id) }"
            />
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn btn-secondary" @click="closeReassessment">Отмена</button>
          <button class="btn btn-primary" @click="saveReassessment">
            <Check :size="18" /> Сохранить
          </button>
        </div>
      </div>
    </div>

    <div v-if="showGoalModal" class="modal-overlay" @click.self="closeGoalModal">
      <div class="goal-modal card">
        <div class="modal-header">
          <h3>Новая цель</h3>
          <button class="btn-close" @click="closeGoalModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Название цели</label>
            <input type="text" v-model="newGoal.title" placeholder="Что хотите достичь?" />
          </div>
          <div class="form-group">
            <label>Сфера</label>
            <div class="sphere-badge" :style="{ color: getSphereColor(selectedSphereForGoal?.id) }">
              <component :is="getSphereIcon(selectedSphereForGoal?.id)" :size="16" />
              {{ selectedSphereForGoal?.name }}
            </div>
          </div>
          <div class="form-group">
            <label>Почему это важно?</label>
            <textarea v-model="newGoal.motivation" rows="2" placeholder="Ваша мотивация..."></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeGoalModal">Отмена</button>
          <button class="btn btn-primary" @click="createGoal" :disabled="!newGoal.title">
            <Plus :size="18" /> Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE } from '@/config/settings.js'
import WheelOfLife from '../components/WheelOfLife.vue'
import { 
  Wallet, 
  Palette, 
  Users, 
  Heart, 
  Briefcase, 
  HeartHandshake,
  ChevronDown,
  TrendingUp,
  Pencil,
  Check,
  X,
  Plus,
  RefreshCcw,
  History,
  PieChart,
  FileText,
  Target
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

const tabs = [
  { id: 'wheel', label: 'Колесо', icon: PieChart },
  { id: 'reflection', label: 'Рефлексия', icon: FileText },
  { id: 'history', label: 'История', icon: History }
]

const activeTab = ref('wheel')

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: HeartHandshake
}

const sphereColors = {
  wealth: '#e63946',
  hobbies: '#f4a261',
  friendship: '#e9c46a',
  health: '#2a9d8f',
  career: '#264653',
  love: '#9b5de5'
}

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Wallet
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

const lifeSpheres = computed(() => store.lifeSpheres)
const sspHistory = computed(() => store.sspHistory || [])
const lastAssessmentDate = computed(() => {
  if (sspHistory.value.length > 0) {
    return sspHistory.value[sspHistory.value.length - 1].date
  }
  return store.sspModuleCompleted?.completedAt || null
})

const averageScore = computed(() => {
  const scores = lifeSpheres.value.map(s => s.score || 0)
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

const strongestSphere = computed(() => {
  return lifeSpheres.value.reduce((max, s) => 
    (!max || (s.score || 0) > (max.score || 0)) ? s : max
  , null)
})

const weakestSphere = computed(() => {
  return lifeSpheres.value.reduce((min, s) => 
    (!min || (s.score || 0) < (min.score || 0)) ? s : min
  , null)
})

const expandedSpheres = ref([])
const editingSphereId = ref(null)
const editingReflection = ref({ why: '', ten: '', prevents: '', desired: '' })

function toggleSphereExpand(sphereId) {
  const index = expandedSpheres.value.indexOf(sphereId)
  if (index === -1) {
    expandedSpheres.value.push(sphereId)
  } else {
    expandedSpheres.value.splice(index, 1)
  }
}

function hasReflectionContent(sphere) {
  if (!sphere.reflection) return false
  return sphere.reflection.why || sphere.reflection.ten || 
         sphere.reflection.prevents || sphere.reflection.desired
}

function startEditReflection(sphere) {
  editingSphereId.value = sphere.id
  editingReflection.value = {
    why: sphere.reflection?.why || '',
    ten: sphere.reflection?.ten || '',
    prevents: sphere.reflection?.prevents || '',
    desired: sphere.reflection?.desired || ''
  }
  if (!expandedSpheres.value.includes(sphere.id)) {
    expandedSpheres.value.push(sphere.id)
  }
}

function cancelEditReflection() {
  editingSphereId.value = null
  editingReflection.value = { why: '', ten: '', prevents: '', desired: '' }
}

async function saveEditReflection(sphereId) {
  store.updateSphereReflection(sphereId, { ...editingReflection.value })
  editingSphereId.value = null
  editingReflection.value = { why: '', ten: '', prevents: '', desired: '' }
  
  if (DEBUG_MODE) {
    console.log('[SSP] Saving edited reflection for sphere:', sphereId)
  }
  const result = await store.saveSSPReflectionToBackend(sphereId)
  if (!result.success && DEBUG_MODE) {
    console.warn('[SSP] Failed to save reflection:', result.error)
  }
}

const showReassessmentSheet = ref(false)
const reassessScores = reactive({})

function openReassessment() {
  lifeSpheres.value.forEach(s => {
    reassessScores[s.id] = s.score
  })
  showReassessmentSheet.value = true
}

function closeReassessment() {
  showReassessmentSheet.value = false
}

async function saveReassessment() {
  const previousScores = {}
  lifeSpheres.value.forEach(s => {
    previousScores[s.id] = s.score
  })

  Object.keys(reassessScores).forEach(sphereId => {
    store.updateSphere(sphereId, { score: reassessScores[sphereId] })
  })

  store.addSSPHistoryEntry({
    date: new Date().toISOString(),
    scores: { ...reassessScores },
    average: Object.values(reassessScores).reduce((a, b) => a + b, 0) / Object.keys(reassessScores).length,
    previousScores
  })

  showReassessmentSheet.value = false
  
  if (DEBUG_MODE) {
    console.log('[SSP] Saving reassessment to backend...')
  }
  const result = await store.saveSSPRatingsToBackend()
  if (!result.success && DEBUG_MODE) {
    console.warn('[SSP] Failed to save reassessment:', result.error)
  }
}

function getTrendClass(sphereId) {
  if (sspHistory.value.length < 2) return ''
  const last = sspHistory.value[sspHistory.value.length - 1]
  const prev = sspHistory.value[sspHistory.value.length - 2]
  const diff = (last.scores?.[sphereId] || 0) - (prev.scores?.[sphereId] || 0)
  if (diff > 0) return 'trend-up'
  if (diff < 0) return 'trend-down'
  return 'trend-same'
}

function getTrendText(sphereId) {
  if (sspHistory.value.length < 2) return '—'
  const last = sspHistory.value[sspHistory.value.length - 1]
  const prev = sspHistory.value[sspHistory.value.length - 2]
  const diff = (last.scores?.[sphereId] || 0) - (prev.scores?.[sphereId] || 0)
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '='
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const showGoalModal = ref(false)
const selectedSphereForGoal = ref(null)
const newGoal = reactive({ title: '', motivation: '' })

function openGoalModal(sphere) {
  selectedSphereForGoal.value = sphere
  newGoal.title = ''
  newGoal.motivation = ''
  showGoalModal.value = true
}

function closeGoalModal() {
  showGoalModal.value = false
  selectedSphereForGoal.value = null
}

async function createGoal() {
  if (!newGoal.title || !selectedSphereForGoal.value) return
  
  const goal = {
    title: newGoal.title,
    sphere: selectedSphereForGoal.value.id,
    motivation: newGoal.motivation,
    status: 'draft'
  }
  
  store.addGoal(goal)
  closeGoalModal()
  
  router.push('/app/goals-bank')
}

onMounted(async () => {
  if (DEBUG_MODE) {
    console.log('[SSP] Loading SSP data on mount...')
  }
  await store.loadSSPFromBackend()
})
</script>

<style scoped>
.ssp-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-bottom: 100px;
}

.ssp-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.ssp-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.ssp-header .subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.ssp-tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.wheel-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.wheel-visualization {
  max-width: 320px;
  margin: 0 auto;
}

.last-assessment {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 1rem 0 0;
}

.wheel-actions {
  display: flex;
  justify-content: center;
}

.wheel-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reflection-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.accordion-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-item.expanded {
  border-color: var(--sphere-color);
  box-shadow: 0 0 0 1px var(--sphere-color);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.accordion-header:hover {
  background: var(--bg-secondary);
}

.accordion-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sphere-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.sphere-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sphere-name {
  font-weight: 500;
  color: var(--text-primary);
}

.sphere-score {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--border-color);
}

.edit-form {
  padding-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-group textarea,
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
}

.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.reflection-view {
  padding-top: 1rem;
}

.reflection-answers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-item {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.answer-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.answer-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.no-reflection {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

.sphere-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.sphere-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.empty-history svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-history p {
  font-size: 1rem;
  margin: 0 0 0.5rem;
  color: var(--text-secondary);
}

.empty-history span {
  font-size: 0.85rem;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.history-chart {
  padding: 1.5rem;
}

.history-chart h3 {
  font-size: 1rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 120px;
  gap: 0.5rem;
}

.chart-bar {
  flex: 1;
  max-width: 40px;
  background: var(--primary-color);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  position: relative;
  min-height: 10px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.chart-bar:hover {
  opacity: 1;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.sphere-trends h3 {
  font-size: 1rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.trend-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trend-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.current-score {
  font-weight: 600;
  color: var(--text-primary);
}

.trend-indicator {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.trend-up {
  color: #10b981;
  background: color-mix(in srgb, #10b981 10%, transparent);
}

.trend-down {
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

.trend-same {
  color: var(--text-muted);
  background: var(--bg-secondary);
}

.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  width: 100%;
  max-height: 85vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sheet-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-close:hover {
  background: var(--bg-secondary);
}

.sheet-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.reassess-item {
  margin-bottom: 1.5rem;
}

.reassess-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.reassess-name {
  flex: 1;
  font-weight: 500;
}

.reassess-score {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  min-width: 30px;
  text-align: right;
}

.score-slider {
  width: 100%;
  height: 8px;
  appearance: none;
  background: var(--bg-tertiary);
  border-radius: 4px;
  outline: none;
}

.score-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: var(--slider-color, var(--primary-color));
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.sheet-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.sheet-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.goal-modal {
  width: 100%;
  max-width: 480px;
  padding: 0;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: color-mix(in srgb, currentColor 10%, transparent);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .ssp-container {
    padding: 1rem;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .tab-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .tab-btn svg {
    display: none;
  }
}
</style>
