// index.ts

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import AboutPage from '@/components/AboutPage.vue'
import CoursesPage from '@/components/CoursesPage.vue'
import APITestPage from '@/components/APITestPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import InfoPage from '@/components/InfoPage.vue'
import SignInPage from '@/components/SignInPage.vue'
import SignUpPage from '@/components/SignUpPage.vue'
import EditProfilePage from '@/components/EditProfilePage.vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
    meta: { title: 'Home - ClassPeek' }
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: AboutPage,
    meta: { title: 'About - ClassPeek' }
  },
  {
    path: '/courses',
    name: 'CoursesPage',
    component: CoursesPage,
    meta: { title: 'Courses - ClassPeek' }
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: { title: 'Profile - ClassPeek' }
  },
  {
    path: '/info/:type/:id',
    name: 'Info',
    component: InfoPage,
    meta: { title: 'Info - ClassPeek' },
    beforeEnter: async (to, from, next) => {
      try {
        // Fetch the data to get the name
        const response = await axios.get(
          `${API_BASE_URL}/${to.params.type}s/${to.params.id}`
        );
        
        // Set meta title based on type and name
        const name = to.params.type === 'professor' ? response.data.name : response.data.title;
        to.meta.title = `${name} - ClassPeek`;
        
        next();
      } catch (error) {
        console.error('Error fetching data for meta:', error);
        next();
      }
    }
  },
  {
    path: '/api-test',
    name: 'APITestPage',
    component: APITestPage,
    meta: { title: 'API Test - ClassPeek' } 
  },
  {
    path: '/signin',
    name: 'SignInPage',
    component: SignInPage,
    meta: { title: 'Sign In - ClassPeek' }
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: SignUpPage, 
    meta: { title: 'Sign In - ClassPeek' }
  },
  {
    path: '/profile/edit',
    name: "EditProfilePage",
    component: EditProfilePage, 
    meta: { title: 'Edit Profile - ClassPeek' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard to create titles
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'ClassPeek'
  next()
})


export default router