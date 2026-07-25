import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("convene_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const SOCKET_URL = API_BASE;
export const FILE_DOWNLOAD_URL = (storedName) => `${API_BASE}/api/files/download/${storedName}`;
