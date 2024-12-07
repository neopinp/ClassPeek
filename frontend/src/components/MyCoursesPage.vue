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
    <h1>My Courses</h1>
    <div v-if="loading" class="loading">Loading...</div>
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
        <div class="actions">
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
            @click="deleteCourse(course.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import api from "../api";
import sessionStore from "../store/session";

interface Course {
  id: number;
  title: string;
  course_code: string;
  description: string;
}

export default defineComponent({
  name: "MyCoursesPage",
  data() {
    return {
      courses: [] as Course[],
      searchQuery: '',
      loading: false,
      error: null as string | null,
    };
  },
  computed: {
    isCurrentProfessor(): boolean {
      return sessionStore.user.user_type === "PROFESSOR";
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
        // Use the existing route to fetch the professor's data
        const response = await api.get(`/professors/${sessionStore.user.id}`);
        const professorData = response.data;

        // Ensure we only use the courses_taught field
        if (professorData?.courses_taught) {
          this.courses = professorData.courses_taught.map((course: { id: any; title: any; course_code: any; description: any; }) => ({
            id: course.id,
            title: course.title,
            course_code: course.course_code,
            description: course.description,
          }));
        } else {
          this.courses = [];
        }
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        this.error = error.response?.data?.error || "Failed to fetch courses.";
      } finally {
        this.loading = false;
      }
    },
    async deleteCourse(courseId: number) {
      if (!confirm("Are you sure you want to delete this course?")) return;
      try {
        await api.delete(`/courses/${courseId}`);
        this.courses = this.courses.filter((course) => course.id !== courseId);
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    },
  },
  mounted() {
    if (this.isCurrentProfessor) {
      this.fetchCourses();
    } else {
      this.error = "Unauthorized: Only professors can access this page.";
    }
  },
});
</script>

<style scoped>
  @import 'styles/Courses.css';
</style>