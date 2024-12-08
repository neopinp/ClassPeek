<template>
  <div v-if="sessionStore.user.user_type === 'PROFESSOR' || sessionStore.user.user_type === 'ADMIN'" class="form-page">
    <div class="form-card">
      <h2 class="form-title">{{ isEditing ? "Edit Subject" : "Create Subject" }}</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name">Subject Name</label>
          <input
            id="name"
            type="text"
            v-model="formData.name"
            placeholder="Enter subject name"
            class="form-input"
          />
        </div>

        <!-- Code Field -->
        <div class="form-group">
          <label for="code">Subject Code</label>
          <input
            id="code"
            type="text"
            v-model="formData.code"
            placeholder="Enter subject code"
            class="form-input"
          />
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter subject description"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? "Save Changes" : "Create Subject" }}
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
  import { defineComponent } from "vue";
  import { isAxiosError } from "axios";
  import api from "@/api";
  import sessionStore from "../store/session";


  export default defineComponent({
    name: "SubjectForm",
    setup() {
        return { sessionStore };
      },
    data() {
      return {
        formData: {
          name: "",
          code: "",
          description: "",
        },
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
      // Methods that handle frontend/backend data handling
      async handleSubmit() {
        try {
          this.loading = true;
          
          // Creating/updating a subject requires different API endpoints
          const method = this.isEditing ? "put" : "post";
          const url = this.isEditing
            // If we are editing a subject, we need to include it's ID in the API endpoint
            ? `/subjects/${this.$route.params.id}`
            : "/subjects";
          // Form data includes the name and description from the relevant fields in the HTML
          const response = await api[method](url, this.formData);
          console.log("Subject saved:", response.data);

          this.showToast("success", `Successfully ${this.isEditing ? "updated" : "created"}!`);
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            // Handle Axios-specific errors
            console.error("Axios error saving subject:", error);
            this.showToast("error", error.response?.data?.error || "An unexpected error occurred. Please try again.");
          } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            console.error("Unexpected error saving subject:", error);
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
        this.$router.push("/subjects");
      },
      // Success toast that informs the user of success or failure, and redirects to the subjects page if successful
      showToast(type: 'success' | 'error', message: string) {
        if (type === 'success') {
          this.successMessage = message;
          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
            this.$router.push("/subjects")
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
  });
</script>

<style scoped>
  @import "styles/Forms.css";
</style>
