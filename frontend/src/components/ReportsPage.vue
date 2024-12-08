<template>
  <div class="admin-reports-page">
    <!-- Search and Filter Section -->
    <div class="search-section">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search reports..."
        class="search-input"
      />
      <select v-model="selectedStatus" class="search-input">
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="DISMISSED">Dismissed</option>
      </select>
      <button class="btn btn-primary" @click="fetchReports">Filter</button>
    </div>

    <!-- Reports Section -->
    <h1>All Reports</h1>
    <div v-if="loading" class="loading">Loading reports...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="reports-list">
      <div 
        v-for="report in filteredReports" 
        :key="report.id" 
        class="report-card"
      >
        <h3>Report #{{ report.id }}</h3>
        <p><strong>Reason:</strong> {{ report.reason }}</p>
        <p><strong>Comment:</strong> {{ report.comment.content }}</p>
        <p><strong>Status:</strong> {{ report.status }}</p>
        <p><strong>Reported By:</strong> {{ report.reported_by.name || report.reported_by.id }}</p>
        <p v-if="report.handled_by?.id"><strong>Handled By:</strong> {{ report.handled_by?.name || "Not handled yet" }}</p>
        
        <div class="actions">
          <!-- View Comment Button -->
          <button class="btn btn-secondary" @click="viewComment(report)">View Comment</button>
          
          <!-- Update Status -->
          <label>
            <strong>Update Status:</strong>
            <select v-model="report.newStatus" class="search-input">
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </label>
          <button class="btn btn-primary" @click="updateReportStatus(report.id, report.newStatus)">Update</button>
        </div>
      </div>
      <div v-if="filteredReports.length === 0" class="no-comments">
        No reports found.
      </div>
    </div>

    <!-- Comment Modal -->
    <div v-if="showCommentModal" class="modal-overlay" @click.self="closeCommentModal">
      <div class="modal-content">
        <h3>Comment Details</h3>
        <div v-if="selectedComment">
          <p><strong>Comment ID:</strong> {{ selectedComment.id }}</p>
          <p><strong>Author (User):</strong> {{ selectedComment.userName || selectedComment.userId }}</p>
          <p><strong>Created At:</strong> {{ formatDate(selectedComment.created_at) }}</p>
          <div class="editable-field" style="margin-top: 1rem;">
            <strong>Content:</strong>
            <div v-if="editingComment">
              <textarea v-model="editContent" class="input-field" style="width:100%;height:120px;"></textarea>
              <div class="modal-actions" style="margin-top:1rem;">
                <button class="btn btn-primary" @click="saveCommentEdit">Save</button>
                <button class="btn btn-secondary" @click="cancelEditComment">Cancel</button>
              </div>
            </div>
            <div v-else>
              <p>{{ selectedComment.content }}</p>
              <div class="modal-actions" style="margin-top:1rem;">
                <button class="btn btn-primary" @click="startEditComment">Edit Comment</button>
                <button class="btn btn-tertiary" @click="deleteSelectedComment">Delete Comment</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications within Modal -->
        <div v-if="modalSuccessMessage" class="success-message">
          <p>{{ modalSuccessMessage }}</p>
        </div>
        <div v-if="modalErrorMessage" class="error">
          <p>{{ modalErrorMessage }}</p>
        </div>

        <div class="modal-actions" v-if="!editingComment">
          <button class="btn btn-secondary" @click="closeCommentModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAxiosError } from "axios";
import api from "../api";
import sessionStore from "../store/session";

interface Report {
  id: number;
  reason: string;
  status: string;
  reported_by: {
    id: number;
    name: string;
  }
  handled_by?: {
    id: number;
    name: string;
  }
  newStatus?: string;
  comment: {
    id: number;
    content: string;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  };
}

interface SelectedComment {
  id: number;
  content: string;
  created_at: string;
  userId: number;
  userName: string;
}

export default defineComponent({
  name: "ReportsPage",
  data() {
    return {
      reports: [] as Report[],
      searchQuery: '',
      selectedStatus: '' as string | undefined,
      loading: false,
      error: null as string | null,

      showCommentModal: false,
      modalSuccessMessage: '' as string | null,
      modalErrorMessage: '' as string | null,
      selectedComment: null as SelectedComment | null,
      editingComment: false,
      editContent: '',
    };
  },
  computed: {
    isAdmin(): boolean {
      return sessionStore.user.user_type === "ADMIN";
    },
    filteredReports(): Report[] {
      let filtered = this.reports;

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(report =>
          report.reason.toLowerCase().includes(query) ||
          report.status.toLowerCase().includes(query) ||
          report.comment.id.toString().includes(query) ||
          report.comment.content.toLowerCase().includes(query)
        );
      }

      if (this.selectedStatus) {
        filtered = filtered.filter(report => report.status === this.selectedStatus);
      }

      return filtered;
    },
  },
  methods: {
    formatDate(dateString: string) {
      try {
        const date = new Date(dateString);
        return date.toLocaleString();
      } catch {
        return dateString;
      }
    },
    async fetchReports() {
      if (!this.isAdmin) {
        this.error = "Unauthorized: Only admins can access this page.";
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        const params: Record<string, string> = {};
        if (this.selectedStatus && this.selectedStatus.trim() !== '') {
          params.status = this.selectedStatus;
        }

        const response = await api.get('/reports', { params });
        const reportsData = response.data;

        if (reportsData && Array.isArray(reportsData)) {
          this.reports = reportsData.map((r: Report) => ({
            id: r.id,
            reason: r.reason,
            status: r.status,
            reported_by: {
              id: r.reported_by.id,
              name: r.reported_by.name
            },
            handled_by: r.handled_by ? {
              id: r.handled_by.id,
              name: r.handled_by.name
            } : undefined,
            newStatus: r.status,
            comment: {
              id: r.comment.id,
              content: r.comment.content,
              created_at: r.comment.created_at,
              user: { id: r.comment.user.id, name: r.comment.user.name }
            }
          }));
        } else {
          this.reports = [];
        }
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error("Axios error fetching reports:", error);
          this.error = error.response?.data?.error || "Failed to fetch reports.";
        } else if (error instanceof Error) {
          console.error("Unexpected error fetching reports:", error);
          this.error = error.message || "Failed to fetch reports.";
        } else {
          console.error("Non-Error thrown:", error);
          this.error = "Failed to fetch reports.";
        }
      } finally {
        this.loading = false;
      }
    },
    async updateReportStatus(reportId: number, newStatus: string | undefined) {
      if (!this.isAdmin) {
        alert("Unauthorized: Only admins can update report status.");
        return;
      }

      if (!newStatus) {
        alert("Please select a status to update.");
        return;
      }

      try {
        await api.put(`/reports/${reportId}`, { status: newStatus });
        const reportIndex = this.reports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
          this.reports[reportIndex].status = newStatus;
          this.reports[reportIndex].newStatus = newStatus;
          if (sessionStore.user.id !== null && sessionStore.user.name) {
            this.reports[reportIndex].handled_by = { 
              id: sessionStore.user.id, 
              name: sessionStore.user.name 
            };
          }
        }
        this.showCommentModal = true;
        this.modalSuccessMessage = `Report #${reportId} updated to ${newStatus}.`;
        // Since the status has changed, we need to re-fetch the reports
        this.fetchReports();
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error("Axios error updating report:", error);
          alert(error.response?.data?.error || "Failed to update report.");
        } else if (error instanceof Error) {
          console.error("Unexpected error updating report:", error);
          alert(error.message || "Failed to update report.");
        } else {
          console.error("Non-Error thrown:", error);
          alert("Failed to update report.");
        }
      }
    },
    viewComment(report: Report) {
      const c = report.comment;
      this.selectedComment = {
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        userId: c.user.id,
        userName: c.user.name
      };
      this.editContent = this.selectedComment.content;
      this.showCommentModal = true;
      this.editingComment = false;

      // Reset notifications when opening a new comment
      this.modalSuccessMessage = null;
      this.modalErrorMessage = null;
    },
    closeCommentModal() {
      this.showCommentModal = false;
      this.selectedComment = null;
      this.editingComment = false;
      this.editContent = '';

      
    // Reset notifications when closing the modal
    this.modalSuccessMessage = null;
    this.modalErrorMessage = null;
    },
    startEditComment() {
      if (!this.selectedComment) return;
      this.editingComment = true;
      this.editContent = this.selectedComment.content;
      
      // Reset notifications when starting to edit
      this.modalSuccessMessage = null;
      this.modalErrorMessage = null;
    },
    cancelEditComment() {
      this.editingComment = false;
      if (this.selectedComment) {
        this.editContent = this.selectedComment.content;
      }
      
      // Reset notifications when cancelling edit
      this.modalSuccessMessage = null;
      this.modalErrorMessage = null;
    },
    async saveCommentEdit() {
      if (!this.selectedComment) return;
      if (!this.isAdmin) {
        this.modalErrorMessage = "Unauthorized: Only admins can edit comments.";
        return;
      }

      try {
        await api.put(`/comments/${this.selectedComment.id}`, { content: this.editContent });
        this.selectedComment.content = this.editContent;
        this.editingComment = false;
        this.modalSuccessMessage = "Comment updated successfully.";
        // Since our comments have changed, we need to re-fetch the reports
        this.fetchReports();
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error("Axios error editing comment:", error);
          this.modalErrorMessage = error.response?.data?.error || "Failed to edit comment.";
        } else if (error instanceof Error) {
          console.error("Unexpected error editing comment:", error);
          this.modalErrorMessage = error.message || "Failed to edit comment.";
        } else {
          console.error("Non-Error thrown:", error);
          this.modalErrorMessage = "Failed to edit comment.";
        }
      }
    },
    async deleteSelectedComment() {
      if (!this.selectedComment) return;

      try {
        await api.delete(`/comments/${this.selectedComment.id}`);
        this.modalSuccessMessage = "Comment deleted successfully.";
        // Since our comments have changed, we need to re-fetch the reports
        this.closeCommentModal();
        this.fetchReports();
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error("Axios error deleting comment:", error);
          this.modalErrorMessage = error.response?.data?.error || "Failed to delete comment.";
        } else if (error instanceof Error) {
          console.error("Unexpected error deleting comment:", error);
          this.modalErrorMessage = error.message || "Failed to delete comment.";
        } else {
          console.error("Non-Error thrown:", error);
          this.modalErrorMessage = "Failed to edit comment.";
        }
      }
    },
  },
  mounted() {
    // Keep the same mounted logic as requested
    this.$watch(() => sessionStore.user, (user) => {
      if (user) {
        this.loading = false;
        if (this.isAdmin) {
          this.fetchReports();
        } else {
          this.error = "Unauthorized: Only admins can access this page.";
        }
      }
    },
    { immediate: true }
    );
  },
});
</script>

<style scoped>
@import 'styles/Courses.css';

/* Keep the existing CSS from your code snippet */
.admin-reports-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 30px;
  display: flex;
  gap: 10px;
}

.search-input {
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

.reports-list {
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: calc(80vh - 50px);
  display: grid;
  gap: 20px;
}

.report-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08);
}

.report-card h3 {
  margin-bottom: 10px;
}

.report-card p {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  border: none;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}
.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-tertiary {
  background-color: #f63b3b;
  color: white;
}
.btn-tertiary:hover {
  background-color: #cc2323;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  color: #6b7280;
  font-style: italic;
  border: 1px solid #e5e7eb;
}

.loading {
  text-align: center;
  margin-top: 20px;
}

.error {
  text-align: center;
  color: red;
  margin-top: 20px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Modal Content */
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-20px);
  animation: slideDown 0.3s forwards;
}

@keyframes slideDown {
  to {
    transform: translateY(0);
  }
}

.success-message p {
  font-size: 1rem;
  color: #16a34a;
  text-align: center;
  margin-top: 1rem;
}

.error p {
  font-size: 1rem;
  color: red;
  text-align: center;
  margin-top: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.editable-field {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #4299e1;
  box-shadow: 0 0 5px rgba(66,153,225,0.5);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
