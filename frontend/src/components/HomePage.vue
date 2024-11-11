<template>
  <div class="homePage">
    <main>
      <h1>Welcome to ClassPeek!</h1>
      <!-- Greeting based on user session -->
      <p v-if="userName">Hi, {{ userName }}</p>
      <p v-else>Hi, Guest</p>
      <p>This is the homepage of our application.</p>
      <br />
      <div>
        <img src="../assets/logo.png" class="logo" />
      </div>
      <br />
      <div>
        <input type="text" placeholder="Search" />
      </div>
      <nav>
        <section style="background-color: lightcyan">
          <h4>Majors</h4>
          <ol>
            <li id="homepage-li" v-for="major in majors" :key="major.id">
              <router-link 
                :to="{ name: 'MajorsPage', query: { select: major.name } }"
                class="text-blue-600 hover:underline"
              >
                {{ major.name }}
              </router-link>
            </li>
          </ol>
        </section>

        <section style="background-color: lightcyan">
          <h4>Professors</h4>
          <ol>
            <li id="homepage-li" v-for="professor in professors" :key="professor.id">
              <router-link 
                :to="{ name: 'Info', params: { type: 'professor', id: professor.id } }"
                class="text-blue-600 hover:underline"
              >
                {{ professor.name }}
              </router-link>
            </li>
          </ol>
        </section>

        <section style="background-color: lightcyan;">
          <h4>Subjects</h4>
          <ol>
            <li id="homepage-li" v-for="subject in subjects" :key="subject.id">
              <router-link 
                :to="{ name: 'SubjectsPage', query: { select: subject.code } }"
                class="text-blue-600 hover:underline"
              >
                {{ subject.name }}
              </router-link>
            </li>
          </ol>
        </section>
      </nav>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import sessionStore from "../store/session";
import axios from 'axios';
import './styles/HomePage.css';

const API_BASE_URL = 'http://localhost:3000/api';
export default defineComponent({
  name: 'HomePage',
  data() {
    return {
      userName: sessionStore.user.name || "Guest",
      majors: [] as any[],
      professors: [] as any[],
      subjects: [] as any[],
    };
  },

  methods: {
    async fetchMajors() {
      try {
        const response = await axios.get(`${API_BASE_URL}/majors`);
        this.majors = response.data;
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
    },

    async fetchProfessors() {
      try {
        const response = await axios.get(`${API_BASE_URL}/professors`);
        this.professors = response.data;
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    },

    async fetchSubjects() {
      try {
        const response = await axios.get(`${API_BASE_URL}/subjects`);
        this.subjects = response.data;
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
  },

  mounted() {
    sessionStore.fetchSession().then(() => {
      this.userName = sessionStore.user.name || "Guest"
    })
    Promise.all([
      this.fetchMajors(),
      this.fetchProfessors(),
      this.fetchSubjects(),
    ]);
  },
});
</script>
