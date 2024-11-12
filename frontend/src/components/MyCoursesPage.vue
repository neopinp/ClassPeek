<template>
  <div class="my-courses-page">
    <h1>My Courses</h1>
    <div v-if="loading" class="loading-indicator">Loading...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="courses.length > 0" class="courses-list">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <div v-if="isEditingField === course.id" class="editable-container">
          <label>Course Title:</label>
          <input 
            v-model="editedData.title"
            type="text" 
            placeholder="Edit course title" 
          />
          <label>Course Description:</label>
          <textarea 
            v-model="editedData.description"
            placeholder="Edit course description">
          </textarea>
          <button @click="saveEdit(course.id)" class="btn btn-primary">Save</button>
          <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
        </div>
        <div v-else>
          <h2>{{ course.title }}</h2>
          <p>{{ course.description }}</p>
          <button @click="startEdit(course)" class="btn btn-secondary">Edit</button>
          <button @click="deleteCourse(course.id)" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>

    <div v-else class="no-courses-message">You have no courses to display.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import api from "../api";
import sessionStore from "../store/session";

interface Course {
  id: number;
  title: string;
  description: string;
}

export default defineComponent({
  name: "MyCoursePage",
  data() {
    return {
      courses: [] as Course[],
      loading: false,
      error: null as string | null,
      isEditingField: null as number | null,
      editedData: {
        title: "",
        description: "",
      },
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
        this.courses = professorData.courses_taught.map((course: { id: any; title: any; description: any; }) => ({
          id: course.id,
          title: course.title,
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
    startEdit(course: Course) {
      this.isEditingField = course.id;
      this.editedData = { ...course };
    },
    async saveEdit(courseId: number) {
      try {
        const response = await api.put(`/courses/${courseId}`, this.editedData);
        const index = this.courses.findIndex((course) => course.id === courseId);
        if (index !== -1) {
          this.courses[index] = response.data;
        }
        this.isEditingField = null;
      } catch (error) {
        console.error("Error saving course:", error);
      }
    },
    cancelEdit() {
      this.isEditingField = null;
      this.editedData = {
        title: "",
        description: "",
      };
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
  padding: 20px;
}

.loading-indicator,
.error-message {
  text-align: center;
  color: #ff0000;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-card {
  background: #ffffff;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-card h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.course-card p {
  margin: 0.5rem 0;
  color: #666;
}

.editable-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.editable-container input,
.editable-container textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.no-courses-message {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>