import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
import { SKIP_AUTH_CHECK, DEBUG_MODE } from '@/config/settings.js'
import api, { refreshCsrf } from '@/services/api.js'

// Lazy loading компонентов
const Landing = () => import('@/views/Landing.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Recovery = () => import('@/views/Recovery.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const BalancedScorecard = () => import('@/views/BalancedScorecard.vue')
const Goals = () => import('@/views/Goals.vue')
const GoalNew = () => import('@/views/GoalNew.vue')
const GoalEdit = () => import('@/views/GoalEdit.vue')
const GoalsBank = () => import('@/views/GoalsBank.vue')
const Planner = () => import('@/views/Planner.vue')
const Settings = () => import('@/views/Settings.vue')
const Club = () => import('@/views/Club.vue')
=======
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import BalancedScorecard from '../views/BalancedScorecard.vue'
import Goals from '../views/Goals.vue'
import GoalNew from '../views/GoalNew.vue'
import GoalEdit from '../views/GoalEdit.vue'
import GoalsBank from '../views/GoalsBank.vue'
import Planning from '../views/Planning.vue'
import Settings from '../views/Settings.vue'
import Club from '../views/Club.vue'
>>>>>>> origin/main

const router = createRouter({
  history: createWebHistory(),
  routes: [
<<<<<<< HEAD
    // Публичный лендинг
    {
      path: '/',
      name: 'landing',
      component: Landing,
      meta: { title: 'OnePercent - Система управления жизнью', public: true }
    },
    
    // Auth routes (публичные, но редиректят авторизованных на /app)
    {
      path: '/auth/login',
      name: 'login',
      component: Login,
      meta: { title: 'Вход в систему', public: true, guestOnly: true }
    },
    {
      path: '/auth/register',
      name: 'register',
      component: Register,
      meta: { title: 'Регистрация', public: true, guestOnly: true }
    },
    {
      path: '/auth/recovery',
      name: 'recovery',
      component: Recovery,
      meta: { title: 'Восстановление пароля', public: true, guestOnly: true }
    },
    {
      path: '/auth/logout',
      name: 'logout',
      component: null,
      meta: { public: true },
      beforeEnter: async (to, from, next) => {
        if (DEBUG_MODE) {
          console.log('[Router] Logout: clearing user session')
        }
        await api.logout()
        // Очищаем данные пользователя из store
        const { useAppStore } = await import('@/stores/app.js')
        const store = useAppStore()
        store.clearUser()
        // Сбрасываем кэш авторизации
        authCheckPromise = null
        lastAuthCheck = 0
        if (DEBUG_MODE) {
          console.log('[Router] Logout: session cleared, redirecting to login')
        }
        next({ name: 'login' })
      }
    },
    
    // App routes (защищённые)
    {
      path: '/app',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Главная', requiresAuth: true }
    },
    {
      path: '/app/ssp',
      name: 'ssp',
      component: BalancedScorecard,
      meta: { title: 'Сбалансированная система показателей', requiresAuth: true }
    },
    {
      path: '/app/goals',
      name: 'goals',
      component: Goals,
      meta: { title: 'Цели и декомпозиция', requiresAuth: true }
    },
    {
      path: '/app/goals/new',
      name: 'goal-new',
      component: GoalNew,
      meta: { title: 'Новая цель', requiresAuth: true }
    },
    {
      path: '/app/goals/:id',
      name: 'goal-edit',
      component: GoalEdit,
      meta: { title: 'Редактирование цели', requiresAuth: true }
    },
    {
      path: '/app/goals-bank',
      name: 'goals-bank',
      component: GoalsBank,
      meta: { title: 'Банк целей', requiresAuth: true }
    },
    {
      path: '/app/planner',
      name: 'planner',
      component: Planner,
      meta: { title: 'Планирование', requiresAuth: true }
    },
    {
      path: '/app/settings',
      name: 'settings',
      component: Settings,
      meta: { title: 'Настройки', requiresAuth: true }
    },
    {
      path: '/app/club',
      name: 'club',
      component: Club,
      meta: { title: 'Клуб 1%', requiresAuth: true }
    },
    
    // Редиректы для обратной совместимости со старыми URL
    { path: '/login', redirect: '/auth/login' },
    { path: '/register', redirect: '/auth/register' },
    { path: '/ssp', redirect: '/app/ssp' },
    { path: '/goals', redirect: '/app/goals' },
    { path: '/goals/new', redirect: '/app/goals/new' },
    { path: '/goals/:id', redirect: to => `/app/goals/${to.params.id}` },
    { path: '/goals-bank', redirect: '/app/goals-bank' },
    { path: '/planner', redirect: '/app/planner' },
    { path: '/settings', redirect: '/app/settings' },
    { path: '/club', redirect: '/app/club' },
    
    // 404 - редирект на лендинг
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
=======
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { title: 'Регистрация' }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Вход в систему' }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Главная' }
    },
    {
      path: '/ssp',
      name: 'ssp',
      component: BalancedScorecard,
      meta: { title: 'Сбалансированная система показателей' }
    },
    {
      path: '/goals',
      name: 'goals',
      component: Goals,
      meta: { title: 'Цели и декомпозиция' }
    },
    {
      path: '/goals/new',
      name: 'goal-new',
      component: GoalNew,
      meta: { title: 'Новая цель' }
    },
    {
      path: '/goals/:id',
      name: 'goal-edit',
      component: GoalEdit,
      meta: { title: 'Редактирование цели' }
    },
    {
      path: '/goals-bank',
      name: 'goals-bank',
      component: GoalsBank,
      meta: { title: 'Банк целей' }
    },
    {
      path: '/planning',
      name: 'planning',
      component: Planning,
      meta: { title: 'Планирование' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { title: 'Настройки' }
    },
    {
      path: '/club',
      name: 'club',
      component: Club,
      meta: { title: 'Клуб 1%' }
>>>>>>> origin/main
    }
  ]
})

<<<<<<< HEAD
// Кэш для проверки авторизации
let authCheckPromise = null
let lastAuthCheck = 0
const AUTH_CHECK_CACHE_TIME = 30000 // 30 секунд

/**
 * Проверка авторизации пользователя
 * Возвращает объект { isAuthenticated, userData }
 */
async function checkUserAuth() {
  // Если включен режим пропуска проверки авторизации (dev)
  // Возвращаем "авторизован" для защищённых роутов
  if (SKIP_AUTH_CHECK) {
    if (DEBUG_MODE) {
      console.log('[Router] Auth check skipped (SKIP_AUTH_CHECK=true), simulating authenticated user')
    }
    return { 
      isAuthenticated: true, 
      userData: { 
        id: 'dev-user', 
        email: 'dev@example.com', 
        first_name: 'Dev User' 
      },
      skipped: true
    }
  }
  
  try {
    const now = Date.now()
    
    // Используем кэш если проверка была недавно
    if (!authCheckPromise || (now - lastAuthCheck > AUTH_CHECK_CACHE_TIME)) {
      if (DEBUG_MODE) {
        console.log('[Router] Fetching user data from API...')
      }
      lastAuthCheck = now
      authCheckPromise = api.checkAuth()
    } else if (DEBUG_MODE) {
      console.log('[Router] Using cached auth data')
    }
    
    const userData = await authCheckPromise
    
    if (DEBUG_MODE) {
      if (userData) {
        console.log('[Router] User authenticated:', {
          id: userData.id,
          email: userData.email,
          name: userData.first_name || userData.name || 'N/A'
        })
      } else {
        console.log('[Router] User not authenticated')
      }
    }
    
    return { isAuthenticated: !!userData, userData, skipped: false }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[Router] Auth check error:', error)
    }
    authCheckPromise = null
    return { isAuthenticated: false, userData: null, skipped: false }
  }
}

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  if (DEBUG_MODE) {
    console.log(`[Router] Navigation: ${from.path} → ${to.path}`)
  }
  
  // Устанавливаем title
  document.title = to.meta.title ? `${to.meta.title} - OnePercent` : 'OnePercent'
  
  // Обновляем CSRF токен при каждом переходе на страницу
  await refreshCsrf()
  
  // Получаем store для работы с пользователем
  const { useAppStore } = await import('@/stores/app.js')
  const store = useAppStore()
  
  // Проверяем нужна ли проверка авторизации для этого роута
  const needsAuthCheck = to.meta.requiresAuth || to.meta.guestOnly
  
  if (!needsAuthCheck) {
    // Публичный роут без ограничений - пропускаем
    if (DEBUG_MODE) {
      console.log('[Router] Public route, no auth check needed')
    }
    return next()
  }
  
  // Проверяем авторизацию
  const authResult = await checkUserAuth()
  const { isAuthenticated, userData, skipped } = authResult
  
  // Сохраняем данные пользователя в store (только если не dev-режим)
  if (userData && !skipped) {
    store.setUser(userData)
  }
  
  if (DEBUG_MODE) {
    console.log('[Router] Auth status:', {
      isAuthenticated,
      skipped,
      requiresAuth: to.meta.requiresAuth,
      guestOnly: to.meta.guestOnly,
      targetRoute: to.path
    })
  }
  
  // Роут только для гостей (страницы авторизации)
  // В dev режиме (skipped=true) разрешаем доступ к страницам авторизации
  if (to.meta.guestOnly && isAuthenticated && !skipped) {
    if (DEBUG_MODE) {
      console.log('[Router] Authenticated user on guest-only route, redirecting to /app')
    }
    return next({ name: 'dashboard' })
  }
  
  // Роут требует авторизации
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (DEBUG_MODE) {
      console.log('[Router] Unauthenticated user on protected route, redirecting to login')
    }
    authCheckPromise = null // Сбрасываем кэш
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }
  
  // Всё в порядке - продолжаем навигацию
  if (DEBUG_MODE) {
    console.log('[Router] Navigation allowed')
  }
  return next()
})

// Экспорт функции для сброса кэша авторизации
export function resetAuthCache() {
  authCheckPromise = null
  lastAuthCheck = 0
}

=======
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - OnePercent` : 'OnePercent'
  next()
})

>>>>>>> origin/main
export default router
