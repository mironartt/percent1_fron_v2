<template>
  <div class="ssp-container">
    <Breadcrumbs :items="breadcrumbs" />

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
      <button class="btn btn-primary reassess-tab-btn" @click="openReassessment">
        <RefreshCcw :size="16" />
        Переоценить
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'overview'" class="overview-tab">
        <div class="wheel-card card">
          <div class="stats-bar">
            <div class="stat-chip">
              <TrendingUp :size="14" class="stat-chip-icon" style="color: var(--primary-color)" />
              <span class="stat-chip-value">{{ averageScore.toFixed(1) }}</span>
              <span class="stat-chip-label">Средний балл</span>
            </div>
            <template v-if="strongestSphere">
              <div class="stat-bar-sep"></div>
              <div class="stat-chip">
                <component :is="getSphereIcon(strongestSphere.id)" :size="14" class="stat-chip-icon" :style="{ color: getSphereColor(strongestSphere.id) }" />
                <span class="stat-chip-value">{{ strongestSphere.name }}</span>
                <span class="stat-chip-label">Сильная</span>
              </div>
            </template>
            <template v-if="weakestSphere">
              <div class="stat-bar-sep"></div>
              <div class="stat-chip">
                <component :is="getSphereIcon(weakestSphere.id)" :size="14" class="stat-chip-icon" :style="{ color: getSphereColor(weakestSphere.id) }" />
                <span class="stat-chip-value">{{ weakestSphere.name }}</span>
                <span class="stat-chip-label">Зона роста</span>
              </div>
            </template>
          </div>

          <div class="wheel-visualization">
            <WheelOfLife
              :spheres="lifeSpheres"
              :readonly="true"
            />
            <p class="last-assessment" v-if="lastAssessmentDate">
              Последняя оценка: {{ formatDate(lastAssessmentDate) }}
            </p>
          </div>
        </div>

        <!-- Рефлексия прямо под колесом -->
        <div class="section-title">Рефлексия по сферам</div>
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
                  <label>Как сейчас обстоят дела?</label>
                  <textarea v-model="editingReflection.why" rows="2" placeholder="Опишите текущую ситуацию..."></textarea>
                </div>
                <div class="form-group">
                  <label>Что хочется изменить?</label>
                  <textarea v-model="editingReflection.desired" rows="2" placeholder="Желаемое состояние..."></textarea>
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
                    <div class="answer-label">Как сейчас</div>
                    <div class="answer-text">{{ sphere.reflection.why }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.desired">
                    <div class="answer-label">Хочется изменить</div>
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
        <div v-if="historyLoading" class="history-loading">
          <div class="loading-spinner"></div>
          <p>Загрузка истории...</p>
        </div>

        <div v-else-if="!hasHistoryData" class="empty-history">
          <History :size="48" />
          <p>История оценок пока пуста</p>
          <span>После переоценки здесь появятся данные о динамике</span>
        </div>

        <div v-else class="history-content">
          <div class="history-chart card">
            <h3>Динамика среднего балла</h3>
            <div class="line-chart-wrap">
              <svg class="line-chart" viewBox="0 0 400 140" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="y in [0,2,4,6,8,10]" :key="y"
                  x1="32" :y1="110 - y * 10" x2="390" :y2="110 - y * 10"
                  stroke="var(--border-color)" stroke-width="0.5" />
                <!-- Y labels -->
                <text v-for="y in [0,5,10]" :key="'l'+y"
                  x="26" :y="114 - y * 10"
                  font-size="9" fill="var(--text-secondary)" text-anchor="end">{{ y }}</text>
                <!-- Area fill -->
                <path v-if="sspChartData.length >= 2"
                  :d="lineChartAreaPath"
                  fill="var(--primary-color)" opacity="0.08" />
                <!-- Line -->
                <polyline v-if="sspChartData.length >= 2"
                  :points="lineChartPoints"
                  fill="none" stroke="var(--primary-color)" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <!-- Dots + labels -->
                <g v-for="(entry, i) in sspChartData" :key="i">
                  <circle
                    :cx="lineChartX(i)" :cy="lineChartY(entry.average)"
                    r="4" fill="var(--primary-color)" />
                  <text
                    :x="lineChartX(i)" :y="lineChartY(entry.average) - 8"
                    font-size="9" fill="var(--primary-color)" text-anchor="middle" font-weight="600">
                    {{ entry.average.toFixed(1) }}
                  </text>
                  <text
                    :x="lineChartX(i)" y="128"
                    font-size="8" fill="var(--text-secondary)" text-anchor="middle">
                    {{ formatDate(entry.date) }}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div class="sphere-trends" v-if="sspTrends.length > 0">
            <h3>Изменения по сферам</h3>
            <div 
              v-for="trend in sspTrends" 
              :key="trend.id"
              class="trend-item"
            >
              <div class="trend-left">
                <component :is="getSphereIcon(store.getCategoryFrontendId(trend.id))" :size="18" :style="{ color: getSphereColor(store.getCategoryFrontendId(trend.id)) }" />
                <span>{{ trend.title }}</span>
              </div>
              <div class="trend-right">
                <span class="current-score">{{ trend.current_score }}</span>
                <span class="trend-indicator" :class="'trend-' + trend.trend">
                  {{ trend.change > 0 ? '+' + trend.change : (trend.change < 0 ? trend.change : '=') }}
                </span>
              </div>
            </div>
          </div>

          <div class="history-list" v-if="sspHistory.length > 0">
            <h3>Все переоценки</h3>
            <div 
              v-for="(entry, index) in sspHistory.slice().reverse()" 
              :key="entry.ssp_evaluation_id || index"
              class="history-item"
            >
              <div class="history-item-header">
                <span class="history-date">{{ formatDate(entry.date) }}</span>
                <span class="history-average">{{ entry.average.toFixed(1) }}</span>
              </div>
              <div class="history-spheres">
                <span
                  v-for="sphere in entry.spheres"
                  :key="sphere.id"
                  class="sphere-badge"
                  :style="{ backgroundColor: getSphereColor(store.getCategoryFrontendId(sphere.id)) + '20', color: getSphereColor(store.getCategoryFrontendId(sphere.id)) }"
                >
                  <component :is="getSphereIcon(store.getCategoryFrontendId(sphere.id))" :size="11" />
                  {{ sphere.score }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReassessmentSheet" class="reassess-modal-overlay" @click.self="closeReassessment">
      <div class="reassess-modal" :class="{ 'ai-mode': reassessmentMode === 'ai' }">
        <div class="sheet-header">
          <h3>Переоценка сфер</h3>
          <button class="btn-close" @click="closeReassessment">
            <X :size="24" />
          </button>
        </div>
        
        <div v-if="reassessmentMode === 'select'" class="sheet-intro">
          <p class="intro-text">
            Регулярная переоценка помогает отслеживать прогресс и корректировать фокус внимания на важных сферах жизни.
          </p>
          
          <div class="last-assessment-info" v-if="lastAssessmentDate">
            <Clock :size="16" />
            <span>Последняя оценка: {{ formatDate(lastAssessmentDate) }}</span>
          </div>
          
          <div class="recommendation-tip">
            <Info :size="16" />
            <span>Рекомендуем переоценивать раз в месяц или при значительных изменениях в жизни</span>
          </div>
          
          <div class="reassess-mode-buttons">
            <button class="mode-btn manual" @click="startManualReassessment">
              <RefreshCcw :size="20" />
              <div class="mode-info">
                <span class="mode-title">Быстрая переоценка</span>
                <span class="mode-desc">Оцените сферы самостоятельно</span>
              </div>
            </button>
            
            <button class="mode-btn ai" @click="startAIReassessment">
              <Bot :size="20" />
              <div class="mode-info">
                <span class="mode-title">С AI-ментором</span>
                <span class="mode-desc">AI подберёт вопросы и оценит сферы</span>
              </div>
              <div class="time-warning">
                <Clock :size="12" />
                5-10 мин
              </div>
            </button>
          </div>
        </div>
        
        <div v-if="reassessmentMode === 'manual'" class="sheet-content">
          <div class="preview-wheel-wrap">
            <WheelOfLife :spheres="previewSpheres" :readonly="true" />
          </div>
          <div
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="reassess-card"
            :style="{ '--sphere-color': getSphereColor(sphere.id) }"
          >
            <div class="reassess-header">
              <div class="sphere-icon-wrapper">
                <component :is="getSphereIcon(sphere.id)" :size="24" />
              </div>
              <div class="sphere-details">
                <span class="reassess-name">{{ sphere.name }}</span>
                <span class="reassess-hint">{{ getSphereHint(sphere.id) }}</span>
              </div>
              <span class="reassess-score">{{ reassessScores[sphere.id] }}</span>
            </div>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="10" 
                v-model.number="reassessScores[sphere.id]"
                class="sphere-slider"
                :style="{ '--progress': (reassessScores[sphere.id] / 10) * 100 + '%', '--sphere-color': getSphereColor(sphere.id) }"
              />
              <div class="slider-labels">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>
          
          <div class="sheet-actions">
            <button class="btn btn-secondary" @click="reassessmentMode = 'select'">Назад</button>
            <button class="btn btn-primary" @click="saveReassessment">
              <Check :size="18" /> Сохранить
            </button>
          </div>
        </div>
        
        <div v-if="reassessmentMode === 'ai'" class="ai-reassess-content">
          <div class="ai-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: ((aiCurrentSphereIndex + 1) / lifeSpheres.length) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ aiCurrentSphereIndex + 1 }} / {{ lifeSpheres.length }}</span>
          </div>
          
          <div class="ai-sphere-header" v-if="currentAISphere">
            <div class="sphere-icon-lg" :style="{ color: getSphereColor(currentAISphere.id) }">
              <component :is="getSphereIcon(currentAISphere.id)" :size="32" />
            </div>
            <div class="sphere-title">
              <h4>{{ currentAISphere.name }}</h4>
              <p>{{ getSphereHint(currentAISphere.id) }}</p>
            </div>
          </div>
          
          <div class="ai-chat-area">
            <div class="ai-messages" ref="aiMessagesRef">
              <div 
                v-for="(msg, idx) in aiMessages" 
                :key="idx" 
                class="ai-message"
                :class="msg.role"
              >
                <div class="message-avatar" v-if="msg.role === 'assistant'">
                  <Bot :size="16" />
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
              <div v-if="aiLoading" class="ai-message assistant">
                <div class="message-avatar"><Bot :size="16" /></div>
                <div class="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            
            <div v-if="aiReadyToScore" class="ai-score-input">
              <p class="score-label">Оцените сферу "{{ currentAISphere?.name }}":</p>
              <div class="user-score-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  v-model.number="aiUserScore"
                  class="sphere-slider"
                  :style="{ '--progress': (aiUserScore / 10) * 100 + '%', '--sphere-color': getSphereColor(currentAISphere?.id) }"
                />
                <div class="slider-labels">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div class="score-display">{{ aiUserScore }}/10</div>
              <div class="score-actions">
                <button class="btn btn-secondary" @click="aiReadyToScore = false">Назад к диалогу</button>
                <button class="btn btn-primary" @click="confirmUserScore">
                  <Check :size="14" /> Подтвердить
                </button>
              </div>
            </div>
            
            <div v-else-if="!aiCompleted" class="ai-input-area">
              <textarea 
                v-model="aiUserInput" 
                placeholder="Расскажите, как обстоят дела в этой сфере..."
                rows="2"
                @keydown.enter.ctrl="sendAIMessage"
              ></textarea>
              <button class="btn btn-primary btn-icon" @click="sendAIMessage" :disabled="!aiUserInput.trim() || aiLoading">
                <Send :size="18" />
              </button>
            </div>
          </div>
          
          <div v-if="aiCompleted" class="ai-results">
            <h4>Результаты переоценки</h4>
            <div class="ai-results-grid">
              <div v-for="sphere in lifeSpheres" :key="sphere.id" class="result-item">
                <component :is="getSphereIcon(sphere.id)" :size="18" :style="{ color: getSphereColor(sphere.id) }" />
                <span>{{ sphere.name }}</span>
                <span class="result-score">{{ reassessScores[sphere.id] }}</span>
              </div>
            </div>
            <div class="sheet-actions">
              <button class="btn btn-secondary" @click="reassessmentMode = 'select'">Начать заново</button>
              <button class="btn btn-primary" @click="saveReassessment">
                <Check :size="18" /> Сохранить результаты
              </button>
            </div>
          </div>
          
          <div v-if="!aiCompleted && !aiReadyToScore" class="ai-nav-actions">
            <button class="btn btn-link" @click="skipCurrentSphere">Пропустить сферу</button>
            <button class="btn btn-secondary" @click="readyToScore" :disabled="!aiMessages.some(m => m.role === 'user')">
              <Check :size="16" /> Готов оценить
            </button>
          </div>
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
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import { apiFetch } from '@/services/api.js'
import WheelOfLife from '../components/WheelOfLife.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
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
  Target,
  Bot,
  Clock,
  Info,
  Send
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

const breadcrumbs = [
  { label: 'Главная', to: '/app' },
  { label: 'Колесо баланса' }
]

const tabs = [
  { id: 'overview', label: 'Обзор', icon: PieChart },
  { id: 'history', label: 'История', icon: History }
]

const activeTab = ref('overview')

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

const sphereHints = {
  wealth: 'Финансы, сбережения, материальная стабильность',
  hobbies: 'Увлечения, отдых, творчество, путешествия',
  friendship: 'Друзья, социальные связи, нетворкинг',
  health: 'Физическое здоровье, спорт, питание, сон',
  career: 'Работа, профессия, развитие, достижения',
  love: 'Партнёр, дети, близкие родственники'
}

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Wallet
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

function getSphereHint(sphereId) {
  return sphereHints[sphereId] || ''
}

const lifeSpheres = computed(() => store.lifeSpheres)
const sspHistory = computed(() => store.sspHistoryData?.history || [])
const sspChartData = computed(() => store.sspHistoryData?.chartData || [])
const sspTrends = computed(() => store.sspHistoryData?.spheresTrends || [])
const hasHistoryData = computed(() => store.sspHistoryData?.hasData || false)
const historyLoading = computed(() => store.sspHistoryData?.loading || false)
const historyLoaded = computed(() => store.sspHistoryData?.loaded || false)

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

// Live preview: текущие слайдеры → колесо в модале
const previewSpheres = computed(() =>
  lifeSpheres.value.map(s => ({ ...s, score: reassessScores[s.id] ?? s.score }))
)

// SVG line chart helpers
const CHART_PAD_L = 32
const CHART_PAD_R = 10
const CHART_PAD_T = 14
const CHART_PAD_B = 30
const CHART_W = 400
const CHART_H = 140

function lineChartX(i) {
  const n = sspChartData.value.length
  if (n <= 1) return CHART_W / 2
  return CHART_PAD_L + (i / (n - 1)) * (CHART_W - CHART_PAD_L - CHART_PAD_R)
}

function lineChartY(val) {
  return CHART_H - CHART_PAD_B - (val / 10) * (CHART_H - CHART_PAD_T - CHART_PAD_B)
}

const lineChartPoints = computed(() =>
  sspChartData.value.map((e, i) => `${lineChartX(i)},${lineChartY(e.average)}`).join(' ')
)

const lineChartAreaPath = computed(() => {
  const pts = sspChartData.value
  if (pts.length < 2) return ''
  const first = `${lineChartX(0)},${lineChartY(pts[0].average)}`
  const last = `${lineChartX(pts.length - 1)},${lineChartY(pts[pts.length - 1].average)}`
  const bottom = CHART_H - CHART_PAD_B
  return `M${lineChartX(0)},${bottom} L${first} ` +
    pts.slice(1).map((e, i) => `L${lineChartX(i + 1)},${lineChartY(e.average)}`).join(' ') +
    ` L${lineChartX(pts.length - 1)},${bottom} Z`
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
const reassessmentMode = ref('select')

const aiCurrentSphereIndex = ref(0)
const aiMessages = ref([])
const aiUserInput = ref('')
const aiLoading = ref(false)
const aiReadyToScore = ref(false)
const aiUserScore = ref(5)
const aiCompleted = ref(false)
const aiMessagesRef = ref(null)

const currentAISphere = computed(() => {
  if (aiCurrentSphereIndex.value < lifeSpheres.value.length) {
    return lifeSpheres.value[aiCurrentSphereIndex.value]
  }
  return null
})

function openReassessment() {
  lifeSpheres.value.forEach(s => {
    reassessScores[s.id] = s.score
  })
  reassessmentMode.value = 'select'
  showReassessmentSheet.value = true
}

function closeReassessment() {
  showReassessmentSheet.value = false
  reassessmentMode.value = 'select'
  resetAIState()
}

function startManualReassessment() {
  reassessmentMode.value = 'manual'
}

function startAIReassessment() {
  closeReassessment()
  router.push('/app/interview?source=ssp')
}

function resetAIState() {
  aiCurrentSphereIndex.value = 0
  aiMessages.value = []
  aiUserInput.value = ''
  aiLoading.value = false
  aiReadyToScore.value = false
  aiUserScore.value = 5
  aiCompleted.value = false
}

async function startAISphereDialog() {
  if (!currentAISphere.value) return
  
  const sphere = currentAISphere.value
  const previousScore = sphere.score
  
  aiMessages.value = []
  aiReadyToScore.value = false
  aiUserScore.value = previousScore
  
  const introMessage = `Давайте поговорим о сфере "${sphere.name}" (${getSphereHint(sphere.id)}). 
  
Ваша текущая оценка: ${previousScore}/10.

Расскажите, что изменилось в этой сфере за последнее время? Что идёт хорошо, а что хотелось бы улучшить?`
  
  aiMessages.value.push({ role: 'assistant', content: introMessage })
}

async function sendAIMessage() {
  if (!aiUserInput.value.trim() || aiLoading.value) return
  
  const userMessage = aiUserInput.value.trim()
  aiMessages.value.push({ role: 'user', content: userMessage })
  aiUserInput.value = ''
  aiLoading.value = true
  
  setTimeout(() => {
    if (aiMessagesRef.value) {
      aiMessagesRef.value.scrollTop = aiMessagesRef.value.scrollHeight
    }
  }, 50)
  
  try {
    const sphere = currentAISphere.value
    const response = await apiFetch('/api/ai/reassess-sphere', {
      method: 'POST',
      body: JSON.stringify({
        sphereId: sphere.id,
        sphereName: sphere.name,
        sphereHint: getSphereHint(sphere.id),
        previousScore: sphere.score,
        userMessage: userMessage,
        conversationHistory: aiMessages.value
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      aiMessages.value.push({ role: 'assistant', content: data.message })
    } else {
      aiMessages.value.push({ 
        role: 'assistant', 
        content: 'Спасибо за ваш ответ! Расскажите подробнее — что для вас сейчас важнее всего в этой сфере?'
      })
    }
  } catch (error) {
    aiMessages.value.push({ 
      role: 'assistant', 
      content: 'Спасибо за ваш ответ! Когда будете готовы оценить эту сферу, нажмите кнопку "Готов оценить".'
    })
  } finally {
    aiLoading.value = false
    setTimeout(() => {
      if (aiMessagesRef.value) {
        aiMessagesRef.value.scrollTop = aiMessagesRef.value.scrollHeight
      }
    }, 50)
  }
}

function readyToScore() {
  const sphere = currentAISphere.value
  if (sphere) {
    aiUserScore.value = sphere.score
  }
  aiReadyToScore.value = true
}

function confirmUserScore() {
  const sphere = currentAISphere.value
  if (sphere) {
    reassessScores[sphere.id] = aiUserScore.value
  }
  
  aiReadyToScore.value = false
  
  if (aiCurrentSphereIndex.value < lifeSpheres.value.length - 1) {
    aiCurrentSphereIndex.value++
    startAISphereDialog()
  } else {
    aiCompleted.value = true
  }
}

function skipCurrentSphere() {
  const sphere = currentAISphere.value
  if (sphere) {
    reassessScores[sphere.id] = sphere.score
  }
  
  if (aiCurrentSphereIndex.value < lifeSpheres.value.length - 1) {
    aiCurrentSphereIndex.value++
    startAISphereDialog()
  } else {
    aiCompleted.value = true
  }
}

async function saveReassessment() {
  Object.keys(reassessScores).forEach(sphereId => {
    store.updateSphere(sphereId, { score: reassessScores[sphereId] })
  })

  showReassessmentSheet.value = false
  
  if (DEBUG_MODE) {
    console.log('[SSP] Creating new SSP evaluation on backend...')
  }
  
  const categoriesData = lifeSpheres.value.map(sphere => {
    const backendCategory = store.getCategoryBackendId(sphere.id)
    return {
      category: backendCategory,
      rating: reassessScores[sphere.id],
      rating_reason: sphere.reflection?.why || '',
      what_mean_max_rating: sphere.reflection?.ten || '',
      max_rating_difficulties: sphere.reflection?.prevents || '',
      what_want: sphere.reflection?.desired || ''
    }
  })
  
  const result = await store.createNewSSPEvaluation(categoriesData)
  if (result.success) {
    if (DEBUG_MODE) {
      console.log('[SSP] New evaluation created, reloading history...')
    }
    await store.loadSSPHistoryFromBackend()
  } else if (DEBUG_MODE) {
    console.warn('[SSP] Failed to save reassessment:', result.error)
  }
}

function getTrendClass(sphereId) {
  const backendSphereId = store.getCategoryBackendId(sphereId)
  const trend = sspTrends.value.find(t => t.id === backendSphereId)
  if (!trend) return ''
  if (trend.trend === 'up') return 'trend-up'
  if (trend.trend === 'down') return 'trend-down'
  return 'trend-same'
}

function getTrendText(sphereId) {
  const backendSphereId = store.getCategoryBackendId(sphereId)
  const trend = sspTrends.value.find(t => t.id === backendSphereId)
  if (!trend) return '—'
  if (trend.change > 0) return `+${trend.change}`
  if (trend.change < 0) return `${trend.change}`
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
  
  const goalData = {
    text: newGoal.title,
    sphereId: selectedSphereForGoal.value.id,
    whyImportant: newGoal.motivation,
    status: 'raw',
    source: 'ssp'
  }
  
  const localGoal = store.addRawIdea(goalData, { insertAtTop: true })
  closeGoalModal()
  
  if (!SKIP_AUTH_CHECK) {
    try {
      const result = await store.createGoalOnBackend({
        text: goalData.text,
        sphereId: goalData.sphereId,
        whyImportant: goalData.whyImportant,
        status: goalData.status
      })
      
      if (result.success && result.goalId) {
        store.updateRawIdea(localGoal.id, { backendId: result.goalId })
        if (DEBUG_MODE) {
          console.log('[SSP] Goal created on backend:', result.goalId)
        }
      }
    } catch (error) {
      console.error('[SSP] Failed to create goal on backend:', error)
    }
  }
  
  router.push('/app/goals-bank')
}

onMounted(async () => {
  if (DEBUG_MODE) {
    console.log('[SSP] Loading SSP data on mount...')
  }
  await store.loadSSPFromBackend()
  
  // history is loaded lazily on tab switch
})

watch(activeTab, async (newTab) => {
  if (newTab === 'history' && !historyLoaded.value) {
    if (DEBUG_MODE) {
      console.log('[SSP] Loading history on tab switch...')
    }
    await store.loadSSPHistoryFromBackend()
  }
})
</script>

<style scoped>
.ssp-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
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
  align-items: center;
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

.reassess-tab-btn {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  white-space: nowrap;
  border-radius: var(--radius-md);
}

.wheel-card {
  padding: 1.25rem 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-bar {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 1.25rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  flex: 1;
  min-width: 0;
  background: transparent;
}

.stat-chip-icon {
  flex-shrink: 0;
}

.stat-chip-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-chip-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.stat-bar-sep {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  flex-shrink: 0;
}

.wheel-visualization {
  max-width: 700px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .wheel-visualization {
    max-width: 100%;
  }

  .reassess-tab-btn span {
    display: none;
  }

  .reassess-tab-btn {
    padding: 0.5rem 0.625rem;
  }

  .preview-wheel-wrap {
    max-width: 180px;
  }
}

.last-assessment {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 1rem 0 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 1.5rem 0 0.75rem;
}

/* Live preview wheel in manual reassess modal */
.preview-wheel-wrap {
  max-width: 240px;
  margin: 0 auto 1rem;
}

/* SVG line chart */
.line-chart-wrap {
  width: 100%;
  overflow-x: auto;
}

.line-chart {
  width: 100%;
  height: 140px;
  display: block;
}

.reflection-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.accordion-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--sphere-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.accordion-item.expanded {
  box-shadow: var(--shadow-sm);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.accordion-header:hover {
  background: var(--bg-secondary);
}

.accordion-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.sphere-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: var(--sphere-color);
}

.sphere-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.sphere-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sphere-score {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 10%, transparent);
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 0.875rem 0.875rem;
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
  flex-direction: row;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .edit-actions {
    justify-content: stretch;
  }
  
  .edit-actions .btn {
    flex: 1;
  }
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
  color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 10%, transparent);
}

.trend-down {
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

.trend-same,
.trend-stable {
  color: var(--text-muted);
  background: var(--bg-secondary);
}

.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.history-list h3 {
  font-size: 1rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.history-item {
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.history-average {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--primary-color);
}

.history-spheres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

.reassess-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.reassess-modal {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  animation: modalFadeIn 0.25s ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.reassess-modal.ai-mode {
  max-height: 95vh;
}

@keyframes modalFadeIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
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

.sheet-intro {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.intro-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.last-assessment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.recommendation-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.recommendation-tip svg {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--primary-color);
}

.reassess-mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.mode-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.mode-btn svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.mode-btn.ai svg {
  color: var(--success-color);
}

.mode-info {
  flex: 1;
}

.mode-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.mode-desc {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.time-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.sheet-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.reassess-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1rem;
}

.reassess-card .reassess-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sphere-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--sphere-color) 15%, transparent);
  border-radius: var(--radius-md);
  color: var(--sphere-color);
  flex-shrink: 0;
}

.sphere-details {
  flex: 1;
}

.reassess-card .reassess-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.reassess-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.reassess-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sphere-color, var(--primary-color));
  min-width: 40px;
  text-align: right;
}

.slider-container {
  margin-top: 0.5rem;
}

.sphere-slider {
  width: 100%;
  height: 8px;
  appearance: none;
  background: linear-gradient(to right, var(--sphere-color, var(--primary-color)) var(--progress), var(--bg-tertiary) var(--progress));
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.sphere-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: var(--sphere-color, var(--primary-color));
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  padding: 0 0.25rem;
}

.sheet-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sheet-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ai-reassess-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0.75rem 1rem;
}

.ai-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--success-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.ai-sphere-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}

.sphere-icon-lg {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.sphere-title h4 {
  margin: 0 0 0.125rem 0;
  font-size: 0.95rem;
}

.sphere-title p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.ai-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0;
  max-height: 45vh;
}

.ai-message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ai-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  line-height: 1.5;
  white-space: pre-wrap;
}

.ai-message.assistant .message-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.ai-message.user .message-content {
  background: var(--success-color);
  color: white;
}

.message-content.typing {
  display: flex;
  gap: 4px;
  padding: 1rem;
}

.message-content.typing span {
  width: 8px;
  height: 8px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.message-content.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.message-content.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.ai-score-input {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  margin-top: 1rem;
}

.score-label {
  margin: 0 0 1rem 0;
  font-weight: 500;
  color: var(--text-primary);
}

.user-score-slider {
  margin-bottom: 0.5rem;
}

.score-display {
  font-size: 2rem;
  font-weight: 700;
  color: var(--success-color);
  margin: 0.5rem 0 1rem 0;
}

.score-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ai-nav-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.ai-input-area {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.ai-input-area textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
}

.ai-input-area textarea:focus {
  outline: none;
  border-color: var(--success-color);
}

.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.ai-input-area .btn-primary,
.ai-nav-actions .btn-primary,
.score-actions .btn-primary,
.ai-results .btn-primary,
.ai-reassess-content .btn-primary {
  background: var(--success-color);
}

.ai-input-area .btn-primary:hover,
.ai-nav-actions .btn-primary:hover,
.score-actions .btn-primary:hover,
.ai-results .btn-primary:hover,
.ai-reassess-content .btn-primary:hover {
  background: var(--success-color);
}

.ai-results {
  padding: 1rem 0;
}

.ai-results h4 {
  margin: 0 0 1rem 0;
  text-align: center;
}

.ai-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.result-item span:first-of-type {
  flex: 1;
  font-size: 0.9rem;
}

.result-score {
  font-weight: 700;
  color: var(--success-color);
}


.btn-link {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

.btn-link:hover {
  color: var(--primary-color);
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
  flex-direction: row;
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
  white-space: nowrap;
}

@media (max-width: 768px) {
  .ssp-header {
    padding-left: 3.5rem;
  }

  .ssp-container {
    padding: 1rem;
    padding-bottom: 100px;
  }

  .stat-chip {
    padding: 0.3rem 0.5rem;
    gap: 0.25rem;
  }

  .stat-chip-value {
    display: none;
  }

  .stat-chip-label {
    display: block;
    font-size: 0.75rem;
  }

  .tab-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .tab-btn svg {
    display: none;
  }
}

/* Dark theme overrides */
:root.dark .stat-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .sphere-item {
  background: var(--bg-tertiary);
}

:root.dark .sphere-name {
  color: var(--text-primary);
}

:root.dark .score-positive {
  color: var(--success-color);
  background: var(--status-success-bg);
}

:root.dark .score-negative {
  color: var(--danger-color);
  background: var(--status-danger-bg);
}

:root.dark .reassess-modal {
  background: var(--bg-primary);
}

:root.dark .sphere-card {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

:root.dark .ai-message {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

:root.dark .ssp-container {
  background: var(--bg-secondary);
}

:root.dark .tab-container {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

:root.dark .tab-btn {
  color: var(--text-secondary);
}

:root.dark .tab-btn:hover {
  background: var(--bg-hover);
}

:root.dark .tab-btn.active {
  background: var(--primary-color);
  color: white;
}

:root.dark .history-item {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .history-item:hover {
  background: var(--bg-tertiary);
}

:root.dark .reflection-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .slider-container {
  background: var(--bg-tertiary);
}

:root.dark .sphere-hint {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}
</style>
