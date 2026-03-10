<template>
  <div :class="['voice-bubble', { 'voice-bubble--user': isUser }]">
    <div class="voice-player">
      <button
        class="play-btn"
        @click="togglePlay"
        :disabled="!audioUrl"
      >
        <Pause v-if="isPlaying" :size="18" :stroke-width="2" />
        <Play v-else :size="18" :stroke-width="2" />
      </button>

      <div class="voice-track">
        <div class="voice-progress-bar">
          <div
            class="voice-progress-fill"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
        <span class="voice-duration">{{ displayTime }}</span>
      </div>
    </div>

    <div v-if="transcription" class="voice-transcription">
      {{ transcription }}
    </div>
    <div v-else class="voice-transcription voice-transcription--pending">
      <Loader2 :size="12" :stroke-width="1.5" class="spin" />
      <span>Расшифровка...</span>
    </div>

    <audio
      ref="audioRef"
      :src="audioUrl"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Play, Pause, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  audioUrl: { type: String, default: null },
  duration: { type: Number, default: 0 },
  transcription: { type: String, default: '' },
  isUser: { type: Boolean, default: false }
})

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const audioDuration = ref(0)

const effectiveDuration = computed(() => {
  return audioDuration.value || props.duration || 0
})

const progressPercent = computed(() => {
  if (!effectiveDuration.value) return 0
  return Math.min((currentTime.value / effectiveDuration.value) * 100, 100)
})

const displayTime = computed(() => {
  const time = isPlaying.value ? currentTime.value : effectiveDuration.value
  return formatTime(time)
})

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!audioRef.value || !props.audioUrl) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      isPlaying.value = false
    })
  }
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function onLoadedMetadata() {
  if (audioRef.value && isFinite(audioRef.value.duration)) {
    audioDuration.value = audioRef.value.duration
  }
}
</script>

<style scoped>
.voice-bubble {
  min-width: 200px;
}

.voice-player {
  display: flex;
  align-items: center;
  gap: 10px;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.play-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.play-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-track {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.voice-progress-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.voice-progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.voice-duration {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.voice-transcription {
  margin-top: 8px;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.voice-transcription--pending {
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;
  color: var(--text-tertiary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

audio {
  display: none;
}

/* === User message variant (white on gradient) === */

.voice-bubble--user .play-btn {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.voice-bubble--user .play-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.4);
}

.voice-bubble--user .voice-progress-bar {
  background: rgba(255, 255, 255, 0.25);
}

.voice-bubble--user .voice-progress-fill {
  background: white;
}

.voice-bubble--user .voice-duration {
  color: rgba(255, 255, 255, 0.8);
}

.voice-bubble--user .voice-transcription {
  color: rgba(255, 255, 255, 0.95);
}

.voice-bubble--user .voice-transcription--pending {
  color: rgba(255, 255, 255, 0.7);
}
</style>
