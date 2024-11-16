import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "https://classpeek.ecrl.marist.edu/api" : "/api",
  withCredentials: true, // Automatically include cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;