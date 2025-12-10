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
          v-for="group in getGroupedTasksForDay(selectedDay)" 
          :key="group.goalId"
          class="task-group"
        >
          <div class="group-header" v-if="getGroupedTasksForDay(selectedDay).length > 1 || group.tasks.length > 1">
            <span class="group-title">{{ group.goalTitle }}</span>
            <div class="group-meta">
              <span class="group-count">{{ group.completedCount }}/{{ group.tasks.length }}</span>
              <span v-if="group.totalMinutes" class="group-time">
                <Clock :size="12" />
                {{ formatGroupTime(group.totalMinutes) }}
              </span>
            </div>
          </div>
          <div 
            v-for="task in group.tasks" 
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
            <div class="priority-stripe" :class="'priority-' + (task.priority || 'none')"></div>
            <button 
              class="task-checkbox"
              :class="{ completed: task.completed }"
              @click.stop="toggleTaskComplete(task)"
            >
              <Check v-if="task.completed" :size="16" />
            </button>
            <div class="task-info">
              <span class="task-title">{{ task.stepTitle }}</span>
              <span class="task-goal" v-if="getGroupedTasksForDay(selectedDay).length === 1 && group.tasks.length === 1">{{ task.goalTitle }}</span>
            </div>
            <div class="task-meta">
              <span v-if="task.timeEstimate" class="time-badge">
                <Clock :size="12" />
                {{ formatTimeShort(task.timeEstimate) }}
              </span>
              <span v-if="task.priority" class="priority-icon-badge" :class="'priority-' + task.priority">
                {{ getPriorityIcon(task.priority) }}
              </span>
            </div>
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

    <div class="filters-row compact">
      <div class="sphere-dropdown" :class="{ open: showSphereDropdown }">
        <button class="dropdown-trigger" @click="showSphereDropdown = !showSphereDropdown">
          <Filter :size="14" />
          <span>{{ selectedSphereName }}</span>
          <span class="dropdown-count" v-if="filterSphere">1</span>
          <ChevronDown :size="14" class="dropdown-arrow" />
        </button>
        <div class="dropdown-menu" v-if="showSphereDropdown" @click.stop>
          <button 
            class="dropdown-item"
            :class="{ active: filterSphere === '' }"
            @click="filterSphere = ''; showSphereDropdown = false"
          >
            Все сферы
            <span class="item-count">{{ goalsWithSteps.length }}</span>
          </button>
          <button 
            v-for="sphere in spheresWithGoals" 
            :key="sphere.id"
            class="dropdown-item"
            :class="{ active: filterSphere === sphere.id }"
            @click="filterSphere = sphere.id; showSphereDropdown = false"
          >
            {{ sphere.icon }} {{ sphere.name }}
            <span class="item-count">{{ sphere.goalCount }}</span>
          </button>
        </div>
      </div>
      
      <div class="segmented-control">
        <button 
          class="segment"
          :class="{ active: filterStatus === '' }"
          @click="filterStatus = ''"
        >
          Все
        </button>
        <button 
          class="segment"
          :class="{ active: filterStatus === 'unscheduled' }"
          @click="filterStatus = 'unscheduled'"
        >
          Незапл.
        </button>
        <button 
          class="segment"
          :class="{ active: filterStatus === 'scheduled' }"
          @click="filterStatus = 'scheduled'"
        >
          Запл.
        </button>
      </div>
    </div>

    <!-- Баннер: цели без шагов -->
    <div class="needs-decomposition-banner" v-if="goalsWithoutSteps.length > 0">
      <div class="banner-header">
        <AlertCircle :size="20" class="banner-icon" />
        <span class="banner-title">{{ goalsWithoutSteps.length }} {{ goalsWithoutSteps.length === 1 ? 'цель требует' : 'целей требуют' }} декомпозиции</span>
      </div>
      <p class="banner-text">Чтобы планировать, разбейте цели на конкретные шаги</p>
      <div class="banner-goals">
        <div 
          v-for="goal in goalsWithoutSteps.slice(0, 3)" 
          :key="goal.id" 
          class="banner-goal-item"
          @click="goToDecomposition(goal)"
        >
          <span class="goal-sphere-mini">{{ getSphereIcon(goal.sphereId) }}</span>
          <span class="goal-title-mini">{{ goal.text || goal.title }}</span>
          <ChevronRight :size="16" class="go-icon" />
        </div>
      </div>
      <button 
        v-if="goalsWithoutSteps.length > 3" 
        class="btn btn-outline btn-small"
        @click="goToGoalsBank"
      >
        Показать все ({{ goalsWithoutSteps.length }})
      </button>
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
            <h3 class="goal-title">{{ goal.text || goal.title }}</h3>
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
              completed: step.completed,
              ['priority-' + getScheduledPriority(goal.id, step.id)]: isStepScheduled(goal.id, step.id)
            }"
            @click="openStepActions(goal, step)"
          >
            <button 
              class="step-checkbox"
              :class="{ completed: step.completed }"
              @click.stop="quickToggleStepComplete(goal, step)"
              :title="step.completed ? 'Отменить выполнение' : 'Выполнить'"
            >
              <Check v-if="step.completed" :size="14" />
            </button>
            <div class="step-content">
              <span class="step-title" :class="{ completed: step.completed }">{{ step.title }}</span>
              <div class="step-badges" v-if="isStepScheduled(goal.id, step.id)">
                <span class="date-badge">
                  <Calendar :size="11" />
                  {{ formatStepDate(goal.id, step.id) }}
                </span>
                <span class="time-badge" :class="{ empty: !getScheduledTime(goal.id, step.id) }">
                  <Clock :size="11" />
                  {{ getScheduledTime(goal.id, step.id) ? formatTimeShort(getScheduledTime(goal.id, step.id)) : '—' }}
                </span>
              </div>
            </div>
            <div class="priority-stripe" :class="'priority-' + (getScheduledPriority(goal.id, step.id) || 'none')"></div>
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
          <p class="sheet-subtitle">{{ selectedGoal?.text || selectedGoal?.title }}</p>
          
          <!-- Запланированный шаг: показываем inline-действия -->
          <template v-if="isSelectedStepScheduled">
            <div class="inline-options-section">
              <div class="option-label">
                <Calendar :size="16" />
                <span>День</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="day in weekDays" 
                  :key="day.date"
                  class="chip"
                  :class="{ active: getScheduledStepDate === day.date }"
                  @click="rescheduleStep(day.date)"
                >
                  {{ day.label }} {{ day.dayNum }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Flag :size="16" />
                <span>Приоритет</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="chip"
                  :class="{ 
                    active: getScheduledStepPriority === priority.value,
                    ['priority-' + priority.value]: true
                  }"
                  @click="updateStepPriority(priority.value)"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Clock :size="16" />
                <span>Время</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.value"
                  class="chip"
                  :class="{ active: getScheduledStepTime === time.value }"
                  @click="updateStepTime(time.value)"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
            
            <div class="sheet-actions-row">
              <button class="sheet-action danger" @click="removeStepFromSchedule">
                <Trash2 :size="20" />
                <span>Убрать из плана</span>
              </button>
              <button class="sheet-action primary" @click="closeBottomSheet">
                <Check :size="20" />
                <span>Сохранить</span>
              </button>
            </div>
          </template>
          
          <!-- Незапланированный шаг: показываем все опции -->
          <template v-else>
            <div class="inline-options-section">
              <div class="option-label">
                <Calendar :size="16" />
                <span>День</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="day in futureDays" 
                  :key="day.date"
                  class="chip"
                  :class="{ active: newStepDay === day.date, today: isToday(day.date) }"
                  @click="newStepDay = day.date"
                >
                  {{ day.shortName }} {{ day.dayNum }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Flag :size="16" />
                <span>Приоритет</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="chip"
                  :class="{ 
                    active: newStepPriority === priority.value,
                    ['priority-' + priority.value]: true
                  }"
                  @click="newStepPriority = priority.value"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Clock :size="16" />
                <span>Время</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.value"
                  class="chip"
                  :class="{ active: newStepTime === time.value }"
                  @click="newStepTime = time.value"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
            
            <div class="sheet-actions" style="margin-top: 0.75rem;">
              <button 
                class="sheet-action primary"
                :disabled="!newStepDay"
                @click="scheduleNewStep"
              >
                <CheckCircle :size="20" />
                <span>Запланировать</span>
              </button>
            </div>
          </template>
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
  Trash2,
  AlertCircle
} from 'lucide-vue-next'

const store = useAppStore()
const xpStore = useXpStore()
const router = useRouter()

const weekOffset = ref(0)
const selectedDay = ref(null)
const filterSphere = ref('')
const filterStatus = ref('')
const showSphereDropdown = ref(false)
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

const futureDays = computed(() => {
  const todayStr = formatDateLocal(new Date())
  return weekDays.value.filter(day => day.date >= todayStr)
})

const newStepDay = ref(null)
const newStepPriority = ref('')
const newStepTime = ref('')

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

function getGroupedTasksForDay(dateStr) {
  const tasks = getTasksForDay(dateStr)
  const groups = {}
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  
  for (const task of tasks) {
    const goalKey = task.goalId || task.goalTitle
    if (!groups[goalKey]) {
      groups[goalKey] = {
        goalId: task.goalId,
        goalTitle: task.goalTitle,
        goalCategory: task.goalCategory,
        tasks: [],
        totalMinutes: 0,
        completedCount: 0
      }
    }
    groups[goalKey].tasks.push(task)
    groups[goalKey].totalMinutes += timeValues[task.timeEstimate] || 0
    if (task.completed) groups[goalKey].completedCount++
  }
  
  return Object.values(groups).sort((a, b) => {
    const maxPriorityA = Math.min(...a.tasks.map(t => priorityOrder[t.priority] ?? 4))
    const maxPriorityB = Math.min(...b.tasks.map(t => priorityOrder[t.priority] ?? 4))
    return maxPriorityA - maxPriorityB
  })
}

function formatGroupTime(minutes) {
  if (minutes === 0) return ''
  if (minutes < 60) return `${minutes}м`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
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

const workingGoals = computed(() => store.goals || [])
const lifeSpheres = computed(() => store.lifeSpheres)

const goalsWithSteps = computed(() => {
  return workingGoals.value.filter(g => 
    g.status !== 'completed' &&
    g.steps && 
    g.steps.length > 0
  )
})

const goalsWithoutSteps = computed(() => {
  return workingGoals.value.filter(g => 
    g.status !== 'completed' &&
    (!g.steps || g.steps.length === 0)
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

const selectedSphereName = computed(() => {
  if (!filterSphere.value) return 'Все сферы'
  const sphere = spheresWithGoals.value.find(s => s.id === filterSphere.value)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Все сферы'
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
  
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
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
  
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const step = goal?.steps?.find(s => s.id === stepId)
  return step?.date || ''
}

function getScheduledPriority(goalId, stepId) {
  // Сначала проверяем локальные данные (обновляются сразу при выборе)
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const localTask = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === String(goalId)) && 
    (t.stepId === stepId || t.stepId === String(stepId))
  )
  if (localTask?.priority) return localTask.priority
  
  // Затем проверяем данные с бэкенда
  for (const day of weeklyStepsData.value) {
    const step = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === String(goalId)) && 
      (s.step_id === stepId || s.step_id === String(stepId))
    )
    if (step) return priorityBackendToFrontend[step.step_priority] || step.step_priority || ''
  }
  
  return ''
}

function getScheduledTimeEstimate(goalId, stepId) {
  for (const day of weeklyStepsData.value) {
    const step = day.steps_data?.find(s => s.goal_id === goalId && s.step_id === stepId)
    if (step) return step.step_time_duration || step.time_estimate || ''
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const task = plan?.scheduledTasks?.find(t => t.goalId === goalId && t.stepId === stepId)
  if (task) return task.timeEstimate || task.step_time_duration || ''
  
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const localStep = goal?.steps?.find(s => s.id === stepId)
  return localStep?.timeEstimate || localStep?.time_estimate || ''
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

function getPriorityIcon(priority) {
  const icons = { 'critical': '🔥', 'desirable': '⚡', 'attention': '👁', 'optional': '○' }
  return icons[priority] || ''
}

function getScheduledTime(goalId, stepId) {
  // Сначала проверяем локальные данные (обновляются сразу при выборе)
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const localTask = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === String(goalId)) && 
    (t.stepId === stepId || t.stepId === String(stepId))
  )
  if (localTask?.timeEstimate) return localTask.timeEstimate
  
  // Затем проверяем данные с бэкенда
  for (const day of weeklyStepsData.value) {
    const step = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === String(goalId)) && 
      (s.step_id === stepId || s.step_id === String(stepId))
    )
    if (step) return step.step_time_duration || step.time_estimate || ''
  }
  
  return ''
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

function goToDecomposition(goal) {
  // In dev mode use local-{id}, in prod use backendId
  const goalId = goal.backendId || `local-${goal.id}`
  router.push(`/app/goals/${goalId}`)
}

function getSphereIcon(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere?.icon || '🎯'
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
  newStepDay.value = null
  newStepPriority.value = ''
  newStepTime.value = ''
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

// Computed свойства для работы с шагами из блока "Цели и шаги"
const isSelectedStepScheduled = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return false
  return isStepScheduled(selectedGoal.value.id, selectedStep.value.id)
})

const getScheduledStepDate = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledDate(selectedGoal.value.id, selectedStep.value.id) || null
})

const getScheduledStepPriority = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledPriority(selectedGoal.value.id, selectedStep.value.id) || null
})

const getScheduledStepTime = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledTimeEstimate(selectedGoal.value.id, selectedStep.value.id) || null
})

function formatScheduledDateLabel(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getPriorityLabel(priority) {
  const labels = {
    'critical': 'Критично',
    'desirable': 'Важно',
    'attention': 'В поле внимания',
    'optional': 'По возможности'
  }
  return labels[priority] || priority || ''
}

function formatTimeLabel(time) {
  const labels = {
    '30min': '30 мин',
    '1h': '1 час',
    '2h': '2 часа',
    '3h': '3 часа',
    '4h': '4 часа'
  }
  return labels[time] || time || ''
}


async function toggleStepComplete() {
  if (!selectedGoal.value || !selectedStep.value) return
  
  const newCompleted = !selectedStep.value.completed
  selectedStep.value.completed = newCompleted
  
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${selectedStep.value.title}`)
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: selectedGoal.value.backendId || selectedGoal.value.id,
        step_id: selectedStep.value.backendId || selectedStep.value.id,
        is_complete: newCompleted
      }]
    })
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error toggling step complete:', error)
    selectedStep.value.completed = !newCompleted
  }
}

async function quickToggleStepComplete(goal, step) {
  const newCompleted = !step.completed
  step.completed = newCompleted
  
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${step.title}`)
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goal.backendId || goal.id,
        step_id: step.backendId || step.id,
        is_complete: newCompleted
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error toggling step complete:', error)
    step.completed = !newCompleted
  }
}

async function rescheduleStep(newDate) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Сначала обновляем локально
  saveStepToLocalPlan(selectedGoal.value, selectedStep.value, newDate)
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: selectedGoal.value.backendId || selectedGoal.value.id,
        step_id: selectedStep.value.backendId || selectedStep.value.id,
        dt: newDate
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error rescheduling step:', error)
  }
}

async function updateStepPriority(priority) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Сначала обновляем локально
  updateStepInLocalPlan(selectedGoal.value, selectedStep.value, { priority })
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: selectedGoal.value.backendId || selectedGoal.value.id,
        step_id: selectedStep.value.backendId || selectedStep.value.id,
        priority: priorityFrontendToBackend[priority] || priority || null
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error updating step priority:', error)
  }
}

async function updateStepTime(time) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Сначала обновляем локально
  updateStepInLocalPlan(selectedGoal.value, selectedStep.value, { timeEstimate: time })
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: selectedGoal.value.backendId || selectedGoal.value.id,
        step_id: selectedStep.value.backendId || selectedStep.value.id,
        time_estimate: time || null
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error updating step time:', error)
  }
}

async function removeStepFromSchedule() {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Сначала удаляем локально
  removeStepFromLocalPlan(selectedGoal.value, selectedStep.value)
  closeBottomSheet()
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: selectedGoal.value.backendId || selectedGoal.value.id,
        step_id: selectedStep.value.backendId || selectedStep.value.id,
        dt: null
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error removing step from schedule:', error)
  }
}

function removeStepFromLocalPlan(goal, step) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (plan) {
    // Удалить по обоим вариантам ID
    plan.scheduledTasks = (plan.scheduledTasks || []).filter(
      t => !((t.goalId === goal.id || t.goalId === goal.backendId) && 
             (t.stepId === step.id || t.stepId === step.backendId))
    )
  }
  
  // Убрать дату из шага (в обеих коллекциях)
  updateStepDateInCollections(goal.id, step.id, null)
  
  store.saveToLocalStorage()
}

function updateStepInLocalPlan(goal, step, updates) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  const goalId = goal.backendId || goal.id
  const stepId = step.backendId || step.id
  
  let plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (!plan) {
    plan = { weekStart, scheduledTasks: [] }
    store.weeklyPlans.push(plan)
  }
  
  const task = plan.scheduledTasks.find(
    t => (t.goalId === goalId || t.goalId === goal.id) && 
         (t.stepId === stepId || t.stepId === step.id)
  )
  
  if (task) {
    if (updates.priority !== undefined) task.priority = updates.priority
    if (updates.timeEstimate !== undefined) task.timeEstimate = updates.timeEstimate
    if (updates.completed !== undefined) task.completed = updates.completed
  }
  
  store.saveToLocalStorage()
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
  
  const { DEBUG_MODE } = await import('@/config/settings.js')
  
  // Сначала обновляем локально для мгновенного отклика
  saveStepToLocalPlan(goal, step, date)
  closeBottomSheet()
  
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
  } catch (error) {
    console.error('[Planning] Error scheduling step:', error)
    // В DEV_MODE данные уже сохранены локально, всё ок
    if (DEBUG_MODE) {
      console.log('[Planning] DEV_MODE: Step saved locally')
    }
  }
}

async function scheduleNewStep() {
  if (!selectedGoal.value || !selectedStep.value || !newStepDay.value) return
  
  const goal = selectedGoal.value
  const step = selectedStep.value
  const date = newStepDay.value
  
  // Сохраняем с приоритетом и временем
  saveStepToLocalPlan(goal, step, date)
  
  // Обновляем приоритет и время если заданы
  if (newStepPriority.value || newStepTime.value) {
    updateStepInLocalPlan(goal, step, { 
      priority: newStepPriority.value, 
      timeEstimate: newStepTime.value 
    })
  }
  
  closeBottomSheet()
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goal.backendId || goal.id,
        step_id: step.backendId || step.id,
        dt: date,
        priority: newStepPriority.value || undefined,
        time_estimate: newStepTime.value || undefined
      }]
    })
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error scheduling new step:', error)
  }
}

function saveStepToLocalPlan(goal, step, date) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  // Использовать универсальные ключи
  const goalKey = goal.backendId || goal.id
  const stepKey = step.backendId || step.id
  
  // Найти или создать план на неделю
  let plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (!plan) {
    plan = { weekStart, scheduledTasks: [] }
    store.weeklyPlans.push(plan)
  }
  
  // Удалить старую запись этого шага если есть (проверяем оба варианта ID)
  plan.scheduledTasks = (plan.scheduledTasks || []).filter(
    t => !((t.goalId === goal.id || t.goalId === goal.backendId) && 
           (t.stepId === step.id || t.stepId === step.backendId))
  )
  
  // Добавить новую задачу
  plan.scheduledTasks.push({
    id: `local-${goalKey}-${stepKey}`,
    goalId: goalKey,
    stepId: stepKey,
    stepTitle: step.title,
    goalTitle: goal.text || goal.title,
    scheduledDate: date,
    timeEstimate: step.timeEstimate || '',
    priority: step.priority || '',
    completed: step.completed || false
  })
  
  // Обновить дату в шаге для isStepScheduled (в обеих коллекциях)
  updateStepDateInCollections(goal.id, step.id, date)
  
  // Сохранить в localStorage
  store.saveToLocalStorage()
}

function updateStepDateInCollections(goalId, stepId, date) {
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  if (goal) {
    const step = goal.steps?.find(s => s.id === stepId || s.backendId === stepId)
    if (step) step.date = date
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

function closeSphereDropdown(e) {
  if (!e.target.closest('.sphere-dropdown')) {
    showSphereDropdown.value = false
  }
}

onMounted(async () => {
  initSelectedDay()
  await Promise.all([
    loadWeeklySteps(),
    store.loadGoalsFromBackend({ score_filter: 'true', status_filter: 'work' })
  ])
  setupInfiniteScroll()
  document.addEventListener('click', closeSphereDropdown)
  
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
  document.removeEventListener('click', closeSphereDropdown)
})
</script>

<style scoped>
.planning-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
  padding-bottom: 100px;
}

.planning-header {
  margin-bottom: 1rem;
  text-align: center;
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
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.week-stats::-webkit-scrollbar {
  display: none;
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
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.week-bar::-webkit-scrollbar {
  display: none;
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
  gap: 0.75rem;
}

.task-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
  margin-bottom: 0.25rem;
}

.group-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.group-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.task-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  padding-left: 0;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.priority-stripe {
  width: 4px;
  min-height: 100%;
  align-self: stretch;
  border-radius: 4px 0 0 4px;
  flex-shrink: 0;
}

.priority-stripe.priority-critical { background: var(--danger, #ef4444); }
.priority-stripe.priority-desirable { background: var(--warning, #f59e0b); }
.priority-stripe.priority-attention { background: var(--info, #3b82f6); }
.priority-stripe.priority-optional { background: var(--text-muted, #9ca3af); }
.priority-stripe.priority-none { background: #c7d2fe; }

.task-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.task-card.completed {
  opacity: 0.6;
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
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-secondary);
}

.time-badge svg {
  opacity: 0.7;
}

.priority-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  min-width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
}

.priority-icon-badge.priority-critical { 
  background: rgba(239, 68, 68, 0.15);
}
.priority-icon-badge.priority-desirable { 
  background: rgba(245, 158, 11, 0.15);
}
.priority-icon-badge.priority-attention { 
  background: rgba(59, 130, 246, 0.15);
}
.priority-icon-badge.priority-optional { 
  background: rgba(156, 163, 175, 0.15);
}
.priority-icon-badge.priority-none {
  background: rgba(199, 210, 254, 0.3);
  color: var(--text-muted, #9ca3af);
}

.time-badge.empty {
  opacity: 0.5;
}

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

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.filters-row.compact {
  flex-wrap: nowrap;
  gap: 0.75rem;
}

.sphere-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown-trigger:hover {
  border-color: var(--primary, #6366f1);
}

.sphere-dropdown.open .dropdown-trigger {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.sphere-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-count {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 10px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background: var(--card-bg, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--hover-bg, #f3f4f6);
}

.dropdown-item.active {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
  color: var(--primary, #6366f1);
}

.item-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dropdown-item.active .item-count {
  color: var(--primary, #6366f1);
}

.segmented-control {
  display: flex;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
}

.segment {
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid var(--border-color, #e5e7eb);
}

.segment:last-child {
  border-right: none;
}

.segment:hover {
  background: var(--hover-bg, #f3f4f6);
}

.segment.active {
  background: var(--primary, #6366f1);
  color: white;
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
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border-color, #e5e7eb);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-height: 44px;
  position: relative;
}

.step-checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-color, #d1d5db);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.step-checkbox:hover {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.step-checkbox.completed {
  background: var(--success, #10b981);
  border-color: var(--success, #10b981);
}

.step-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.step-card .priority-stripe {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 10px 10px 0;
}

.step-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.step-card.scheduled {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.step-card.scheduled.priority-critical {
  background: rgba(239, 68, 68, 0.08);
}

.step-card.scheduled.priority-desirable {
  background: rgba(245, 158, 11, 0.08);
}

.step-card.scheduled.priority-attention {
  background: rgba(59, 130, 246, 0.08);
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
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  align-items: center;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 6px;
}

.date-badge svg {
  opacity: 0.8;
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

.needs-decomposition-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.banner-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.banner-icon {
  color: #d97706;
  flex-shrink: 0;
}

.banner-title {
  font-weight: 600;
  color: #92400e;
  font-size: 0.9375rem;
}

.banner-text {
  color: #a16207;
  font-size: 0.8125rem;
  margin: 0 0 0.75rem;
}

.banner-goals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.banner-goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.banner-goal-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.goal-sphere-mini {
  font-size: 1rem;
  flex-shrink: 0;
}

.goal-title-mini {
  flex: 1;
  font-size: 0.875rem;
  color: #78350f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.go-icon {
  color: #d97706;
  flex-shrink: 0;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  margin-top: 0.75rem;
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
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.bottom-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1rem 1rem 1.5rem;
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

.sheet-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
}

.step-info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg, #f3f4f6);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.info-badge svg {
  opacity: 0.7;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.days-grid .sheet-action.day-option {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  min-height: 60px;
}

.days-grid .day-label {
  font-size: 0.875rem;
}

.days-grid .day-date {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sheet-actions-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.sheet-actions-row .sheet-action {
  flex: 1;
  justify-content: center;
  min-height: 44px;
  border-radius: 10px;
  font-weight: 500;
}

.sheet-action.primary {
  background: var(--primary-color, #6366f1);
  color: #fff;
}

.sheet-action.primary:hover {
  background: var(--primary-dark, #4f46e5);
}

.inline-options-section {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.inline-options-section:last-of-type {
  border-bottom: none;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.chip {
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.chip.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: white;
}

.chip.priority-critical.active {
  background: var(--danger, #ef4444);
  border-color: var(--danger, #ef4444);
}

.chip.priority-desirable.active {
  background: var(--warning, #f59e0b);
  border-color: var(--warning, #f59e0b);
}

.chip.priority-attention.active {
  background: var(--info, #3b82f6);
  border-color: var(--info, #3b82f6);
}

.chip.priority-optional.active {
  background: var(--text-muted, #9ca3af);
  border-color: var(--text-muted, #9ca3af);
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

.sheet-action.primary {
  background: var(--primary, #6366f1);
  color: white;
  font-weight: 500;
}

.sheet-action.primary:hover {
  background: var(--primary-dark, #4f46e5);
}

.sheet-action.primary:disabled {
  background: var(--border-color, #e5e7eb);
  color: var(--text-muted, #9ca3af);
  cursor: not-allowed;
}

.chip.today {
  border-color: var(--primary, #6366f1);
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

@media (max-width: 767px) {
  .sheet-action {
    min-height: 52px;
    padding: 0.875rem 1rem;
    -webkit-tap-highlight-color: transparent;
  }
  
  .sheet-action:active {
    background: var(--hover-bg, #f3f4f6);
    transform: scale(0.98);
  }
  
  .days-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.35rem;
  }
  
  .days-grid .sheet-action.day-option {
    padding: 0.5rem 0.25rem;
    min-height: 50px;
  }
  
  .days-grid .day-label {
    font-size: 0.7rem;
  }
  
  .days-grid .day-date {
    font-size: 0.95rem;
  }
  
  .step-card {
    min-height: 48px;
    -webkit-tap-highlight-color: transparent;
  }
  
  .step-card:active {
    transform: scale(0.98);
    background: var(--hover-bg, #f3f4f6);
  }
  
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

/* Dark theme overrides */
:root.dark .step-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .step-title {
  color: var(--text-primary);
}

:root.dark .step-meta {
  color: var(--text-secondary);
}

:root.dark .day-tab {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .day-tab.active {
  background: var(--primary-color);
  color: white;
}

:root.dark .day-tab:hover:not(.active) {
  background: var(--bg-hover);
}

:root.dark .priority-badge.priority-none {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .bottom-sheet {
  background: var(--bg-primary);
}

:root.dark .chip-filter {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .chip-filter.active {
  background: var(--primary-color);
  color: white;
}
</style>
