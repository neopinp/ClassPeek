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
import "./styles/SignInPage.css";

export default defineComponent({
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    handleSignIn() {
      console.log("Signing in with:", this.email, this.password);
      this.$router.push('/profile');
    }
  }
});
</script>


