<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container modal-compact">
        <div class="modal-header">
          <button
            class="header-icon-btn"
            :class="{ active: activeSection === 'icon' }"
            @click="toggleSection('icon')"
          >
            {{ getIconEmoji(formData.icon) }}
          </button>
          <input
            ref="headerNameInput"
            v-model="formData.name"
            type="text"
            class="header-name-input"
            :placeholder="editingHabit ? 'Редактировать привычку' : 'Новая привычка'"
            @keydown.enter="formData.name.trim() && !isSaving && saveHabit()"
          />
          <button class="btn-close" @click="close">
            <X :size="20" :stroke-width="1.5" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="activeSection === 'icon'" class="expand-section">
            <div class="icon-grid-full">
              <button
                v-for="icon in habitIconsData"
                :key="icon.name"
                class="icon-option"
                :class="{ selected: formData.icon === icon.name }"
                @click="formData.icon = icon.name; activeSection = null"
              >
                {{ icon.emoji }}
              </button>
            </div>
          </div>

          <div class="action-bar">
            <button
              v-if="editingHabit"
              class="action-chip action-chip-danger"
              @click="handleDelete"
              title="Удалить"
            >
              <Trash2 :size="14" :stroke-width="1.5" />
            </button>
            <button
              class="action-chip"
              :class="{ active: activeSection === 'schedule' }"
              @click="toggleSection('schedule')"
            >
              <Calendar :size="14" :stroke-width="1.5" />
              {{ scheduleChipLabel }}
            </button>
            <button
              class="action-chip"
              :class="{ active: activeSection === 'more' }"
              @click="toggleSection('more')"
            >
              <SlidersHorizontal :size="14" :stroke-width="1.5" />
              Ещё
            </button>
            <div class="action-bar-spacer"></div>
            <button
              class="btn-create"
              @click="saveHabit"
              :disabled="!formData.name.trim() || isSaving"
            >
              <Loader2 v-if="isSaving" :size="16" :stroke-width="2" class="spin" />
              {{ editingHabit ? 'Сохранить' : 'Создать' }}
            </button>
          </div>

          <div v-if="activeSection === 'schedule'" class="expand-section">
            <div class="schedule-presets">
              <button
                class="preset-btn"
                :class="{ active: formData.frequencyType === 'daily' }"
                @click="formData.frequencyType = 'daily'"
              >
                Каждый день
              </button>
              <button
                class="preset-btn"
                :class="{ active: formData.frequencyType === 'weekdays' }"
                @click="formData.frequencyType = 'weekdays'"
              >
                Будни
              </button>
              <button
                class="preset-btn"
                :class="{ active: formData.frequencyType === 'weekends' }"
                @click="formData.frequencyType = 'weekends'"
              >
                Выходные
              </button>
            </div>
            <div class="days-row">
              <button
                v-for="day in weekDaysConfig"
                :key="day.key"
                class="day-btn-compact"
                :class="{ active: isDayActiveBySchedule(day.key) }"
                @click="toggleDayManual(day.key)"
              >
                {{ day.short }}
              </button>
            </div>
          </div>

          <div v-if="activeSection === 'more'" class="expand-section">
            <div class="xp-slider-row">
              <label class="slider-label">Награда за выполнение</label>
              <div class="xp-slider-control">
                <input
                  type="range"
                  v-model.number="formData.xpReward"
                  min="1"
                  max="100"
                  step="1"
                  class="xp-slider"
                />
                <span class="xp-slider-value">+{{ formData.xpReward }} XP</span>
              </div>
            </div>
            <textarea
              v-model="formData.description"
              class="form-input description-input"
              rows="2"
              placeholder="Описание (необязательно)"
            />
            <div v-if="gameSettings.difficultyMode !== 'soft'" class="penalty-field">
              <label class="slider-label">
                <CircleAlert :size="14" :stroke-width="1.5" />
                Штраф за пропуск
              </label>
              <div class="xp-slider-control">
                <input
                  type="range"
                  v-model.number="formData.xpPenalty"
                  min="0"
                  max="200"
                  step="1"
                  class="xp-slider penalty"
                />
                <span class="xp-slider-value penalty">-{{ formData.xpPenalty }} XP</span>
              </div>
            </div>
          </div>

          <div v-if="!editingHabit" class="suggest-row">
            <span class="suggest-label">Нужна идея?</span>
            <button class="suggest-link-btn" @click="openTemplatesModal">
              <Sparkles :size="12" :stroke-width="1.5" />
              Шаблоны
            </button>
            <span class="suggest-dot">&middot;</span>
            <button class="suggest-link-btn" @click="openAiSuggestionsModal">
              <Sparkles :size="12" :stroke-width="1.5" />
              Ментор
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <AiMentorModal
    :show="showSuggestionsModal"
    :step="suggestionsStep"
    title="Умный подбор привычек"
    subtitle="Умный подбор привычек"
    description="AI проанализирует ваши цели, паттерны поведения и рефлексии. На основе этого предложит привычки для достижения результатов."
    :features="habitFeatures"
    buttonText="Подобрать привычки"
    loadingText="AI анализирует ваш профиль..."
    skipKey="habitSuggestionsSkipIntro"
    :skipChecked="skipHabitSuggestionsIntro"
    @update:skipChecked="skipHabitSuggestionsIntro = $event; saveSkipIntroPreference()"
    @close="closeSuggestionsModal"
    @start="startHabitSuggestions"
  >
    <template #selection>
      <div class="ai-selection-section">
        <h4>Рекомендованные привычки</h4>
        <p class="ai-selection-hint">Выберите привычки, которые хотите добавить</p>
        <div class="ai-suggestions-list aim-scrollable">
          <div
            v-for="(habit, idx) in aiSuggestedHabits"
            :key="idx"
            class="ai-suggestion-card"
            :class="{ selected: selectedAiHabits.includes(idx) }"
            @click="toggleAiHabitSelection(idx)"
          >
            <div class="ai-suggestion-checkbox">
              <CheckSquare v-if="selectedAiHabits.includes(idx)" :size="20" />
              <Square v-else :size="20" />
            </div>
            <div class="ai-suggestion-content">
              <div class="ai-suggestion-header">
                <span class="ai-habit-emoji">{{ getIconEmoji(habit.icon) }}</span>
                <h5 class="ai-suggestion-title">{{ habit.name }}</h5>
              </div>
              <p v-if="habit.whyUseful" class="ai-suggestion-reason">
                <Bot :size="14" />
                {{ habit.whyUseful }}
              </p>
              <div class="ai-habit-meta">
                <span class="ai-habit-schedule">
                  <Calendar :size="12" />
                  {{ habit.scheduleLabel }}
                </span>
                <span class="ai-habit-xp">+{{ habit.xpReward }} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #confirmation>
      <div class="ai-confirmation-section">
        <div class="ai-success-icon"><CheckCircle :size="48" /></div>
        <h4>Привычки успешно добавлены!</h4>
        <p class="ai-confirmation-text">Добавлено {{ createdAiHabits.length }} {{ getHabitsWord(createdAiHabits.length) }}</p>
        <div class="ai-created-list">
          <div v-for="habit in createdAiHabits" :key="habit.id" class="ai-created-item">
            <CheckCircle :size="16" class="ai-created-icon" />
            <span>{{ habit.name }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #error>
      <div class="ai-error-section">
        <div class="ai-error-icon"><AlertTriangle :size="48" /></div>
        <h4>Не удалось подобрать привычки</h4>
        <p class="ai-error-text">{{ suggestionsErrorMessage }}</p>
      </div>
    </template>

    <template #templates>
      <div class="ai-templates-section">
        <h4>Шаблоны привычек</h4>
        <p class="ai-templates-hint">Выберите готовые привычки из категорий</p>
        <div class="suggestions-categories aim-scrollable">
          <div v-for="category in habitSuggestions" :key="category.name" class="suggestion-category">
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
            <div class="category-habits">
              <button v-for="habit in category.habits" :key="habit.name" class="suggestion-habit" @click="selectSuggestedHabit(habit)">
                <span class="habit-emoji">{{ getIconEmoji(habit.icon) }}</span>
                <div class="habit-details">
                  <span class="habit-title">{{ habit.name }}</span>
                  <span class="habit-desc">{{ habit.description }}</span>
                </div>
                <div class="habit-schedule-badge">{{ habit.scheduleLabel }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ step: currentStep }">
      <template v-if="currentStep === 'selection'">
        <button class="aim-btn aim-btn-secondary" @click="suggestionsStep = 'intro'">
          <ArrowLeft :size="16" />
          <span>Назад</span>
        </button>
        <button class="aim-btn aim-btn-primary" :disabled="selectedAiHabits.length === 0" @click="confirmAiHabitSelection">
          Добавить ({{ selectedAiHabits.length }})
        </button>
      </template>
      <template v-else-if="currentStep === 'confirmation'">
        <button class="aim-btn aim-btn-primary aim-btn-full" @click="closeSuggestionsModal">Отлично!</button>
      </template>
      <template v-else-if="currentStep === 'error'">
        <button class="aim-btn aim-btn-secondary" @click="showTemplateHabits">Выбрать из шаблонов</button>
        <button class="aim-btn aim-btn-primary" @click="suggestionsStep = 'intro'">Попробовать снова</button>
      </template>
      <template v-else-if="currentStep === 'templates'">
        <button class="aim-btn aim-btn-secondary aim-btn-full" @click="suggestionsStep = 'intro'">
          <ArrowLeft :size="16" />
          <span>Назад к AI</span>
        </button>
      </template>
    </template>
  </AiMentorModal>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, markRaw } from 'vue'
import {
  X,
  Sparkles,
  CircleAlert,
  Trash2,
  Loader2,
  Target,
  RefreshCw,
  BarChart3,
  Clock,
  CheckSquare,
  Square,
  Bot,
  Calendar,
  SlidersHorizontal,
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from 'lucide-vue-next'
import AiMentorModal from '@/components/AiMentorModal.vue'
import { useAppStore } from '@/stores/app'
import { useHabitsStore } from '@/stores/habits'
import { useAITasksStore } from '@/stores/aiTasks'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editingHabit: {
    type: Object,
    default: null
  },
  gameSettings: {
    type: Object,
    default: () => ({ difficultyMode: 'balanced' })
  }
})

const emit = defineEmits(['update:modelValue', 'created', 'updated', 'deleted', 'open-mentor'])

const appStore = useAppStore()
const habitsStore = useHabitsStore()
const aiTasksStore = useAITasksStore()
const toast = useToastStore()

const habitFeatures = [
  { icon: markRaw(Target), text: 'Анализ целей и ССП' },
  { icon: markRaw(RefreshCw), text: 'Паттерны поведения' },
  { icon: markRaw(BarChart3), text: 'Персонализация' },
  { icon: markRaw(Clock), text: 'Готовое расписание' }
]

const HABIT_TASK_TYPE = 'habit_create_help'
const HABIT_VIEWED_RESULTS_KEY = 'habit_suggestions_viewed'

const headerNameInput = ref(null)
const isSaving = ref(false)
const activeSection = ref(null)
const showSuggestionsModal = ref(false)
const suggestionsStep = ref('intro')
const skipHabitSuggestionsIntro = ref(false)
const aiSuggestedHabits = ref([])
const selectedAiHabits = ref([])
const createdAiHabits = ref([])
const suggestionsErrorMessage = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formData = ref({
  name: '',
  icon: 'fire',
  description: '',
  xpReward: 5,
  xpPenalty: 0,
  frequencyType: 'daily',
  scheduleDays: [1, 2, 3, 4, 5, 6, 0],
  reminderTime: ''
})

const habitIconsData = [
  { emoji: '🔥', name: 'fire' },
  { emoji: '💪', name: 'strength' },
  { emoji: '🧠', name: 'brain' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '📚', name: 'book' },
  { emoji: '🏃', name: 'run' },
  { emoji: '💧', name: 'water' },
  { emoji: '😴', name: 'sleep' },
  { emoji: '🧘', name: 'meditation' },
  { emoji: '🎯', name: 'target' },
  { emoji: '💰', name: 'money' },
  { emoji: '📈', name: 'graph' },
  { emoji: '☀️', name: 'sun' },
  { emoji: '🌙', name: 'moon' },
  { emoji: '🛡️', name: 'shield' },
  { emoji: '🎨', name: 'palette' },
  { emoji: '😊', name: 'smile' },
  { emoji: '🍎', name: 'apple' },
  { emoji: '⚖️', name: 'weight' },
  { emoji: '📅', name: 'calendar' },
  { emoji: '🏆', name: 'trophy' },
  { emoji: '⭐', name: 'star' },
  { emoji: '🚀', name: 'rocket' },
  { emoji: '🌿', name: 'leaf' },
  { emoji: '☕', name: 'coffee' },
  { emoji: '🎵', name: 'music' },
  { emoji: '📷', name: 'camera' },
  { emoji: '💻', name: 'laptop' },
  { emoji: '🏋️', name: 'dumbbell' },
  { emoji: '🧘‍♀️', name: 'yoga' },
  { emoji: '🚴', name: 'bicycle' },
  { emoji: '🏊', name: 'swimmer' }
]

const scheduleChipLabel = computed(() => {
  const ft = formData.value.frequencyType
  if (ft === 'daily') return 'Каждый день'
  if (ft === 'weekdays') return 'Будни'
  if (ft === 'weekends') return 'Выходные'
  return 'Свой график'
})

function toggleSection(section) {
  activeSection.value = activeSection.value === section ? null : section
}

const weekDaysConfig = [
  { key: 1, name: 'Понедельник', short: 'Пн' },
  { key: 2, name: 'Вторник', short: 'Вт' },
  { key: 3, name: 'Среда', short: 'Ср' },
  { key: 4, name: 'Четверг', short: 'Чт' },
  { key: 5, name: 'Пятница', short: 'Пт' },
  { key: 6, name: 'Суббота', short: 'Сб' },
  { key: 0, name: 'Воскресенье', short: 'Вс' }
]

const habitSuggestions = [
  {
    name: 'Здоровье и тело',
    icon: '💪',
    habits: [
      { name: 'Утренняя зарядка', description: '10 минут упражнений', icon: 'run', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Пить воду', description: '8 стаканов в день', icon: 'water', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 5 },
      { name: 'Прогулка 30 минут', description: 'На свежем воздухе', icon: 'run', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
    ]
  },
  {
    name: 'Продуктивность',
    icon: '🚀',
    habits: [
      { name: 'Планирование дня', description: 'План на день с утра', icon: 'target', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 8 },
      { name: 'Глубокая работа', description: '2 часа без отвлечений', icon: 'brain', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 15 },
    ]
  },
  {
    name: 'Обучение',
    icon: '📚',
    habits: [
      { name: 'Чтение 20 минут', description: 'Расширение кругозора', icon: 'book', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Изучение языка', description: 'Практика языка', icon: 'brain', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 12 },
    ]
  },
  {
    name: 'Ментальное здоровье',
    icon: '🧘',
    habits: [
      { name: 'Медитация', description: 'Практика осознанности', icon: 'meditation', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Благодарность', description: '3 вещи за день', icon: 'heart', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 5 },
    ]
  },
  {
    name: 'Режим и отдых',
    icon: '😴',
    habits: [
      { name: 'Ранний подъём', description: 'Встать до 7:00', icon: 'sun', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 10 },
      { name: 'Сон до 23:00', description: 'Лечь спать вовремя', icon: 'sleep', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
    ]
  }
]

onMounted(() => {
  const skipIntro = localStorage.getItem('skipHabitSuggestionsIntro') === 'true'
  skipHabitSuggestionsIntro.value = skipIntro
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
    nextTick(() => {
      headerNameInput.value?.focus()
    })
  }
})

watch(() => props.editingHabit, (habit) => {
  if (habit) {
    const scheduleDays = habit.scheduleDays || habit.schedule_days || []
    const frequencyType = determineFrequencyType(habit.frequencyType || habit.frequency_type, scheduleDays)
    
    formData.value = {
      name: habit.name,
      icon: normalizeIconName(habit.icon),
      description: habit.description || '',
      xpReward: habit.xpReward || habit.xp_reward || 5,
      xpPenalty: habit.xpPenalty || habit.xp_penalty || 0,
      frequencyType: frequencyType,
      scheduleDays: scheduleDays.length > 0 ? [...scheduleDays] : [1, 2, 3, 4, 5, 6, 0],
      reminderTime: habit.reminderTime || habit.reminder_time || ''
    }
  }
}, { immediate: true })

function resetForm() {
  if (!props.editingHabit) {
    formData.value = {
      name: '',
      icon: 'fire',
      description: '',
      xpReward: 5,
      xpPenalty: props.gameSettings.difficultyMode === 'hardcore' ? 5 : 
                 props.gameSettings.difficultyMode === 'balanced' ? 3 : 0,
      frequencyType: 'daily',
      scheduleDays: [1, 2, 3, 4, 5, 6, 0],
      reminderTime: ''
    }
  }
  activeSection.value = null
}

function close() {
  isOpen.value = false
  activeSection.value = null
}

function getIconEmoji(iconName) {
  const found = habitIconsData.find(i => i.name === iconName)
  return found ? found.emoji : iconName
}

function normalizeIconName(rawIcon) {
  const byName = habitIconsData.find(i => i.name === rawIcon)
  if (byName) return rawIcon
  const byEmoji = habitIconsData.find(i => i.emoji === rawIcon)
  if (byEmoji) return byEmoji.name
  return 'fire'
}

function determineFrequencyType(existingType, scheduleDays) {
  if (existingType && existingType !== 'daily') return existingType
  if (!scheduleDays || scheduleDays.length === 0) return 'daily'
  
  const sortedDays = [...scheduleDays].sort((a, b) => a - b)
  const allDays = [0, 1, 2, 3, 4, 5, 6]
  const weekdays = [1, 2, 3, 4, 5]
  const weekends = [0, 6]
  
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort((x, y) => x - y)
    const sortedB = [...b].sort((x, y) => x - y)
    return sortedA.every((val, i) => val === sortedB[i])
  }
  
  if (arraysEqual(sortedDays, allDays)) return 'daily'
  if (arraysEqual(sortedDays, weekdays)) return 'weekdays'
  if (arraysEqual(sortedDays, weekends)) return 'weekends'
  
  return 'custom'
}

function isDayActiveBySchedule(dayKey) {
  const freqType = formData.value.frequencyType
  if (freqType === 'daily') return true
  if (freqType === 'weekdays') return dayKey >= 1 && dayKey <= 5
  if (freqType === 'weekends') return dayKey === 0 || dayKey === 6
  if (freqType === 'custom') return formData.value.scheduleDays.includes(dayKey)
  return false
}

function toggleDay(dayKey) {
  const index = formData.value.scheduleDays.indexOf(dayKey)
  if (index === -1) {
    formData.value.scheduleDays.push(dayKey)
  } else if (formData.value.scheduleDays.length > 1) {
    formData.value.scheduleDays.splice(index, 1)
  }
}

function toggleDayManual(dayKey) {
  formData.value.frequencyType = 'custom'
  toggleDay(dayKey)
}

async function saveHabit() {
  if (!formData.value.name.trim() || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const scheduleDays = formData.value.frequencyType === 'custom' ? formData.value.scheduleDays :
                         formData.value.frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] :
                         formData.value.frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6]
    
    const habitData = {
      name: formData.value.name.trim(),
      icon: formData.value.icon,
      description: formData.value.description,
      xpReward: formData.value.xpReward,
      xpPenalty: formData.value.xpPenalty,
      frequencyType: formData.value.frequencyType,
      scheduleDays: scheduleDays,
      reminderTime: formData.value.reminderTime
    }
    
    const backendHabitData = {
      name: habitData.name,
      description: habitData.description || '',
      icon: habitData.icon,
      xp_reward: habitData.xpReward,
      xp_penalty: habitData.xpPenalty || 0,
      schedule_days: scheduleDays
    }
    
    if (props.editingHabit) {
      appStore.updateHabit(props.editingHabit.id, habitData)
      toast.showToast({ title: 'Привычка обновлена', type: 'success' })
      
      const backendId = props.editingHabit.backendId || props.editingHabit.id
      const backendResult = await habitsStore.updateHabit(backendId, backendHabitData)
      if (backendResult.success && backendResult.data?.id) {
        appStore.updateHabit(props.editingHabit.id, { backendId: backendResult.data.id })
      }
      
      emit('updated', { ...habitData, id: props.editingHabit.id })
    } else {
      const localHabit = appStore.addHabit(habitData)
      toast.showToast({ title: 'Привычка создана', type: 'success' })
      
      try {
        const { useActivationStore } = await import('@/stores/activation.js')
        const activationStore = useActivationStore()
        const result = activationStore.completeTask('create_habit')
        if (result.completed && result.message) {
          appStore.sendMentorMessage(result.message, 'assistant')
        }
      } catch (e) {
        console.error('[AddHabitModal] Activation tracking error:', e)
      }
      
      const backendResult = await habitsStore.createHabit(backendHabitData)
      
      if (backendResult.success && backendResult.habitId) {
        appStore.updateHabit(localHabit.id, { backendId: backendResult.habitId })
      }
      
      emit('created', { ...habitData, id: localHabit.id, backendId: backendResult?.habitId })
    }
    
    close()
  } catch (error) {
    console.error('[AddHabitModal] Save error:', error)
    toast.showToast({ title: 'Ошибка сохранения', type: 'error' })
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (props.editingHabit) {
    appStore.removeHabit(props.editingHabit.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
    
    const backendId = props.editingHabit.backendId || props.editingHabit.id
    await habitsStore.deleteHabit(backendId)
    
    emit('deleted', props.editingHabit)
    close()
  }
}

function openTemplatesModal() {
  showSuggestionsModal.value = true
  suggestionsStep.value = 'templates'
}

async function openAiSuggestionsModal() {
  showSuggestionsModal.value = true
  
  aiTasksStore.connect()
  
  const runningTask = aiTasksStore.getActiveTaskByType(HABIT_TASK_TYPE)
  if (runningTask) {
    suggestionsStep.value = 'loading'
    await waitForExistingTask(runningTask.task_id)
    return
  }
  
  const completedTask = aiTasksStore.getCompletedTaskByType(HABIT_TASK_TYPE)
  const cachedResult = aiTasksStore.getTaskResult(HABIT_TASK_TYPE)
  
  if (completedTask || cachedResult) {
    const viewedTaskIds = getViewedHabitResults()
    const taskId = completedTask?.task_id || 'cached'
    
    if (!viewedTaskIds.includes(String(taskId))) {
      const result = cachedResult || completedTask?.result
      if (result) {
        handleHabitSuggestionsResult(result)
        markHabitResultViewed(taskId)
        return
      }
    }
  }
  
  if (skipHabitSuggestionsIntro.value) {
    startHabitSuggestions()
  } else {
    suggestionsStep.value = 'intro'
  }
}

function closeSuggestionsModal() {
  showSuggestionsModal.value = false
  
  const runningTask = aiTasksStore.getActiveTaskByType(HABIT_TASK_TYPE)
  if (!runningTask) {
    suggestionsStep.value = skipHabitSuggestionsIntro.value ? 'templates' : 'intro'
    aiSuggestedHabits.value = []
    selectedAiHabits.value = []
    createdAiHabits.value = []
    suggestionsErrorMessage.value = ''
  }
}

function saveSkipIntroPreference() {
  localStorage.setItem('skipHabitSuggestionsIntro', skipHabitSuggestionsIntro.value.toString())
}

function showTemplateHabits() {
  suggestionsStep.value = 'templates'
}

function selectSuggestedHabit(habit) {
  formData.value = {
    name: habit.name,
    icon: habit.icon,
    description: habit.description || '',
    xpReward: habit.xpReward || 10,
    xpPenalty: 0,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    reminderTime: ''
  }
  showDescriptionField.value = !!(habit.description)
  closeSuggestionsModal()
}

function getViewedHabitResults() {
  try {
    const stored = localStorage.getItem(HABIT_VIEWED_RESULTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markHabitResultViewed(taskId) {
  const viewed = getViewedHabitResults()
  if (!viewed.includes(String(taskId))) {
    viewed.push(String(taskId))
    if (viewed.length > 10) viewed.shift()
    localStorage.setItem(HABIT_VIEWED_RESULTS_KEY, JSON.stringify(viewed))
  }
}

function toggleAiHabitSelection(idx) {
  const index = selectedAiHabits.value.indexOf(idx)
  if (index === -1) {
    selectedAiHabits.value.push(idx)
  } else {
    selectedAiHabits.value.splice(index, 1)
  }
}

function getHabitsWord(count) {
  if (count === 1) return 'привычка'
  if (count >= 2 && count <= 4) return 'привычки'
  return 'привычек'
}

async function startHabitSuggestions() {
  suggestionsStep.value = 'loading'
  selectedAiHabits.value = []
  
  try {
    aiTasksStore.connect()
    
    const userData = prepareUserDataForHabits()
    
    const result = await aiTasksStore.startTaskAndWait('habit_create_help', userData, 120000)
    
    if (result.status === 'already_running' && result.task_id) {
      await waitForExistingTask(result.task_id)
    } else {
      handleHabitSuggestionsResult(result)
    }
  } catch (error) {
    console.error('[AddHabitModal] AI suggestion error:', error)
    suggestionsErrorMessage.value = error.message || 'Произошла ошибка при генерации привычек'
    suggestionsStep.value = 'error'
  }
}

async function waitForExistingTask(taskId) {
  const maxAttempts = 60
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const status = await aiTasksStore.getTaskStatus(taskId)
    
    if (!status) {
      suggestionsErrorMessage.value = 'Не удалось получить статус задачи'
      suggestionsStep.value = 'error'
      return
    }
    
    if (status.status === 'completed' && status.result) {
      handleHabitSuggestionsResult(status.result)
      return
    }
    
    if (status.status === 'failed') {
      suggestionsErrorMessage.value = status.error?.message || 'Ошибка генерации'
      suggestionsStep.value = 'error'
      return
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }
  
  suggestionsErrorMessage.value = 'Время ожидания истекло'
  suggestionsStep.value = 'error'
}

function handleHabitSuggestionsResult(result, taskId = null) {
  const habits = result.habits || result.suggestions || []
  
  if (habits.length > 0) {
    aiSuggestedHabits.value = habits.map((h, idx) => ({
      id: `habit-${Date.now()}-${idx}`,
      name: h.name,
      icon: h.icon || 'fire',
      description: h.description || '',
      frequencyType: h.frequency_type || 'daily',
      scheduleDays: h.schedule_days || [0, 1, 2, 3, 4, 5, 6],
      scheduleLabel: h.schedule_label || 'Каждый день',
      xpReward: h.xp_reward || 10,
      whyUseful: h.why_useful || '',
      trigger: h.trigger || ''
    }))
    suggestionsStep.value = 'selection'
    
    const completedTask = aiTasksStore.getCompletedTaskByType(HABIT_TASK_TYPE)
    const idToMark = taskId || completedTask?.task_id || `result_${Date.now()}`
    markHabitResultViewed(idToMark)
  } else {
    suggestionsErrorMessage.value = 'Не удалось получить рекомендации'
    suggestionsStep.value = 'error'
  }
}

function prepareUserDataForHabits() {
  const lifeSpheres = appStore.lifeSpheres || []
  const goals = appStore.ideas || []
  const existingHabits = habitsStore.habits || appStore.habits || []
  
  return {
    spheres: lifeSpheres.map(s => ({
      id: s.id,
      name: s.name,
      score: s.score || 0,
      reflection: s.reflection || {}
    })),
    growthZones: lifeSpheres
      .filter(s => s.score > 0 && s.score <= 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        score: s.score,
        desired: s.reflection?.desired || '',
        prevents: s.reflection?.prevents || ''
      })),
    goals: goals.slice(0, 5).map(g => ({
      text: g.text,
      sphereId: g.sphereId
    })),
    existingHabits: existingHabits.map(h => h.name)
  }
}

async function confirmAiHabitSelection() {
  createdAiHabits.value = []
  
  const selected = selectedAiHabits.value.map(idx => aiSuggestedHabits.value[idx])
  
  const localHabits = []
  const backendHabitsData = []
  
  for (const habit of selected) {
    const scheduleDays = habit.scheduleDays || [0, 1, 2, 3, 4, 5, 6]
    
    const habitData = {
      name: habit.name,
      icon: habit.icon || 'fire',
      description: habit.description || habit.whyUseful || '',
      xpReward: habit.xpReward || 10,
      xpPenalty: 0,
      frequencyType: habit.frequencyType || 'daily',
      scheduleDays: scheduleDays,
      reminderTime: ''
    }
    
    const localHabit = appStore.addHabit(habitData)
    localHabits.push(localHabit)
    
    createdAiHabits.value.push({
      id: localHabit.id,
      name: habit.name
    })
    
    backendHabitsData.push({
      name: habitData.name,
      description: habitData.description,
      icon: habitData.icon,
      xp_reward: habitData.xpReward,
      xp_penalty: 0,
      schedule_days: scheduleDays
    })
  }
  
  try {
    const backendResult = await habitsStore.createHabits(backendHabitsData)
    if (backendResult.success && backendResult.habitIds) {
      backendResult.habitIds.forEach((backendId, index) => {
        if (localHabits[index] && backendId) {
          appStore.updateHabit(localHabits[index].id, { backendId })
        }
      })
    }
  } catch (error) {
    console.error('[AddHabitModal] Backend sync error for habits:', error)
  }
  
  suggestionsStep.value = 'confirmation'
  
  aiTasksStore.clearTaskResult(HABIT_TASK_TYPE)
  
  toast.showToast({ 
    title: `Добавлено ${createdAiHabits.value.length} ${getHabitsWord(createdAiHabits.value.length)}`, 
    type: 'success' 
  })
  
  emit('created', { multiple: true, habits: createdAiHabits.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.suggestions-overlay {
  z-index: 2100;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-compact {
  max-width: 420px;
}

.modal-suggestions {
  max-width: 560px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.header-name-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  background: transparent;
  padding: 0;
  min-width: 0;
}

.header-name-input::placeholder {
  color: var(--text-tertiary, #9ca3af);
  font-weight: 500;
}

.ai-header h3 {
  color: #6366f1;
}

.ai-icon {
  color: #6366f1;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 16px 20px;
}

.modal-content {
  padding: 24px;
}

.header-icon-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.header-icon-btn:hover {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.header-icon-btn.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.action-chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.action-chip.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-chip-danger {
  color: var(--text-muted);
}

.action-chip-danger:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
  background: color-mix(in srgb, var(--danger-color) 5%, transparent);
}

.action-bar-spacer {
  flex: 1;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-create:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expand-section {
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-top: 10px;
}

.icon-grid-full {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.icon-option {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: var(--bg-primary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-option:hover {
  border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
  transform: scale(1.1);
}

.icon-option.selected {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.suggest-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.suggest-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.suggest-link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: opacity 0.2s;
}

.suggest-link-btn:hover {
  opacity: 0.7;
}

.suggest-dot {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
}

.form-input::placeholder {
  color: #9ca3af;
}

.description-input {
  resize: none;
  margin-top: 12px;
}

.xp-slider-row {
  margin-bottom: 16px;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.xp-slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xp-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  appearance: none;
  cursor: pointer;
}

.xp-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

.xp-slider.penalty::-webkit-slider-thumb {
  background: #ef4444;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

.xp-slider-value {
  min-width: 70px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
  text-align: center;
}

.xp-slider-value.penalty {
  background: color-mix(in srgb, var(--danger-color) 8%, transparent);
  color: var(--danger-color);
}

.schedule-presets {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.preset-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.preset-btn.active {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  color: var(--primary-color);
}

.days-row {
  display: flex;
  gap: 4px;
}

.day-btn-compact {
  flex: 1;
  padding: 5px 2px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.day-btn-compact:hover {
  border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
}

.day-btn-compact.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.penalty-field {
  padding: 12px;
  background: color-mix(in srgb, var(--danger-color) 5%, transparent);
  border-radius: 12px;
  margin-top: 12px;
}


.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-intro-section {
  text-align: center;
  padding: 20px 0;
}

.ai-intro-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.ai-intro-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.ai-intro-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
}

.ai-intro-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.ai-feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  font-size: 13px;
  color: #4b5563;
}

.ai-feature-item svg {
  color: #6366f1;
}

.btn-ai-action {
  width: 100%;
  padding: 14px;
  font-size: 15px;
}

.ai-skip-intro-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
}

.ai-skip-intro-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.ai-loading-section {
  text-align: center;
  padding: 40px 0;
}

.ai-loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ai-loading-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-loading-hint {
  font-size: 14px;
  color: #9ca3af;
}

.ai-selection-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-selection-hint {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.ai-suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.ai-suggestion-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-suggestion-card:hover {
  border-color: #c7d2fe;
}

.ai-suggestion-card.selected {
  border-color: #6366f1;
  background: #f5f3ff;
}

.ai-suggestion-checkbox {
  color: #d1d5db;
  flex-shrink: 0;
}

.ai-suggestion-card.selected .ai-suggestion-checkbox {
  color: #6366f1;
}

.ai-suggestion-content {
  flex: 1;
  min-width: 0;
}

.ai-suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ai-habit-emoji {
  font-size: 20px;
}

.ai-suggestion-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.ai-suggestion-reason {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
}

.ai-suggestion-reason svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #6366f1;
}

.ai-habit-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-habit-schedule,
.ai-habit-xp {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.ai-habit-schedule {
  background: #f3f4f6;
  color: #4b5563;
}

.ai-habit-xp {
  background: #eef2ff;
  color: #6366f1;
}

.ai-selection-actions {
  display: flex;
  gap: 12px;
}

.ai-selection-actions .btn {
  flex: 1;
}

.ai-confirmation-section {
  text-align: center;
  padding: 20px 0;
}

.ai-success-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.ai-confirmation-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-confirmation-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.ai-created-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.ai-created-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
}

.ai-created-icon {
  color: #10b981;
}

.ai-error-section {
  text-align: center;
  padding: 20px 0;
}

.ai-error-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}

.ai-error-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-error-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.ai-error-actions {
  display: flex;
  gap: 12px;
}

.ai-error-actions .btn {
  flex: 1;
}

.ai-templates-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-templates-hint {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.suggestions-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-category {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 20px;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.category-habits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-habit {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.suggestion-habit:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.habit-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.habit-details {
  flex: 1;
  min-width: 0;
}

.habit-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.habit-desc {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.habit-schedule-badge {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    margin: 10px;
    max-height: calc(100vh - 40px);
  }
  
  .icon-grid-full {
    grid-template-columns: repeat(6, 1fr);
  }

  .ai-intro-features {
    grid-template-columns: 1fr;
  }

  .action-chip {
    padding: 6px 10px;
    font-size: 12px;
  }

  .btn-create {
    padding: 7px 16px;
    font-size: 13px;
  }

  .preset-btn {
    padding: 5px 6px;
    font-size: 0.6875rem;
  }
}
</style>
