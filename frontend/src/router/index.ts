// index.ts

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import sessionStore from '@/store/session'
import HomePage from '@/components/HomePage.vue'
import AboutPage from '@/components/AboutPage.vue'
import SubjectsPage from '@/components/SubjectsPage.vue'
import APITestPage from '@/components/APITestPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import InfoPage from '@/components/InfoPage.vue'
import SignInPage from '@/components/SignInPage.vue'
import SignUpPage from '@/components/SignUpPage.vue'
import EditProfilePage from '@/components/EditProfilePage.vue'
import axios from 'axios'

import MajorsPage from '@/components/MajorsPage.vue'
import CourseForm from '@/components/CourseForm.vue'
import MajorForm from '@/components/MajorForm.vue'
import SubjectForm from '@/components/SubjectForm.vue'

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
    path: '/subjects',
    name: 'SubjectsPage',
    component: SubjectsPage,
    meta: { title: 'Subjects - ClassPeek' }
  },
  {
    path: '/majors',
    name: 'MajorsPage',
    component: MajorsPage,
    meta: { title: 'Majors - ClassPeek' }
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: { title: 'Profile - ClassPeek' }
  },
  {
    path: '/course-form/:id?',
    name: 'CourseForm',
    component: CourseForm,
    meta: { title: 'Course Form - ClassPeek' }
  },
  {
    path: '/major-form/:id?',
    name: 'MajorForm',
    component: MajorForm,
    meta: { title: 'Major Form - ClassPeek' }
  },
  {
    path: '/subject-form/:id?',
    name: 'SubjectForm',
    component: SubjectForm,
    meta: { title: 'Subject Form - Classpeek'}
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