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
        <div class="comments-section mt-8 max-w-4xl">
        <h3 class="text-xl font-semibold mb-4">Comments</h3>
        
        <!-- Main Comment Form -->
        <div class="comment-form mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <textarea
            v-model="newComment"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Write a comment..."
            rows="3"
          ></textarea>
          <div class="mt-2 flex justify-end">
            <button
              @click="submitComment"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>Post Comment</span>
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div class="comments-list space-y-6">
          <div v-for="comment in comments" :key="comment.id" 
              class="comment-thread"
          >
            <!-- Main Comment -->
            <div class="comment-item bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold">{{ comment.user.name }}</span>
                    <span 
                      class="text-xs px-2 py-1 rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-800': comment.user.user_type === 'PROFESSOR',
                        'bg-green-100 text-green-800': comment.user.user_type === 'STUDENT'
                      }"
                    >
                      {{ comment.user.user_type }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    <span :title="formatDate(comment.created_at)">
                      {{ formatRelativeTime(comment.created_at) }}
                    </span>
                    <span 
                      v-if="comment.updated_at !== comment.created_at" 
                      class="ml-2 italic"
                      :title="formatDate(comment.updated_at)"
                    >
                      (edited {{ formatRelativeTime(comment.updated_at) }})
                    </span>
                  </div>
                </div>
                <div v-if="isCurrentUser(comment.user.id)" class="flex gap-2">
                  <button
                    @click="startEdit(comment)"
                    class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteComment(comment.id)"
                    class="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <!-- Edit Form -->
              <div v-if="editingComment && editingComment.id === comment.id" 
                  class="mt-4"
              >
                <textarea
                  v-model="editingComment.content"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
                <div class="mt-2 flex gap-2 justify-end">
                  <button
                    @click="cancelEdit"
                    class="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEdit"
                    class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div v-else class="mt-3 text-gray-700">
                {{ comment.content }}
              </div>

              <!-- Reply Button -->
              <div class="mt-4 flex justify-between items-center">
                <button
                  @click="startReply(comment)"
                  class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Reply
                </button>
              </div>

              <!-- Reply Form -->
              <div v-if="replyingTo === comment.id" 
                  class="mt-4 pl-4 border-l-2 border-gray-200"
              >
                <textarea
                  v-model="replyContent"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Write a reply..."
                  rows="2"
                ></textarea>
                <div class="mt-2 flex gap-2 justify-end">
                  <button
                    @click="cancelReply"
                    class="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    @click="submitReply(comment.id)"
                    class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Post Reply
                  </button>
                </div>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies && comment.replies.length > 0" 
                  class="mt-4 space-y-3 pl-6 border-l-2 border-gray-200"
              >
                <div v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="reply-item bg-gray-50 p-4 rounded-lg"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-semibold">{{ reply.user.name }}</span>
                        <span 
                          class="text-xs px-2 py-0.5 rounded-full"
                          :class="{
                            'bg-blue-100 text-blue-800': reply.user.user_type === 'PROFESSOR',
                            'bg-green-100 text-green-800': reply.user.user_type === 'STUDENT'
                          }"
                        >
                          {{ reply.user.user_type }}
                        </span>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        {{ formatRelativeTime(reply.created_at) }}
                      </div>
                    </div>
                    <div v-if="isCurrentUser(reply.user.id)" class="flex gap-2">
                      <button
                        @click="startEdit(reply)"
                        class="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteComment(reply.id)"
                        class="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 text-gray-700">
                    {{ reply.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Comments State -->
          <div v-if="!comments.length" 
              class="text-center py-8 bg-white rounded-lg border border-gray-200"
          >
            <span class="text-gray-500 italic">No comments yet. Be the first to comment!</span>
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

interface User {
  id: number;
  name: string;
  user_type: 'STUDENT' | 'PROFESSOR';
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  parent_id?: number | null;
  replies?: Comment[];
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
      editingComment: null as Comment | null,
      replyingTo: null as number | null,
      replyContent: '',
      comments: [] as Comment[]
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
    // Existing Info Page Methods
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

    // Data Fetching Methods
    async fetchData() {
      this.loading = true;
      try {
        this.type = this.$route.params.type as 'professor' | 'course';
        const id = this.$route.params.id;

        if (!['professor', 'course'].includes(this.type)) {
          this.error = 'Invalid type';
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/${this.type}s/${id}`);
        this.data = response.data;
        await this.fetchComments();
        document.title = `${this.getTitle()} - ClassPeek`;
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Failed to load data';
      } finally {
        this.loading = false;
      }
    },

    async fetchComments() {
      try {
        const response = await axios.get(`${API_BASE_URL}/comments`, {
          params: {
            [this.isProfessor ? 'professorPageId' : 'courseId']: this.entityId
          }
        });
        
        this.comments = this.sortComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    },

    // Comment Sorting and Formatting Methods
    sortComments(comments: Comment[]) {
      return [...comments].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },

    formatDate(dateString: string) {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error('Invalid date string:', dateString);
          return 'Invalid date';
        }

        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    },

    formatRelativeTime(dateString: string): string {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }

        if (diffInDays < 30) {
          const diffInWeeks = Math.floor(diffInDays / 7);
          return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
          return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
      } catch (error) {
        console.error('Error formatting relative time:', error);
        return this.formatDate(dateString);
      }
    },

    // User Permission Methods
    isCurrentUser(userId: number) {
      // TODO: Replace with actual user authentication check
      return true;
    },

    // Comment CRUD Methods
    async submitComment() {
      if (!this.newComment.trim() || !this.entityId) return;

      try {
        const commentData = {
          content: this.newComment,
          [this.isProfessor ? 'professorPageId' : 'courseId']: this.entityId
        };

        await axios.post(`${API_BASE_URL}/comments`, commentData);
        this.newComment = '';
        await this.fetchComments();
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    },

    async deleteComment(commentId: number) {
      if (!confirm('Are you sure you want to delete this comment?')) return;

      try {
        await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
        await this.fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    },

    // Comment Edit Methods
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
        await this.fetchComments();
        this.editingComment = null;
      } catch (error) {
        console.error('Error updating comment:', error);
      }
    },

    cancelEdit() {
      this.editingComment = null;
    },

    // Reply Methods
    startReply(comment: Comment) {
      this.replyingTo = comment.id;
      this.replyContent = '';
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyContent = '';
    },

    async submitReply(parentId: number) {
      if (!this.replyContent.trim() || !this.entityId) return;

      try {
        const commentData = {
          content: this.replyContent,
          [this.isProfessor ? 'professorPageId' : 'courseId']: this.entityId,
          parentId
        };

        await axios.post(`${API_BASE_URL}/comments`, commentData);
        this.replyContent = '';
        this.replyingTo = null;
        await this.fetchComments();
      } catch (error) {
        console.error('Error submitting reply:', error);
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