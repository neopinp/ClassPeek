<template>
  <div class="all-courses-page">
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
  professor_id?: number;  // Optional here since we only require it for checking course ownership, included in API response
}

export default defineComponent({
  name: "AllCoursesPage",
  data() {
    return {
      courses: [] as Course[],
      searchQuery: '',
      loading: false,
      error: null as string | null,
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
        return this.isAdmin || course.professor_id === sessionStore.user.id;
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

        // Ensure we process the courses correctly
        if (coursesData && Array.isArray(coursesData)) {
          this.courses = coursesData.map((course: { id: any; title: any; course_code: any; description: any; }) => ({
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
    if (this.isProfessor || this.isAdmin) {
      this.fetchCourses();
    } else {
      this.error = "Unauthorized: Only professors and admins can access this page.";
    }
  },
});
</script>

<style scoped>
.all-courses-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.courses-list {
  display: grid;
  gap: 20px;
}

.course-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-card:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.12),
      0 8px 16px rgba(0, 0, 0, 0.08);
  }

.course-card h3 {
  margin-bottom: 10px;
}

.course-title-link {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.course-code {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.course-description {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.edit-button:hover {
  background-color: #2563eb;
}

.delete-button {
  background-color: #ef4444;
}

.delete-button:hover {
  background-color: #dc2626;
}

.link {
  text-decoration: none;
  color: inherit;
  display: inline-block;
}
</style>