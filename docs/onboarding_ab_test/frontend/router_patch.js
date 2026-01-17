// Router Patch for A/B Test
// Применить эти изменения в файле: src/router/index.js

// ============================================
// ШАГ 1: Изменить импорт компонента
// ============================================

// БЫЛО:
// const OnboardingAI = () => import('@/components/OnboardingAI.vue')

// СТАЛО:
const OnboardingRouter = () => import('@/components/OnboardingRouter.vue')


// ============================================
// ШАГ 2: Изменить route definition
// ============================================

// БЫЛО:
/*
{
  path: '/onboarding',
  name: 'Onboarding',
  component: OnboardingAI,
  meta: {
    requiresAuth: true,
    title: 'Онбординг'
  }
}
*/

// СТАЛО:
{
  path: '/onboarding',
  name: 'Onboarding',
  component: OnboardingRouter, // ← Изменили компонент
  meta: {
    requiresAuth: true,
    title: 'Онбординг'
  }
}


// ============================================
// ПОЛНЫЙ ПРИМЕР ПОСЛЕ ИЗМЕНЕНИЙ
// ============================================

/*
import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

// ... другие импорты ...

// A/B Test Onboarding Router
const OnboardingRouter = () => import('@/components/OnboardingRouter.vue')

// ... другие компоненты ...

const routes = [
  // ... другие маршруты ...

  {
    path: '/onboarding',
    name: 'Onboarding',
    component: OnboardingRouter,
    meta: {
      requiresAuth: true,
      title: 'Онбординг'
    }
  },

  // ... другие маршруты ...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards остаются без изменений
router.beforeEach(async (to, from, next) => {
  // ... существующая логика ...
})

export default router
*/


// ============================================
// ОТКАТ (Rollback)
// ============================================

// Если нужно вернуть старый онбординг:
// 1. Заменить обратно:
//    const OnboardingAI = () => import('@/components/OnboardingAI.vue')
// 2. В route definition:
//    component: OnboardingAI


// ============================================
// ПРОВЕРКА
// ============================================

// После изменений проверьте:
// 1. npm run dev
// 2. Откройте /onboarding
// 3. Проверьте в консоли: должно появиться "🧪 A/B Test: { variant: 'fast' или 'deep' }"
// 4. Проверьте localStorage: ключ 'onboarding_variant' должен быть 'fast' или 'deep'
