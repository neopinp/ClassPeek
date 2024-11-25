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
          <!-- Professor Specific Information -->
          <div v-if="isProfessor" class="professor-info">
            <!-- Office Location -->
            <div class="editable-field">
              <label><strong>Office:</strong></label>
              <div v-if="isEditingField !== 'office_location'" class="text-display">
                <p style="color: black;">{{ data?.professor_page?.office_location || 'Not specified' }}</p>
                <button v-if="isCurrentProfessor && !isEditingField" class="btn btn-primary" @click="startEdit('office_location')">
                  Edit
                </button>
              </div>
              <div v-else>
                <textarea v-model="editedData.office_location" class="input-field"></textarea>
                <button class="btn btn-primary" @click="saveEdit('office_location')">
                  Save
                </button>
                <button class="btn btn-secondary" @click="cancelEdit">
                  Cancel
                </button>
              </div>
            </div>

            <!-- Office Hours -->
            <div class="editable-field">
              <label><strong>Office Hours:</strong></label>
              <div v-if="isEditingField !== 'office_hours'" class="text-display">
                <p style="color: black;">{{ data?.professor_page?.office_hours || 'Not specified' }}</p>
                <button
                  v-if="isCurrentProfessor && !isEditingField" 
                  class="btn btn-primary"
                  @click="startEdit('office_hours')"
                >
                  Edit
                </button>
              </div>
              <div v-else>
                <textarea
                  v-model="editedData.office_hours"
                  class="input-field"
                ></textarea>
                <button
                  class="btn btn-primary"
                  @click="saveEdit('office_hours')"
                >
                  Save
                </button>
                <button
                  class="btn btn-secondary"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div v-else class="course-info">
            <p><strong>Credits:</strong> {{ data?.credits }}</p>
            <p><strong>Course Code:</strong> {{ data?.course_code }}</p>
            <p><strong>Professor: </strong>
              <router-link
                v-if="data?.professor?.id"
                :to="{ name: 'Info', params: { type: 'professor', id: data?.professor?.id } }"
                class="course-title-link"
              >
              {{ data?.professor?.name }}
              </router-link>
              <span v-else>{{ data?.professor?.name }}</span>
            </p>
          </div>
        </div>
      </section>
      
      <article class="main-content">
        <h2>{{ getTopicTitle() }}</h2>
        <div class="content-body">
          <!-- Bio Section -->
          <div class="editable-field">
            <div v-if="!isEditingField || isEditingField !== 'bio'">
              <p>{{ getMainContent() }}</p>
              <button 
                v-if="isCurrentProfessor && !isEditingField" 
                class="btn btn-primary" 
                @click="startEdit('bio')">
                Edit Bio
              </button>
            </div>
            <div v-else>
              <textarea
                v-model="editedData.bio"
                class="input-field"
                placeholder="Edit professor bio here"
              ></textarea>
              <div class="edit-actions">
                <button class="btn btn-primary" @click="saveEdit('bio')">Save</button>
                <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Prerequisites Section -->
          <div v-if="!isProfessor && data?.prerequisites?.length" class="prerequisites">
            <h3>Prerequisites:</h3>
            <ul>
              <li v-for="prereq in data.prerequisites" :key="prereq.id">
                {{ prereq.course_code }} - {{ prereq.title }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Ratings Section -->
        <div class="ratings-section">
          <h3>Ratings</h3>
          
          <!-- Display Average Rating -->
          <div class="average-rating">
            <span class="stars">{{ renderStars(averageRating) }}</span>
            <span class="numeric-rating">{{ averageRating.toFixed(1) }} / 5</span>
          </div>
          
          <!-- User Rating Submission -->
          <div v-if="isAuthenticated" class="user-rating">
            <!-- TODO: Add individual user routes, it'd use this structure below
            <h4>Your Rating</h4>
            <div v-if="userRating">
              <span class="stars">{{ renderStars(userRating) }}</span>
              <span class="numeric-rating">{{ userRating }} / 5</span>
              <button class="edit-button" @click="toggleRatingForm">Edit Rating</button>
            </div>
            <div v-else> -->
            <div>
              <button class="btn btn-primary" @click="toggleRatingForm">Rate This {{ isProfessor ? 'Professor' : 'Course' }}</button>
            </div>
            
            <!-- Rating Form -->
            <div v-if="showRatingForm" class="rating-form">
              <form @submit.prevent="submitRating">
                <div class="rating-options">
                  <label v-for="n in 5" :key="n">
                    <input type="radio" :value="n" v-model.number="ratingValue" required />
                    {{ n }}
                  </label>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Submit</button>
                  <button type="button" class="btn btn-secondary" @click="toggleRatingForm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Rating Not Available -->
          <div v-else class="not-authenticated">
            <p>Please log in to submit a rating.</p>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h3>Comments</h3>
          
          <!-- Main Comment Form -->
          <div v-if="isAuthenticated" class="comment-form">
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
          <div v-else class="comment-form">
            <p>Please login to post comments.</p>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-thread">
              <!-- Parent Comment -->
              <div class="comment-item">
                <div class="user-info">
                  <div class="user-header">
                    <!-- Username also links to their profile -->
                    <router-link
                      v-if="comment.user.user_type === 'PROFESSOR'"
                      :to="{ name: 'Info', params: { type: 'professor', id: comment.user.id } }"
                      class="user-name-link"
                    >
                      <span class="user-name">{{ comment.user.name }}</span>
                    </router-link>
                    <span v-else class="user-name">{{ comment.user.name }}</span>
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
                  <div v-if="editingComment?.id === comment.id" class="editable-field">
                    <textarea v-model="editingComment.content"></textarea>
                    <div class="comment-actions">
                      <button class="btn btn-secondary" @click="cancelCommentEdit">Cancel</button>
                      <button class="btn btn-primary" @click="saveCommentEdit">Save</button>
                    </div>
                  </div>
                  <div v-else>{{ comment.content }}</div>
                </div>

                <div class="comment-actions">
                  <button class="btn btn-primary" @click="startReply(comment)">Reply</button>
                  <div v-if="isCurrentUser(comment.user.id) || isUserProfessor" class="user-actions">
                    <button class="btn btn-primary" @click="startCommentEdit(comment)">Edit</button>
                    <button class="btn btn-tertiary" @click="deleteComment(comment.id)">Delete</button>
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
                        <!-- Username also links to their profile -->
                        <router-link v-if="reply.user.user_type === 'PROFESSOR'"
                          :to="{ name: 'Info', params: { type: 'professor', id: reply.user.id } }"
                          class="user-name-link"
                        >
                          <span class="user-name">{{ reply.user.name }}</span>
                        </router-link>
                        <span v-else class="user-name">{{ reply.user.name }}</span>
                        <span class="user-type-badge"
                          :class="{
                            'professor': reply.user.user_type === 'PROFESSOR',
                            'student': reply.user.user_type === 'STUDENT'
                          }"
                        >
                          {{ reply.user.user_type || "Unknown"}}
                        </span>
                      </div>
                      <span class="timestamp" :title="formatDate(reply.created_at)">
                        {{ formatRelativeTime(reply.created_at) }}
                      </span>
                    </div>

                    <div class="comment-content">
                      {{ reply.content }}
                    </div>

                    <div v-if="isCurrentUser(reply.user.id) || isUserProfessor" class="comment-actions">
                      <button class="btn btn-primary" @click="startCommentEdit(reply)">Edit</button>
                      <button class="btn btn-tertiary" @click="deleteComment(reply.id)">Delete</button>
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
import { defineComponent, onMounted } from "vue";
import api from "../api";
import sessionStore from "../store/session";
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

export default defineComponent({
  name: "InfoPage",

  setup() {
    onMounted(() => {
      sessionStore.fetchSession();
    });

    return {
      user: sessionStore.user,
    };
  },

  data() {
    return {
      data: null as any,
      editedData: {
        bio: "",
        office_hours: "",
        office_location: "",
      },
      loading: false,
      error: null as string | null,
      isEditing: false,
      isEditingField:  null as "bio" | "office_hours" | "office_location" | null,
      type: '' as 'professor' | 'course',
      newComment: '',
      editingComment: null as Comment | null,
      replyingTo: null as number | null,
      replyContent: '',
      comments: [] as Comment[],
      averageRating: 0.0 as number,
      userRating: null as number | null,
      ratingValue: 5 as number,
      showRatingForm: false,
    };
  },

  computed: {
    isAuthenticated(): boolean {
      return !!this.user.id;
    },
    isProfessor(): boolean {
      return this.type === 'professor';
    },

    isUserProfessor(): boolean {
      return sessionStore.user.user_type === "PROFESSOR";
    },

    isCurrentProfessor(): boolean {
      return (
        sessionStore.user.user_type === "PROFESSOR" &&
        sessionStore.user.id === this.data?.professor_page?.professor_id
      );
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

        const response = await api.get(`/${this.type}s/${id}`);
        
        this.data = response.data;
        
        await this.fetchComments();
        await this.fetchRatings();
        document.title = `${this.getTitle()} - ClassPeek`;
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Failed to load data';
      } finally {
        this.loading = false;
      }
    },

    startEdit(field: "bio" | "office_hours" | "office_location") {
      this.isEditingField = field;
      if (this.data?.professor_page) {
        this.editedData[field] = this.data.professor_page[field];
      }
    },

    cancelEdit() {
      this.isEditingField = null;
    },
    
    async saveEdit(field: "bio" | "office_hours" | "office_location") {
      if (!this.isEditingField) return;

      try {
        this.loading = true;

        const updateData: Partial<typeof this.editedData> = {
          [field]: this.editedData[field],
        };

        const professorId = this.data?.id;
        if (!professorId) throw new Error("Professor ID is missing");

        const response = await api.put(`/professors/${professorId}/page`, updateData);
        console.log("Updated Professor Page:", response.data);

        // Update local data
        if (this.data?.professor_page) {
          this.data.professor_page[field] = this.editedData[field];
        }

        this.isEditingField = null;
      } catch (error) {
        console.error("Error updating professor page:", error);
        alert("Failed to save changes. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    async fetchComments() {
      try {
        if (!this.data) {
          console.log('No data available for comments');
          return;
        }

        let params = {};
        
        if (this.isProfessor) {
          if (this.data.professor_page?.id) {
            params = { professorPageId: this.data.professor_page.id };
            console.log('Fetching professor comments for page:', this.data.professor_page.id);
          } else {
            console.error('Professor page ID not found:', this.data);
            return;
          }
        } else {
          if (this.data.id) {
            params = { courseId: this.data.id };
            console.log('Fetching course comments for course:', this.data.id);
          } else {
            console.error('Course ID not found:', this.data);
            return;
          }
        }

        const response = await api.get('/comments', { params });
        this.comments = response.data;

        console.log('Fetched comments with replies:', JSON.stringify(this.comments, null, 2));
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
      return sessionStore.user.id === userId;
    },

    // Comment CRUD Methods
    async submitComment() {
      if (!this.newComment.trim() || !this.entityId) return;

      try {
        const commentData = {
          content: this.newComment,
          ...(this.isProfessor 
            ? { professorPageId: this.data.professor_page?.id }
            : { courseId: this.data.id }
          )
        };

        await api.post(`/comments`, commentData);
        this.newComment = '';
        await this.fetchComments();
      } catch (error) {
        // Narrow down the type of `error`
        if (axios.isAxiosError(error)) {
          // Handle Axios-specific errors
          console.error("Axios error:", error.response?.data);
          if (error.response?.status === 401) {
            alert("You must be signed in to post a comment.");
          } else {
            alert("An error occurred while submitting your comment.");
          }
        } else if (error instanceof Error) {
          // Handle general errors
          console.error("Error:", error.message);
          alert("An unexpected error occurred. Please try again.");
        } else {
          // Handle unknown errors
          console.error("Unexpected error:", error);
          alert("An unknown error occurred.");
        }
      }
    },

    async deleteComment(commentId: number) {
      if (!confirm('Are you sure you want to delete this comment?')) return;

      try {
        await api.delete(`/comments/${commentId}`);
        await this.fetchComments();
      } catch (error) {
        // Narrow down the type of `error`
        if (axios.isAxiosError(error)) {
          // Handle Axios-specific errors
          console.error("Axios error:", error.response?.data);
          if (error.response?.status === 401) {
            alert("You must be signed in to delete a comment.");
          } else {
            alert("An error occurred while deleting your comment.");
          }
        } else if (error instanceof Error) {
          // Handle general errors
          console.error("Error:", error.message);
          alert("An unexpected error occurred. Please try again.");
        } else {
          // Handle unknown errors
          console.error("Unexpected error:", error);
          alert("An unknown error occurred.");
        }
      }
    },

    // Comment Edit Methods
    startCommentEdit(comment: Comment) {
      this.editingComment = { ...comment };
    },

    async saveCommentEdit() {
      if (!this.editingComment) return;

      try {
        await api.put(`/comments/${this.editingComment.id}`, {
          content: this.editingComment.content,
        });
        await this.fetchComments();
        this.editingComment = null;
      } catch (error) {
        // Narrow down the type of `error`
        if (axios.isAxiosError(error)) {
          // Handle Axios-specific errors
          console.error("Axios error:", error.response?.data);
          if (error.response?.status === 401) {
            alert("You must be signed in to edit a comment.");
          } else {
            alert("An error occurred while editing your comment.");
          }
        } else if (error instanceof Error) {
          // Handle general errors
          console.error("Error:", error.message);
          alert("An unexpected error occurred. Please try again.");
        } else {
          // Handle unknown errors
          console.error("Unexpected error:", error);
          alert("An unknown error occurred.");
        }
      }
    },

    cancelCommentEdit() {
      this.editingComment = null;
    },

    // Reply Methods
    startReply(comment: Comment) {
      const userName = comment?.user?.name;
      if (!userName) {
        console.error('Invalid comment object or missing user name:', comment);
        return;
      }
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
          parentId,
          [this.isProfessor ? 'professorPageId' : 'courseId']: this.entityId
        };

        await api.post(`/comments`, commentData);

        this.replyContent = '';
        this.replyingTo = null;
        await this.fetchComments();
      } catch (error) {
        console.error('Error submitting reply:', error);
      }
    },

    // Ratings Methods
    async fetchRatings() {
      if (!this.data) return;

      try {
        // Determine the type and ID for fetching ratings
        const params: any = {};
        let endpoint = '';

        if (this.isProfessor) {
          const professorPageId = this.data.professor_page?.id;
          if (!professorPageId) {
            console.error('ProfessorPage ID is missing');
            return;
          }
          params.professorPageId = professorPageId;
          endpoint = `/ratings`;
        } else {
          const courseId = this.data.id;
          if (!courseId) {
            console.error('Course ID is missing');
            return;
          }
          params.courseId = courseId;
          endpoint = `/ratings`;
        }

        // Fetch average rating
        const averageResponse = await api.get(endpoint, { params });
        this.averageRating = averageResponse.data.averageRating;

        // If authenticated, fetch user's rating
        if (this.isAuthenticated) {
          const userId = sessionStore.user.id;
          // Since ratings are unique per user per entity, fetch the user's rating
          // Currently the API returns every rating, maybe tweak to fetch user rating seperately?

          const ratingsResponse = await api.get(endpoint, { params });
          const allRatings = ratingsResponse.data.allRatings;

          const userRatingObj = allRatings.find((r: any) => r.userId === userId);
          this.userRating = userRatingObj ? userRatingObj.value : null;
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    },

    renderStars(rating: number): string {
      const fullStars = Math.floor(rating);
      const halfStar = rating - fullStars >= 0.5;
      let stars = '★'.repeat(fullStars);
      if (halfStar) stars += '½';
      stars = stars.padEnd(5, '☆'); // Ensure total of 5 stars
      return stars;
    },

    toggleRatingForm() {
      this.showRatingForm = !this.showRatingForm;
      if (this.userRating) {
        this.ratingValue = this.userRating;
      } else {
        this.ratingValue = 5;
      }
    },

    async submitRating() {
      try {
        const payload: any = {
          value: this.ratingValue,
        };

        if (this.isProfessor) {
          payload.professorPageId = this.data.professor_page.id;
        } else {
          payload.courseId = this.data.id;
        }

        const response = await api.post('/ratings', payload);
        this.averageRating = response.data.averageRating;

        // Update user's rating
        if (this.userRating) {
          this.userRating = this.ratingValue;
        } else {
          this.userRating = this.ratingValue;
        }

        this.showRatingForm = false;
      } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating. Please try again.');
      }
    },
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
    background: rgb(249, 187, 187);
    /*background-image: url("images/download.jpg");*/
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
    background: rgb(255, 61, 93);
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

   /* ===== Editable items ===== */

  .editable-field {
    margin-bottom: 20px;
  }
  .editable-field strong {
    display: block;
    margin-bottom: 5px;
  }
  .editable-field textarea,
  .editable-field input {
    width: 100%;
    max-width: 400px;
    min-height: 50px;
    padding: 10px;
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    resize: vertical; /* Allow vertical resizing for textareas */
    outline: none;
    transition: all 0.3s ease;
  }

  .editable-field textarea:focus,
  .editable-field input:focus {
    border-color: #4299e1; /* Blue border on focus */
    box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); /* Subtle glow */
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
    background: rgb(255, 61, 93);
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
    background: rgb(249, 187, 187);
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
    border-color: red;
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

  .user-name-link {
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

  /* ===== Ratings Section ===== */
  .ratings-section {
    margin-top: 2rem;
    padding: 2rem;
    background: rgb(255, 223, 223);
    border-radius: 0.75rem;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.05),
      0 4px 6px rgba(0, 0, 0, 0.02);
  }

  .ratings-section h3 {
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .average-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .average-rating .stars {
    color: #f59e0b; /* Amber-400 for stars */
    font-size: 1.25rem;
  }

  .average-rating .numeric-rating {
    font-weight: 600;
    color: #374151; /* Gray-700 */
  }

  .user-rating {
    margin-bottom: 1.5rem;
  }

  .user-rating h4 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .user-rating .stars {
    color: #f59e0b;
    font-size: 1.25rem;
    margin-right: 0.5rem;
  }

  .rating-form {
    margin-top: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .rating-options {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .rating-options label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    color: #374151;
  }

  .rating-options input[type="radio"] {
    accent-color: #3b82f6; /* Blue-500 */
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
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

  .btn-tertiary {
    background-color: #f63b3b;
    color: white;
  }

  .btn-tertiary:hover {
    background-color: #cc2323;
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

  .course-info .course-title-link {
    color: #1e90ff; /* Link color */
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;
  }
  .course-info .course-title-link:hover {
    color: #0056b3; /* Hover color */
    text-decoration: underline;
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