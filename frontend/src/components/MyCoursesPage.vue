<template>
  <div class="my-courses-page">
    <h1>My Courses</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="courses-list">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <h3>{{ course.title }}</h3>
        <p><strong>Code:</strong> {{ course.course_code }}</p>
        <p><strong>Description:</strong> {{ course.description }}</p>
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
  name: "MyCoursePage",
  data() {
    return {
      courses: [] as Course[],
      loading: false,
      error: null as string | null,
    };
  },
  computed: {
    isCurrentProfessor(): boolean {
      return sessionStore.user.user_type === "PROFESSOR";
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
.my-courses-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
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