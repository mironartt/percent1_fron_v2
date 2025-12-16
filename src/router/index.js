import { createRouter, createWebHistory } from 'vue-router'
import { SKIP_AUTH_CHECK, DEBUG_MODE, YANDEX_METRIKA_ID } from '@/config/settings.js'
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
const Planning = () => import('@/views/Planning.vue')
const Settings = () => import('@/views/Settings.vue')
const Subscription = () => import('@/views/Subscription.vue')
const Club = () => import('@/views/Club.vue')
const JournalHistory = () => import('@/views/JournalHistory.vue')
const LearningCenter = () => import('@/views/LearningCenter.vue')
const Profile = () => import('@/views/Profile.vue')
const Habits = () => import('@/views/Habits.vue')
const OnboardingAI = () => import('@/components/OnboardingAI.vue')
const NotFound = () => import('@/views/NotFound.vue')
const LegalPage = () => import('@/views/LegalPage.vue')

// Year Review (New Year)
const NewYearLanding = () => import('@/views/land/NewYearLanding.vue')
const NewYearTest = () => import('@/views/land/NewYearTest.vue')
const NewYearResults = () => import('@/views/land/NewYearResults.vue')

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
    
    // Year Review (Итоги года)
    {
      path: '/land/newyear',
      name: 'newyear-landing',
      component: NewYearLanding,
      meta: { title: 'Итоги 2025 — OnePercent', public: true }
    },
    {
      path: '/land/newyear/test',
      name: 'newyear-test',
      component: NewYearTest,
      meta: { title: 'Тест — Итоги 2025', public: true }
    },
    {
      path: '/land/newyear/results',
      name: 'newyear-results',
      component: NewYearResults,
      meta: { title: 'Твои итоги 2025 и план на 2026 — OnePercent', public: true }
    },
    
    // Onboarding (требует авторизации)
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingAI,
      meta: { title: 'Онбординг', requiresAuth: true }
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
    
    // Legal pages (публичные)
    {
      path: '/privacy',
      name: 'privacy',
      component: LegalPage,
      meta: { title: 'Политика конфиденциальности', public: true, docType: 'privacy' }
    },
    {
      path: '/termspolicy',
      name: 'terms',
      component: LegalPage,
      meta: { title: 'Условия использования', public: true, docType: 'terms' }
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: LegalPage,
      meta: { title: 'Отказ от ответственности', public: true, docType: 'disclaimer' }
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
        const { useAppStore } = await import('@/stores/app.js')
        const store = useAppStore()
        store.clearUser()
        authCheckPromise = null
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
      path: '/app/planning',
      name: 'planning',
      component: Planning,
      meta: { title: 'Планирование недели', requiresAuth: true }
    },
    {
      path: '/app/settings',
      name: 'settings',
      component: Settings,
      meta: { title: 'Профиль', requiresAuth: true }
    },
    {
      path: '/app/subscription',
      name: 'subscription',
      component: Subscription,
      meta: { title: 'Тарифы и подписка', requiresAuth: true }
    },
    {
      path: '/app/club',
      name: 'club',
      component: Club,
      meta: { title: 'Клуб 1%', requiresAuth: true }
    },
    {
      path: '/app/journal',
      name: 'journal',
      component: JournalHistory,
      meta: { title: 'Дневник', requiresAuth: true }
    },
    {
      path: '/app/learning',
      name: 'learning',
      component: LearningCenter,
      meta: { title: 'Обучение', requiresAuth: true }
    },
    {
      path: '/app/achievements',
      name: 'achievements',
      component: Profile,
      meta: { title: 'Достижения', requiresAuth: true }
    },
    {
      path: '/app/habits',
      name: 'habits',
      component: Habits,
      meta: { title: 'Привычки', requiresAuth: true }
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
    { path: '/planning', redirect: '/app/planning' },
    { path: '/settings', redirect: '/app/settings' },
    { path: '/club', redirect: '/app/club' },
    
    // 404 - страница не найдена
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { title: 'Страница не найдена', public: true }
    }
  ]
})

// Переменная для сброса кэша при logout
let authCheckPromise = null

async function checkUserAuth() {
  if (SKIP_AUTH_CHECK) {
    if (DEBUG_MODE) {
      console.log('[Router] Auth check skipped (SKIP_AUTH_CHECK=true), simulating authenticated user')
    }
    return { 
      isAuthenticated: true, 
      userData: { 
        id: 'dev-user', 
        email: 'dev@example.com', 
        first_name: 'Dev User',
        finish_onboarding: true,
        finish_minitask: true
      },
      skipped: true
    }
  }
  
  try {
    // Всегда вызываем API для получения свежих данных пользователя
    if (DEBUG_MODE) {
      console.log('[Router] Fetching fresh user data from API...')
    }
    
    const userData = await api.checkAuth()
    
    if (DEBUG_MODE) {
      if (userData) {
        console.log('[Router] User authenticated:', {
          id: userData.id,
          email: userData.email,
          name: userData.first_name || userData.name || 'N/A',
          finish_onboarding: userData.finish_onboarding,
          finish_minitask: userData.finish_minitask
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
    return { isAuthenticated: false, userData: null, skipped: false }
  }
}

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  if (DEBUG_MODE) {
    console.log(`[Router] Navigation: ${from.path} → ${to.path}`)
  }
  
  document.title = to.meta.title ? `${to.meta.title} - OnePercent` : 'OnePercent'
  
  await refreshCsrf()
  
  const { useAppStore } = await import('@/stores/app.js')
  const store = useAppStore()
  
  const needsAuthCheck = to.meta.requiresAuth || to.meta.guestOnly
  
  if (!needsAuthCheck) {
    if (DEBUG_MODE) {
      console.log('[Router] Public route, no auth check needed')
    }
    return next()
  }
  
  const authResult = await checkUserAuth()
  const { isAuthenticated, userData, skipped } = authResult
  
  if (userData) {
    store.setUser(userData)
    
    // Синхронизируем XP balance с данными пользователя
    const { useXpStore } = await import('@/stores/xp.js')
    const xpStore = useXpStore()
    xpStore.syncFromUserData(userData)
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
  
  if (to.meta.guestOnly && isAuthenticated && !skipped) {
    if (DEBUG_MODE) {
      console.log('[Router] Authenticated user on guest-only route, redirecting to /app')
    }
    return next({ name: 'dashboard' })
  }
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (DEBUG_MODE) {
      console.log('[Router] Unauthenticated user on protected route, redirecting to login')
    }
    authCheckPromise = null
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }
  
  // Mini-task navigation blocking
  // Block navigation to any route except settings until mini-task is complete
  // Only applies if: user finished onboarding but not mini-task
  if (to.meta.requiresAuth && isAuthenticated) {
    const shouldBlockForMiniTask = store.shouldShowMiniTask
    const allowedDuringMiniTask = ['dashboard', 'settings', 'logout']
    
    if (shouldBlockForMiniTask && !allowedDuringMiniTask.includes(to.name)) {
      if (DEBUG_MODE) {
        console.log('[Router] Blocking navigation during mini-task, redirecting to dashboard')
      }
      return next({ name: 'dashboard' })
    }
  }
  
  if (DEBUG_MODE) {
    console.log('[Router] Navigation allowed')
  }
  return next()
})

// Отслеживание переходов в Яндекс.Метрике (для SPA)
router.afterEach(async (to) => {
  if (typeof window !== 'undefined' && window.ym && YANDEX_METRIKA_ID) {
    try {
      window.ym(YANDEX_METRIKA_ID, 'hit', to.fullPath, {
        title: to.meta.title || document.title
      })

      if (DEBUG_MODE) {
        console.log('[YandexMetrika] Page view tracked:', {
          id: YANDEX_METRIKA_ID,
          path: to.fullPath,
          title: to.meta.title || document.title
        })
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[YandexMetrika] Error tracking page view:', error)
      }
    }
  }
  
  // Activation tracking for First Week Mission
  if (to.meta.requiresAuth) {
    try {
      const { useActivationStore } = await import('@/stores/activation.js')
      const activationStore = useActivationStore()
      
      // Track page visits for activation tasks
      const routeToTask = {
        '/app/goals': 'view_goals',
        '/app/goals-bank': 'view_goals'
      }
      
      // Check path patterns
      for (const [path, taskId] of Object.entries(routeToTask)) {
        if (to.path.startsWith(path)) {
          activationStore.completeTask(taskId)
          break
        }
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Router] Error tracking activation:', error)
      }
    }
  }
})

// Экспорт функции для сброса кэша авторизации
export function resetAuthCache() {
  authCheckPromise = null
}

export default router
