import axios from "axios";

const RENDER_BACKEND_URL = "https://real-time-video-conference-app.onrender.com";
const RENDER_FRONTEND_URL = "https://real-time-video-conference-app-1.onrender.com";

function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_URL || "").trim();
  if (!configured) return RENDER_BACKEND_URL;
  if (configured.includes(RENDER_FRONTEND_URL)) return RENDER_BACKEND_URL;
  return configured.replace(/\/$/, "");
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