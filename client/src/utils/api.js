import axios from "axios";

// Deployed URIs on Render
export const RENDER_BACKEND_URL = "https://real-time-video-conference-app.onrender.com";
export const RENDER_FRONTEND_URL = "https://real-time-video-conference-app-1.onrender.com";

function resolveApiBase() {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();

  // If VITE_API_URL is provided, normalize it
  if (envUrl) {
    const normalized = envUrl.replace(/\/$/, "");
    
    // If mistakenly set to the frontend URL, auto-correct to backend URL
    if (normalized === RENDER_FRONTEND_URL || normalized.includes("real-time-video-conference-app-1.onrender.com")) {
      return RENDER_BACKEND_URL;
    }
    
    // If mistakenly set to browser origin in production (which is the client), correct to backend URL
    if (!import.meta.env.DEV && typeof window !== "undefined" && normalized === window.location.origin) {
      return RENDER_BACKEND_URL;
    }

    return normalized;
  }

  // Fallback defaults: localhost:5000 in dev, Render backend in production
  return import.meta.env.DEV ? "http://localhost:5000" : RENDER_BACKEND_URL;
}

const API_BASE = resolveApiBase();

export const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("convene_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const SOCKET_URL = API_BASE;
export const FILE_DOWNLOAD_URL = (storedName) => `${API_BASE}/api/files/download/${storedName}`;