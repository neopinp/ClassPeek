<template>
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-gray-800">
            Create New Subject
          </h1>
        </header>
        
        <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-4">
            <!-- Subject Code -->
            <div>
              <label class="block font-medium text-gray-700 mb-2">Subject Code</label>
              <input
                v-model="formData.code"
                type="text"
                class="w-full p-2 border rounded-md"
                required
                maxlength="10"
                placeholder="e.g., CS"
                :disabled="loading"
              />
            </div>
  
            <!-- Subject Name -->
            <div>
              <label class="block font-medium text-gray-700 mb-2">Subject Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full p-2 border rounded-md"
                required
                maxlength="50"
                placeholder="e.g., Computer Science"
                :disabled="loading"
              />
            </div>
  
            <!-- Description -->
            <div>
              <label class="block font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                class="w-full p-2 border rounded-md"
                rows="4"
                placeholder="Enter subject description..."
                :disabled="loading"
              ></textarea>
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
              {{ loading ? 'Saving...' : 'Create Subject' }}
            </button>
          </div>
        </form>
      </div>
  
      <!-- Success Toast -->
      <div v-if="showSuccessToast" class="success-toast">
        {{ successMessage }}
      </div>
    </div>
</template>
  
<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios';
  
  const API_BASE_URL = 'http://localhost:3000/api';
  
  interface Subject {
    id: number;
    name: string;
    code: string;
    description: string | null;
  }
  
  interface SubjectFormData {
    name: string;
    code: string;
    description: string;
  }
  
  export default defineComponent({
    name: 'SubjectForm',
    
    data() {
      return {
        loading: false,
        error: null as string | null,
        showSuccessToast: false,
        successMessage: '',
        formData: {
          name: '',
          code: '',
          description: ''
        } as SubjectFormData
      };
    },
  
    methods: {
      async handleSubmit() {
        try {
          this.loading = true;
          this.error = null;
          
          const submitData = {
            name: this.formData.name,
            code: this.formData.code.toUpperCase(), // Ensure code is uppercase
            description: this.formData.description,
          };
  
          const response = await axios.post(`${API_BASE_URL}/subjects`, submitData);
          console.log('Response:', response.data);
          
          // Show success message
          this.successMessage = `Successfully created ${this.formData.name}`;
          this.showSuccessToast = true;
          
          // Clear form
          this.formData = {
            name: '',
            code: '',
            description: ''
          };
  
        } catch (error: any) {
          console.error('Error details:', error);
          this.error = error.response?.data?.error || error.message || 'Failed to save subject';
        } finally {
          this.loading = false;
        }
      }
    }
  });
</script>
  
<style scoped>
  .success-toast {
    position: fixed;
    top: 4rem;
    right: 1rem;
    background-color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    border-left: 4px solid #10B981;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 40;
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