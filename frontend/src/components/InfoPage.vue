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
        <div class="comments-section">
          <h3>Comments</h3>
          
          <!-- Main Comment Form -->
          <div class="comment-form">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
            ></textarea>
            <div class="comment-actions">
              <button class="btn btn-primary" @click="submitComment">
                Post Comment
              </button>
            </div>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-thread">
              <!-- Parent Comment -->
              <div class="comment-item">
                <div class="user-info">
                  <div class="user-header">
                    <span class="user-name">{{ comment.user.name }}</span>
                    <span class="user-type-badge" 
                      :class="{ 
                        'professor': comment.user.user_type === 'PROFESSOR',
                        'student': comment.user.user_type === 'STUDENT'
                      }"
                    >
                      {{ comment.user.user_type }}
                    </span>
                  </div>
                  <span class="timestamp" :title="formatDate(comment.created_at)">
                    {{ formatRelativeTime(comment.created_at) }}
                  </span>
                </div>

                <div class="comment-content">
                  <div v-if="editingComment?.id === comment.id" class="edit-form">
                    <textarea v-model="editingComment.content"></textarea>
                    <div class="comment-actions">
                      <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
                      <button class="btn btn-primary" @click="saveEdit">Save</button>
                    </div>
                  </div>
                  <div v-else>{{ comment.content }}</div>
                </div>

                <div class="comment-actions">
                  <button class="action-button" @click="startReply(comment)">Reply</button>
                  <div v-if="isCurrentUser(comment.user.id)" class="user-actions">
                    <button class="edit-button" @click="startEdit(comment)">Edit</button>
                    <button class="delete-button" @click="deleteComment(comment.id)">Delete</button>
                  </div>
                </div>

                <!-- Reply Form -->
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <textarea
                    v-model="replyContent"
                    placeholder="Write a reply..."
                  ></textarea>
                  <div class="comment-actions">
                    <button class="btn btn-secondary" @click="cancelReply">Cancel</button>
                    <button class="btn btn-primary" @click="submitReply(comment.id)">Reply</button>
                  </div>
                </div>

                <!-- Replies -->
                <div v-if="comment.replies?.length" class="replies">
                  <div v-for="reply in comment.replies" 
                      :key="reply.id"
                      class="reply-item"
                  >
                    <div class="user-info">
                      <div class="user-header">
                        <span class="user-name">{{ reply.user.name }}</span>
                        <span class="user-type-badge"
                          :class="{
                            'professor': reply.user.user_type === 'PROFESSOR',
                            'student': reply.user.user_type === 'STUDENT'
                          }"
                        >
                          {{ reply.user.user_type }}
                        </span>
                      </div>
                      <span class="timestamp" :title="formatDate(reply.created_at)">
                        {{ formatRelativeTime(reply.created_at) }}
                      </span>
                    </div>

                    <div class="comment-content">
                      {{ reply.content }}
                    </div>

                    <div v-if="isCurrentUser(reply.user.id)" class="comment-actions">
                      <button class="edit-button" @click="startEdit(reply)">Edit</button>
                      <button class="delete-button" @click="deleteComment(reply.id)">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Comments State -->
            <div v-if="!comments.length" class="no-comments">
              Be the first to comment!
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
  /* ===== Base Page Layout ===== */
  .info-page {
    margin: 50px 0 0 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.02);
    font-size: 16px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }

  .info-page main {
    display: flex;
    min-height: 460px;
    gap: 20px;
    padding: 20px;
    margin-bottom: 0;
  }

  /* ===== Sidebar Styles ===== */
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

  /* Profile Image */
  .image-container {
    width: 100%;
    height: 200px;
    margin-bottom: 15px;
    border-radius: 8px;
    overflow: hidden;
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

  /* ===== Main Content Area ===== */
  .main-content {
    flex: 3;
    background: white;
    padding: 30px;
    border-radius: 8px;
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

  /* Prerequisites Section */
  .prerequisites {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
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

  /* ===== Comments Section ===== */
  .comments-section {
    margin-top: 2rem;
    padding: 2rem;
    background: transparent;
  }

  .comments-section h3 {
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  /* Comment Form */
  .comment-form {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.05),
      0 4px 6px rgba(0, 0, 0, 0.02);
    margin-bottom: 2rem;
  }

  .comment-form textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    min-height: 100px;
    font-size: 0.95rem;
    color: #374151;
    transition: all 0.2s;
  }

  .comment-form textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  /* Comment Thread and Items */
  .comment-thread {
    margin-bottom: 1.5rem;
  }

  .comment-item {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.05),
      0 4px 6px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .comment-item:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.08),
      0 6px 12px rgba(0, 0, 0, 0.05);
  }

  /* User Information */
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-name {
    font-weight: 600;
    color: #2c3e50;
  }

  .timestamp {
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* User Type Badges */
  .user-type-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: 500;
  }

  .user-type-badge.professor {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .user-type-badge.student {
    background-color: #dcfce7;
    color: #166534;
  }

  /* Comment Actions */
  .comment-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    justify-content: flex-end;
  }

  .action-button {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .edit-button {
    color: #3b82f6;
  }

  .edit-button:hover {
    color: #2563eb;
  }

  .delete-button {
    color: #ef4444;
  }

  .delete-button:hover {
    color: #dc2626;
  }

  /* Reply Section */
  .replies {
    margin-top: 1rem;
    margin-left: 2rem;
    padding-left: 1.5rem;
    border-left: 2px solid #e5e7eb;
  }

  .reply-item {
    background: #f8fafc;
    padding: 1.25rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
  }

  .reply-form {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border-left: 2px solid #3b82f6;
  }

  .reply-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    min-height: 80px;
  }

  /* Buttons */
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background-color: #6b7280;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
    transform: translateY(-1px);
  }

  /* Empty State */
  .no-comments {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 0.75rem;
    color: #6b7280;
    font-style: italic;
    border: 1px solid #e5e7eb;
  }

  /* Info Cards Content */
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

  /* ===== Responsive Design ===== */
  @media (max-width: 768px) {
    .info-page main {
      flex-direction: column;
    }

    .sidebar {
      max-width: none;
    }

    .replies {
      margin-left: 1rem;
      padding-left: 1rem;
    }

    .comment-item {
      padding: 1rem;
    }
  }
</style>