<template>
  <header class="catalog-header" :class="{ scrolled: isScrolled }">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">1%</span>
          <div class="logo-text">
            <b class="logo-title">OnePercent</b>
            <span class="tagline">+1% каждый день</span>
          </div>
        </router-link>
        <nav class="header-nav">
          <router-link to="/catalog" class="nav-link" :class="{ active: isActivePath('/catalog') }">Каталог</router-link>
          <router-link to="/catalog/goals" class="nav-link" :class="{ active: isActivePath('/catalog/goals') }">Цели</router-link>
          <router-link to="/catalog/habits" class="nav-link" :class="{ active: isActivePath('/catalog/habits') }">Привычки</router-link>
          <router-link to="/catalog/bundles" class="nav-link" :class="{ active: isActivePath('/catalog/bundles') }">Наборы</router-link>
          <div class="nav-divider"></div>
          <template v-if="isAuthenticated">
            <router-link to="/app" class="btn btn-primary">Личный кабинет</router-link>
          </template>
          <template v-else>
            <router-link to="/auth/login" class="nav-link login-link">Войти</router-link>
            <router-link to="/auth/register" class="btn btn-primary">Начать бесплатно</router-link>
          </template>
        </nav>
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Меню">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
      <router-link to="/catalog" class="mobile-link" @click="closeMobileMenu">Каталог</router-link>
      <router-link to="/catalog/goals" class="mobile-link" @click="closeMobileMenu">Цели</router-link>
      <router-link to="/catalog/habits" class="mobile-link" @click="closeMobileMenu">Привычки</router-link>
      <router-link to="/catalog/bundles" class="mobile-link" @click="closeMobileMenu">Наборы</router-link>
      <div class="mobile-divider"></div>
      <template v-if="isAuthenticated">
        <router-link to="/app" class="mobile-link primary" @click="closeMobileMenu">Личный кабинет</router-link>
      </template>
      <template v-else>
        <router-link to="/auth/login" class="mobile-link" @click="closeMobileMenu">Войти</router-link>
        <router-link to="/auth/register" class="mobile-link primary" @click="closeMobileMenu">Начать бесплатно</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const isAuthenticated = computed(() => appStore.isAuthenticated)

function isActivePath(path) {
  if (path === '/catalog') {
    return route.path === '/catalog'
  }
  return route.path.startsWith(path)
}

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.catalog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.catalog-header.scrolled {
  background: rgba(255, 255, 255, 0.98);
  border-bottom-color: #e5e7eb;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: #6366f1;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
}

.tagline {
  color: #6b7280;
  font-size: 12px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  color: #4b5563;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #6366f1;
  background: #f5f3ff;
}

.nav-link.active {
  color: #6366f1;
  background: #f5f3ff;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
}

.login-link {
  color: #6366f1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  width: 24px;
  height: 2px;
  background: #4b5563;
  border-radius: 1px;
  transition: all 0.3s;
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  flex-direction: column;
  gap: 8px;
}

.mobile-menu.open {
  display: flex;
}

.mobile-link {
  padding: 12px 16px;
  color: #4b5563;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.mobile-link:hover {
  background: #f5f3ff;
  color: #6366f1;
}

.mobile-link.primary {
  background: #6366f1;
  color: white;
  text-align: center;
}

.mobile-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

@media (max-width: 900px) {
  .header-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }
}
</style>
