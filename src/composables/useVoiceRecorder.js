/**
 * Composable для записи голосовых сообщений через MediaRecorder API.
 * Нативный браузерный API, без внешних зависимостей.
 */
import { ref, computed, onUnmounted } from 'vue'

const MAX_DURATION = 120 // 2 минуты (лимит бэкенда)

// Определить поддерживаемый MIME-тип для записи
function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return null

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return null
}

export function useVoiceRecorder() {
  const isRecording = ref(false)
  const duration = ref(0)
  const permissionDenied = ref(false)
  const error = ref(null)

  let mediaStream = null
  let mediaRecorder = null
  let audioChunks = []
  let durationTimer = null
  let startTime = 0
  let resolveStop = null
  let autoStopCallback = null

  const supportedMimeType = getSupportedMimeType()

  const isSupported = computed(() => {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined' &&
      supportedMimeType
    )
  })

  async function startRecording() {
    if (!isSupported.value) {
      error.value = 'not_supported'
      return false
    }

    if (isRecording.value) return false

    error.value = null
    permissionDenied.value = false
    audioChunks = []
    duration.value = 0

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        permissionDenied.value = true
        error.value = 'permission_denied'
      } else if (err.name === 'NotFoundError') {
        error.value = 'no_device'
      } else {
        error.value = 'recording_error'
      }
      return false
    }

    try {
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
    } catch {
      cleanup()
      error.value = 'recording_error'
      return false
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      clearInterval(durationTimer)
      durationTimer = null

      const blob = new Blob(audioChunks, { type: supportedMimeType })
      const finalDuration = duration.value

      isRecording.value = false
      releaseStream()

      if (resolveStop) {
        resolveStop({ blob, duration: finalDuration })
        resolveStop = null
      } else if (autoStopCallback) {
        // Автостоп по лимиту — отдаём blob через callback
        autoStopCallback({ blob, duration: finalDuration })
      }
    }

    mediaRecorder.onerror = () => {
      error.value = 'recording_error'
      cancelRecording()
    }

    mediaRecorder.start(250) // chunks каждые 250ms
    isRecording.value = true
    startTime = Date.now()

    durationTimer = setInterval(() => {
      duration.value = Math.round((Date.now() - startTime) / 100) / 10

      // Автостоп при достижении лимита — через callback, не через stopRecording()
      if (duration.value >= MAX_DURATION) {
        clearInterval(durationTimer)
        durationTimer = null
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          resolveStop = null
          mediaRecorder.stop()
        }
      }
    }, 100)

    return true
  }

  function stopRecording() {
    if (!isRecording.value || !mediaRecorder || mediaRecorder.state === 'inactive') {
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      resolveStop = resolve
      mediaRecorder.stop()
    })
  }

  function cancelRecording() {
    resolveStop = null

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = null
      mediaRecorder.stop()
    }

    clearInterval(durationTimer)
    durationTimer = null
    audioChunks = []
    duration.value = 0
    isRecording.value = false
    releaseStream()
  }

  function releaseStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }
    mediaRecorder = null
  }

  function onAutoStop(callback) {
    autoStopCallback = callback
  }

  function cleanup() {
    cancelRecording()
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    isSupported,
    isRecording,
    duration,
    permissionDenied,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    onAutoStop,
    cleanup
  }
}
