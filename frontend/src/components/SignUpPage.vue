<template>
  <div class="signup-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required />

      <label for="confirmPassword">Confirm Password:</label>
      <input type="password" id="confirmPassword" v-model="confirmPassword" required />

      <button type="submit">Create Account</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import "./styles/SignUpPage.css";

export default defineComponent({
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    handleSignUp() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      console.log("Creating account with:", this.email, this.password);
      this.$router.push('/signin');
    }
  }
});
</script>

