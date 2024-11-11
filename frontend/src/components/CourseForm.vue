<template>
  <div v-if="sessionStore.user.user_type === 'PROFESSOR'" class="max-w-4xl mx-auto p-6">
    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="success-toast"
    >
      {{ successMessage }}
    </div>
    <div class="bg-white rounded-lg shadow-lg p-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEditing ? 'Edit Course' : 'Create New Course' }}
        </h1>
      </header>
      
      <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Course Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block font-medium text-gray-700 mb-2">Course Code</label>
            <input
              v-model="formData.course_code"
              type="text"
              class="w-full p-2 border rounded-md"
              required
              maxlength="15"
              placeholder="e.g., CS101"
              :disabled="loading"
            />
          </div>
          
          <div class="col-span-1">
            <label class="block font-medium text-gray-700 mb-2">Credits</label>
            <input
              v-model.number="formData.credits"
              type="number"
              class="w-full p-2 border rounded-md"
              required
              min="0"
              :disabled="loading"
            />
          </div>
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-2">Title</label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full p-2 border rounded-md"
            required
            maxlength="255"
            placeholder="e.g., Introduction to Computer Science"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-2">Description</label>
          <textarea
            v-model="formData.description"
            class="w-full p-2 border rounded-md"
            required
            rows="4"
            placeholder="Enter course description..."
            :disabled="loading"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-gray-700 mb-2">Professor</label>
            <select
              v-model="formData.professor_id"
              class="w-full p-2 border rounded-md"
              required
              :disabled="loading"
            >
              <option value="">Select a professor</option>
              <option
                v-for="professor in professors"
                :key="professor.id"
                :value="professor.id"
              >
                {{ professor.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-gray-700 mb-2">Subject</label>
            <select
              v-model="formData.subject_id"
              class="w-full p-2 border rounded-md"
              required
              :disabled="loading"
            >
              <option value="">Select a subject</option>
              <option
                v-for="subject in subjects"
                :key="subject.id"
                :value="subject.id"
              >
                {{ subject.name }} ({{ subject.code }})
              </option>
            </select>
          </div>
        </div>
        
        <!-- Prerequisites Section -->
        <div>
          <label class="block font-medium text-gray-700 mb-2">Prerequisites</label>
          <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
            <div
              v-for="course in availablePrereqs"
              :key="course.id"
              class="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                :value="course.id"
                v-model="selectedPrereqIds"
                :id="'prereq-' + course.id"
                :disabled="loading"
                class="rounded"
              />
              <label :for="'prereq-' + course.id" class="text-sm">
                {{ course.course_code }} - {{ course.title }}
              </label>
            </div>
          </div>
        </div>

        <!-- Majors Section -->
        <div>
          <label class="block font-medium text-gray-700 mb-2">Related Majors</label>
          <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
            <div
              v-for="major in majors"
              :key="major.id"
              class="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                :value="major.id"
                v-model="selectedMajorIds"
                :id="'major-' + major.id"
                :disabled="loading"
                class="rounded"
              />
              <label :for="'major-' + major.id" class="text-sm">
                {{ major.name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            @click="$router.back()"
            class="px-4 py-2 border rounded-md hover:bg-gray-50"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import sessionStore from '../store/session';
import api from '../api';

interface Professor {
  id: number;
  name: string;
  user_type: 'PROFESSOR';
  professor_page?: {
    id: number;
    bio?: string;
  };
  credentials?: {
    school_email: string;
  };
  courses_taught?: any[];
}

interface Subject {
  id: number;
  name: string;
  code: string;
  courses?: any[];
}

interface Major {
  id: number;
  name: string;
  description: string;
  courses?: any[];
}

interface Course {
  id: number;
  course_code: string;
  title: string;
  description: string;
  credits: number;
  professor_id: number;
  subject_id: number;
  professor?: Professor;
  subject?: Subject;
  majors?: Major[];
  prerequisites?: Course[];
}

interface CourseFormData {
  course_code: string;
  title: string;
  description: string;
  credits: number;
  professor_id: number | null;
  subject_id: number | null;
  prerequisites?: number[];
}

export default defineComponent({
  name: 'CourseForm',
  
  setup() {
    const router = useRouter();
    onMounted(() => {
      if (sessionStore.user.user_type !== "PROFESSOR") {
        alert("Not a professor, resource access blocked.");
        router.back(); // Redirect to the previous page
      }
    });
    return {
      sessionStore
    } 
  },

  data() {
    return {
      loading: false,
      error: null as string | null,
      showSuccessToast: false,
      successMessage: '',
      professors: [] as Professor[],
      subjects: [] as Subject[],
      majors: [] as Major[],
      selectedMajorIds: [] as number[],
      selectedPrereqIds: [] as number[],
      availablePrereqs: [] as Course[],
      formData: {
        course_code: '',
        title: '',
        description: '',
        credits: 0,
        professor_id: null,
        subject_id: null
      } as CourseFormData
    };
  },

  computed: {
    isEditing(): boolean {
      return !!this.$route.params.id;
    }
  },

  methods: {
    async fetchReferenceData() {
      try {
        this.loading = true;
        const [professorsRes, subjectsRes, majorsRes] = await Promise.all([
          api.get<Professor[]>('/professors'),
          api.get<Subject[]>('/subjects'),
          api.get<Major[]>('/majors')
        ]);
        
        this.professors = professorsRes.data;
        this.subjects = subjectsRes.data;
        this.majors = majorsRes.data;
      } catch (error) {
        console.error('Error fetching reference data:', error);
        this.error = 'Failed to load reference data';
      } finally {
        this.loading = false;
      }
    },

    async fetchAvailablePrereqs() {
      try {
        const response = await api.get<Course[]>('/courses')
        // Filter out the current course if we're editing
        this.availablePrereqs = response.data.filter(course => 
          course.id !== parseInt(this.$route.params.id as string)
        );
      } catch (error) {
        console.error('Error fetching prerequisites:', error);
      }
    },

    async loadCourse(id: string) {
      try {
        this.loading = true;
        const response = await api.get<Course>(`/courses/${id}`);
        const course = response.data;
        
        this.formData = {
          course_code: course.course_code,
          title: course.title,
          description: course.description,
          credits: course.credits,
          professor_id: course.professor_id,
          subject_id: course.subject_id
        };
        
        this.selectedPrereqIds = course.prerequisites?.map(p => p.id) || [];
        this.selectedMajorIds = course.majors?.map(p => p.id) || [];
      } catch (error) {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course data';
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      try {
        this.loading = true;
        this.error = null;

        if (!this.formData.professor_id || !this.formData.subject_id) {
          throw new Error('Professor and Subject are required');
        }
        
        const submitData = {
          course_code: this.formData.course_code,
          title: this.formData.title,
          description: this.formData.description,
          credits: Number(this.formData.credits),
          professor: {
            connect: { id: Number(this.formData.professor_id) }
          },
          subject: {
            connect: { id: Number(this.formData.subject_id) }
          },
          prerequisites: this.isEditing ? {
            // For editing, specify both connect and disconnect
            disconnect: this.availablePrereqs
              .filter(course => !this.selectedPrereqIds.includes(course.id))
              .map(course => ({ id: course.id })),
            connect: this.selectedPrereqIds.map(id => ({ id: Number(id) }))
          } : {
            // For new courses, just connect
            connect: this.selectedPrereqIds.map(id => ({ id: Number(id) }))
          },
          majors: this.isEditing ? {
            disconnect: this.majors
              .filter(major => !this.selectedMajorIds.includes(major.id))
              .map(major => ({ id: major.id })),
            connect: this.selectedMajorIds.map(id => ({ id: Number(id) }))
          } : {
            connect: this.selectedMajorIds.map(id => ({ id: Number(id) }))
          }
        };

        const endpoint = `/courses${this.isEditing ? `/${this.$route.params.id}` : ''}`;
        const method = this.isEditing ? 'put' : 'post';

        const response = await api({
          method,
          url: endpoint,
          data: submitData,
        });

        // Show success message and prepare for redirect
        const courseId = this.isEditing ? this.$route.params.id : response.data.id;
        const message = this.isEditing 
          ? `Successfully updated ${this.formData.course_code}`
          : `Successfully created ${this.formData.course_code}`;
          
        this.successMessage = message;
        this.showSuccessToast = true;
        
        // Redirect after a short delay
        setTimeout(() => {
          this.showSuccessToast = false;
          this.$router.push(`/info/course/${courseId}`);
        }, 2000);

      } catch (error: any) {
        console.error('Error details:', error);
        this.error = error.response?.data?.error || error.message || 'Failed to save course';
      } finally {
        this.loading = false;
      }
    }
  },

  async mounted() {
    await Promise.all([
      this.fetchReferenceData(),
      this.fetchAvailablePrereqs()
    ]);
    
    if (this.isEditing) {
      await this.loadCourse(this.$route.params.id as string);
    }
  }
});
</script>

<style scoped>
.success-toast {
  position: fixed;
  top: 4rem; /* Below app bar */
  right: 1rem;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border-left: 4px solid #10B981;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999; /* Make sure it's above everything */
  max-width: 300px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>