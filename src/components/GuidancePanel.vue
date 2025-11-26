<template>
  <div class="guidance-panel" :class="{ 'guidance-panel--sticky': sticky }">
    <div class="guidance-header" v-if="title">
      <span class="guidance-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
    </div>
    
    <div class="guidance-content">
      <div v-if="tips && tips.length > 0" class="tips-section">
        <div 
          v-for="(tip, index) in tips" 
          :key="index" 
          class="tip-item"
          :class="{ 'tip-item--highlight': tip.highlight }"
        >
          <span class="tip-icon">{{ tip.icon || '💡' }}</span>
          <div class="tip-content">
            <p class="tip-text">{{ tip.text }}</p>
            <p v-if="tip.example" class="tip-example">
              <strong>Пример:</strong> {{ tip.example }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="checklist && checklist.length > 0" class="checklist-section">
        <h4 class="checklist-title">{{ checklistTitle || 'Чек-лист' }}</h4>
        <div 
          v-for="(item, index) in checklist" 
          :key="index" 
          class="checklist-item"
          :class="{ 'checklist-item--done': item.done }"
        >
          <span class="checklist-check">{{ item.done ? '✓' : '○' }}</span>
          <span class="checklist-text">{{ item.text }}</span>
        </div>
      </div>

      <div v-if="warning" class="warning-section">
        <span class="warning-icon">⚠️</span>
        <p class="warning-text">{{ warning }}</p>
      </div>

      <div v-if="showAICoach" class="ai-coach-section">
        <div class="coach-header">
          <span class="coach-icon">🤖</span>
          <h4>ИИ-коуч</h4>
        </div>
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessagesRef">
            <div 
              v-for="(msg, idx) in chatMessages" 
              :key="idx"
              class="message"
              :class="msg.role === 'user' ? 'user-message' : 'coach-message'"
            >
              <span class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
              <div class="message-content">
                <p>{{ msg.content }}</p>
              </div>
            </div>
          </div>
          <div class="chat-input-area">
            <input 
              type="text"
              v-model="userMessage"
              @keyup.enter="sendMessage"
              :placeholder="chatPlaceholder || 'Спросите совет...'"
              class="chat-input"
            />
            <button 
              class="btn-send"
              @click="sendMessage"
              :disabled="!userMessage.trim()"
            >→</button>
          </div>
        </div>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📋'
  },
  tips: {
    type: Array,
    default: () => []
  },
  checklist: {
    type: Array,
    default: () => []
  },
  checklistTitle: {
    type: String,
    default: 'Чек-лист'
  },
  warning: {
    type: String,
    default: ''
  },
  sticky: {
    type: Boolean,
    default: false
  },
  showAICoach: {
    type: Boolean,
    default: false
  },
  chatPlaceholder: {
    type: String,
    default: 'Спросите совет...'
  },
  initialMessage: {
    type: String,
    default: 'Привет! Я помогу тебе на этом шаге. Задай любой вопрос.'
  },
  coachResponses: {
    type: Array,
    default: () => [
      'Хороший вопрос! Давай разберём это подробнее.',
      'Попробуй сформулировать это более конкретно.',
      'Отличная идея! Подумай также о сроках и ресурсах.',
      'Рекомендую начать с самого простого шага.',
      'Помни: главное — регулярность, а не объём.'
    ]
  }
})

const chatMessagesRef = ref(null)
const userMessage = ref('')
const chatMessages = ref([
  { role: 'coach', content: props.initialMessage }
])

watch(() => props.initialMessage, (newMsg) => {
  if (newMsg && chatMessages.value.length === 1) {
    chatMessages.value[0].content = newMsg
  }
})

async function sendMessage() {
  if (!userMessage.value.trim()) return
  
  const msg = userMessage.value
  chatMessages.value.push({ role: 'user', content: msg })
  userMessage.value = ''
  
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
  
  setTimeout(() => {
    const responses = props.coachResponses
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    chatMessages.value.push({ role: 'coach', content: randomResponse })
    
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }, 800)
}
</script>

<style scoped>
.guidance-panel {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.guidance-panel--sticky {
  position: sticky;
  top: 1rem;
}

.guidance-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.guidance-icon {
  font-size: 1.25rem;
}

.guidance-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.guidance-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tips-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  gap: 0.625rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.tip-item--highlight {
  background: rgba(99, 102, 241, 0.08);
  border-left: 3px solid var(--primary-color);
}

.tip-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.tip-example {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-style: italic;
}

.checklist-section {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.checklist-title {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.checklist-item--done {
  color: var(--success-color);
}

.checklist-item--done .checklist-text {
  text-decoration: line-through;
}

.checklist-check {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.warning-section {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--warning-color);
}

.warning-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.warning-text {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.ai-coach-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.coach-icon {
  font-size: 1.125rem;
}

.coach-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 240px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.5rem 0;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-avatar {
  font-size: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  padding: 0.625rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.coach-message .message-content {
  background: var(--bg-secondary);
}

.user-message .message-content {
  background: rgba(99, 102, 241, 0.1);
}

.message-content p {
  margin: 0;
  line-height: 1.45;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.625rem;
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  background: var(--bg-primary);
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-send {
  padding: 0.5rem 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .guidance-panel--sticky {
    position: static;
  }
  
  .chat-container {
    height: 200px;
  }
}
</style>
