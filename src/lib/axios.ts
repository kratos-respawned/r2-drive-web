import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://localhost:8787",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setBaseUrl(baseUrl: string) {
  apiClient.defaults.baseURL = baseUrl.replace(/\/$/, "");
}

export default apiClient;
