import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import AboutPage from '@/components/AboutPage.vue'
import CoursesPage from '@/components/CoursesPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: AboutPage
  },
  {
    path: '/courses',
    name: 'CoursesPage',
    component: CoursesPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
