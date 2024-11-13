import axios from "axios";

const api = axios.create({
  baseURL: "http://10.11.29.118:3000/api",
  withCredentials: true, // Automatically include cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;