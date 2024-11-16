<template>
  <div class="homePage">
    <main>
      <div class="header">
        <h1 class="page-title">Welcome to ClassPeek!</h1>
        <p v-if="userName" class="greeting">Hi, {{ userName }}</p>
        <p v-else class="greeting">Hi, Guest</p>
      </div>
      <!-- Search Section -->
      <div class="search-section">
        <input
          type="text"
          placeholder="Search for professors, subjects, or majors..."
          v-model="searchQuery"
          class="search-input"
        />
      </div>
      <!-- Horizontal Grid Section -->
      <div class="horizontal-grid">
        <!-- Majors Section -->
        <section class="grid-section">
          <h2 class="section-title">Majors</h2>
          <ul class="list">
            <li v-for="major in filteredMajors" :key="major.id" class="card">
              <router-link
                :to="{ name: 'MajorsPage', query: { select: major.name } }"
                class="card-link"
              >
                <div class="card-name">{{ major.name }}</div>
                <div class="card-description">{{ getFirstSentence(major.description) }}</div>
              </router-link>
            </li>
          </ul>
        </section>
        <!-- Professors Section -->
        <section class="grid-section">
          <h2 class="section-title">Professors</h2>
          <ul class="list">
            <li v-for="professor in filteredProfessors" :key="professor.id" class="card">
              <router-link
                :to="{ name: 'Info', params: { type: 'professor', id: professor.id } }"
                class="card-link"
              >
                <div class="card-name">{{ professor.name }}</div>
                <div class="card-description">{{ professor.bio }}</div>
              </router-link>
            </li>
          </ul>
        </section>
        <!-- Subjects Section -->
        <section class="grid-section">
          <h2 class="section-title">Subjects</h2>
          <ul class="list">
            <li v-for="subject in filteredSubjects" :key="subject.id" class="card">
              <router-link
                :to="{ name: 'SubjectsPage', query: { select: subject.code } }"
                class="card-link"
              >
                <div class="card-name">{{ subject.name }}</div>
                <div class="card-description">{{ subject.description }}</div>
              </router-link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import api from "../api";
  import sessionStore from "../store/session";

  export default defineComponent({
    name: "HomePage",
    data() {
      return {
        userName: sessionStore.user?.name || null,
        searchQuery: "",
        professors: [] as { id: number; name: string; bio?: string }[],
        subjects: [] as { id: number; name: string; code: string; description: string }[],
        majors: [] as { id: number; name: string; description: string }[],
      };
    },
    computed: {
      filteredProfessors() {
        return this.professors.filter((prof) =>
          prof.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      filteredSubjects() {
        return this.subjects.filter((subj) =>
          subj.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      filteredMajors() {
        return this.majors.filter((major) =>
          major.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
    },
    methods: {
      async fetchData() {
        try {
          const [professorsResponse, subjectsResponse, majorsResponse] = await Promise.all([
            api.get("/professors"),
            api.get("/subjects"),
            api.get("/majors"),
          ]);
          this.professors = professorsResponse.data.map((professor: any) => ({
            id: professor.id,
            name: professor.name,
            bio: professor.professor_page?.bio || "No bio provided.",
          }));
          this.subjects = subjectsResponse.data;
          this.majors = majorsResponse.data;
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
      getFirstSentence(text: string): string {
        const firstSentence = text.split(".")[0];
        return firstSentence.trim() + ".";
      },
    },
    mounted() {
      this.fetchData();
    },
  });
</script>

<style scoped>
  @import './styles/HomePage.css'
</style>
