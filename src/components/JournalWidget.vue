<template>
  <div class="journal-widget card" :class="{ 'has-entry': hasTodayEntry }">
    <template v-if="!hasTodayEntry">
      <div class="widget-cta">
        <div class="cta-icon">
          <BookOpen :size="28" :stroke-width="1.5" />
        </div>
        <div class="cta-content">
          <h3>Заполните итоги дня</h3>
          <p>Отрефлексируйте день и получите обратную связь от AI-коуча</p>
        </div>
        <button class="btn btn-primary" @click="$emit('open')">
          <Pencil :size="16" :stroke-width="1.5" />
          Написать
        </button>
      </div>
      
      <div v-if="journalStreak > 0" class="streak-info">
        <Flame :size="16" :stroke-width="1.5" />
        <span>Стрик: {{ journalStreak }} {{ pluralize(journalStreak, 'день', 'дня', 'дней') }}</span>
      </div>
    </template>

    <template v-else>
      <div class="widget-header">
        <div class="header-title">
          <BookOpen :size="18" :stroke-width="1.5" />
          <span>Итоги дня</span>
        </div>
        <div class="streak-badge" v-if="journalStreak > 0">
          <Flame :size="14" :stroke-width="1.5" />
          {{ journalStreak }}
        </div>
      </div>

      <div class="entry-preview">
        <div class="preview-section" v-if="todayEntry?.whatDone">
          <CheckCircle :size="14" :stroke-width="1.5" />
          <span>{{ truncate(todayEntry.whatDone, 60) }}</span>
        </div>
        
        <div class="preview-section" v-if="todayEntry?.tomorrowPlans">
          <ListTodo :size="14" :stroke-width="1.5" />
          <span>{{ truncate(todayEntry.tomorrowPlans, 60) }}</span>
        </div>
      </div>

      <div v-if="todayEntry?.aiResponse" class="ai-mini">
        <div class="ai-avatar-mini">
          <Sparkles :size="12" :stroke-width="1.5" />
        </div>
        <span>{{ truncate(todayEntry.aiResponse, 80) }}</span>
      </div>

      <div class="widget-actions">
        <button class="btn btn-secondary btn-sm" @click="$emit('open')">
          <Eye :size="14" :stroke-width="1.5" />
          Посмотреть
        </button>
        <router-link to="/app/journal" class="btn btn-outline btn-sm">
          История
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  BookOpen, 
  Pencil, 
  Flame, 
  CheckCircle, 
  ListTodo, 
  Sparkles,
  Eye
} from 'lucide-vue-next'

defineEmits(['open'])

const store = useAppStore()

const hasTodayEntry = computed(() => store.hasTodayEntry)
const todayEntry = computed(() => store.todayJournalEntry)
const journalStreak = computed(() => store.journalStreak)

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
</script>

<style scoped>
.journal-widget {
  padding: 1.25rem;
}

.journal-widget.has-entry {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03));
}

.widget-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cta-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.cta-content {
  flex: 1;
}

.cta-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.cta-content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.streak-info svg {
  color: var(--warning-color);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-title svg {
  color: var(--primary-color);
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.15));
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--warning-color);
}

.entry-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.preview-section {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.preview-section svg {
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.ai-mini {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.ai-avatar-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.ai-mini span {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.widget-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>
