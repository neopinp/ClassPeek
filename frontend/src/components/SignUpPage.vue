<template>
  <div class="signup-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required />

      <label for="name">Username:</label>
      <input type="name" id="name" v-model="userData.name" required />

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
import axios from 'axios';
import "./styles/SignUpPage.css";

const API_BASE_URL = 'http://localhost:3000/api';

export default defineComponent({
  data() {
    return {
      userData: {
        password: "",
        name: '',
        email:'',
      },
      email:"",
      password:'',
      confirmPassword: ''
    };
  },
  methods: {
    async handleSignUp() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      } 
      this.userData.password = this.password;
      this.userData.email = this.email;
      try {
        await axios.post(`${API_BASE_URL}/users`,this.userData);
        this.$router.push('/signin');
      } catch (error) {
          alert('Error creating user');
        }
      
    }
  }
});
</script>

