<template>
  <!-- Success Toast -->
  <div
      v-if="showSuccessToast"
      class="success-toast"
    >
      {{ successMessage }}
    </div>
  <div class="signin-container">
    <h2>Sign In</h2>
    <form @submit.prevent="handleSignIn" class="signin-form">
      <label for="email">Email:</label>
      <!-- .trim removes whitespace, prevents input errors -->
      <input type="email" id="email" v-model.trim="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model.trim="password" required />
      
      <p v-if="errorMessage" style="color:red; font-style:italic">{{ errorMessage }}</p>
      <button type="submit">Sign In</button>
    </form>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import { isAxiosError } from "axios";
  import api from "../api";
  import sessionStore from "../store/session";
  import "./styles/SignInPage.css";

  export default defineComponent({
    data() {
      return {
        email: '',
        password: '',
        successMessage: '',
        errorMessage: '',
        showSuccessToast: false,
      };
    },
    methods: {
      showToast(message: string) {
        this.successMessage = message;
        this.showSuccessToast = true;

        // Automatically hide the toast after 3 seconds
        setTimeout(() => {
          this.showSuccessToast = false;
        }, 3000);
      },

      async handleSignIn() {
        // Client-side validation for empty fields
        if (!this.email || !this.password) {
          this.errorMessage = "Please fill in both email and password fields.";
          return;
        }

        try {
          const response = await api.post("/auth/login", {
            email: this.email,
            password: this.password,
          });

          // Assuming a successful response status indicates a successful login
          if (response.status === 200) {
            // Fetch session after login
            await sessionStore.fetchSession();

            const message = `Successfully logged in as ${this.email}`;
            this.showToast(message);

            // Redirect after a short delay to allow users to read the toast
            setTimeout(() => {
              this.$router.push("/");
            }, 2000);
          }
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            console.error("Axios error during sign in:", error);
            this.errorMessage = error.response?.data?.error || "Failed to sign in.";
          } else if (error instanceof Error) {
            console.error("Unexpected error during sign in:", error);
            this.errorMessage = error.message || "Failed to sign in.";
          } else {
            console.error("Non-Error thrown during sign in:", error);
            this.errorMessage = "Failed to sign in.";
          }
        }
      },
    }
  });
</script>
