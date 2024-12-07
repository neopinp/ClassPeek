<template>
  <div v-if="sessionStore.user.user_type === 'PROFESSOR'" class="form-page">
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
              {{ prerequisite.title }} - {{ prerequisite.course_code }}
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
    <div v-if="showSuccessToast" class="toast-notification success-toast show">
      {{ successMessage }}
    </div>

    <!-- Error Toast -->
    <div v-if="showErrorToast" class="toast-notification error-toast show">
      {{ errorMessage }}
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
import { isAxiosError } from 'axios';

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
    course_code: string;
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
        },
        professors: [] as Professor[],
        subjects: [] as Subject[],
        majors: [] as Major[],
        courses: [] as Course[],
        loading: false,
        showSuccessToast: false,
        successMessage: '',
        showErrorToast: false,
        errorMessage: ''
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
              majors: currentCourse.majors?.map((major: { id: number }) => major.id) || "",
            };

            // Exclude the current course from prerequisites
            this.courses = coursesRes.data.filter(course => course.id !== currentCourse.id);
          } else {
            this.courses = coursesRes.data;
          }
        } catch (error) {
          console.error('Error fetching reference data:', error);
        } finally {
          this.loading = false;
        }
      },

      async handleSubmit() {
        try {
          this.loading = true;

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

          this.showToast("success", `Successfully ${this.isEditing ? "updated" : "created"}!`);
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            // Handle Axios-specific errors
            console.error("Axios error saving course:", error);
            this.showToast("error", error.response?.data?.error || "An unexpected error occurred. Please try again.");
          } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            console.error("Unexpected error saving course:", error);
            this.showToast("error", error.message || "An unexpected error occurred. Please try again.");
          } else {
            // Handle any other types of thrown values
            console.error("Non-Error thrown:", error);
            this.showToast("error", "An unexpected error occurred. Please try again.");
          }
        } finally {
          this.loading = false;
        }
      },

      handleCancel() {
        this.$router.push('/my-courses');
      },

      showToast(type: 'success' | 'error', message: string) {
        if (type === 'success') {
          this.successMessage = message;
          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
            // TODO: Route this to created course
            this.$router.push(`/all-courses`)
          }, 3000); // Toast disappears after 3 seconds
        } else if (type === 'error') {
          this.errorMessage = message;
          this.showErrorToast = true;

          setTimeout(() => {
            this.showErrorToast = false;
          }, 3000); // Toast disappears after 3 seconds
        }
      },
    },
    mounted() {
      this.fetchReferenceData();
    },
  });
</script>

<style scoped>
  @import 'styles/Forms.css';
</style>