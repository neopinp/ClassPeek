<template>
  <div class="info-page">
    <main>
      <section class="sidebar">
        <div class="profile-card">
          <div class="image-container">
            <img 
              v-if="data?.image_url" 
              :src="data.image_url" 
              :alt="getTitle()"
              class="profile-image"
            />
            <div v-else class="image-placeholder">
              <span>No Image Available</span>
            </div>
          </div>
          <h4 class="title">{{ getTitle() }}</h4>
        </div>
        <div class="info-card">
          <h4>Additional Information</h4>
          <div v-if="isProfessor" class="professor-info">
            <p><strong>Office:</strong> {{ data?.professor_page?.office_location || 'Not specified' }}</p>
            <p><strong>Office Hours:</strong> {{ data?.professor_page?.office_hours || 'Not specified' }}</p>
          </div>
          <div v-else class="course-info">
            <p><strong>Credits:</strong> {{ data?.credits }}</p>
            <p><strong>Course Code:</strong> {{ data?.course_code }}</p>
            <p><strong>Professor:</strong> {{ data?.professor?.name }}</p>
          </div>
        </div>
      </section>
      
      <article class="main-content">
        <h2>{{ getTopicTitle() }}</h2>
        <div class="content-body">
          <p>{{ getMainContent() }}</p>
          
          <div v-if="!isProfessor && data?.prerequisites?.length" class="prerequisites">
            <h3>Prerequisites:</h3>
            <ul>
              <li v-for="prereq in data.prerequisites" :key="prereq.id">
                {{ prereq.course_code }} - {{ prereq.title }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section mt-8">
          <h3 class="text-xl font-semibold mb-4">Comments</h3>
          
          <!-- Comment Form -->
          <div class="comment-form mb-6">
            <textarea
              v-model="newComment"
              class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write a comment..."
              rows="3"
            ></textarea>
            <button
              @click="submitComment"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Post Comment
            </button>
          </div>

          <!-- Comments List -->
          <div class="comments-list space-y-4">
            <div v-for="comment in data?.comments" :key="comment.id" 
                class="comment-item bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-semibold">{{ comment.user.name }}</span>
                  <span class="text-sm text-gray-500 ml-2">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
                <div v-if="isCurrentUser(comment.userId)" class="flex gap-2">
                  <button
                    @click="startEdit(comment)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteComment(comment.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <!-- Edit Form -->
              <div v-if="editingComment && editingComment.id === comment.id" 
                   class="mt-3"
              >
                <textarea
                  v-model="editingComment.content"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
                <div class="mt-2 flex gap-2">
                  <button
                    @click="saveEdit"
                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    @click="cancelEdit"
                    class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div v-else class="mt-2 text-gray-700">
                {{ comment.content }}
              </div>
            </div>

            <!-- No Comments State -->
            <div v-if="!data?.comments?.length" 
                 class="text-center py-6 text-gray-500 italic"
            >
              No comments yet
            </div>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from 'axios';

interface Comment {
  id: number;
  content: string;
  userId: number;
  createdAt: string | Date;
  user: {
    name: string;
    userType: 'STUDENT' | 'PROFESSOR';
  };
}

const API_BASE_URL = 'http://localhost:3000/api';

export default defineComponent({
  name: "InfoPage",

  data() {
    return {
      data: null as any,
      loading: false,
      error: null as string | null,
      type: '' as 'professor' | 'course',
      newComment: '',
      editingComment: null as Comment | null
    };
  },

  computed: {
    isProfessor(): boolean {
      return this.type === 'professor';
    },

    entityId(): number | null {
      return this.data?.id || null;
    }
  },

  methods: {
    getTitle() {
      if (!this.data) return '';
      return this.isProfessor ? this.data.name : this.data.title;
    },

    getTopicTitle() {
      if (!this.data) return '';
      return this.isProfessor ? 'Professor Bio' : 'Course Description';
    },

    getMainContent() {
      if (!this.data) return '';
      return this.isProfessor ? this.data.professor_page?.bio : this.data.description;
    },

    async fetchData() {
      this.loading = true;
      try {
        this.type = this.$route.params.type as 'professor' | 'course';
        const id = this.$route.params.id;

        // Validate type
        if (!['professor', 'course'].includes(this.type)) {
          this.error = 'Invalid type';
          return;
        }
        
        const response = await axios.get(
          `${API_BASE_URL}/${this.type}s/${id}`
        );
        
        this.data = response.data;
        document.title = `${this.getTitle()} - ClassPeek`;
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Failed to load data';
      } finally {
        this.loading = false;
      }
    },

    formatDate(date: string | Date) {
      return new Date(date).toLocaleDateString();
    },

    isCurrentUser(userId: number) {
      // TODO: Replace with actual user authentication check
      return true; // For development
    },

    async submitComment() {
      if (!this.newComment.trim() || !this.entityId) return;

      try {
        const commentData = {
          content: this.newComment,
          [this.isProfessor ? 'professorPageId' : 'courseId']: this.entityId
        };

        await axios.post(`${API_BASE_URL}/comments`, commentData);
        
        this.newComment = '';
        await this.fetchData(); // Refresh the entire data
      } catch (error) {
        console.error('Error submitting comment:', error);
        // TODO: Add user feedback for error
      }
    },

    startEdit(comment: Comment) {
      this.editingComment = { ...comment };
    },

    async saveEdit() {
      if (!this.editingComment) return;

      try {
        await axios.put(
          `${API_BASE_URL}/comments/${this.editingComment.id}`,
          { content: this.editingComment.content }
        );
        await this.fetchData(); // Refresh data
        this.editingComment = null;
      } catch (error) {
        console.error('Error updating comment:', error);
      }
    },

    cancelEdit() {
      this.editingComment = null;
    },

    async deleteComment(commentId: number) {
      if (!confirm('Are you sure you want to delete this comment?')) return;

      try {
        await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
        await this.fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  },

  mounted() {
    this.fetchData();
  },

  watch: {
    '$route'(to, from) {
      if (to.params.id !== from.params.id || to.params.type !== from.params.type) {
        this.fetchData();
      }
    }
  }
});
</script>

<style scoped>
.info-page {
  margin-top: 50px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.02);
  padding: 0;
  margin: 50px 0 0 0;
  font-size: 16px;
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.info-page main {
  display: flex;
  min-height: 460px;
  gap: 20px;
  padding: 20px;
  margin-bottom: 0;
}

.sidebar {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card, .info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  /* Deeper, layered shadow effect */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 8px 16px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-card:hover, .info-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 16px 24px rgba(0, 0, 0, 0.06);
}

.image-container {
  width: 100%;
  height: 200px;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  /* Add subtle inner shadow */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.title {
  font-size: 1.2em;
  font-weight: 600;
  text-align: center;
  margin-top: 10px;
}

.main-content {
  flex: 3;
  background: white;
  padding: 30px;
  border-radius: 8px;
  /* Deeper shadow with slight color tint */
  box-shadow: 
    0 4px 6px rgba(50, 50, 93, 0.11),
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
}

.main-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.content-body {
  line-height: 1.6;
}

.prerequisites {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  /* Inset shadow effect */
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.05);
}


.prerequisites h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.prerequisites ul {
  list-style-type: none;
  padding: 0;
}

.prerequisites li {
  padding: 5px 0;
  color: #666;
}

.comments-section {
  background-color: #f8f9fa;
  padding: 30px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comments-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.comments-list {
  list-style-type: none;
  padding: 0;
}

.comment-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  /* Subtle lift effect */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 4px 6px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.comment-item:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 6px 12px rgba(0, 0, 0, 0.05);
}


.no-comments {
  text-align: center;
  color: #666;
  font-style: italic;
}

.comment-form textarea {
  background: white;
  border: 1px solid #ddd;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.comment-form textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  outline: none;
}

.comment-form button {
  transition: all 0.2s;
}

.comment-form button:hover {
  transform: translateY(-1px);
}

.comment-item {
  position: relative;
  padding: 20px;
}

.comment-item button {
  font-size: 0.875rem;
  transition: all 0.2s;
}

.comment-item button:hover {
  transform: translateY(-1px);
}

.comment-item textarea {
  background: white;
  border: 1px solid #ddd;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.comment-item textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  outline: none;
}

.professor-info, .course-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.professor-info p, .course-info p {
  margin: 0;
  color: #666;
}

strong {
  color: #2c3e50;
}
</style>