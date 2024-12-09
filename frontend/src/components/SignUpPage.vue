<template>
  <!-- Success Toast -->
  <div
    v-if="showSuccessToast"
    class="success-toast"
  >
    {{ successMessage }}
  </div>
  <div class="signup-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <label for="dob">DOB:</label>
      <input type="date" id="dob" v-model="userData.dob">

      <label for="email">Email:</label>
      <input type="email" id="email" v-model="userData.email" required />

      <label for="name">Username:</label>
      <input type="text" id="name" v-model="userData.name" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="userData.password" required />

      <label for="confirmPassword">Confirm Password:</label>
      <input type="password" id="confirmPassword" v-model="confirmPassword" required />

      <p v-if="errorMessage" style="color:red; font-style:italic">{{ errorMessage }}</p>
      <button type="submit">Create Account</button>
    </form>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import { isAxiosError } from "axios";
  import api from "../api";
  import "./styles/SignUpPage.css";

  export default defineComponent({
    name: "SignUpPage",
    data() {
      return {
        userData: {
          dob: "",
          // Professors are created by the admin, so only students can sign up
          role: "STUDENT",
          email: "",
          name: "",
          password: "",
        },
        confirmPassword: "",
        successMessage: '',
        showSuccessToast: false,
        errorMessage: "",
      };
    },
    methods: {
      async handleSignUp() {
        // Clear error at start of signup
        this.errorMessage = "";
        // Basic validation for password match
        if (this.userData.password !== this.confirmPassword) {
          this.errorMessage = "Passwords do not match!";
          return;
        }

        try {
          const response = await api.post("/auth/signup", this.userData);
          // 201: Created
          if (response.status === 201) {
            this.successMessage = "Account created successfully!";
            this.showSuccessToast = true;
            setTimeout(() => {
              this.showSuccessToast = false;
              this.$router.push("/signin");
            }, 2000)
          }
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            console.error("Axios error during sign up:", error);
            this.errorMessage = error.response?.data?.error || "Failed to sign up.";
          } else if (error instanceof Error) {
            console.error("Unexpected error during sign in:", error);
            this.errorMessage = error.message || "Failed to sign in.";
          } else {
            console.error("Non-Error thrown during sign in:", error);
            this.errorMessage = "Failed to sign in.";
          }
        }
      },
    },
  });
</script>
