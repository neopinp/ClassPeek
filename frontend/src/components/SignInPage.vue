<template>
  <div class="signin-container">
    <h2>Sign In</h2>
    <form @submit.prevent="handleSignIn" class="signin-form">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required />

      <button type="submit">Sign In</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import api from "../api";
import sessionStore from "../store/session";
import "./styles/SignInPage.css";

export default defineComponent({
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async handleSignIn() {
      try {
        await api.post("/auth/login", {
          email: this.email,
          password: this.password,
        });

        // Fetch session after login
        await sessionStore.fetchSession();

        alert("Login successful");
        this.$router.push("/profile");
      } catch (error) {
        alert("Error logging in");
      }
    },
  }
});
</script>
