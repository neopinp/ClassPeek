<template>
  <div class="courses-page">
    <!-- Search and Filter Section -->
    <div class="search-section">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search courses..."
        class="search-input"
      />
    </div>
    <!-- Courses Section -->
    <h1>All Courses</h1>
    <div v-if="userLoading" class="loading">Loading user data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="courses-list">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card">
        <router-link
          :to="{ name: 'Info', params: { type: 'course', id: course.id } }"
          class="course-title-link"
        >
          <h3>{{ course.title }}</h3>
        </router-link>
        <p class="course-code"><strong>Code:</strong> {{ course.course_code }}</p>
        <p class="course-description"><strong>Description:</strong> {{ course.description || "No description avaliable."}} </p>
        <div v-if="canEditOrDelete(course.id)" class="actions">
          <button class="edit-button">
            <router-link
              :to="{ name: 'CourseForm', params: { id: course.id } }"
              class="link"
            >
              Edit
            </router-link>
          </button>
          <button
            class="delete-button"
            @click="openDeleteModal(course)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete course <strong>{{ selectedCourse?.title }}</strong>?</p>
        <div class="modal-actions" style="margin-top:1rem;">
          <button class="delete-button" @click="confirmDeleteCourse">Delete</button>
          <button class="cancel-button" @click="closeDeleteModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import { isAxiosError } from "axios";
  import api from "../api";
  import sessionStore from "../store/session";

  interface Course {
    id: number;
    title: string;
    course_code: string;
    description: string;
    professor: {
      id: number;
    }
  }

  export default defineComponent({
    name: "AllCoursesPage",
    data() {
      return {
        courses: [] as Course[],
        searchQuery: '',
        loading: false,
        error: null as string | null,
        userLoading: true,
        showDeleteModal: false,
        selectedCourse: null as Course | null,
      };
    },
    computed: {
      isProfessor(): boolean {
        return sessionStore.user.user_type === "PROFESSOR";
      },
      isAdmin(): boolean {
        return sessionStore.user.user_type === "ADMIN";
      },
      canEditOrDelete() {
        return (courseId: number) => {
          const course = this.courses.find((c) => c.id === courseId);
          if (!course) return false;
          return this.isAdmin || course.professor.id === sessionStore.user.id;
        }
      },
      filteredCourses(): Course[] {
        if (!this.searchQuery) return this.courses;

        const query = this.searchQuery.toLowerCase();
        return this.courses.filter(course =>
          course.title.toLowerCase().includes(query) ||
          course.course_code.toLowerCase().includes(query)
        );
      },
    },
    methods: {
      async fetchCourses() {
        try {
          this.loading = true;
          this.error = null;

          const response = await api.get(`/courses`);
          const coursesData = response.data;

          // Ensure we process the courses correctly (including the professor_id for access control)
          if (coursesData && Array.isArray(coursesData)) {
            this.courses = coursesData.map((course: { id: number; title: string; course_code: string; description: string; professor: { id: number };}) => ({
              id: course.id,
              title: course.title,
              course_code: course.course_code,
              description: course.description,
              professor: {
                id: course.professor.id,
              },
            }));
          } else {
            this.courses = [];
          }
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            // Handle Axios-specific errors
            console.error("Axios error fetching courses:", error);
            this.error = error.response?.data?.error || "Failed to fetch courses.";
          } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            console.error("Unexpected error fetching courses:", error);
            this.error = error.message || "Failed to fetch courses.";
          } else {
            // Handle any other types of thrown values
            console.error("Non-Error thrown:", error);
            this.error = "Failed to fetch courses.";
          }
        } finally {
          this.loading = false;
        }
      },
      openDeleteModal(course: Course) {
        this.selectedCourse = course;
        this.showDeleteModal = true;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
        this.selectedCourse = null;
      },
      async confirmDeleteCourse() {
        if (!this.selectedCourse) return;

        try {
          await api.delete(`/courses/${this.selectedCourse.id}`);
          this.courses = this.courses.filter((course) => course.id !== this.selectedCourse?.id);
        } catch (error) {
          console.error("Error deleting course:", error);
        } finally {
          this.closeDeleteModal();
        }
      },
    },
    mounted() {
      // While loading the page, watch for changes in user data
      this.$watch(() => sessionStore.user, (user) => {
        if (user) {
          this.userLoading = false;
          if (this.isProfessor || this.isAdmin) {
            this.fetchCourses();
          } else {
            this.error = "Unauthorized: Only professors and admins can access this page.";
          }
        }
      },
      { immediate: true }
      );
    },
  });
</script>

<style scoped>
  @import 'styles/Courses.css';
</style>