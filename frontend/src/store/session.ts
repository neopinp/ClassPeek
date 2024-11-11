import { reactive } from "vue";
import api from "../api";

const sessionStore = reactive({
  isAuthenticated: false,
  user: {
    id: null,
    name: "Guest",
    user_type: "STUDENT",
    blurb: null,
    email: null,
  },

  async fetchSession() {
    try {
      const response = await api.get("/users/me");
      this.isAuthenticated = true;
      this.user = response.data; // Ensure `user_type` is part of the data
    } catch (error) {
      console.error("Failed to fetch session:", error);
      this.isAuthenticated = false;
      this.user = {
        id: null,
        name: "Guest",
        user_type: "STUDENT",
        blurb: null,
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
        user_type: "STUDENT",
        blurb: null,
        email: null,
      };
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
});

export default sessionStore;