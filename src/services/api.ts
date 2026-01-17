import axios from "axios";

const api = axios.create({
  // Se existir a variável VITE_API_URL (na Vercel), usa ela.
  // Se não, usa localhost (no seu PC).
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Adiciona o Token automaticamente (Interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
