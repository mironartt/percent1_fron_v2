<template>
  <div class="journal-entry-container">
    <div class="journal-card card">
      <div class="journal-header">
        <div class="header-left">
          <BookOpen :size="24" :stroke-width="1.5" class="header-icon" />
          <div>
            <h2 class="journal-title">Итоги дня</h2>
            <span class="journal-date">{{ formattedDate }}</span>
          </div>
        </div>
        <button 
          v-if="!isEditing && hasTodayEntry" 
          class="edit-btn"
          @click="startEditing"
        >
          <Pencil :size="16" :stroke-width="1.5" />
          Редактировать
        </button>
      </div>

      <form v-if="isEditing || !hasTodayEntry" @submit.prevent="saveEntry" class="journal-form">
        <div class="form-section">
          <label class="form-label">
            <CheckCircle :size="16" :stroke-width="1.5" />
            Что сделал за день?
          </label>
          <textarea
            v-model="form.whatDone"
            class="form-textarea"
            placeholder="Опишите конкретные действия, даже если их было мало..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-section">
          <label class="form-label">
            <XCircle :size="16" :stroke-width="1.5" />
            Что не сделал и почему?
          </label>
          <textarea
            v-model="form.whatNotDone"
            class="form-textarea"
            placeholder="Если что-то не удалось — напишите почему (опционально)"
            rows="2"
          ></textarea>
        </div>

        <div class="form-section">
          <label class="form-label">
            <Lightbulb :size="16" :stroke-width="1.5" />
            Рефлексия дня
          </label>
          <textarea
            v-model="form.reflection"
            class="form-textarea"
            placeholder="Что получилось? Что не получилось? Какие инсайты?"
            rows="3"
          ></textarea>
        </div>

        <div class="form-section">
          <label class="form-label">
            <ListTodo :size="16" :stroke-width="1.5" />
            Планы на завтра (1-3 задачи)
          </label>
          <textarea
            v-model="form.tomorrowPlans"
            class="form-textarea"
            placeholder="Запишите 1-3 основных задачи на завтра..."
            rows="2"
          ></textarea>
        </div>

        <div class="form-actions">
          <button 
            v-if="isEditing && hasTodayEntry" 
            type="button" 
            class="btn btn-secondary"
            @click="cancelEditing"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="!isFormValid || saving"
          >
            <Loader2 v-if="saving" :size="18" :stroke-width="1.5" class="spin" />
            <Send v-else :size="18" :stroke-width="1.5" />
            {{ saving ? 'Сохранение...' : 'Сохранить и получить ответ AI' }}
          </button>
        </div>
      </form>

      <div v-else class="journal-view">
        <div class="entry-section" v-if="todayEntry.whatDone">
          <h4><CheckCircle :size="16" :stroke-width="1.5" /> Что сделал</h4>
          <p>{{ todayEntry.whatDone }}</p>
        </div>

        <div class="entry-section" v-if="todayEntry.whatNotDone">
          <h4><XCircle :size="16" :stroke-width="1.5" /> Что не сделал</h4>
          <p>{{ todayEntry.whatNotDone }}</p>
        </div>

        <div class="entry-section" v-if="todayEntry.reflection">
          <h4><Lightbulb :size="16" :stroke-width="1.5" /> Рефлексия</h4>
          <p>{{ todayEntry.reflection }}</p>
        </div>

        <div class="entry-section" v-if="todayEntry.tomorrowPlans">
          <h4><ListTodo :size="16" :stroke-width="1.5" /> Планы на завтра</h4>
          <p>{{ todayEntry.tomorrowPlans }}</p>
        </div>
      </div>

      <div v-if="todayEntry?.aiResponse" class="ai-response">
        <div class="ai-header">
          <div class="ai-avatar">
            <Sparkles :size="18" :stroke-width="1.5" />
          </div>
          <span>AI-коуч</span>
        </div>
        <div class="ai-content">
          {{ todayEntry.aiResponse }}
        </div>
      </div>

      <div v-if="todayEntry?.aiResponseLoading" class="ai-loading">
        <Loader2 :size="20" :stroke-width="1.5" class="spin" />
        <span>AI-коуч анализирует вашу запись...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  ListTodo, 
  Send, 
  Pencil,
  Sparkles,
  Loader2
} from 'lucide-vue-next'

const props = defineProps({
  editingEntry: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['saved'])
const store = useAppStore()

const isEditing = ref(false)
const saving = ref(false)
const currentEntryId = ref(null)
const currentBackendId = ref(null)

const form = ref({
  whatDone: '',
  whatNotDone: '',
  reflection: '',
  tomorrowPlans: ''
})

const hasTodayEntry = computed(() => store.hasTodayEntry)
const todayEntry = computed(() => store.todayJournalEntry)

// Initialize form with editing entry data
watch(() => props.editingEntry, (entry) => {
  if (entry) {
    form.value = {
      whatDone: entry.whatDone || '',
      whatNotDone: entry.whatNotDone || '',
      reflection: entry.reflection || '',
      tomorrowPlans: entry.tomorrowPlans || ''
    }
    currentEntryId.value = entry.id
    currentBackendId.value = entry.backendId || null
    isEditing.value = true
  } else {
    currentEntryId.value = null
    currentBackendId.value = null
    isEditing.value = false
  }
}, { immediate: true })

const formattedDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('ru-RU', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
})

const isFormValid = computed(() => {
  return form.value.whatDone.trim().length > 0 || 
         form.value.reflection.trim().length > 0
})

function startEditing() {
  if (todayEntry.value) {
    form.value = {
      whatDone: todayEntry.value.whatDone || '',
      whatNotDone: todayEntry.value.whatNotDone || '',
      reflection: todayEntry.value.reflection || '',
      tomorrowPlans: todayEntry.value.tomorrowPlans || ''
    }
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  form.value = {
    whatDone: '',
    whatNotDone: '',
    reflection: '',
    tomorrowPlans: ''
  }
}

async function saveEntry() {
  if (!isFormValid.value) return
  
  saving.value = true
  
  try {
    const { updateDiaryEntry } = await import('@/services/api.js')
    
    // Prepare data for backend
    const backendData = {
      diary_id: currentBackendId.value || null,
      what_done: form.value.whatDone,
      what_not_done: form.value.whatNotDone,
      reflection: form.value.reflection,
      plans: form.value.tomorrowPlans
    }
    
    const isUpdate = !!currentBackendId.value
    let localEntry
    
    if (isUpdate) {
      // Update existing entry in store
      localEntry = store.updateJournalEntry(currentEntryId.value, {
        whatDone: form.value.whatDone,
        whatNotDone: form.value.whatNotDone,
        reflection: form.value.reflection,
        tomorrowPlans: form.value.tomorrowPlans
      })
    } else {
      // Create new entry in store
      localEntry = store.addJournalEntry({
        whatDone: form.value.whatDone,
        whatNotDone: form.value.whatNotDone,
        reflection: form.value.reflection,
        tomorrowPlans: form.value.tomorrowPlans
      })
    }
    
    isEditing.value = false
    emit('saved', localEntry)
    
    // Track activation task
    try {
      const { useActivationStore } = await import('@/stores/activation.js')
      const { useAppStore } = await import('@/stores/app.js')
      const activationStore = useActivationStore()
      const result = activationStore.completeTask('write_reflection')
      if (result.completed && result.message) {
        const appStore = useAppStore()
        appStore.sendMentorMessage(result.message, 'assistant')
      }
    } catch (e) {
      console.error('[JournalEntry] Activation tracking error:', e)
    }
    
    // Sync with backend
    try {
      const result = await updateDiaryEntry(backendData)
      
      if (result.status === 'ok' && result.data?.diary_id) {
        // Update local entry with backend ID
        if (localEntry && !isUpdate) {
          localEntry.backendId = result.data.diary_id
          localEntry.id = String(result.data.diary_id)
        }
      }
    } catch (apiError) {
      console.error('[JournalEntry] Error syncing to backend:', apiError)
    }
    
    // Get AI response (demo mode) - only for new entries
    if (!isUpdate && localEntry) {
      store.setJournalAILoading(localEntry.id, true)
      const aiResponse = await getAIResponse(form.value)
      store.updateJournalAIResponse(localEntry.id, aiResponse)
    }
    
  } catch (error) {
    console.error('Error saving journal entry:', error)
  } finally {
    saving.value = false
  }
}

async function getAIResponse(entryData) {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const responses = [
    `Отличная работа сегодня! Вижу, что вы продвинулись вперёд. Особенно ценно, что вы отметили "${entryData.whatDone.substring(0, 50)}...". Продолжайте в том же духе!`,
    `Рад видеть вашу рефлексию. Планы на завтра выглядят реалистично. Помните: маленькие шаги каждый день приводят к большим результатам.`,
    `Хороший день! Заметил, что вы честно оценили, что не получилось — это важный навык. Завтра у вас есть возможность улучшиться на 1%.`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

watch(() => todayEntry.value, (entry) => {
  if (entry && !isEditing.value) {
    form.value = {
      whatDone: entry.whatDone || '',
      whatNotDone: entry.whatNotDone || '',
      reflection: entry.reflection || '',
      tomorrowPlans: entry.tomorrowPlans || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
.journal-entry-container {
  max-width: 700px;
  margin: 0 auto;
}

.journal-card {
  padding: 0;
  overflow: hidden;
}

.journal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  color: var(--primary-color);
}

.journal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.journal-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.journal-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-label svg {
  color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 0.875rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.journal-view {
  padding: 1.5rem;
}

.entry-section {
  margin-bottom: 1.25rem;
}

.entry-section:last-child {
  margin-bottom: 0;
}

.entry-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.entry-section h4 svg {
  color: var(--primary-color);
}

.entry-section p {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.ai-response {
  margin: 0 1.5rem 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-lg);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-header span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.ai-content {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
