<template>
  <div class="form-page">
    <div class="form-card">
      <h2 class="form-title">{{ isEditing ? "Edit Major" : "Create Major" }}</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name">Major Name</label>
          <input
            id="name"
            type="text"
            v-model="formData.name"
            placeholder="Enter major name"
            class="form-input"
          />
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter major description"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? "Save Changes" : "Create Major" }}
          </button>
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.visible" class="toast" :class="toast.type === 'success' ? 'success-toast' : 'error-toast'">
      {{ toast.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import api from "@/api";

interface ToastMessage {
  type: "success" | "error";
  message: string;
}

export default defineComponent({
  name: "MajorForm",
  data() {
    return {
      formData: {
        name: "",
        description: "",
      },
      loading: false,
      toast: reactive({
        visible: false,
        type: "success" as "success" | "error",
        message: "",
      }),
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.$route.params.id;
    },
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true;

        const method = this.isEditing ? "put" : "post";
        const url = this.isEditing
          ? `/majors/${this.$route.params.id}`
          : "/majors";

        const response = await api[method](url, this.formData);
        console.log("Major saved:", response.data);

        this.showToast("success", `Successfully ${this.isEditing ? "updated" : "created"}!`);
      } catch (error: any) {
        console.error("Error saving major:", error);
        this.showToast("error", error.response?.data?.error || "An unexpected error occurred. Please try again.");
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.$router.push("/majors");
    },
    showToast(type: "success" | "error", message: string) {
      this.toast.type = type;
      this.toast.message = message;
      this.toast.visible = true;

      setTimeout(() => {
        this.toast.visible = false;
      }, 4000); // Hide toast after 4 seconds
    },
  },
});
</script>

<style scoped>
  @import "styles/Forms.css";
</style>
