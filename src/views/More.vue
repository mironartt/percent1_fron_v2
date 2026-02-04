<template>
  <div class="more-page has-bottom-nav">
    <!-- Profile Section -->
    <div class="profile-section">
      <div class="profile-avatar">
        <User :size="32" :stroke-width="1.5" />
      </div>
      <div class="profile-info">
        <h2 class="profile-name">{{ userName }}</h2>
        <div class="profile-xp">
          <Zap :size="14" :stroke-width="1.5" />
          <span>{{ userXP }} XP</span>
        </div>
      </div>
      <router-link to="/app/settings" class="profile-settings-btn" aria-label="Настройки профиля">
        <ChevronRight :size="20" :stroke-width="1.5" />
      </router-link>
    </div>

    <!-- Navigation Groups -->
    <div class="nav-groups">
      <!-- Features -->
      <div class="nav-group">
        <h3 class="group-title">Функции</h3>
        <div class="group-items">
          <router-link to="/app/ssp" class="nav-link">
            <div class="nav-link-icon">
              <Target :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">ССП (Колесо баланса)</span>
            <ChevronRight :size="18" :stroke-width="1.5" class="nav-link-arrow" />
          </router-link>

          <router-link to="/app/habits" class="nav-link">
            <div class="nav-link-icon">
              <Flame :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Привычки</span>
            <ChevronRight :size="18" :stroke-width="1.5" class="nav-link-arrow" />
          </router-link>

          <router-link to="/app/achievements" class="nav-link">
            <div class="nav-link-icon">
              <Award :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Достижения</span>
            <ChevronRight :size="18" :stroke-width="1.5" class="nav-link-arrow" />
          </router-link>

          <router-link to="/app/learning" class="nav-link">
            <div class="nav-link-icon">
              <GraduationCap :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Обучение</span>
            <ChevronRight :size="18" :stroke-width="1.5" class="nav-link-arrow" />
          </router-link>

          <a href="https://t.me/dmkosik" target="_blank" rel="noopener noreferrer" class="nav-link">
            <div class="nav-link-icon">
              <Users :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Клуб 1%</span>
            <ExternalLink :size="16" :stroke-width="1.5" class="nav-link-arrow external" />
          </a>
        </div>
      </div>

      <!-- Settings -->
      <div class="nav-group">
        <h3 class="group-title">Настройки</h3>
        <div class="group-items">
          <router-link to="/app/settings" class="nav-link">
            <div class="nav-link-icon">
              <Settings :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Профиль</span>
            <ChevronRight :size="18" :stroke-width="1.5" class="nav-link-arrow" />
          </router-link>

          <button class="nav-link" @click="toggleTheme">
            <div class="nav-link-icon">
              <Sun v-if="isDark" :size="20" :stroke-width="1.5" />
              <Moon v-else :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">{{ isDark ? 'Светлая тема' : 'Тёмная тема' }}</span>
            <div class="theme-toggle">
              <div class="toggle-track" :class="{ active: isDark }">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Support -->
      <div class="nav-group">
        <h3 class="group-title">Поддержка</h3>
        <div class="group-items">
          <a href="https://t.me/dmkosik" target="_blank" rel="noopener noreferrer" class="nav-link">
            <div class="nav-link-icon">
              <HelpCircle :size="20" :stroke-width="1.5" />
            </div>
            <span class="nav-link-label">Помощь</span>
            <ExternalLink :size="16" :stroke-width="1.5" class="nav-link-arrow external" />
          </a>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <button class="logout-btn" @click="handleLogout">
      <LogOut :size="18" :stroke-width="1.5" />
      <span>Выйти</span>
    </button>

    <!-- Version -->
    <p class="version-text">OnePercent v1.0</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useXpStore } from '@/stores/xp'
import {
  User,
  Zap,
  ChevronRight,
  Target,
  Flame,
  Award,
  GraduationCap,
  Users,
  Settings,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  ExternalLink
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const xpStore = useXpStore()

const isDark = ref(false)

const userName = computed(() => {
  return store.user?.first_name || store.user?.username || 'Пользователь'
})

const userXP = computed(() => {
  return xpStore.totalXP || 0
})

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

async function toggleTheme() {
  isDark.value = !isDark.value
  const newTheme = isDark.value ? 'dark' : 'light'
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Сохраняем в localStorage для быстрого старта
  localStorage.setItem('theme', newTheme)
  
  // Сохраняем в БД через store
  await store.setTheme(newTheme)
}

async function handleLogout() {
  await store.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
.more-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 1rem;
}

/* Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-xp {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--warning-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-settings-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.profile-settings-btn:hover {
  background: var(--bg-tertiary);
}

/* Navigation Groups */
.nav-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nav-group {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  padding: 0.75rem 1rem 0.5rem;
  margin: 0;
}

.group-items {
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  min-height: var(--touch-target);
  color: var(--text-primary);
  text-decoration: none;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.nav-link:hover {
  background: var(--bg-tertiary);
}

.nav-link:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.nav-link-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.nav-link-label {
  flex: 1;
  font-weight: 500;
}

.nav-link-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.nav-link-arrow.external {
  color: var(--text-tertiary);
  opacity: 0.7;
}

/* Theme Toggle */
.theme-toggle {
  margin-left: auto;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-track.active {
  background: var(--primary-color);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-track.active .toggle-thumb {
  transform: translateX(20px);
}

/* Logout Button */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  min-height: var(--touch-target);
  background: transparent;
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-lg);
  color: var(--danger-color);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 1rem;
}

.logout-btn:hover {
  background: var(--danger-color);
  color: white;
}

/* Version */
.version-text {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .toggle-track,
  .toggle-thumb,
  .logout-btn,
  .profile-settings-btn {
    transition: none;
  }
}
</style>
