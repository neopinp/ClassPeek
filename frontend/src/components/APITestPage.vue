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
                  <button @click="viewCourseDetails(course.id)">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
  
      <!-- Professors Section -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Professors</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full border">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 border">Name</th>
                <th class="p-2 border">Email</th>
                <th class="p-2 border">Office</th>
                <th class="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="professor in professors" :key="professor.id">
                <td class="p-2 border">{{ professor.name }}</td>
                <td class="p-2 border">{{ professor.credentials?.school_email }}</td>
                <td class="p-2 border">{{ professor.professor_page?.office_location }}</td>
                <td class="p-2 border">
                  <button @click="viewProfessorDetails(professor.id)" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mb-4">
            <input 
            v-model="searchId" 
            type="number" 
            placeholder="Search by ID"
            class="p-2 border rounded mr-2"
            />
            <button 
            @click="searchProfessor" 
            class="bg-blue-500 text-white px-4 py-2 rounded"
            >
            Search
            </button>
        </div>
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="subject in subjects" :key="subject.id">
                <td class="p-2 border">{{ subject.code }}</td>
                <td class="p-2 border">{{ subject.name }}</td>
                <td class="p-2 border">{{ subject.courses?.length || 0 }}</td>
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
    // for example, for course in courses, and course.corse_code, course.title, etc.
    data() {
      return {
        courses: [] as any[],
        professors: [] as any[],
        subjects: [] as any[],
        selectedCourse: null as any,
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
      async fetchCourses() {
        try {
          this.loading.courses = true;
          // axios is what works with our backend API routes.
          // for example, the courses API would be 'http://localhost:3000/api/courses'
          // response.data contains the table information we need to populate our page. 
          // refer to the backend to see how the structure is returned
          const response = await axios.get(`${API_BASE_URL}/courses`);
          this.courses = response.data;
        } catch (error) {
          console.error('Error fetching courses:', error);
        } finally {
          this.loading.courses = false;
        }
      },
  
      async fetchProfessors() {
        try {
          this.loading.professors = true;
          const response = await axios.get(`${API_BASE_URL}/professors`);
          this.professors = response.data;
          console.log(response.data )
        } catch (error) {
          console.error('Error fetching professors:', error);
        } finally {
          this.loading.professors = false;
        }
      },

      async searchProfessor() {
        if (!this.searchId) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/professors/${this.searchId}`);
            this.professors = response.data ? [response.data] : [];
        } catch (error) {
            console.error('Error searching professor:', error);
            this.professors = [];
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
  
      viewProfessorDetails(professorId: number) {
        // Implement professor details view
        console.log('Viewing professor:', professorId);
      },
  
      // Example POST methods
      async createCourse(courseData: any) {
        try {
          const response = await axios.post(`${API_BASE_URL}/courses`, courseData);
          await this.fetchCourses();
          return response.data;
        } catch (error) {
          console.error('Error creating course:', error);
        }
      },
  
      async updateProfessorPage(professorId: number, pageData: any) {
        try {
          const response = await axios.put(`${API_BASE_URL}/professors/${professorId}/page`, pageData);
          await this.fetchProfessors();
          return response.data;
        } catch (error) {
          console.error('Error updating professor page:', error);
        }
      }
    },
    
    // Mounted just runs these functions when the page loads
    // This way, when the page runs we already have courses, professors, and subjects to work with.
    mounted() {
      this.fetchCourses();
      this.fetchProfessors();
      this.fetchSubjects();
    }
  });
  </script>
