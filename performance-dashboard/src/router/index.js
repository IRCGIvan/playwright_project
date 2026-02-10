import { createRouter, createWebHistory } from 'vue-router'
import PerformanceView from '@/views/PerformanceView.vue'
import ResultsView from '@/views/ResultsView.vue'

const routes = [
  { path: '/', redirect: '/performance' },
  { path: '/performance', component: PerformanceView },
  { path: '/results', component: ResultsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

// import { createRouter, createWebHistory } from 'vue-router'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [],
// })

// export default router
