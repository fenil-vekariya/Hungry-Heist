import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://hungry-heist.onrender.com/api";

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