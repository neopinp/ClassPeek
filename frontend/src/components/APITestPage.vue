<template>
  <div class="api-test p-4">
    <!-- Course Details Modal -->
    <!-- We show this when selectedCourse has data -->
    <div v-if="selectedCourse" class="modal">
      <div class="modal-content">
        <h2>Course Details</h2>
        <!-- Show loading state while fetching details -->
        <div v-if="loading.courseDetails">Loading...</div>
        <div v-else>
          <p><strong>Code:</strong> {{ selectedCourse.course_code }}</p>
          <p><strong>Title:</strong> {{ selectedCourse.title }}</p>
          <p><strong>Description:</strong> {{ selectedCourse.description }}</p>
          <p><strong>Credits:</strong> {{ selectedCourse.credits }}</p>
          <p><strong>Professor:</strong> {{ selectedCourse.professor?.name }}</p>
          <p><strong>Subject:</strong> {{ selectedCourse.subject?.name }}</p>
          <div v-if="selectedCourse.prerequisites?.length">
            <strong>Prerequisites:</strong>
            <ul>
              <li v-for="prereq in selectedCourse.prerequisites" :key="prereq.id">
                {{ prereq.course_code }} - {{ prereq.title }}
              </li>
            </ul>
          </div>
        </div>
        <button @click="selectedCourse = null">Close</button>
      </div>
    </div>

    <h1 class="text-2xl font-bold mb-6">API Testing Dashboard</h1>
    
    <!-- Courses Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Courses</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Code</th>
              <th class="p-2 border">Title</th>
              <th class="p-2 border">Professor</th>
              <th class="p-2 border">Subject</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course.id">
              <td>{{ course.course_code }}</td>
              <td>{{ course.title }}</td>
              <td>{{ course.professor?.name }}</td>
              <td>{{ course.subject?.name }}</td>
              <td>
                <button @click="viewCourseDetails(course.id)" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">View</button>
                <button @click="deleteCourse(course.id)" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Users Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Users</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">ID</th>
              <th class="p-2 border">Name</th>
              <th class="p-2 border">Type</th>
              <th class="p-2 border">Email</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="p-2 border">{{ user.id }}</td>
              <td class="p-2 border">{{ user.name }}</td>
              <td class="p-2 border">{{ user.user_type }}</td>
              <td class="p-2 border">{{ user.credentials?.school_email }}</td>
              <td class="p-2 border">
                <button @click="deleteUser(user.id)" class="bg-red-500 text-white px-2 py-1 rounded">
                  Delete User
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Professor Pages Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Professor Pages</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Professor Name</th>
              <th class="p-2 border">Office</th>
              <th class="p-2 border">Office Hours</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="page in professorPages" :key="page.id">
              <td class="p-2 border">{{ getProfessorName(page.professor_id) }}</td>
              <td class="p-2 border">{{ page.office_location }}</td>
              <td class="p-2 border">{{ page.office_hours }}</td>
              <td class="p-2 border">
                <button @click="deleteProfessorPage(page.id)" class="bg-red-500 text-white px-2 py-1 rounded">
                  Delete Page
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Subjects Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Subjects</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Code</th>
              <th class="p-2 border">Name</th>
              <th class="p-2 border">Course Count</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id">
              <td class="p-2 border">{{ subject.code }}</td>
              <td class="p-2 border">{{ subject.name }}</td>
              <td class="p-2 border">{{ subject.courses?.length || 0 }}</td>
              <td class="p-2 border">
                <button @click="deleteSubject(subject.id)" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export default defineComponent({
  name: 'APITestPage',
  
  // The context where the async methods attached fetched data to
  // this is where the data is defined and worked with in the HTML template
  data() {
    return {
      // Data arrays for different entities
      courses: [] as any[],
      subjects: [] as any[],
      users: [] as any[],
      professors: [] as any[],
      professorPages: [] as any[],
      selectedCourse: null as any,
      // Loading states for UI feedback
      loading: {
        courses: false,
        professors: false,
        subjects: false,
        courseDetails: false
      },
      searchId: '' as string | number,
      error: null as string | null
    };
  },

  methods: {
    // Fetch Methods - These methods get data from our API endpoints
    async fetchCourses() {
      try {
        this.loading.courses = true;
        const response = await axios.get(`${API_BASE_URL}/courses`);
        this.courses = response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        this.loading.courses = false;
      }
    },

    async fetchUsers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    // Combined professor-related fetches into one method
    async fetchProfessorData() {
      try {
        this.loading.professors = true;
        const response = await axios.get(`${API_BASE_URL}/professors`);
        this.professors = response.data;
        this.professorPages = response.data
          .map((prof: any) => prof.professor_page)
          .filter(Boolean);
      } catch (error) {
        console.error('Error fetching professor data:', error);
      } finally {
        this.loading.professors = false;
      }
    },

    async fetchSubjects() {
      try {
        this.loading.subjects = true;
        const response = await axios.get(`${API_BASE_URL}/subjects`);
        this.subjects = response.data;
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        this.loading.subjects = false;
      }
    },

    // Utility Methods
    getProfessorName(professorId: number) {
      const professor = this.professors.find(p => p.id === professorId);
      return professor ? professor.name : 'Unknown';
    },

    // View Methods
    async viewCourseDetails(courseId: number) {
      try {
        this.loading.courseDetails = true;
        const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
        this.selectedCourse = response.data;
      } catch (error) {
        console.error('Error fetching course details:', error);
        this.error = 'Failed to load course details';
      } finally {
        this.loading.courseDetails = false;
      }
    },

    // Delete Methods - Each includes confirmation and error handling
    async deleteUser(userId: number) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`${API_BASE_URL}/users/${userId}`);
          await this.fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Error deleting user. Make sure there are no related records.');
        }
      }
    },

    async deleteProfessorPage(pageId: number) {
      if (confirm('Are you sure you want to delete this professor page?')) {
        try {
          await axios.delete(`${API_BASE_URL}/professors/${pageId}`);
          await this.fetchProfessorData();
        } catch (error) {
          console.error('Error deleting professor page:', error);
          alert('Error deleting professor page');
        }
      }
    },

    async deleteCourse(courseId: number) {
      if (confirm('Are you sure you want to delete this course?')) {
        try {
          await axios.delete(`${API_BASE_URL}/courses/${courseId}`);
          // Update both courses and subjects to refresh course count
          await Promise.all([
            this.fetchCourses(),
            this.fetchSubjects()
          ]);
        } catch (error) {
          console.error('Error deleting course:', error);
          alert('Error deleting course. Make sure there are no prerequisites or other dependencies.');
        }
      }
    },

    async deleteSubject(subjectId: number) {
      if (confirm('Are you sure you want to delete this subject?')) {
        try {
          await axios.delete(`${API_BASE_URL}/subjects/${subjectId}`);
          await this.fetchSubjects();
        } catch (error) {
          console.error('Error deleting subject:', error);
          alert('Error deleting subject. Make sure there are no courses associated with it.');
        }
      }
    },

    // Create/Update Methods
    async createCourse(courseData: any) {
      try {
        const response = await axios.post(`${API_BASE_URL}/courses`, courseData);
        // Update both courses and subjects to refresh course count
        await Promise.all([
          this.fetchCourses(),
          this.fetchSubjects()
        ]);
        return response.data;
      } catch (error) {
        console.error('Error creating course:', error);
      }
    },

    async updateProfessorPage(professorId: number, pageData: any) {
      try {
        const response = await axios.put(`${API_BASE_URL}/professors/${professorId}/page`, pageData);
        await this.fetchProfessorData();
        return response.data;
      } catch (error) {
        console.error('Error updating professor page:', error);
      }
    }
  },
  
  // Mounted runs these functions when the page loads
  // This way, when the page runs we already have all our data to work with
  mounted() {
    Promise.all([
      this.fetchCourses(),
      this.fetchUsers(),
      this.fetchProfessorData(),
      this.fetchSubjects()
    ]);
  }
});
</script>