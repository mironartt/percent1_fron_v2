import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import BalancedScorecard from '../views/BalancedScorecard.vue'
import Goals from '../views/Goals.vue'
import GoalEdit from '../views/GoalEdit.vue'
import GoalsBank from '../views/GoalsBank.vue'
import Planner from '../views/Planner.vue'
import Settings from '../views/Settings.vue'
import Club from '../views/Club.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
