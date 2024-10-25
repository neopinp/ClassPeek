import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import AboutPage from '@/components/AboutPage.vue'
import CoursesPage from '@/components/CoursesPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import InfoPage from '@/components/InfoPage.vue'

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
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: ProfilePage
  },
  {
    path: '/info',
    name: 'InfoPage',
    component: InfoPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router