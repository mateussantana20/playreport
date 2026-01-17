import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Porta do seu Spring Boot
});

// Interceptor para adicionar o Token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
