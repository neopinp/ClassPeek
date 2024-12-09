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
      <button type="submit" class="btn btn-tertiary">Sign In</button>
    </form>
    <div style="margin-top: 10px; text-align: center;">
      <a href="javascript:void(0)" @click="openResetModal" style="color:#3b82f6;text-decoration:underline;">Forgot Password?</a>
    </div>
  </div>

  <!-- Password Reset Modal -->
  <div v-if="showResetModal" class="modal-overlay" @click.self="closeResetModal">
    <div class="modal-content">
      <h3>Reset Password</h3>
      <p>Enter your account email and a new password:</p>
      <input 
        type="email" 
        v-model.trim="resetEmail" 
        placeholder="Your email" 
        style="width:100%;margin-bottom:15px;" 
      />
      <input 
        type="password" 
        v-model.trim="resetPasswordField" 
        placeholder="New password" 
        style="width:100%;margin-bottom:15px;" 
      />
      
      <div class="modal-actions" style="margin-top:1rem;">
        <button class="btn btn-tertiary" @click="resetPassword">Update Password</button>
        <button class="btn btn-secondary" @click="closeResetModal">Cancel</button>
      </div>

      <p v-if="errorMessage" style="color:red; font-style:italic; margin-top:10px;">{{ errorMessage }}</p>
    </div>
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
        showResetModal: false,
        resetEmail: '',
        resetPasswordField: '',
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
      openResetModal() {
        this.errorMessage = '';
        this.resetEmail = '';
        this.resetPasswordField = '';
        this.showResetModal = true;
      },

      closeResetModal() {
        this.showResetModal = false;
        this.errorMessage = '';
        this.resetEmail = '';
        this.resetPasswordField = '';
      },

      async resetPassword() {
        if (!this.resetEmail || !this.resetPasswordField) {
          this.errorMessage = "Email and password fields are required.";
          return;
        }

        try {
          const response = await api.put("/users/passwordreset", {
            email: this.resetEmail,
            password: this.resetPasswordField
          });

          if (response.status === 200) {
            this.showToast("Password updated successfully!");
            this.closeResetModal();
          }
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            console.error("Axios error updating password:", error);
            this.errorMessage = error.response?.data?.error || "Failed to update password.";
          } else if (error instanceof Error) {
            console.error("Unexpected error updating password:", error);
            this.errorMessage = error.message || "Failed to update password.";
          } else {
            console.error("Non-Error thrown:", error);
            this.errorMessage = "Failed to update password.";
          }
        }
      },
    }
  });
</script>
