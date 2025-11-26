import { createRouter, createWebHistory } from 'vue-router'
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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Публичный лендинг
    {
      path: '/',
      name: 'landing',
      component: Landing,
      meta: { title: 'OnePercent - Система управления жизнью', public: true }
    },
    
    // Auth routes (публичные)
    {
      path: '/auth/login',
      name: 'login',
      component: Login,
      meta: { title: 'Вход в систему', public: true }
    },
    {
      path: '/auth/register',
      name: 'register',
      component: Register,
      meta: { title: 'Регистрация', public: true }
    },
    {
      path: '/auth/recovery',
      name: 'recovery',
      component: Recovery,
      meta: { title: 'Восстановление пароля', public: true }
    },
    {
      path: '/auth/logout',
      name: 'logout',
      component: null,
      meta: { public: true },
      beforeEnter: async (to, from, next) => {
        await api.logout()
        // Очищаем данные пользователя из store
        const { useAppStore } = await import('@/stores/app.js')
        const store = useAppStore()
        store.clearUser()
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
    }
  ]
})

// Кэш для проверки авторизации
let authCheckPromise = null
let lastAuthCheck = 0
const AUTH_CHECK_CACHE_TIME = 30000 // 30 секунд

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  // Устанавливаем title
  document.title = to.meta.title ? `${to.meta.title} - OnePercent` : 'OnePercent'
  
  // Обновляем CSRF токен при каждом переходе на страницу
  await refreshCsrf()
  
  // Если роут не требует авторизации - пропускаем
  if (!to.meta.requiresAuth) {
    return next()
  }
  
  // Если включен режим пропуска проверки авторизации (dev)
  if (SKIP_AUTH_CHECK) {
    if (DEBUG_MODE) {
      console.log('[Router] Auth check skipped (SKIP_AUTH_CHECK=true)')
    }
    return next()
  }
  
  // Проверяем авторизацию
  try {
    const now = Date.now()
    
    // Используем кэш если проверка была недавно
    if (!authCheckPromise || (now - lastAuthCheck > AUTH_CHECK_CACHE_TIME)) {
      lastAuthCheck = now
      authCheckPromise = api.checkAuth()
    }
    
    const userData = await authCheckPromise
    
    if (userData) {
      // Пользователь авторизован - сохраняем данные в store
      const { useAppStore } = await import('@/stores/app.js')
      const store = useAppStore()
      store.setUser(userData)
      return next()
    } else {
      // Пользователь не авторизован - редирект на логин
      authCheckPromise = null // Сбрасываем кэш
      return next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[Router] Auth check error:', error)
    }
    authCheckPromise = null // Сбрасываем кэш при ошибке
    return next({ name: 'login' })
  }
})

// Экспорт функции для сброса кэша авторизации
export function resetAuthCache() {
  authCheckPromise = null
  lastAuthCheck = 0
}

export default router
