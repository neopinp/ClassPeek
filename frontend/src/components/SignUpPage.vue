<template>
  <div class="signup-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="userData.email" required />

      <label for="name">Username:</label>
      <input type="text" id="name" v-model="userData.name" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="userData.password" required />

      <label for="confirmPassword">Confirm Password:</label>
      <input type="password" id="confirmPassword" v-model="confirmPassword" required />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <button type="submit">Create Account</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import api from "../api";
import "./styles/SignUpPage.css";

export default defineComponent({
  name: "SignUpPage",
  data() {
    return {
      userData: {
        email: "",
        name: "",
        password: "",
      },
      confirmPassword: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleSignUp() {
      // Basic validation for password match
      if (this.userData.password !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match!";
        return;
      }

      try {
        await api.post("/auth/signup", this.userData);

        this.successMessage = "Account created successfully!";
        this.$router.push("/signin");
      } catch (error) {
        this.errorMessage = "Failed to create an account. Please try again.";
        console.error("Sign-up error:", error);
      }
    },
  },
});
</script>
