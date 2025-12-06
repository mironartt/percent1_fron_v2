<template>
  <div class="planning-container">
    <header class="planning-header">
      <h1 class="page-title">Планирование</h1>
      <div class="week-navigation">
        <button class="nav-btn" @click="prevWeek" aria-label="Предыдущая неделя">
          <ChevronLeft :size="20" />
        </button>
        <span class="week-range">{{ weekRangeText }}</span>
        <button class="nav-btn" @click="nextWeek" aria-label="Следующая неделя">
          <ChevronRight :size="20" />
        </button>
        <button 
          v-if="!isCurrentWeek" 
          class="today-btn"
          @click="goToCurrentWeek"
        >
          Сегодня
        </button>
      </div>
    </header>

    <div class="week-stats">
      <div class="stat-chip">
        <span class="stat-value">{{ weeklyTotalTasks }}</span>
        <span class="stat-label">шагов</span>
      </div>
      <div class="stat-chip">
        <span class="stat-value">{{ weeklyCompletedTasks }}</span>
        <span class="stat-label">выполнено</span>
      </div>
      <div class="stat-chip" v-if="weeklyTotalTime">
        <span class="stat-value">{{ weeklyTotalTime }}</span>
        <span class="stat-label">всего</span>
      </div>
    </div>

    <div class="week-bar">
      <button 
        v-for="day in weekDays" 
        :key="day.date"
        class="day-tab"
        :class="{ 
          active: selectedDay === day.date,
          today: isToday(day.date),
          'has-tasks': getTasksForDay(day.date).length > 0,
          weekend: day.isWeekend
        }"
        @click="selectDay(day.date)"
      >
        <span class="day-name">{{ day.shortName }}</span>
        <span class="day-num">{{ day.dayNum }}</span>
        <span v-if="getTasksForDay(day.date).length > 0" class="task-count">
          {{ getTasksForDay(day.date).length }}
        </span>
      </button>
    </div>

    <div class="day-content" v-if="selectedDay">
      <div class="day-header-info">
        <h2 class="day-title">{{ selectedDayTitle }}</h2>
        <span v-if="getTotalTimeForDay(selectedDay)" class="day-time">
          <Clock :size="14" />
          {{ getTotalTimeForDay(selectedDay) }}
        </span>
      </div>

      <div class="tasks-list" v-if="getTasksForDay(selectedDay).length > 0">
        <div 
          v-for="task in getTasksForDay(selectedDay)" 
          :key="task.id"
          class="task-card"
          :class="[
            { completed: task.completed },
            'priority-' + (task.priority || 'none')
          ]"
          @click="openTaskActions(task)"
          @touchstart="handleTouchStart(task, $event)"
          @touchend="handleTouchEnd"
          @touchmove="handleTouchMove"
        >
          <button 
            class="task-checkbox"
            :class="{ completed: task.completed }"
            @click.stop="toggleTaskComplete(task)"
          >
            <Check v-if="task.completed" :size="16" />
          </button>
          <div class="task-info">
            <span class="task-title">{{ task.stepTitle }}</span>
            <span class="task-goal">{{ task.goalTitle }}</span>
          </div>
          <div class="task-meta">
            <span v-if="task.timeEstimate" class="time-badge">{{ formatTimeShort(task.timeEstimate) }}</span>
            <span v-if="task.priority" class="priority-dot" :class="'priority-' + task.priority"></span>
          </div>
        </div>
      </div>

      <div v-else class="empty-day">
        <Calendar :size="48" class="empty-icon" />
        <p>Нет задач на этот день</p>
        <span class="empty-hint">Добавьте шаги из целей ниже</span>
      </div>
    </div>

    <div class="section-divider">
      <span>Цели и шаги</span>
    </div>

    <div class="filters-section">
      <div class="chip-filters">
        <button 
          class="chip"
          :class="{ active: filterSphere === '' }"
          @click="filterSphere = ''"
        >
          Все сферы
          <span class="chip-count">{{ goalsWithSteps.length }}</span>
        </button>
        <button 
          v-for="sphere in spheresWithGoals" 
          :key="sphere.id"
          class="chip"
          :class="{ active: filterSphere === sphere.id }"
          @click="filterSphere = sphere.id"
        >
          {{ sphere.icon }} {{ sphere.name }}
          <span class="chip-count">{{ sphere.goalCount }}</span>
        </button>
      </div>
      
      <div class="status-chips">
        <button 
          class="chip small"
          :class="{ active: filterStatus === '' }"
          @click="filterStatus = ''"
        >
          Все
        </button>
        <button 
          class="chip small"
          :class="{ active: filterStatus === 'unscheduled' }"
          @click="filterStatus = 'unscheduled'"
        >
          Незапланированные
        </button>
        <button 
          class="chip small"
          :class="{ active: filterStatus === 'scheduled' }"
          @click="filterStatus = 'scheduled'"
        >
          Запланированные
        </button>
      </div>
    </div>

    <div class="goals-list" v-if="filteredGoalsWithSteps.length > 0">
      <div 
        v-for="goal in paginatedGoals" 
        :key="goal.id" 
        class="goal-card"
        :class="{ expanded: expandedGoals[goal.id] }"
      >
        <div class="goal-header" @click="toggleGoal(goal.id)">
          <div class="goal-main">
            <span class="goal-sphere-badge">{{ getSphereName(goal.sphereId) }}</span>
            <h3 class="goal-title">{{ goal.title }}</h3>
          </div>
          <div class="goal-meta">
            <span class="steps-badge">
              {{ getUnscheduledStepsCount(goal) }}/{{ getUncompletedSteps(goal).length }}
            </span>
            <ChevronDown :size="20" class="expand-icon" :class="{ expanded: expandedGoals[goal.id] }" />
          </div>
        </div>
        
        <div class="steps-grid" v-show="expandedGoals[goal.id]">
          <div 
            v-for="step in getFilteredSteps(goal)" 
            :key="step.id"
            class="step-card"
            :class="{ 
              scheduled: isStepScheduled(goal.id, step.id),
              completed: step.completed
            }"
            @click="openStepActions(goal, step)"
          >
            <div class="step-content">
              <span class="step-title">{{ step.title }}</span>
              <div class="step-badges" v-if="isStepScheduled(goal.id, step.id)">
                <span class="date-badge">{{ formatStepDate(goal.id, step.id) }}</span>
                <span v-if="getScheduledPriority(goal.id, step.id)" class="priority-badge" :class="'priority-' + getScheduledPriority(goal.id, step.id)">
                  {{ getPriorityShort(getScheduledPriority(goal.id, step.id)) }}
                </span>
              </div>
            </div>
            <button 
              v-if="!isStepScheduled(goal.id, step.id)"
              class="quick-add-btn"
              @click.stop="quickScheduleStep(goal, step)"
            >
              <Plus :size="18" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasMoreGoals" class="infinite-scroll-trigger" ref="infiniteScrollTrigger">
        <div class="loading-spinner-small"></div>
      </div>
    </div>

    <div v-else-if="goalsWithSteps.length === 0" class="empty-state">
      <Target :size="48" class="empty-icon" />
      <h3>Нет целей для планирования</h3>
      <p>Добавьте цели в банк целей и декомпозируйте их на шаги</p>
      <button class="btn btn-primary" @click="goToGoalsBank">
        Перейти в банк целей
      </button>
    </div>

    <div v-else class="empty-state">
      <Filter :size="48" class="empty-icon" />
      <p>Нет целей по выбранным фильтрам</p>
      <button class="btn btn-outline" @click="clearFilters">
        Сбросить фильтры
      </button>
    </div>

    <button class="fab" @click="openAddStepModal" v-if="goalsWithSteps.length > 0">
      <Plus :size="24" />
    </button>

    <div class="bottom-sheet-overlay" v-if="showBottomSheet" @click="closeBottomSheet">
      <div class="bottom-sheet" @click.stop>
        <div class="sheet-handle"></div>
        
        <template v-if="bottomSheetMode === 'task'">
          <h3 class="sheet-title">{{ selectedTask?.stepTitle }}</h3>
          <p class="sheet-subtitle">{{ selectedTask?.goalTitle }}</p>
          
          <div class="sheet-actions">
            <button class="sheet-action" @click="toggleTaskComplete(selectedTask); closeBottomSheet()">
              <CheckCircle :size="20" />
              <span>{{ selectedTask?.completed ? 'Отменить выполнение' : 'Выполнено' }}</span>
            </button>
            <button class="sheet-action" @click="openRescheduleSheet">
              <Calendar :size="20" />
              <span>Перенести</span>
            </button>
            <button class="sheet-action" @click="openPrioritySheet">
              <Flag :size="20" />
              <span>Приоритет</span>
            </button>
            <button class="sheet-action" @click="openTimeSheet">
              <Clock :size="20" />
              <span>Время</span>
            </button>
            <button class="sheet-action danger" @click="removeTaskFromSchedule(selectedTask); closeBottomSheet()">
              <Trash2 :size="20" />
              <span>Убрать из плана</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'step'">
          <h3 class="sheet-title">{{ selectedStep?.title }}</h3>
          <p class="sheet-subtitle">{{ selectedGoal?.title }}</p>
          
          <div class="sheet-actions">
            <button 
              v-for="day in weekDays" 
              :key="day.date"
              class="sheet-action day-option"
              :class="{ today: isToday(day.date) }"
              @click="scheduleStepToDay(selectedGoal, selectedStep, day.date)"
            >
              <span class="day-label">{{ day.label }}</span>
              <span class="day-date">{{ day.dayNum }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'reschedule'">
          <h3 class="sheet-title">Перенести на</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="day in weekDays" 
              :key="day.date"
              class="sheet-action day-option"
              :class="{ 
                today: isToday(day.date),
                active: selectedTask?.scheduledDate === day.date 
              }"
              @click="rescheduleTask(selectedTask, day.date)"
            >
              <span class="day-label">{{ day.label }}</span>
              <span class="day-date">{{ day.dayNum }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'priority'">
          <h3 class="sheet-title">Приоритет</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="priority in priorities" 
              :key="priority.value"
              class="sheet-action priority-option"
              :class="{ active: selectedTask?.priority === priority.value }"
              @click="updateTaskPriority(selectedTask, priority.value)"
            >
              <span class="priority-indicator" :class="'priority-' + priority.value"></span>
              <span>{{ priority.label }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'time'">
          <h3 class="sheet-title">Время выполнения</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="time in timeOptions" 
              :key="time.value"
              class="sheet-action"
              :class="{ active: selectedTask?.timeEstimate === time.value }"
              @click="updateTaskTime(selectedTask, time.value)"
            >
              <Clock :size="18" />
              <span>{{ time.label }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'add'">
          <h3 class="sheet-title">Добавить шаг на {{ selectedDayTitle }}</h3>
          
          <div class="add-step-search">
            <Search :size="16" />
            <input 
              v-model="addStepSearch" 
              type="text" 
              placeholder="Поиск по шагам..."
              class="search-input"
            />
          </div>
          
          <div class="add-step-list">
            <template v-for="goal in goalsWithUnscheduledSteps" :key="goal.id">
              <div class="add-goal-header">{{ goal.title }}</div>
              <button 
                v-for="step in getUnscheduledStepsFiltered(goal)" 
                :key="step.id"
                class="sheet-action step-option"
                @click="scheduleStepToDay(goal, step, selectedDay)"
              >
                <span class="step-name">{{ step.title }}</span>
                <Plus :size="18" />
              </button>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import { 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle,
  Clock,
  Plus,
  Target,
  Filter,
  Search,
  Flag,
  Trash2
} from 'lucide-vue-next'

const store = useAppStore()
const xpStore = useXpStore()
const router = useRouter()

const weekOffset = ref(0)
const selectedDay = ref(null)
const filterSphere = ref('')
const filterStatus = ref('')
const addStepSearch = ref('')
const goalsDisplayLimit = ref(10)
const expandedGoals = ref({})
const infiniteScrollTrigger = ref(null)
let infiniteScrollObserver = null

const showBottomSheet = ref(false)
const bottomSheetMode = ref('task')
const selectedTask = ref(null)
const selectedGoal = ref(null)
const selectedStep = ref(null)

let touchTimer = null
const longPressDelay = 500

const priorities = [
  { value: 'critical', label: 'Критично' },
  { value: 'desirable', label: 'Важно' },
  { value: 'attention', label: 'В поле внимания' },
  { value: 'optional', label: 'По возможности' },
  { value: '', label: 'Без приоритета' }
]

const timeOptions = [
  { value: '30min', label: '30 минут' },
  { value: '1h', label: '1 час' },
  { value: '2h', label: '2 часа' },
  { value: '3h', label: '3 часа' },
  { value: '4h', label: '4 часа' },
  { value: '', label: 'Без оценки' }
]

function formatDateLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + (weekOffset.value * 7))
  monday.setHours(12, 0, 0, 0)
  
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const fullNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push({
      date: formatDateLocal(date),
      dayNum: date.getDate(),
      shortName: dayNames[i],
      label: fullNames[i],
      isWeekend: i >= 5
    })
  }
  return days
})

const isCurrentWeek = computed(() => weekOffset.value === 0)

const weekRangeText = computed(() => {
  if (weekDays.value.length < 7) return ''
  const start = new Date(weekDays.value[0].date)
  const end = new Date(weekDays.value[6].date)
  const options = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('ru-RU', options)} — ${end.toLocaleDateString('ru-RU', options)}`
})

const selectedDayTitle = computed(() => {
  if (!selectedDay.value) return ''
  const day = weekDays.value.find(d => d.date === selectedDay.value)
  if (!day) return ''
  const date = new Date(selectedDay.value)
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${day.label}, ${day.dayNum} ${monthNames[date.getMonth()]}`
})

function prevWeek() {
  weekOffset.value--
  loadWeeklySteps()
}

function nextWeek() {
  weekOffset.value++
  loadWeeklySteps()
}

function goToCurrentWeek() {
  weekOffset.value = 0
  loadWeeklySteps()
}

function selectDay(date) {
  selectedDay.value = date
}

function isToday(dateStr) {
  return dateStr === formatDateLocal(new Date())
}

function initSelectedDay() {
  const today = formatDateLocal(new Date())
  const todayInWeek = weekDays.value.find(d => d.date === today)
  selectedDay.value = todayInWeek ? todayInWeek.date : weekDays.value[0].date
}

const weeklyStepsData = ref([])
const weeklyStepsLoading = ref(false)

async function loadWeeklySteps() {
  if (weeklyStepsLoading.value) return
  
  await nextTick()
  
  const startDate = weekDays.value[0]?.date
  const endDate = weekDays.value[6]?.date
  
  if (!startDate || !endDate) {
    console.log('[Planning] Week dates not ready yet')
    return
  }
  
  weeklyStepsLoading.value = true
  
  try {
    const { getPlannedSteps } = await import('@/services/api.js')
    console.log('[Planning] Loading weekly steps for:', startDate, 'to', endDate)
    
    const response = await getPlannedSteps({ date_from: startDate, date_to: endDate })
    if (response.status === 'success' && response.steps_data) {
      weeklyStepsData.value = response.steps_data
    }
  } catch (error) {
    console.error('[Planning] Error loading weekly steps:', error)
  } finally {
    weeklyStepsLoading.value = false
  }
}

const timeDurationMap = { 'half': '30min', 'one': '1h', 'two': '2h', 'three': '3h', 'four': '4h' }
const priorityBackendToFrontend = { 'critical': 'critical', 'important': 'desirable', 'attention': 'attention', 'optional': 'optional' }
const priorityFrontendToBackend = { 'critical': 'critical', 'desirable': 'important', 'attention': 'attention', 'optional': 'optional' }
const priorityOrder = { critical: 0, important: 0, desirable: 1, attention: 2, optional: 3, '': 4 }

function getTasksForDay(dateStr) {
  const dayData = weeklyStepsData.value.find(d => d.date === dateStr)
  if (dayData && dayData.steps_data && dayData.steps_data.length > 0) {
    return dayData.steps_data
      .map(step => ({
        id: `backend-${step.step_id}`,
        goalId: step.goal_id,
        stepId: step.step_id,
        stepTitle: step.step_title,
        goalTitle: step.goal_title,
        goalCategory: step.goal_category,
        scheduledDate: step.step_dt,
        timeEstimate: timeDurationMap[step.step_time_duration] || '',
        priority: priorityBackendToFrontend[step.step_priority] || step.step_priority || '',
        completed: step.step_is_complete || false,
        order: step.step_order
      }))
      .sort((a, b) => {
        const priorityA = priorityOrder[a.priority] ?? 4
        const priorityB = priorityOrder[b.priority] ?? 4
        return priorityA - priorityB
      })
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  if (!plan) return []
  
  return (plan.scheduledTasks || [])
    .filter(t => t.scheduledDate === dateStr)
    .sort((a, b) => {
      const priorityA = priorityOrder[a.priority] ?? 4
      const priorityB = priorityOrder[b.priority] ?? 4
      return priorityA - priorityB
    })
}

function getTotalTimeForDay(dateStr) {
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  const tasks = getTasksForDay(dateStr)
  const totalMinutes = tasks.reduce((sum, task) => {
    return sum + (timeValues[task.timeEstimate] || 0)
  }, 0)
  
  if (totalMinutes === 0) return ''
  if (totalMinutes < 60) return `${totalMinutes}м`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`
}

const weeklyTotalTasks = computed(() => {
  let total = 0
  for (const day of weekDays.value) {
    total += getTasksForDay(day.date).length
  }
  return total
})

const weeklyCompletedTasks = computed(() => {
  let completed = 0
  for (const day of weekDays.value) {
    completed += getTasksForDay(day.date).filter(t => t.completed).length
  }
  return completed
})

const weeklyTotalTime = computed(() => {
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  let totalMinutes = 0
  
  for (const day of weekDays.value) {
    for (const task of getTasksForDay(day.date)) {
      totalMinutes += timeValues[task.timeEstimate] || 0
    }
  }
  
  if (totalMinutes === 0) return ''
  if (totalMinutes < 60) return `${totalMinutes}м`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`
})

function formatTimeShort(time) {
  const labels = { '30min': '30м', '1h': '1ч', '2h': '2ч', '3h': '3ч', '4h': '4ч' }
  return labels[time] || time
}

const goals = computed(() => store.goalsBank?.rawIdeas || [])
const lifeSpheres = computed(() => store.lifeSpheres)

const goalsWithSteps = computed(() => {
  const activeStatuses = ['in_progress', 'active', 'in-progress']
  return goals.value.filter(g => 
    activeStatuses.includes(g.status) && 
    g.steps && 
    g.steps.length > 0
  )
})

const spheresWithGoals = computed(() => {
  const sphereCounts = {}
  for (const goal of goalsWithSteps.value) {
    const sphereId = goal.sphereId || goal.sphere_id
    if (!sphereCounts[sphereId]) {
      sphereCounts[sphereId] = 0
    }
    sphereCounts[sphereId]++
  }
  
  return lifeSpheres.value
    .filter(s => sphereCounts[s.id])
    .map(s => ({
      ...s,
      goalCount: sphereCounts[s.id]
    }))
})

const filteredGoalsWithSteps = computed(() => {
  let filtered = goalsWithSteps.value
  
  if (filterSphere.value) {
    filtered = filtered.filter(g => (g.sphereId || g.sphere_id) === filterSphere.value)
  }
  
  if (filterStatus.value === 'unscheduled') {
    filtered = filtered.filter(g => getUnscheduledStepsCount(g) > 0)
  } else if (filterStatus.value === 'scheduled') {
    filtered = filtered.filter(g => getScheduledStepsCount(g) > 0)
  }
  
  return filtered
})

const paginatedGoals = computed(() => {
  return filteredGoalsWithSteps.value.slice(0, goalsDisplayLimit.value)
})

const hasMoreGoals = computed(() => {
  return goalsDisplayLimit.value < filteredGoalsWithSteps.value.length
})

const goalsWithUnscheduledSteps = computed(() => {
  return goalsWithSteps.value.filter(g => 
    getUncompletedSteps(g).some(s => !isStepScheduled(g.id, s.id))
  )
})

function getUncompletedSteps(goal) {
  return (goal.steps || []).filter(s => !s.completed)
}

function getFilteredSteps(goal) {
  let steps = getUncompletedSteps(goal)
  
  if (filterStatus.value === 'unscheduled') {
    steps = steps.filter(s => !isStepScheduled(goal.id, s.id))
  } else if (filterStatus.value === 'scheduled') {
    steps = steps.filter(s => isStepScheduled(goal.id, s.id))
  }
  
  return steps
}

function getUnscheduledStepsFiltered(goal) {
  let steps = getUncompletedSteps(goal).filter(s => !isStepScheduled(goal.id, s.id))
  
  if (addStepSearch.value) {
    const query = addStepSearch.value.toLowerCase()
    steps = steps.filter(s => s.title?.toLowerCase().includes(query))
  }
  
  return steps
}

function getUnscheduledStepsCount(goal) {
  return getUncompletedSteps(goal).filter(s => !isStepScheduled(goal.id, s.id)).length
}

function getScheduledStepsCount(goal) {
  return getUncompletedSteps(goal).filter(s => isStepScheduled(goal.id, s.id)).length
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : ''
}

function isStepScheduled(goalId, stepId) {
  for (const day of weeklyStepsData.value) {
    if (day.steps_data?.some(s => s.goal_id === goalId && s.step_id === stepId)) {
      return true
    }
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  if (plan?.scheduledTasks?.some(t => t.goalId === goalId && t.stepId === stepId)) {
    return true
  }
  
  const goal = goals.value.find(g => g.id === goalId)
  const step = goal?.steps?.find(s => s.id === stepId)
  return !!step?.date
}

function getScheduledDate(goalId, stepId) {
  for (const day of weeklyStepsData.value) {
    const step = day.steps_data?.find(s => s.goal_id === goalId && s.step_id === stepId)
    if (step) return step.step_dt
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const task = plan?.scheduledTasks?.find(t => t.goalId === goalId && t.stepId === stepId)
  if (task) return task.scheduledDate
  
  const goal = goals.value.find(g => g.id === goalId)
  const step = goal?.steps?.find(s => s.id === stepId)
  return step?.date || ''
}

function getScheduledPriority(goalId, stepId) {
  for (const day of weeklyStepsData.value) {
    const step = day.steps_data?.find(s => s.goal_id === goalId && s.step_id === stepId)
    if (step) return priorityBackendToFrontend[step.step_priority] || step.step_priority || ''
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const task = plan?.scheduledTasks?.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.priority || ''
}

function formatStepDate(goalId, stepId) {
  const dateStr = getScheduledDate(goalId, stepId)
  if (!dateStr) return ''
  
  const day = weekDays.value.find(d => d.date === dateStr)
  if (day) return day.shortName
  
  const date = new Date(dateStr)
  return `${date.getDate()}.${date.getMonth() + 1}`
}

function getPriorityShort(priority) {
  const labels = { 'critical': '!!!', 'desirable': '!!', 'attention': '!', 'optional': '○' }
  return labels[priority] || ''
}

function toggleGoal(goalId) {
  expandedGoals.value[goalId] = !expandedGoals.value[goalId]
}

function clearFilters() {
  filterSphere.value = ''
  filterStatus.value = ''
}

function goToGoalsBank() {
  router.push('/app/goals-bank')
}

function handleTouchStart(task, event) {
  touchTimer = setTimeout(() => {
    openTaskActions(task)
  }, longPressDelay)
}

function handleTouchEnd() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

function handleTouchMove() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

function openTaskActions(task) {
  selectedTask.value = task
  bottomSheetMode.value = 'task'
  showBottomSheet.value = true
}

function openStepActions(goal, step) {
  selectedGoal.value = goal
  selectedStep.value = step
  bottomSheetMode.value = 'step'
  showBottomSheet.value = true
}

function openRescheduleSheet() {
  bottomSheetMode.value = 'reschedule'
}

function openPrioritySheet() {
  bottomSheetMode.value = 'priority'
}

function openTimeSheet() {
  bottomSheetMode.value = 'time'
}

function openAddStepModal() {
  addStepSearch.value = ''
  bottomSheetMode.value = 'add'
  showBottomSheet.value = true
}

function closeBottomSheet() {
  showBottomSheet.value = false
  selectedTask.value = null
  selectedGoal.value = null
  selectedStep.value = null
}

async function toggleTaskComplete(task) {
  if (!task) return
  
  const newCompleted = !task.completed
  
  task.completed = newCompleted
  
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${task.stepTitle}`)
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        is_complete: newCompleted
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error toggling task complete:', error)
    task.completed = !newCompleted
  }
}

async function rescheduleTask(task, newDate) {
  if (!task) return
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        dt: newDate
      }]
    })
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error rescheduling task:', error)
  }
}

async function updateTaskPriority(task, priority) {
  if (!task) return
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        priority: priorityFrontendToBackend[priority] || priority || null
      }]
    })
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error updating task priority:', error)
  }
}

async function updateTaskTime(task, time) {
  if (!task) return
  
  const timeMap = { '30min': 'half', '1h': 'one', '2h': 'two', '3h': 'three', '4h': 'four' }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        time_duration: timeMap[time] || null
      }]
    })
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error updating task time:', error)
  }
}

async function removeTaskFromSchedule(task) {
  if (!task) return
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        dt: '1700-01-01'
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error removing task from schedule:', error)
  }
}

async function scheduleStepToDay(goal, step, date) {
  if (!goal || !step || !date) return
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goal.backendId || goal.id,
        step_id: step.backendId || step.id,
        dt: date
      }]
    })
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error scheduling step:', error)
  }
}

function quickScheduleStep(goal, step) {
  selectedGoal.value = goal
  selectedStep.value = step
  bottomSheetMode.value = 'step'
  showBottomSheet.value = true
}

function loadMoreGoals() {
  if (hasMoreGoals.value) {
    goalsDisplayLimit.value += 10
  }
}

function setupInfiniteScroll() {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
  
  infiniteScrollObserver = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && hasMoreGoals.value) {
      loadMoreGoals()
    }
  }, {
    rootMargin: '100px'
  })
  
  watch(infiniteScrollTrigger, (el) => {
    if (el && infiniteScrollObserver) {
      infiniteScrollObserver.observe(el)
    }
  }, { immediate: true })
}

watch(weekOffset, () => {
  initSelectedDay()
})

onMounted(async () => {
  initSelectedDay()
  await loadWeeklySteps()
  setupInfiniteScroll()
  
  if (filteredGoalsWithSteps.value.length > 0) {
    expandedGoals.value[filteredGoalsWithSteps.value[0].id] = true
  }
})

onUnmounted(() => {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
})
</script>

<style scoped>
.planning-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 100px;
}

.planning-header {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--hover-bg, #f3f4f6);
}

.week-range {
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.today-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--primary, #6366f1);
  background: transparent;
  color: var(--primary, #6366f1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  background: var(--primary, #6366f1);
  color: white;
}

.week-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  white-space: nowrap;
}

.stat-value {
  font-weight: 600;
  color: var(--primary, #6366f1);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.week-bar {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.day-tab {
  flex: 1;
  min-width: 44px;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
  position: relative;
}

.day-tab:hover {
  background: var(--hover-bg, #f3f4f6);
}

.day-tab.active {
  background: var(--primary, #6366f1);
  color: white;
}

.day-tab.today:not(.active) {
  border: 2px solid var(--primary, #6366f1);
}

.day-tab.weekend {
  opacity: 0.8;
}

.day-tab .day-name {
  font-size: 0.75rem;
  font-weight: 500;
}

.day-tab .day-num {
  font-size: 1rem;
  font-weight: 600;
}

.day-tab .task-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-tab.active .task-count {
  background: white;
  color: var(--primary, #6366f1);
}

.day-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.day-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.day-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.day-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.task-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.priority-critical {
  border-left-color: var(--danger, #ef4444);
}

.task-card.priority-desirable {
  border-left-color: var(--warning, #f59e0b);
}

.task-card.priority-attention {
  border-left-color: var(--info, #3b82f6);
}

.task-card.priority-optional {
  border-left-color: var(--text-muted, #9ca3af);
}

.task-card.priority-none {
  border-left-color: var(--border-color, #e5e7eb);
}

.task-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.task-checkbox:hover {
  border-color: var(--primary, #6366f1);
}

.task-checkbox.completed {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-goal {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.time-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg);
  border-radius: 10px;
  color: var(--text-secondary);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.priority-critical { background: var(--danger, #ef4444); }
.priority-dot.priority-desirable { background: var(--warning, #f59e0b); }
.priority-dot.priority-attention { background: var(--info, #3b82f6); }
.priority-dot.priority-optional { background: var(--text-muted, #9ca3af); }
.priority-dot.priority-none { background: var(--border-color, #e5e7eb); }

.empty-day {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.5rem;
}

.empty-day p {
  margin: 0.5rem 0 0.25rem;
  font-weight: 500;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--text-muted, #9ca3af);
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 1rem;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.section-divider span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filters-section {
  margin-bottom: 1rem;
}

.chip-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-chips {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: var(--hover-bg, #f3f4f6);
}

.chip.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: white;
}

.chip.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.chip-count {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
}

.goal-header:hover {
  background: var(--hover-bg, #f3f4f6);
}

.goal-main {
  flex: 1;
  min-width: 0;
}

.goal-sphere-badge {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.goal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.steps-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg);
  border-radius: 10px;
  color: var(--text-secondary);
}

.expand-icon {
  color: var(--text-muted, #9ca3af);
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

@media (min-width: 480px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.step-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.step-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.step-card.scheduled {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.step-card.completed {
  opacity: 0.5;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  display: block;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-badges {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.date-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 6px;
}

.priority-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
}

.priority-badge.priority-critical { background: var(--danger, #ef4444); color: white; }
.priority-badge.priority-desirable { background: var(--warning, #f59e0b); color: white; }
.priority-badge.priority-attention { background: var(--info, #3b82f6); color: white; }
.priority-badge.priority-optional { background: var(--text-muted, #9ca3af); color: white; }
.priority-badge.priority-none { background: var(--border-color, #e5e7eb); color: var(--text-primary, #1f2937); }

.quick-add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px dashed var(--border-color, #e5e7eb);
  background: transparent;
  color: var(--text-muted, #9ca3af);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.quick-add-btn:hover {
  border-color: var(--primary, #6366f1);
  color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.infinite-scroll-trigger {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary, #6366f1);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--hover-bg, #f3f4f6);
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 1rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottom-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  background: var(--card-bg);
  border-radius: 20px 20px 0 0;
  padding: 1rem 1rem 2rem;
  overflow-y: auto;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0 auto 1rem;
}

.sheet-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.sheet-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sheet-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.sheet-action:hover {
  background: var(--hover-bg, #f3f4f6);
}

.sheet-action.danger {
  color: var(--danger);
}

.sheet-action.active {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
  color: var(--primary, #6366f1);
}

.sheet-action.day-option {
  justify-content: space-between;
}

.sheet-action.day-option.today {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.day-label {
  font-weight: 500;
}

.day-date {
  color: var(--text-secondary);
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.priority-indicator.priority-critical { background: var(--danger, #ef4444); }
.priority-indicator.priority-desirable { background: var(--warning, #f59e0b); }
.priority-indicator.priority-attention { background: var(--info, #3b82f6); }
.priority-indicator.priority-optional { background: var(--text-muted, #9ca3af); }
.priority-indicator.priority-none { background: var(--border-color, #e5e7eb); }

.add-step-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 12px;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.add-step-search .search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.add-step-list {
  max-height: 50vh;
  overflow-y: auto;
}

.add-goal-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-option {
  justify-content: space-between;
}

.step-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .planning-container {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .week-bar {
    gap: 0.5rem;
  }
  
  .day-tab {
    min-width: 60px;
    padding: 0.75rem 0.5rem;
  }
  
  .day-tab .day-name {
    font-size: 0.8125rem;
  }
  
  .day-tab .day-num {
    font-size: 1.125rem;
  }
  
  .fab {
    bottom: 2rem;
    right: 2rem;
  }
  
  .bottom-sheet {
    border-radius: 20px;
    margin-bottom: 2rem;
  }
}
</style>
