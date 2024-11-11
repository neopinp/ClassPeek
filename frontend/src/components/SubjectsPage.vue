<template>
    <div class="directory-page">
      <!-- Search and Filter Section -->
      <div class="search-section">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search subjects or courses..."
          class="search-input"
        />
      </div>
  
      <!-- Subjects Grid -->
      <div class="subjects-grid">
        <div 
          v-for="subject in filteredSubjects" 
          :key="subject.id"
          :id="`subject-${subject.id}`"
          class="subject-card"
          :class="{ 'active': selectedSubjects.some(s => s.id === subject.id) }"
          @click="toggleSubject(subject)"
        >
          <div class="subject-header">
            <h3>{{ subject.code }}</h3>
            <span class="course-count">{{ subject.courses?.length || 0 }} courses</span>
          </div>
          <p class="subject-name">{{ subject.name }}</p>
  
          <!-- Courses List (shows when subject is selected) -->
          <div v-if="selectedSubjects.some(s => s.id === subject.id)" class="courses-list">
            <div 
              v-for="course in groupCoursesByBaseCode(subject.courses)" 
              :key="course.baseCode" 
              class="course-group"
            >
              <div class="course-header" @click.stop="toggleCourse(course)">
                <h4>{{ course.baseCode }} - {{ course.title }}</h4>
                <span class="section-count">{{ course.sections.length }} sections</span>
              </div>
  
              <!-- Course Sections -->
              <div v-if="expandedCourses.includes(course.baseCode)" class="course-sections">
                <router-link
                  v-for="section in course.sections"
                  :key="section.id"
                  :to="{ name: 'Info', params: { type: 'course', id: section.id }}"
                  class="section-link"
                >
                  <div class="section-info">
                    <span class="section-code">{{ section.course_code }}</span>
                    <span class="professor-name">Prof. {{ section.professor?.name }}</span>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import api from '../api';
  
  interface Professor {
    id: number;
    name: string;
  }
  
  interface Course {
    id: number;
    course_code: string;
    title: string;
    professor?: Professor;
  }
  
  interface Subject {
    id: number;
    code: string;
    name: string;
    courses?: Course[];
  }
  
  interface GroupedCourse {
    baseCode: string;
    title: string;
    sections: Course[];
  }
  
  export default defineComponent({
    name: 'SubjectsPage',
  
    data() {
      return {
        subjects: [] as Subject[],
        selectedSubjects: [] as Subject[],
        expandedCourses: [] as string[],
        searchQuery: '',
        loading: false,
        error: null as string | null
      };
    },
  
    computed: {
      filteredSubjects(): Subject[] {
        if (!this.searchQuery) return this.subjects;
        
        const query = this.searchQuery.toLowerCase();
        return this.subjects.filter(subject => 
          subject.code.toLowerCase().includes(query) ||
          subject.name.toLowerCase().includes(query) ||
          subject.courses?.some(course => 
            course.title.toLowerCase().includes(query) ||
            course.course_code.toLowerCase().includes(query)
          )
        );
      }
    },
  
    methods: {
      async fetchSubjects() {
        try {
          this.loading = true;
          const response = await api.get('/subjects');
          this.subjects = response.data;
        } catch (error) {
          console.error('Error fetching subjects:', error);
          this.error = 'Failed to load subjects';
        } finally {
          this.loading = false;
        }
      },
  
      toggleSubject(subject: Subject) {
        const index = this.selectedSubjects.findIndex(s => s.id === subject.id);
        if (index > -1) {
            // If subject is already selected, remove it
            this.selectedSubjects.splice(index, 1);
        } else {
            // Add the subject to selected subjects
            this.selectedSubjects.push(subject);
        }
        },
  
      toggleCourse(course: GroupedCourse) {
        const index = this.expandedCourses.indexOf(course.baseCode);
        if (index > -1) {
          this.expandedCourses.splice(index, 1);
        } else {
          this.expandedCourses.push(course.baseCode);
        }
      },
  
      getBaseCourseCode(courseCode: string): string {
        return courseCode.split('-')[0];
      },
  
      groupCoursesByBaseCode(courses: Course[] = []): GroupedCourse[] {
        const groupedCourses: Record<string, GroupedCourse> = courses.reduce((acc, course) => {
          const baseCode = this.getBaseCourseCode(course.course_code);
          if (!acc[baseCode]) {
            acc[baseCode] = {
              baseCode,
              title: course.title.split('(')[0].trim(),
              sections: []
            };
          }
          acc[baseCode].sections.push(course);
          return acc;
        }, {} as Record<string, GroupedCourse>);
  
        return Object.values(groupedCourses);
      },
  
      handleRouteQuery() {
        const subjectCode = this.$route.query.select as string;
        if (subjectCode && this.subjects.length > 0) {
          const subject = this.subjects.find(s => s.code === subjectCode);
          if (subject) {
            this.selectedSubjects = [subject];
            this.$nextTick(() => {
              const element = document.getElementById(`subject-${subject.id}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            });
          }
        }
      }
    },
  
    watch: {
      subjects: {
        handler(newSubjects) {
          if (newSubjects.length > 0) {
            this.handleRouteQuery();
          }
        },
        immediate: true
      },
  
      '$route.query': {
        handler() {
          this.handleRouteQuery();
        },
        immediate: true
      }
    },
  
    mounted() {
      this.fetchSubjects();
    }
  });
  </script>
  
  <style scoped>
  .directory-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    scroll-behavior: smooth;
  }
  
  .search-section {
    margin-bottom: 30px;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
  
  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .subject-card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .subject-card:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.12),
      0 8px 16px rgba(0, 0, 0, 0.08);
  }
  
  .subject-card.active {
    border-left: 4px solid #4299e1;
    padding-left: 16px;
    animation: highlight 1s ease-in-out;
  }
  
  @keyframes highlight {
    0% { background-color: #fff; }
    50% { background-color: #e3f2fd; }
    100% { background-color: #fff; }
  }
  
  .subject-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .subject-header h3 {
    font-size: 1.5em;
    color: #2d3748;
    margin: 0;
  }
  
  .course-count {
    color: #718096;
    font-size: 0.9em;
  }
  
  .subject-name {
    color: #4a5568;
    margin: 0;
  }
  
  .courses-list {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }
  
  .course-group {
    margin-bottom: 15px;
  }
  
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f7fafc;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .course-header:hover {
    background: #edf2f7;
  }
  
  .course-header h4 {
    margin: 0;
    color: #2d3748;
  }
  
  .section-count {
    color: #718096;
    font-size: 0.9em;
  }
  
  .course-sections {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  .section-link {
    display: block;
    padding: 8px 12px;
    margin: 5px 0;
    color: #4a5568;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  
  .section-link:hover {
    background-color: #edf2f7;
  }
  
  .section-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .section-code {
    font-weight: 500;
  }
  
  .professor-name {
    color: #718096;
    font-size: 0.9em;
  }
  </style>