<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="welcome-modal-overlay" @click.self="handleClose">
        <div class="welcome-modal" :class="{ 'video-mode': showVideo }">
          <button class="close-btn" @click="handleClose">
            <X :size="20" />
          </button>

          <div v-if="!showVideo" class="welcome-content">
            <div class="welcome-icon">
              <Play :size="48" />
            </div>
            <h2 class="welcome-title">Добро пожаловать в OnePercent!</h2>
            <p class="welcome-description">
              Посмотрите короткое видео, чтобы узнать как эффективно использовать сервис 
              и достигать своих целей на 1% каждый день.
            </p>
            <div class="welcome-actions">
              <button class="btn btn-primary" @click="watchVideo">
                <Play :size="18" />
                Посмотреть видео
              </button>
              <button class="btn btn-secondary" @click="handleClose">
                Посмотрю позже
              </button>
            </div>
          </div>

          <div v-else class="video-content">
            <div class="video-header">
              <h3>Обучающее видео</h3>
            </div>
            <div class="video-container">
              <iframe
                :src="embedUrl"
                frameborder="0"
                allow="clipboard-write; autoplay"
                webkitAllowFullScreen
                mozallowfullscreen
                allowfullscreen
              ></iframe>
            </div>
            <div class="video-actions">
              <button class="btn btn-primary" @click="finishWatching">
                Готово
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, Play } from 'lucide-vue-next'

const STORAGE_KEY = 'welcomeVideoSeen'
const VIDEO_ID = 'f5edee9e1b0de1103bcda9862e62fd96'

const isOpen = ref(false)
const showVideo = ref(false)

const embedUrl = computed(() => `https://rutube.ru/play/embed/${VIDEO_ID}`)

function checkShouldShow() {
  const seen = localStorage.getItem(STORAGE_KEY)
  return !seen
}

function show() {
  if (checkShouldShow()) {
    isOpen.value = true
  }
}

function markAsSeen() {
  localStorage.setItem(STORAGE_KEY, 'true')
}

function watchVideo() {
  showVideo.value = true
}

function finishWatching() {
  markAsSeen()
  isOpen.value = false
  showVideo.value = false
}

function handleClose() {
  markAsSeen()
  isOpen.value = false
  showVideo.value = false
}

defineExpose({ show })
</script>

<style scoped>
.welcome-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.welcome-modal {
  background: var(--bg-primary);
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.welcome-modal.video-mode {
  max-width: 720px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.welcome-content {
  padding: 48px 32px 32px;
  text-align: center;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.welcome-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 28px;
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.video-content {
  padding: 16px;
}

.video-header {
  padding: 8px 40px 16px 8px;
}

.video-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-actions {
  padding: 16px 0 8px;
  display: flex;
  justify-content: center;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .welcome-modal,
.modal-fade-leave-active .welcome-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .welcome-modal,
.modal-fade-leave-to .welcome-modal {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

@media (max-width: 480px) {
  .welcome-modal {
    max-width: 100%;
    border-radius: 16px;
  }

  .welcome-content {
    padding: 40px 24px 24px;
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
  }

  .welcome-icon svg {
    width: 36px;
    height: 36px;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .welcome-description {
    font-size: 0.9rem;
  }
}
</style>
