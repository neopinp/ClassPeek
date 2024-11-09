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
import axios from 'axios';
import "./styles/SignInPage.css";

const API_BASE_URL = 'http://localhost:3000/api';

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
        const user : any = await axios.get(`${API_BASE_URL}/users/:${this.email}/:${this.password}`); // To be fixed
        // Somehow send user info to app component and have it run the sign up method
      } catch (error) {
        alert('Error finding user');
      }
      
      
    }
  }
});
</script>


