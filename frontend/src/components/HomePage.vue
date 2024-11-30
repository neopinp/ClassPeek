<template>
  <div class="homePage">

    <div class="header-container">
    <!-- Render Marist Logo -->
    <img :src="logo" width="200px" height="200px" alt="Marist Logo" />
    <header class="header">
      <h1 class="page-title">Welcome to ClassPeek!</h1>
      <p class="greeting">Hi, {{ user_name }}</p>
      <div class="search-section">
        <input
          type="text"
          v-model="searchQuery"
          class="search-input"
          placeholder="Search for courses in majors or subjects, or professor information..."
        />
      </div>
    </header>
  </div>
    <div class="horizontal-grid">
      <!-- Majors Section -->
      <div
        class="grid-section majors"
        :class="{ highlight: highlightedSection === 'majors' }"
      >
        <h2 class="section-title">Majors</h2>
        <ul class="list">
          <li
            v-for="major in filteredMajors"
            :key="major.id"
            class="card"
          >
            <router-link
              :to="{ name: 'MajorsPage', query: { select: major.name, search: searchQuery } }"
              class="card-link"
            >
              <span class="card-name">{{ major.name }}</span>
              <span class="card-description">
                {{ major.description.split('.')[0] }}.
              </span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Professors Section -->
      <div
        class="grid-section professors"
        :class="{ highlight: highlightedSection === 'professors' }"
      >
        <h2 class="section-title">Professors</h2>
        <ul class="list">
          <li
            v-for="professor in filteredProfessors"
            :key="professor.id"
            class="card"
          >
            <router-link
              :to="{ name: 'Info', params: { type: 'professor', id: professor.id } }"
              class="card-link"
            >
              <span class="card-name">{{ professor.name }}</span>
              <span class="card-description">
                {{ professor.professor_page?.bio || "No bio provided." }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Subjects Section -->
      <div
        class="grid-section subjects"
        :class="{ highlight: highlightedSection === 'subjects' }"
      >
        <h2 class="section-title">Subjects</h2>
        <ul class="list">
          <li
            v-for="subject in filteredSubjects"
            :key="subject.id"
            class="card"
          >
            <router-link
              :to="{ name: 'SubjectsPage', query: { select: subject.code, search: searchQuery } }"
              class="card-link"
            >
              <span class="card-name">{{ subject.name }}</span>
              <span class="card-description">
                {{ subject.description.split('.')[0] }}.
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import api from "../api";
import sessionStore from "../store/session";

export default defineComponent({
  name: "HomePage",
  data() {
    return {
      // Dynamically resolve the image path
      logo: require('./images/MaristFox.png'), // Adjust relative path if needed
      user_name: "",
      searchQuery: "",
      majors: [],
      subjects: [],
      professors: [],
      courses: [],
      filteredMajors: [],
      filteredSubjects: [],
      filteredProfessors: [],
      highlightedSection: null, // Keeps track of the section to highlight (majors/subjects)
    };
  },
  methods: {
    async fetchData() {
      try {
        const [majorsRes, subjectsRes, professorsRes, coursesRes] = await Promise.all([
          api.get("/majors"),
          api.get("/subjects"),
          api.get("/professors"),
          api.get("/courses"),
        ]);
        // Stores user and relevant information for homepage from the API
        this.user_name = sessionStore.user?.name || "Guest";
        this.majors = majorsRes.data;
        this.subjects = subjectsRes.data;
        this.professors = professorsRes.data;
        this.courses = coursesRes.data;
        // Data stores for when the user searches in the input field
        this.filteredMajors = [...this.majors];
        this.filteredSubjects = [...this.subjects];
        this.filteredProfessors = [...this.professors];
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    handleSearch() {
      const query = this.searchQuery.toLowerCase();

      // Filter majors, subjects, and professors
      // With each major/subject/professor, we filter our the descrip
      this.filteredMajors = this.majors.filter(
        (major) =>
          major.name.toLowerCase().includes(query) ||
          major.description.toLowerCase().includes(query)
      );
      this.filteredSubjects = this.subjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(query) ||
          subject.description.toLowerCase().includes(query)
      );
      this.filteredProfessors = this.professors.filter(
        (professor) =>
          professor.name.toLowerCase().includes(query) ||
          professor.professor_page?.bio?.toLowerCase().includes(query)
      );

      // Filter courses and map to relevant majors/subjects from the search query via the title and course code
      const filteredCourses = this.courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.course_code.toLowerCase().includes(query)
      );

      // If we have a match within our search query for a course attached to a subject or major, push the subjects/majors that do contain them
      if (filteredCourses.length > 0) {
        const matchingSubjects = new Set(
          filteredCourses.map((course) => course.subject_id)
        );
        const matchingMajors = new Set(
          filteredCourses.flatMap((course) =>
            course.majors?.map((major) => major.id) || []
          )
        );

        // Visually represent the above results in the page
        this.filteredSubjects = this.subjects.filter((subject) =>
          matchingSubjects.has(subject.id)
        );
        this.filteredMajors = this.majors.filter((major) =>
          matchingMajors.has(major.id)
        );

        this.highlightedSection = "courses";
      } else {
        this.highlightedSection = null; // Reset highlight if no courses match
      }
    },
    navigateToPage(section, id, query) {
      // Navigate to the respective section page with the query
      const routeName =
        section === "major"
          ? "MajorsPage"
          : section === "subject"
          ? "SubjectsPage"
          : null;

      if (routeName) {
        // Populate the URL with the selected major/subject if just the major/subject is selected
        // Otherwise, also include the searched matching course.
        this.$router.push({ name: routeName, query: { select: id, search: query } });
      }
    },
  },
  // Upon the search field being updated (user types in it), run handleSearch to dynamically filter/modify the frontend
  // In Vue, the watch: {} structure handles this.
  watch: {
    searchQuery: "handleSearch",
  },
  mounted() {
    this.fetchData();
  },
});
</script>

<style scoped>
  @import './styles/HomePage.css'
</style>
