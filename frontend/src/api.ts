import axios from "axios";

const api = axios.create({
  baseURL: "http://classpeek.ecrl.marist.edu/api",
  withCredentials: true, // Automatically include cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;