import axios from "axios";

export const getBackendURL = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  if (apiBase) return apiBase.replace(/\/api$/, "");
  
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://hungry-heist-server.onrender.com";
};

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://hungry-heist-server.onrender.com/api");

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;