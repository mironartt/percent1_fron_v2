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
            {{ saving ? 'Сохранение...' : 'Сохранить и получить ответ от AI ментора' }}
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

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useXPNotification } from '@/composables/useXPNotification.js'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Send, 
  Pencil,
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
const { showJournalEntryXP } = useXPNotification()

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
      showJournalEntryXP()
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
    
    // Open mentor panel and send journal data for AI analysis
    if (localEntry) {
      await sendToMentor(form.value, isUpdate)
    }
    
  } catch (error) {
    console.error('Error saving journal entry:', error)
  } finally {
    saving.value = false
  }
}

async function sendToMentor(entryData, isUpdate) {
  // Open mentor panel
  store.toggleMentorPanel(true)
  
  // Build context message for the mentor
  const journalSummary = buildJournalSummary(entryData)
  
  // Send user's journal as context (system message style)
  const contextMessage = isUpdate 
    ? `Я обновил свой дневник за сегодня:\n\n${journalSummary}`
    : `Вот мои итоги дня:\n\n${journalSummary}`
  
  // Add user context message
  store.sendMentorMessage(contextMessage, 'user')
  
  // Simulate AI thinking delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Generate personalized AI response based on journal content
  const aiResponse = generateMentorResponse(entryData, isUpdate)
  store.sendMentorMessage(aiResponse, 'assistant')
}

function buildJournalSummary(data) {
  let summary = ''
  
  if (data.whatDone) {
    summary += `**Что сделал:** ${data.whatDone}\n\n`
  }
  if (data.whatNotDone) {
    summary += `**Что не сделал:** ${data.whatNotDone}\n\n`
  }
  if (data.reflection) {
    summary += `**Рефлексия:** ${data.reflection}\n\n`
  }
  return summary.trim()
}

function generateMentorResponse(data, isUpdate) {
  const userName = store.user?.first_name || 'друг'
  
  // Analyze what was written
  const hasWhatDone = data.whatDone && data.whatDone.trim().length > 0
  const hasWhatNotDone = data.whatNotDone && data.whatNotDone.trim().length > 0
  const hasReflection = data.reflection && data.reflection.trim().length > 0
  
  let response = ''
  
  if (isUpdate) {
    response = `Отлично, ${userName}! Вижу, что ты дополнил свой дневник. `
  } else {
    response = `Спасибо за рефлексию, ${userName}! `
  }
  
  if (hasWhatDone) {
    const donePreview = data.whatDone.substring(0, 80)
    response += `Вижу, что сегодня ты поработал над "${donePreview}${data.whatDone.length > 80 ? '...' : ''}". Каждый шаг вперёд — это прогресс! `
  }
  
  if (hasWhatNotDone) {
    response += `\n\nТо, что ты честно написал о том, что не получилось — это важный навык самоанализа. Не ругай себя, а используй это как информацию для улучшения. `
  }
  
  if (hasReflection) {
    response += `\n\nТвоя рефлексия показывает, что ты осознанно подходишь к своему развитию. `
  }
  
  response += `\n\n💪 Ты стал на 1% лучше сегодня!`
  
  return response
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
