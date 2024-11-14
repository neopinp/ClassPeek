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
        <input type="text" placeholder="Search" v-model="searchQuery" />
      </div>
      <nav>
        <!-- Majors Section -->
        <section v-if="filteredMajors.length" style="background-color: lightcyan">
          <h4>Majors</h4>
          <ol>
            <li id="homepage-li" v-for="major in filteredMajors" :key="major.id">
              <router-link 
                :to="{ name: 'MajorsPage', query: { select: major.name } }"
                class="text-blue-600 hover:underline"
              >
                {{ major.name }}
              </router-link>
            </li>
          </ol>
        </section>

        <!-- Professors Section -->
        <section v-if="filteredProfessors.length" style="background-color: lightcyan">
          <h4>Professors</h4>
          <ol>
            <li id="homepage-li" v-for="professor in filteredProfessors" :key="professor.id">
              <router-link 
                :to="{ name: 'Info', params: { type: 'professor', id: professor.id } }"
                class="text-blue-600 hover:underline"
              >
                {{ professor.name }}
              </router-link>
            </li>
          </ol>
        </section>

        <!-- Subjects Section -->
        <section v-if="filteredSubjects.length" style="background-color: lightcyan;">
          <h4>Subjects</h4>
          <ol>
            <li id="homepage-li" v-for="subject in filteredSubjects" :key="subject.id">
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
import api from '../api';
import './styles/HomePage.css';

export default defineComponent({
  name: 'HomePage',
  data() {
    return {
      userName: sessionStore.user.name || "Guest",
      majors: [] as any[],
      professors: [] as any[],
      subjects: [] as any[],
      searchQuery: '' as string,
    };
  },

  computed: {
    filteredMajors() {
      return this.majors.filter(major => 
        major.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredProfessors() {
      return this.professors.filter(professor => 
        professor.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredSubjects() {
      return this.subjects.filter(subject => 
        subject.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  methods: {
    async fetchMajors() {
      try {
        const response = await api.get('/majors');
        this.majors = response.data;
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
    },

    async fetchProfessors() {
      try {
        const response = await api.get('/professors');
        this.professors = response.data;
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    },

    async fetchSubjects() {
      try {
        const response = await api.get('/subjects');
        this.subjects = response.data;
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
  },

  mounted() {
    sessionStore.fetchSession().then(() => {
      this.userName = sessionStore.user.name || "Guest";
    });
    Promise.all([
      this.fetchMajors(),
      this.fetchProfessors(),
      this.fetchSubjects(),
    ]);
  },
});
</script>
