import { reactive } from "vue";
import api from "../api";

// Accessible data across the entire frontend
const sessionStore = reactive({
  isAuthenticated: false,
  user: {
    id: null,
    name: "Guest",
    image_data: "",
    user_type: "STUDENT",
    blurb: null,
    description: null,
    email: null,
  },

  // Functions to handle userdata once a session is created, and for logging out too
  async fetchSession() {
    try {
      const response = await api.get("/users/me");
      this.isAuthenticated = true;
      this.user = response.data;
    } catch (error) {
      console.error("Failed to fetch session:", error);
      this.isAuthenticated = false;
      this.user = {
        id: null,
        name: "Guest",
        image_data: "",
        user_type: "STUDENT",
        blurb: null,
        description: null,
        email: null,
      };
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
      this.isAuthenticated = false;
      this.user = {
        id: null,
        name: "Guest",
        image_data: "",
        user_type: "STUDENT",
        blurb: null,
        description: null,
        email: null,
      };
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
});

export default sessionStore;