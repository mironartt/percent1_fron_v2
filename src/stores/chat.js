/**
 * Chat Store - управление состоянием чата с AI Mentor
 * 
 * Функциональность:
 * - Хранение сообщений
 * - Статус соединения WebSocket
 * - Статус обработки бота (is_bot_processing)
 * - Пагинация для загрузки истории
 * - Интеграция с WebSocket и REST API
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'
import { getChatMessages, sendChatMessage, markChatMessagesRead, updateChatReaction } from '@/services/api.js'
import chatWebSocket from '@/services/chatWebSocket.js'

export const useChatStore = defineStore('chat', () => {
  const conversationId = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)
  const isBotProcessing = ref(false)
  const isBotTyping = ref(false)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const connectionStatus = ref('disconnected')
  const forceDisconnected = ref(false)
  const listenersAttached = ref(false)
  
  const pagination = ref({
    page: 1,
    pageSize: 50,
    totalPages: 1,
    totalItems: 0,
    hasMore: false
  })

  const isConnected = computed(() => connectionStatus.value === 'connected')
  const canSendMessage = computed(() => !isBotProcessing.value && !isLoading.value)

  function setConversationId(id) {
    conversationId.value = id
  }

  function setUnreadCount(count) {
    unreadCount.value = count
  }

  function setIsBotProcessing(value) {
    isBotProcessing.value = value
  }

  async function loadMessages(page = 1) {
    if (!conversationId.value) {
      if (DEBUG_MODE) {
        console.warn('[ChatStore] No conversation ID set')
      }
      return { success: false, error: 'no_conversation' }
    }

    const isFirstPage = page === 1
    if (isFirstPage) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    try {
      const result = await getChatMessages({
        conversation_id: conversationId.value,
        order_by: 'date_created',
        order_direction: 'desc',
        page,
        page_size: pagination.value.pageSize
      })

      if (result.status === 'ok' && result.data) {
        const newMessages = (result.data.messages_data || []).reverse()
        
        if (isFirstPage) {
          messages.value = newMessages
        } else {
          messages.value = [...newMessages, ...messages.value]
        }

        pagination.value = {
          page: result.data.page || page,
          pageSize: result.data.page_size || pagination.value.pageSize,
          totalPages: result.data.total_pages || 1,
          totalItems: result.data.total_items || 0,
          hasMore: page < (result.data.total_pages || 1)
        }

        if (DEBUG_MODE) {
          console.log('[ChatStore] Messages loaded:', {
            page,
            count: newMessages.length,
            total: pagination.value.totalItems
          })
        }

        return { success: true }
      }

      return { success: false, error: result.error_data?.message || 'load_failed' }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[ChatStore] Load messages error:', error)
      }
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  async function loadOlderMessages() {
    if (isLoadingMore.value || !pagination.value.hasMore) {
      return { success: false, reason: 'no_more' }
    }

    return loadMessages(pagination.value.page + 1)
  }

  async function sendMessage(content, options = {}) {
    if (!conversationId.value || !content.trim()) {
      return { success: false, error: 'invalid_input' }
    }

    if (isBotProcessing.value) {
      return { success: false, error: 'bot_processing' }
    }

    const messageData = {
      conversation_id: conversationId.value,
      content: content.trim(),
      source_page: options.sourcePage || null,
      client_context: options.clientContext || null,
      reply_to_id: options.replyToId || null
    }

    if (chatWebSocket.isConnected) {
      const sent = chatWebSocket.sendMessage(
        conversationId.value,
        content.trim(),
        options
      )
      
      if (sent) {
        isBotProcessing.value = true
        return { success: true, method: 'websocket' }
      }
    }

    try {
      const result = await sendChatMessage(messageData)
      
      if (result.status === 'ok' && result.data?.message) {
        addMessage(result.data.message)
        isBotProcessing.value = true
        return { success: true, method: 'rest' }
      }

      return { success: false, error: result.error_data?.message || 'send_failed' }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[ChatStore] Send message error:', error)
      }
      return { success: false, error: error.message }
    }
  }

  function addMessage(message) {
    const existingIndex = messages.value.findIndex(m => m.message_id === message.message_id)
    
    if (existingIndex >= 0) {
      messages.value[existingIndex] = message
    } else {
      messages.value.push(message)
    }

    if (message.message_type === 'bot' && message.status !== 'read') {
      unreadCount.value++
    }
  }

  async function markAsRead(messageIds = null) {
    if (!conversationId.value) return { success: false }

    if (chatWebSocket.isConnected) {
      chatWebSocket.markRead(conversationId.value, messageIds)
      unreadCount.value = 0
      return { success: true, method: 'websocket' }
    }

    try {
      const params = { conversation_id: conversationId.value }
      if (messageIds) {
        params.message_ids = messageIds
      }
      
      const result = await markChatMessagesRead(params)
      
      if (result.status === 'ok') {
        unreadCount.value = 0
        return { success: true, method: 'rest' }
      }
      
      return { success: false }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function addReaction(messageId, reactionType, remove = false) {
    if (chatWebSocket.isConnected) {
      chatWebSocket.addReaction(messageId, reactionType, remove)
      return { success: true, method: 'websocket' }
    }

    try {
      const result = await updateChatReaction({
        message_id: messageId,
        reaction_type: reactionType,
        remove
      })
      
      return { success: result.status === 'ok', method: 'rest' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  function setupWebSocketListeners() {
    if (listenersAttached.value) {
      return
    }

    listenersAttached.value = true

    chatWebSocket.on('connected', handleConnected)
    chatWebSocket.on('disconnected', handleDisconnected)
    chatWebSocket.on('reconnecting', handleReconnecting)
    chatWebSocket.on('message_sent', handleMessageSent)
    chatWebSocket.on('new_message', handleNewMessage)
    chatWebSocket.on('bot_typing', handleBotTyping)
    chatWebSocket.on('force_disconnect', handleForceDisconnect)
    chatWebSocket.on('server_error', handleServerError)

    if (DEBUG_MODE) {
      console.log('[ChatStore] WebSocket listeners attached')
    }
  }

  function handleConnected() {
    connectionStatus.value = 'connected'
    forceDisconnected.value = false
  }

  function handleDisconnected() {
    connectionStatus.value = 'disconnected'
  }

  function handleReconnecting() {
    connectionStatus.value = 'reconnecting'
  }

  function handleMessageSent(data) {
    if (data && data.message) {
      addMessage(data.message)
    }
  }

  function handleNewMessage(data) {
    if (data && data.message) {
      addMessage(data.message)
      
      if (data.message.message_type === 'bot') {
        isBotProcessing.value = false
        isBotTyping.value = false
      }
    }
  }

  function handleBotTyping(data) {
    isBotTyping.value = data && data.typing === true
  }

  function handleForceDisconnect() {
    connectionStatus.value = 'force_disconnected'
    forceDisconnected.value = true
  }

  function handleServerError(data) {
    if (data && data.error_code === 'bot_is_processing') {
      isBotProcessing.value = true
    }
  }

  function connectWebSocket() {
    if (forceDisconnected.value) {
      if (DEBUG_MODE) {
        console.log('[ChatStore] Cannot reconnect - force disconnected')
      }
      return
    }

    setupWebSocketListeners()
    chatWebSocket.connect()
  }

  function disconnectWebSocket() {
    chatWebSocket.disconnect()
    connectionStatus.value = 'disconnected'
  }

  function resetForceDisconnect() {
    forceDisconnected.value = false
  }

  function reconnectAfterForceDisconnect() {
    forceDisconnected.value = false
    connectWebSocket()
  }

  function clearMessages() {
    messages.value = []
    pagination.value = {
      page: 1,
      pageSize: 50,
      totalPages: 1,
      totalItems: 0,
      hasMore: false
    }
  }

  function $reset() {
    conversationId.value = null
    messages.value = []
    unreadCount.value = 0
    isBotProcessing.value = false
    isBotTyping.value = false
    isLoading.value = false
    isLoadingMore.value = false
    connectionStatus.value = 'disconnected'
    forceDisconnected.value = false
    pagination.value = {
      page: 1,
      pageSize: 50,
      totalPages: 1,
      totalItems: 0,
      hasMore: false
    }
    disconnectWebSocket()
  }

  return {
    conversationId,
    messages,
    unreadCount,
    isBotProcessing,
    isBotTyping,
    isLoading,
    isLoadingMore,
    connectionStatus,
    forceDisconnected,
    pagination,
    isConnected,
    canSendMessage,
    setConversationId,
    setUnreadCount,
    setIsBotProcessing,
    loadMessages,
    loadOlderMessages,
    sendMessage,
    addMessage,
    markAsRead,
    addReaction,
    connectWebSocket,
    disconnectWebSocket,
    resetForceDisconnect,
    reconnectAfterForceDisconnect,
    clearMessages,
    $reset
  }
})
