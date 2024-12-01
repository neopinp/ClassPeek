import axios from "axios";
import { API_PATH } from '@config';
// To avoid having to change our API url in every single file
const api = axios.create({
  // Use the API_PATH from our config
  baseURL: API_PATH,
  withCredentials: true, // Automatically include cookies (this is required for our userSession and authentication locked APIs)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;