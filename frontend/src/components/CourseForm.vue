<template>
  <div v-if="sessionStore.user.user_type === 'PROFESSOR'" class="course-form-page">
    <div class="form-card">
      <h2 class="form-title">{{ isEditing ? "Edit Course" : "Create Course" }}</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Title Field -->
        <div class="form-group">
          <label for="title">Course Title</label>
          <input
            id="title"
            type="text"
            v-model="formData.title"
            placeholder="Enter course title"
            class="form-input"
          />
        </div>

        <!-- Course Code Field -->
        <div class="form-group">
          <label for="course-code">Course Code</label>
          <input
            id="course-code"
            type="text"
            v-model="formData.course_code"
            placeholder="Enter course code"
            class="form-input"
          />
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter course description"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Credits Field -->
        <div class="form-group">
          <label for="credits">Credits</label>
          <input
            id="credits"
            type="number"
            v-model.number="formData.credits"
            placeholder="Enter number of credits"
            class="form-input"
          />
        </div>

        <!-- Subject Dropdown -->
        <div class="form-group">
          <label for="subject">Subject</label>
          <select
            id="subject"
            v-model="formData.subject_id"
            class="form-input"
          >
            <option value="" disabled>Select a subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <!-- Professor Dropdown -->
        <div class="form-group">
          <label for="professor">Professor</label>
          <select
            id="professor"
            v-model="formData.professor_id"
            class="form-input"
          >
            <option value="" disabled>Select a professor</option>
            <option v-for="professor in professors" :key="professor.id" :value="professor.id">
              {{ professor.name }}
            </option>
          </select>
        </div>

        <!-- Related Majors -->
        <div class="form-group">
          <label for="majors">Related Majors</label>
          <select
            id="majors"
            v-model="formData.majors"
            class="form-input"
          >
            <option disabled value="">Select a related major</option>
            <option 
              v-for="major in majors" 
              :key="major.id" 
              :value="major.id"
            >
              {{ major.name }}
            </option>
          </select>
        </div>

        <!-- Prerequisites -->
        <div class="form-group">
          <label for="prerequisites">Prerequisites</label>
          <select
            id="prerequisites"
            v-model="formData.prerequisites"
            class="form-input"
            multiple
          >
            <option v-for="prerequisite in courses" :key="prerequisite.id" :value="prerequisite.id">
              {{ prerequisite.title }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? "Save Changes" : "Create Course" }}
          </button>
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="toast success-toast">
      {{ successMessage }}
    </div>

    <!-- Error -->
    <div v-if="error" class="toast error-toast">
      <p>{{ error }}</p>
    </div>
  </div>
  <div v-else class="access-denied">
    <p>You do not have permission to access this page.</p>
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';
  import sessionStore from '@/store/session';
  import api from '@/api';

  interface Professor {
    id: number;
    name: string;
  }

  interface Subject {
    id: number;
    name: string;
  }

  interface Major {
    id: number;
    name: string;
  }

  interface Course {
    id: number;
    title: string;
  }

  export default defineComponent({
    name: 'CourseForm',
    setup() {
      return { sessionStore };
    },
    data() {
      return {
        formData: {
          title: '',
          course_code: '',
          description: '',
          credits: null as number | null,
          professor_id: null as number | null,
          subject_id: null as number | null,
          majors: [] as number[],
          prerequisites: [] as number[],
          //major_id: [] as number[],
        },
        professors: [] as Professor[],
        subjects: [] as Subject[],
        majors: [] as Major[],
        courses: [] as Course[],
        loading: false,
        error: null as string | null,
        showSuccessToast: false,
        successMessage: null as string | null,
      };
    },
    computed: {
      isEditing(): boolean {
        return !!this.$route.params.id;
      },
    },
    methods: {
      async fetchReferenceData() {
        try {
          this.loading = true;

          const [professorsRes, subjectsRes, majorsRes, coursesRes] = await Promise.all([
            api.get<Professor[]>('/professors'),
            api.get<Subject[]>('/subjects'),
            api.get<Major[]>('/majors'),
            api.get<Course[]>('/courses'),
          ]);

          this.professors = professorsRes.data;
          this.subjects = subjectsRes.data;
          this.majors = majorsRes.data;

          if (this.isEditing) {
            // Fetch the current course
            const courseResponse = await api.get(`/courses/${this.$route.params.id}`);
            const currentCourse = courseResponse.data;

            // Populate formData and include the current course ID
            this.formData = {
              ...this.formData,
              id: currentCourse.id, // Include the current course ID
              ...currentCourse,
              prerequisites: currentCourse.prerequisites?.map((prereq: { id: number }) => prereq.id) || [],
              majors: currentCourse.majors?.map((major: { id: number }) => major.id)[0] || "",
            };

            // Exclude the current course from prerequisites
            this.courses = coursesRes.data.filter(course => course.id !== currentCourse.id);
          } else {
            this.courses = coursesRes.data;
          }
        } catch (error) {
          console.error('Error fetching reference data:', error);
          this.error = 'Failed to load reference data.';
        } finally {
          this.loading = false;
        }
      },

      async handleSubmit() {
        try {
          this.loading = true;
          this.error = null;

          // Normalize the payload
          const payload = {
            title: this.formData.title,
            course_code: this.formData.course_code,
            description: this.formData.description,
            credits: this.formData.credits,
            professor: {
              connect: { id: this.formData.professor_id }
            },
            subject: {
              connect: { id: this.formData.subject_id }
            },
            prerequisites: this.formData.prerequisites.map(id => ({ id })),
            majors: this.formData.majors.length > 0 ? { connect: this.formData.majors.map(id => ({ id })) } : undefined,
            user_type: sessionStore.user.user_type // Include user_type for validation in the backend
          };

          const url = this.isEditing
            ? `/courses/${this.$route.params.id}`
            : `/courses`;

          const method = this.isEditing ? "put" : "post";

          const response = await api[method](url, payload);
          console.log("Course saved:", response.data);

          this.successMessage = `Successfully ${this.isEditing ? "updated" : "created"} course!`;
          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
            this.$router.push("/all-courses"); // Navigate to all courses or desired page
          }, 2000);
        } catch (error: any) {
          console.error("Error saving course:", error);

          // Extract and display the error message
          if (error.response && error.response.data && error.response.data.error) {
            this.error = error.response.data.error;
          } else {
            this.error = "An unexpected error occurred. Please try again.";
          }
        } finally {
          this.loading = false;
        }
      },

      handleCancel() {
        this.$router.push('/my-courses');
      },
    },
    mounted() {
      this.fetchReferenceData();
    },
  });
</script>

<style scoped>
/* Base styles for the form page */
.course-form-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;
}

/* Form card styles */
.form-card {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

/* Form title */
.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  color: #2d3748;
}

/* Form group styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #4a5568;
}

.form-input,
.form-textarea,
select {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
  outline: none;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

/* Actions section */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-primary {
  background-color: #3182ce;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #2b6cb0;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background-color: #cbd5e0;
  transform: translateY(-2px);
}

/* Toast notification styles */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #38a169;
  color: #ffffff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.toast.success-toast {
  background-color: #38a169;
}

.toast.error-toast {
  background-color: #e53e3e;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Access denied message */
.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #e53e3e;
}
</style>