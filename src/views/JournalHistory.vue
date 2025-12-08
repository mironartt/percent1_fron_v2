<template>
  <div class="journal-history">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1>Дневник</h1>
          <p class="subtitle">История ваших записей и рефлексий</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge" v-if="journalStreak > 0">
            <Flame :size="18" :stroke-width="1.5" />
            <span>{{ journalStreak }} {{ pluralize(journalStreak, 'день', 'дня', 'дней') }} подряд</span>
          </div>
          <div class="stat-badge secondary">
            <BookOpen :size="18" :stroke-width="1.5" />
            <span>{{ totalEntries }} {{ pluralize(totalEntries, 'запись', 'записи', 'записей') }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="content-layout">
      <div class="main-content">
        <div class="today-cta card" v-if="journalEntries.length > 0 || isLoading">
          <div class="cta-content">
            <BookOpen :size="32" :stroke-width="1.5" class="cta-icon" />
            <div>
              <h3 v-if="!hasTodayEntry">Заполните итоги сегодняшнего дня</h3>
              <h3 v-else>Добавить новую запись</h3>
              <p>Рефлексия помогает осознанно двигаться к целям</p>
            </div>
          </div>
          <button class="btn btn-primary" @click="openTodayEntry">
            <Pencil :size="16" :stroke-width="1.5" />
            {{ hasTodayEntry ? 'Редактировать' : 'Написать' }}
          </button>
        </div>

        <div class="search-bar">
          <Search :size="18" :stroke-width="1.5" class="search-icon" />
          <input 
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Поиск по записям (мин. 3 символа)..."
            class="search-input"
          />
        </div>

        <div v-if="isLoading && journalEntries.length === 0" class="loading-state">
          <Loader2 :size="32" :stroke-width="1.5" class="spin" />
          <span>Загрузка записей...</span>
        </div>

        <div class="entries-list">
          <div 
            v-for="entry in journalEntries" 
            :key="entry.id"
            class="entry-card card"
            :class="{ 'is-today': isToday(entry.date) }"
          >
            <div class="entry-header">
              <div class="entry-date">
                <CalendarDays :size="16" :stroke-width="1.5" />
                <span>{{ formatDate(entry.date) }}</span>
                <span v-if="isToday(entry.date)" class="today-badge">Сегодня</span>
              </div>
              <div class="entry-actions">
                <button 
                  class="action-btn edit-btn"
                  @click.stop="editEntry(entry)"
                  title="Редактировать"
                >
                  <Edit2 :size="16" :stroke-width="1.5" />
                </button>
                <button 
                  class="action-btn delete-btn"
                  @click.stop="deleteEntry(entry)"
                  title="Удалить"
                >
                  <Trash2 :size="16" :stroke-width="1.5" />
                </button>
                <button 
                  class="expand-btn"
                  @click="toggleExpand(entry.id)"
                >
                  <ChevronDown 
                    :size="18" 
                    :stroke-width="1.5" 
                    :class="{ rotated: expandedEntries.includes(entry.id) }" 
                  />
                </button>
              </div>
            </div>

            <div class="entry-summary" v-if="!expandedEntries.includes(entry.id)">
              <p v-if="entry.whatDone">{{ truncate(entry.whatDone, 120) }}</p>
            </div>

            <div class="entry-full" v-if="expandedEntries.includes(entry.id)">
              <div class="entry-section" v-if="entry.whatDone">
                <h4><CheckCircle :size="14" :stroke-width="1.5" /> Что сделал</h4>
                <p>{{ entry.whatDone }}</p>
              </div>

              <div class="entry-section" v-if="entry.whatNotDone">
                <h4><XCircle :size="14" :stroke-width="1.5" /> Что не сделал</h4>
                <p>{{ entry.whatNotDone }}</p>
              </div>

              <div class="entry-section" v-if="entry.reflection">
                <h4><Lightbulb :size="14" :stroke-width="1.5" /> Рефлексия</h4>
                <p>{{ entry.reflection }}</p>
              </div>

              <div class="entry-section" v-if="entry.tomorrowPlans">
                <h4><ListTodo :size="14" :stroke-width="1.5" /> Планы на завтра</h4>
                <p>{{ entry.tomorrowPlans }}</p>
              </div>

              <div v-if="entry.aiResponse" class="ai-response-mini">
                <div class="ai-header">
                  <Sparkles :size="14" :stroke-width="1.5" />
                  <span>AI-коуч</span>
                </div>
                <p>{{ entry.aiResponse }}</p>
              </div>
            </div>
          </div>

          <div v-if="journalEntries.length === 0 && !isLoading" class="empty-state">
            <BookOpen :size="48" :stroke-width="1" class="empty-icon" />
            <h3>Пока нет записей</h3>
            <p>Начните вести дневник — записывайте итоги дня и получайте обратную связь от AI-коуча</p>
            <button class="btn btn-primary" @click="openTodayEntry">
              Создать первую запись
            </button>
          </div>

          <button 
            v-if="currentPage < totalPages && journalEntries.length > 0"
            class="btn btn-outline load-more-btn"
            :disabled="isLoading"
            @click="loadMore"
          >
            <Loader2 v-if="isLoading" :size="16" :stroke-width="1.5" class="spin" />
            <span v-else>Загрузить ещё</span>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showEntryModal" class="modal-overlay" @click.self="showEntryModal = false">
        <div class="modal-container">
          <button class="modal-close" @click="showEntryModal = false">
            <X :size="20" :stroke-width="1.5" />
          </button>
          <JournalEntry :editing-entry="editingEntry" @saved="onEntrySaved" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import JournalEntry from '@/components/JournalEntry.vue'
import { 
  BookOpen, 
  Flame, 
  Pencil, 
  CalendarDays, 
  ChevronDown,
  CheckCircle,
  XCircle,
  Lightbulb,
  ListTodo,
  Sparkles,
  X,
  Trash2,
  Edit2,
  Loader2,
  Search
} from 'lucide-vue-next'

const store = useAppStore()

const showEntryModal = ref(false)
const expandedEntries = ref([])
const isLoading = ref(false)
const editingEntry = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

const journalEntries = computed(() => store.journal.entries || [])
const journalStreak = computed(() => store.journalStreak)
const totalEntries = computed(() => totalItems.value || journalEntries.value.length)

// Track if today's entry exists from backend (independent of filters)
const hasTodayEntryFromBackend = ref(false)
const todayDateStr = computed(() => new Date().toISOString().split('T')[0])

// Combined check: either from backend tracking or from local store
const hasTodayEntry = computed(() => {
  return hasTodayEntryFromBackend.value || store.hasTodayEntry
})

// Load diary entries from backend
async function loadDiaryEntries(page = 1, isFiltered = false) {
  isLoading.value = true
  try {
    const { getDiaryEntries } = await import('@/services/api.js')
    const params = {
      order_by: 'date_created',
      order_direction: 'desc',
      page: page
    }
    
    if (searchQuery.value && searchQuery.value.length >= 3) {
      params.query_filter = searchQuery.value
    }
    
    const result = await getDiaryEntries(params)
    
    if (result.status === 'ok' && result.data) {
      const backendEntries = (result.data.diaries_data || []).map(entry => ({
        id: String(entry.diary_id),
        backendId: entry.diary_id,
        date: entry.date_created.split(' ')[0],
        whatDone: entry.what_done || '',
        whatNotDone: entry.what_not_done || '',
        reflection: entry.reflection || '',
        tomorrowPlans: entry.plans || '',
        dateCreated: entry.date_created
      }))
      
      if (page === 1) {
        store.journal.entries = backendEntries
        
        // On first page load without filters, check for today's entry
        if (!isFiltered || !searchQuery.value) {
          hasTodayEntryFromBackend.value = backendEntries.some(
            entry => entry.date === todayDateStr.value
          )
        }
      } else {
        store.journal.entries = [...store.journal.entries, ...backendEntries]
      }
      
      currentPage.value = result.data.page || 1
      totalPages.value = result.data.total_pages || 1
      totalItems.value = result.data.total_items || 0
    }
  } catch (error) {
    console.error('[JournalHistory] Error loading diary entries:', error)
  } finally {
    isLoading.value = false
  }
}

// Search with debounce
let searchTimeout = null
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    // Pass isFiltered=true when search query is present
    loadDiaryEntries(1, searchQuery.value.length >= 3)
  }, 500)
}

function loadMore() {
  if (currentPage.value < totalPages.value) {
    loadDiaryEntries(currentPage.value + 1)
  }
}

// Delete entry
async function deleteEntry(entry) {
  if (!confirm('Удалить эту запись?')) return
  
  try {
    const { deleteDiaryEntry } = await import('@/services/api.js')
    
    // Optimistic UI update
    store.journal.entries = store.journal.entries.filter(e => e.id !== entry.id)
    totalItems.value--
    
    // Sync with backend
    if (entry.backendId) {
      await deleteDiaryEntry(entry.backendId)
    }
  } catch (error) {
    console.error('[JournalHistory] Error deleting entry:', error)
    // Reload on error
    loadDiaryEntries(1)
  }
}

// Edit entry
function editEntry(entry) {
  editingEntry.value = entry
  showEntryModal.value = true
}

onMounted(() => {
  loadDiaryEntries(1)
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'long' 
  })
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function toggleExpand(entryId) {
  const index = expandedEntries.value.indexOf(entryId)
  if (index === -1) {
    expandedEntries.value.push(entryId)
  } else {
    expandedEntries.value.splice(index, 1)
  }
}

function openTodayEntry() {
  // Check if there's already an entry for today
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = journalEntries.value.find(e => e.date === today)
  
  if (todayEntry) {
    // Open with existing data for editing
    editingEntry.value = todayEntry
  } else {
    editingEntry.value = null
  }
  showEntryModal.value = true
}

function onEntrySaved() {
  showEntryModal.value = false
  editingEntry.value = null
  // Reload entries from backend
  loadDiaryEntries(1)
}
</script>

<style scoped>
.journal-history {
  max-width: var(--content-width-narrow);
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--container-padding);
  box-sizing: border-box;
}

.page-header {
  padding: 2rem 0;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.15));
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--warning-color);
}

.stat-badge.secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.stat-badge svg {
  flex-shrink: 0;
}

.today-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-color: rgba(99, 102, 241, 0.2);
}

.cta-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cta-icon {
  color: var(--primary-color);
}

.cta-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.cta-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 3rem;
}

.entry-card {
  padding: 1.25rem;
}

.entry-card.is-today {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(139, 92, 246, 0.02));
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.entry-date svg {
  color: var(--text-tertiary);
}

.today-badge {
  padding: 0.125rem 0.5rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.expand-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

.entry-summary {
  margin-top: 0.75rem;
}

.entry-summary p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.entry-full {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.entry-section {
  margin-bottom: 1rem;
}

.entry-section:last-child {
  margin-bottom: 0;
}

.entry-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 0.375rem 0;
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

.ai-response-mini {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.06);
  border-radius: var(--radius-md);
}

.ai-response-mini .ai-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.ai-response-mini p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  z-index: 10;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Search bar */
.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Entry actions */
.entry-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
}

.action-btn.edit-btn:hover {
  color: var(--primary-color);
}

.action-btn.delete-btn:hover {
  color: var(--danger-color);
}

/* Load more button */
.load-more-btn {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .today-cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .today-cta .btn {
    width: 100%;
  }
  
  .cta-content {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
