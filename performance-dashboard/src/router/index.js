import { createRouter, createWebHistory } from 'vue-router'
import PerformanceView from '@/views/PerformanceView.vue'
import ResultsView from '@/views/ResultsView.vue'
import JmeterView from '@/views/JmeterView.vue'

const routes = [
  { path: '/', redirect: '/performance' },
  { path: '/performance', component: PerformanceView },
  { path: '/results', component: ResultsView },
  { path: '/jmeter',  component: JmeterView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
