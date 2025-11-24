import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import BalancedScorecard from '../views/BalancedScorecard.vue'
import SSPAnalytics from '../views/SSPAnalytics.vue'
import Goals from '../views/Goals.vue'
import Planner from '../views/Planner.vue'
import Settings from '../views/Settings.vue'
import Club from '../views/Club.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      path: '/ssp-analytics',
      name: 'ssp-analytics',
      component: SSPAnalytics,
      meta: { title: 'ССП - Аналитика и Прогресс' }
    },
    {
      path: '/goals',
      name: 'goals',
      component: Goals,
      meta: { title: 'Банк целей' }
    },
    {
      path: '/planner',
      name: 'planner',
      component: Planner,
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
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - OnePercent` : 'OnePercent'
  next()
})

export default router
