/**
 * Pinia store для управления AI-задачами
 * 
 * Функциональность:
 * - WebSocket подключение для получения прогресса в реальном времени
 * - REST API методы для запуска, отмены, статуса задач
 * - Глобальное хранилище активных задач и результатов
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL, WS_BASE_URL, DEBUG_MODE } from '@/config/settings.js'

export const useAITasksStore = defineStore('aiTasks', () => {
  const ws = ref(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const activeTasks = ref([])
  const taskResults = ref({})
  const taskErrors = ref({})
  const cooldowns = ref({})
  
  const shouldReconnect = ref(true)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  function getWebSocketUrl() {
    let baseUrl = WS_BASE_URL || API_BASE_URL || window.location.origin
    baseUrl = baseUrl.replace(/^http/, 'ws')
    baseUrl = baseUrl.replace(/\/+$/, '')
    return `${baseUrl}/ws/tasks/`
  }

  function getApiUrl(endpoint) {
    const base = API_BASE_URL || ''
    return `${base}/api/rest/front/app/ai-tasks/${endpoint}/`
  }

  function connect() {
    if (isConnecting.value || isConnected.value) {
      if (DEBUG_MODE) {
        console.log('[AITasks] Already connected or connecting')
      }
      return
    }

    isConnecting.value = true
    shouldReconnect.value = true

    const url = getWebSocketUrl()
    
    if (DEBUG_MODE) {
      console.log('[AITasks] Connecting to:', url)
    }

    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        isConnecting.value = false
        isConnected.value = true
        reconnectAttempts.value = 0
        
        if (DEBUG_MODE) {
          console.log('[AITasks] WebSocket connected')
        }
      }

      ws.value.onclose = (event) => {
        isConnecting.value = false
        isConnected.value = false
        
        if (DEBUG_MODE) {
          console.log('[AITasks] WebSocket closed:', event.code, event.reason)
        }
        
        handleClose(event.code)
      }

      ws.value.onerror = (error) => {
        isConnecting.value = false
        
        if (DEBUG_MODE) {
          console.error('[AITasks] WebSocket error:', error)
        }
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (e) {
          if (DEBUG_MODE) {
            console.error('[AITasks] Failed to parse message:', e)
          }
        }
      }
    } catch (error) {
      isConnecting.value = false
      if (DEBUG_MODE) {
        console.error('[AITasks] Failed to create WebSocket:', error)
      }
    }
  }

  function handleClose(code) {
    if (code === 4001) {
      if (DEBUG_MODE) {
        console.log('[AITasks] Not authorized, not reconnecting')
      }
      shouldReconnect.value = false
      return
    }

    if (code === 4003) {
      // Force disconnect - ограничиваем ретраи как для обычных дисконнектов
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        if (DEBUG_MODE) {
          console.log(`[AITasks] Force disconnected, reconnecting (${reconnectAttempts.value}/${maxReconnectAttempts})...`)
        }
        setTimeout(connect, reconnectDelay)
      } else {
        if (DEBUG_MODE) {
          console.log('[AITasks] Max reconnect attempts reached after force disconnect')
        }
        shouldReconnect.value = false
      }
      return
    }

    if (shouldReconnect.value && reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      const delay = reconnectDelay * reconnectAttempts.value
      
      if (DEBUG_MODE) {
        console.log(`[AITasks] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`)
      }
      
      setTimeout(connect, delay)
    }
  }

  function handleMessage(message) {
    const { type, data } = message

    if (DEBUG_MODE) {
      console.log('[AITasks] Received:', type, data)
    }

    switch (type) {
      case 'ping':
        sendPong()
        break

      case 'active_tasks':
        activeTasks.value = data.tasks || []
        break

      case 'task_started':
        const existingIndex = activeTasks.value.findIndex(t => t.task_id === data.task_id)
        if (existingIndex === -1) {
          activeTasks.value.push({
            task_id: data.task_id,
            task_type: data.task_type,
            status: 'running',
            progress_percent: 0,
            progress_text: 'Запуск...',
            result: null,
            error: null
          })
        }
        break

      case 'task_progress':
        updateTask(data.task_id, {
          progress_percent: data.progress_percent,
          progress_text: data.progress_text,
          status: 'running'
        })
        break

      case 'task_completed':
        updateTask(data.task_id, {
          status: 'completed',
          progress_percent: 100,
          progress_text: 'Готово',
          result: data.result
        })
        taskResults.value[data.task_id] = data.result
        taskResults.value[`${data.task_type}_latest`] = data.result
        resolveTaskPromise(data.task_id, data.result)
        break

      case 'task_failed':
        updateTask(data.task_id, {
          status: 'failed',
          error: data.error
        })
        taskErrors.value[data.task_id] = data.error
        rejectTaskPromise(data.task_id, data.error)
        break

      case 'task_status':
        updateTask(data.task_id, {
          status: data.status,
          progress_percent: data.progress_percent,
          progress_text: data.progress_text,
          result: data.result,
          error: data.error
        })
        break

      case 'cancel_task_response':
        if (data.success) {
          removeTask(data.task_id)
        }
        break

      case 'force_disconnect':
        if (DEBUG_MODE) {
          console.log('[AITasks] Force disconnect:', data.reason)
        }
        break
    }
  }

  function updateTask(taskId, updates) {
    const index = activeTasks.value.findIndex(t => t.task_id === taskId)
    if (index !== -1) {
      activeTasks.value[index] = { ...activeTasks.value[index], ...updates }
    }
  }

  function removeTask(taskId) {
    const index = activeTasks.value.findIndex(t => t.task_id === taskId)
    if (index !== -1) {
      activeTasks.value.splice(index, 1)
    }
  }

  function sendPong() {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'pong' }))
    }
  }

  function disconnect() {
    shouldReconnect.value = false
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
    isConnecting.value = false
  }

  async function apiRequest(endpoint, body = {}) {
    const url = getApiUrl(endpoint)
    
    try {
      const { apiFetch } = await import('@/services/api.js')
      const response = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      
      return await response.json()
    } catch (error) {
      if (DEBUG_MODE) {
        console.error(`[AITasks] API error (${endpoint}):`, error)
      }
      return {
        status: 'error',
        error_code: 'network_error',
        error_message: 'Ошибка сети'
      }
    }
  }

  const taskPromises = ref({})

  async function startTask(taskType, context = {}) {
    const result = await apiRequest('start', {
      task_type: taskType,
      context
    })

    if (result.status === 'error') {
      if (result.error_code === 'ai_task_cooldown') {
        cooldowns.value[taskType] = {
          until: Date.now() + (result.data?.wait_seconds || 60) * 1000,
          seconds: result.data?.wait_seconds || 60
        }
      }
      
      if (result.error_code === 'ai_task_already_running' && result.data?.existing_task_id) {
        return {
          status: 'already_running',
          task_id: result.data.existing_task_id,
          error_message: result.error_message
        }
      }

      throw new Error(result.error_message || 'Ошибка запуска задачи')
    }

    return result.data
  }

  async function startTaskAndWait(taskType, context = {}, timeout = 120000) {
    const startResult = await startTask(taskType, context)
    
    if (startResult.status === 'already_running') {
      return startResult
    }

    const taskId = startResult.task_id

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        delete taskPromises.value[taskId]
        reject(new Error('Время ожидания истекло'))
      }, timeout)

      taskPromises.value[taskId] = {
        resolve: (result) => {
          clearTimeout(timeoutId)
          delete taskPromises.value[taskId]
          resolve(result)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          delete taskPromises.value[taskId]
          reject(error)
        },
        taskType
      }
    })
  }

  function resolveTaskPromise(taskId, result) {
    const promise = taskPromises.value[taskId]
    if (promise) {
      promise.resolve(result)
    }
  }

  function rejectTaskPromise(taskId, error) {
    const promise = taskPromises.value[taskId]
    if (promise) {
      promise.reject(new Error(error?.message || 'Ошибка выполнения задачи'))
    }
  }

  async function cancelTask(taskId) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        action: 'cancel_task',
        data: { task_id: taskId }
      }))
      return true
    }

    const result = await apiRequest('cancel', { task_id: taskId })
    if (result.status === 'ok') {
      removeTask(taskId)
      return true
    }
    return false
  }

  async function getTaskStatus(taskId) {
    const result = await apiRequest('status', { task_id: taskId })
    if (result.status === 'ok') {
      return result.data
    }
    return null
  }

  async function getActiveTasks() {
    const result = await apiRequest('active')
    if (result.status === 'ok') {
      activeTasks.value = result.data.tasks || []
      return result.data.tasks
    }
    return []
  }

  function getActiveTaskByType(taskType) {
    return activeTasks.value.find(
      t => t.task_type === taskType && ['pending', 'running'].includes(t.status)
    )
  }

  function getCompletedTaskByType(taskType) {
    return activeTasks.value.find(
      t => t.task_type === taskType && t.status === 'completed'
    )
  }

  function getTaskResult(taskType) {
    return taskResults.value[`${taskType}_latest`] || null
  }

  function clearTaskResult(taskType) {
    delete taskResults.value[`${taskType}_latest`]
  }

  function isTaskRunning(taskType) {
    const task = getActiveTaskByType(taskType)
    return task?.status === 'pending' || task?.status === 'running'
  }

  function getTaskProgress(taskType) {
    const task = getActiveTaskByType(taskType)
    return task ? {
      percent: task.progress_percent || 0,
      text: task.progress_text || ''
    } : null
  }

  function getCooldown(taskType) {
    const cooldown = cooldowns.value[taskType]
    if (!cooldown) return null
    
    const remaining = Math.ceil((cooldown.until - Date.now()) / 1000)
    if (remaining <= 0) {
      delete cooldowns.value[taskType]
      return null
    }
    return remaining
  }

  const hasActiveTasks = computed(() => activeTasks.value.length > 0)

  return {
    ws,
    isConnected,
    isConnecting,
    activeTasks,
    taskResults,
    taskErrors,
    cooldowns,
    hasActiveTasks,

    connect,
    disconnect,
    
    startTask,
    startTaskAndWait,
    cancelTask,
    getTaskStatus,
    getActiveTasks,
    
    getActiveTaskByType,
    getCompletedTaskByType,
    getTaskResult,
    clearTaskResult,
    isTaskRunning,
    getTaskProgress,
    getCooldown
  }
})
