<!-- frontend/src/components/CommentSection.vue -->
<template>
    <div class="comments-section">
      <!-- Comment Form -->
      <div class="comment-form mb-4">
        <textarea
          v-model="newComment"
          class="w-full p-2 border rounded"
          placeholder="Write a comment..."
          rows="3"
        ></textarea>
        <button
          @click="submitComment"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
  
      <!-- Comments List -->
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="mb-4">
          <div class="p-4 border rounded">
            <div class="flex justify-between">
              <span class="font-bold">{{ comment.user.name }}</span>
              <span class="text-gray-500">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="mt-2">{{ comment.content }}</p>
            
            <!-- Edit/Delete buttons -->
            <div v-if="isCurrentUser(comment.userId)" class="mt-2 space-x-2">
              <button 
                @click="startEdit(comment)"
                class="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button 
                @click="deleteComment(comment.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            
            <!-- Edit form -->
            <div v-if="editingComment && editingComment.id === comment.id" class="mt-2">
              <textarea
                v-model="editingComment.content"
                class="w-full p-2 border rounded"
                rows="3"
              ></textarea>
              <div class="mt-2 space-x-2">
                <button
                  @click="saveEdit"
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import axios from 'axios'
  
  interface CommentData {
    id: number
    content: string
    userId: number
    courseId?: number
    professorPageId?: number
    createdAt: string | Date
    updatedAt: string | Date
    user: {
      name: string
      userType: 'STUDENT' | 'PROFESSOR'
    }
  }
  
  export default defineComponent({
    name: 'CommentSection',
  
    props: {
      courseId: {
        type: Number,
        required: false,
        default: undefined
      },
      professorPageId: {
        type: Number,
        required: false,
        default: undefined
      }
    },
  
    data() {
      return {
        comments: [] as CommentData[],
        newComment: '',
        editingComment: null as CommentData | null
      }
    },
  
    methods: {
      async fetchComments() {
        try {
          const response = await axios.get('http://localhost:3000/api/comments', {
            params: {
              courseId: this.courseId,
              professorPageId: this.professorPageId,
            }
          })
          this.comments = response.data
        } catch (error) {
          console.error('Error fetching comments:', error)
        }
      },
  
      async submitComment() {
        if (!this.newComment.trim()) return
  
        try {
          await axios.post('http://localhost:3000/api/comments', {
            content: this.newComment,
            courseId: this.courseId,
            professorPageId: this.professorPageId
          })
          this.newComment = ''
          await this.fetchComments()
        } catch (error) {
          console.error('Error submitting comment:', error)
        }
      },
  
      async deleteComment(commentId: number) {
        if (!confirm('Are you sure you want to delete this comment?')) return
  
        try {
          await axios.delete(`http://localhost:3000/api/comments/${commentId}`)
          await this.fetchComments()
        } catch (error) {
          console.error('Error deleting comment:', error)
        }
      },
  
      startEdit(comment: CommentData) {
        this.editingComment = { ...comment }
      },
  
      async saveEdit() {
        if (!this.editingComment) return
  
        try {
          await axios.put(`http://localhost:3000/api/comments/${this.editingComment.id}`, {
            content: this.editingComment.content
          })
          await this.fetchComments()
          this.editingComment = null
        } catch (error) {
          console.error('Error updating comment:', error)
        }
      },
  
      cancelEdit() {
        this.editingComment = null
      },
  
      formatDate(date: string | Date) {
        return new Date(date).toLocaleDateString()
      },
  
      isCurrentUser(userId: number) {
        // TODO: Replace with actual user authentication check
        return true // For development
      }
    },
  
    mounted() {
      this.fetchComments()
    }
  })
  </script>