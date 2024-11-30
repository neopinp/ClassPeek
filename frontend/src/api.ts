import axios from "axios";

// To avoid having to change our API url in every single file
const api = axios.create({
  // Sets the URL to either your server's /api address or your localhost depending on if its run locally or built on the server
  // Vue handles this automatically with process.env.NODE_ENV
  baseURL: process.env.NODE_ENV === "production" ? "https://classpeek.ecrl.marist.edu/api" : "/api",
  withCredentials: true, // Automatically include cookies (this is required for our userSession)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;