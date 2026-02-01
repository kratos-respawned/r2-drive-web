import axios from "axios";

const is_dev = import.meta.env.DEV === true;
export const API_BASE_URL =
  is_dev ? "http://localhost:8787" : (globalThis as any).BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  adapter: "xhr",
});

export default apiClient;
