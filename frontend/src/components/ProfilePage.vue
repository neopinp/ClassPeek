<template>
  <div class="info-page">
    <main>
      <section class="sidebar">
        <div class="profile-card">
          <div class="image-container">
            <div class="image-placeholder">
              <span v-if="!isEditing && editableProfile.image_data == ''">No Image Available</span>
              <img
                v-if="!isEditing && editableProfile.image_data != ''"
                :src="editableProfile.image_data"
                id="image"
                style="width:200px;height:200px;object-fit:contain"
              />
              <input v-if="isEditing" id="input" type="file" @change="uploadImg">
            </div>
          </div>
          <h4 class="title">{{ user.name }}</h4>
        </div>
        <div class="info-card">
          <h4>Additional Information</h4>
          <p><strong>Email:</strong> {{ user.email }}</p>
        </div>
      </section>

      <article class="main-content">
        <h2>Profile Details</h2>
        <div class="content-body">
          <!-- Blurb -->
          <div class="editable-field">
            <label><strong>Blurb:</strong></label>
            <div v-if="!isEditing" class="text-display">
              <p>{{ editableProfile.blurb || 'No blurb provided.' }}</p>
            </div>
            <textarea
              v-else
              v-model="editableProfile.blurb"
              class="input-field"
            ></textarea>
          </div>
          <!-- Description -->
          <div class="editable-field">
            <label><strong>Description:</strong></label>
            <div v-if="!isEditing" class="text-display">
              <p>{{ editableProfile.description || 'No description provided.' }}</p>
            </div>
            <textarea
              v-else
              v-model="editableProfile.description"
              class="input-field"
            ></textarea>
          </div>
          <div v-if="isEditing" class="edit-actions">
            <button class="btn btn-primary" @click="saveChanges">Save</button>
            <button class="btn btn-secondary" @click="cancelChanges">Cancel</button>
          </div>
          <div v-else>
            <button class="btn btn-primary" @click="startEditing">Edit Profile</button>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import sessionStore from "@/store/session";
  import api from "@/api";

  export default defineComponent({
    name: "ProfilePage",
    data() {
      return {
        isEditing: false,
        new_image: "",
        editableProfile: {
          image_data: sessionStore.user.image_data || "",
          blurb: sessionStore.user.blurb || "",
          description: sessionStore.user.description || "",
        },
        errorMessage: null as string | null,
      };
    },
    computed: {
      user() {
        (sessionStore.user) ? document.title = sessionStore.user.name : {};
        return sessionStore.user;
      },
    },
    methods: {
      uploadImg() {
        let fileList = ((document.getElementById("input") as unknown)as HTMLInputElement).files;
        let file;
        (fileList) ? file = fileList[0] : {}; 
        const reader = new FileReader();
        (file) ? reader.readAsDataURL(file) : {};
        reader.onload = () => {
          console.log("Data \n" + reader.result);
          this.new_image = (reader.result) as string || ""
        }
        
      },
      loadImg() {
        let img = document.getElementById("image");
        (img) ? img.setAttribute("src",sessionStore.user.image_data) : {};
      },
      startEditing() {
        this.isEditing = true;
        this.editableProfile = {
          image_data: this.user.image_data || "",
          blurb: this.user.blurb || "",
          description: this.user.description || "",
        };
      },
      async saveChanges() {
        try {
          (this.new_image != "") ? this.editableProfile.image_data = this.new_image : {};
          const response = await api.put("/users/profile", this.editableProfile);
          console.log("Save: " + response.data.image_data);
          sessionStore.user.image_data = response.data.image_data;
          sessionStore.user.blurb = response.data.blurb;
          sessionStore.user.description = response.data.description;
          this.isEditing = false;
          this.new_image = "";
          this.loadImg();
          this.errorMessage = null;
        } catch (error) {
          console.error("Failed to save changes:", error);
          this.errorMessage = "Failed to update profile. Please try again.";
        }
      },
      cancelChanges() {
        this.isEditing = false;
        this.new_image = "";
        this.editableProfile = {
          image_data: this.user.image_data || "",
          blurb: this.user.blurb || "",
          description: this.user.description || "",
        };
      },
    },
    mounted() {
      // When the component mounts, we know the session should be fetched already due to the router guard.
      // Still, add watchers to handle any updates that might happen after initial load.

      // Watch for changes to user.image_data and load the image if it changes
      this.$watch(
        () => sessionStore.user.image_data,
        (newVal) => {
          if (newVal) {
            this.loadImg();
          }
        },
        { immediate: true } // Call immediately in case image_data is already present
      );

      // Watch for changes to user name to update the document title dynamically
      this.$watch(
        () => sessionStore.user.name,
        (newVal) => {
          if (newVal) {
            document.title = newVal;
          }
        },
        { immediate: true } // If user.name is set at mount, update title immediately
      );
    },
  });
</script>

<style scoped>
  /* Merged styles from ProfilePage and InfoPage */
  .info-page {
    margin: 50px 0 0 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }

  .info-page main {
    display: flex;
    gap: 20px;
    padding: 20px;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  .image-container {
    width: 100%;
    height: 200px;
    margin-bottom: 15px;
    border-radius: 8px;
    overflow: hidden;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    color: #666;
  }

  .main-content {
    flex: 3;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .main-content h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
  }

  .editable-field {
    margin-bottom: 20px;
  }

  .text-display {
    background: #f8f9fa;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #333;
  }

  .input-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .edit-actions {
    display: flex;
    gap: 10px;
  }

  .btn {
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .btn-secondary {
    background-color: #6b7280;
    color: white;
    border: none;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }
</style>
