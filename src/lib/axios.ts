import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.BACKEND_URL || "http://localhost:8787",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export default apiClient;
