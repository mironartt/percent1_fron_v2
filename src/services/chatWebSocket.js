/**
 * WebSocket сервис для чата с AI Mentor
 * 
 * Функциональность:
 * - Подключение к WebSocket серверу
 * - Heartbeat (ping/pong) для поддержания соединения
 * - Автоматический reconnect при разрыве
 * - Обработка force_disconnect при открытии в другой вкладке
 * - События для обновления UI
 */

import { API_BASE_URL, WS_BASE_URL, DEBUG_MODE } from '@/config/settings.js'

class ChatWebSocket {
  constructor() {
    this.socket = null
    this.shouldReconnect = true
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.listeners = new Map()
    this.isConnecting = false
    this.isConnected = false
  }

  getWebSocketUrl() {
    let baseUrl = WS_BASE_URL || API_BASE_URL || window.location.origin
    baseUrl = baseUrl.replace(/^http/, 'ws')
    baseUrl = baseUrl.replace(/\/+$/, '')
    return `${baseUrl}/ws/chat/`
  }

  connect() {
    if (this.isConnecting || this.isConnected) {
      if (DEBUG_MODE) {
        console.log('[ChatWS] Already connected or connecting')
      }
      return
    }

    this.isConnecting = true
    this.shouldReconnect = true

    const url = this.getWebSocketUrl()
    
    if (DEBUG_MODE) {
      console.log('[ChatWS] Connecting to:', url)
    }

    try {
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        this.isConnecting = false
        this.isConnected = true
        this.reconnectAttempts = 0
        
        if (DEBUG_MODE) {
          console.log('[ChatWS] Connected')
        }
        
        this.emit('connected')
      }

      this.socket.onclose = (event) => {
        this.isConnecting = false
        this.isConnected = false
        
        if (DEBUG_MODE) {
          console.log('[ChatWS] Closed:', event.code, event.reason)
        }
        
        this.handleClose(event.code)
      }

      this.socket.onerror = (error) => {
        this.isConnecting = false
        
        if (DEBUG_MODE) {
          console.error('[ChatWS] Error:', error)
        }
        
        this.emit('error', error)
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (e) {
          if (DEBUG_MODE) {
            console.error('[ChatWS] Failed to parse message:', e)
          }
        }
      }
    } catch (error) {
      this.isConnecting = false
      if (DEBUG_MODE) {
        console.error('[ChatWS] Failed to create WebSocket:', error)
      }
      this.emit('error', error)
    }
  }

  handleClose(code) {
    this.emit('disconnected', code)
    
    switch (code) {
      case 4001:
        if (DEBUG_MODE) {
          console.log('[ChatWS] Not authenticated - redirecting to login')
        }
        this.shouldReconnect = false
        this.emit('auth_required')
        break

      case 4002:
        if (DEBUG_MODE) {
          console.log('[ChatWS] Heartbeat timeout - will reconnect')
        }
        if (this.shouldReconnect) {
          this.scheduleReconnect()
        }
        break

      case 4003:
        if (DEBUG_MODE) {
          console.log('[ChatWS] Force disconnect - chat opened elsewhere')
        }
        this.shouldReconnect = false
        this.emit('force_disconnect')
        break

      default:
        if (this.shouldReconnect) {
          this.scheduleReconnect()
        }
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (DEBUG_MODE) {
        console.log('[ChatWS] Max reconnect attempts reached')
      }
      this.emit('max_reconnect_reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)
    
    if (DEBUG_MODE) {
      console.log(`[ChatWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    }

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect()
      }
    }, delay)
  }

  handleMessage(data) {
    const { type } = data

    switch (type) {
      case 'ping':
        this.sendPong()
        break

      case 'message_sent':
        this.emit('message_sent', data.data)
        break

      case 'new_message':
        this.emit('new_message', data.data)
        break

      case 'bot_typing':
        this.emit('bot_typing', data.data)
        break

      case 'force_disconnect':
        if (DEBUG_MODE) {
          console.log('[ChatWS] Force disconnect event:', data.data)
        }
        this.shouldReconnect = false
        this.emit('force_disconnect', data.data)
        break

      case 'error':
        if (DEBUG_MODE) {
          console.error('[ChatWS] Server error:', data.data)
        }
        this.emit('server_error', data.data)
        break

      default:
        if (DEBUG_MODE) {
          console.log('[ChatWS] Unknown message type:', type, data)
        }
    }
  }

  sendPong() {
    this.send({
      action: 'pong',
      data: {}
    })
  }

  send(payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (DEBUG_MODE) {
        console.warn('[ChatWS] Cannot send - not connected')
      }
      return false
    }

    try {
      this.socket.send(JSON.stringify(payload))
      return true
    } catch (e) {
      if (DEBUG_MODE) {
        console.error('[ChatWS] Send error:', e)
      }
      return false
    }
  }

  sendMessage(conversationId, content, options = {}) {
    return this.send({
      action: 'send_message',
      data: {
        conversation_id: conversationId,
        content,
        reply_to_id: options.replyToId || null,
        source_page: options.sourcePage || null,
        client_context: options.clientContext || null
      }
    })
  }

  sendTypingStart(conversationId) {
    return this.send({
      action: 'typing_start',
      data: { conversation_id: conversationId }
    })
  }

  sendTypingStop(conversationId) {
    return this.send({
      action: 'typing_stop',
      data: { conversation_id: conversationId }
    })
  }

  markRead(conversationId, messageIds = null) {
    const data = { conversation_id: conversationId }
    if (messageIds) {
      data.message_ids = messageIds
    }
    return this.send({
      action: 'mark_read',
      data
    })
  }

  addReaction(messageId, reactionType, remove = false) {
    const data = {
      message_id: messageId,
      reaction_type: reactionType
    }
    if (remove) {
      data.remove = true
    }
    return this.send({
      action: 'add_reaction',
      data
    })
  }

  disconnect() {
    this.shouldReconnect = false
    
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    
    this.isConnected = false
    this.isConnecting = false
    
    if (DEBUG_MODE) {
      console.log('[ChatWS] Disconnected manually')
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  emit(event, data = null) {
    if (!this.listeners.has(event)) return
    
    for (const callback of this.listeners.get(event)) {
      try {
        callback(data)
      } catch (e) {
        if (DEBUG_MODE) {
          console.error('[ChatWS] Listener error:', e)
        }
      }
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      shouldReconnect: this.shouldReconnect
    }
  }
}

export const chatWebSocket = new ChatWebSocket()
export default chatWebSocket
