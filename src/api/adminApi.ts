import axios from "axios";
import { refreshTokens } from "../features/auth/auth";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
});

// добавляем access в заголовок
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// общий флаг для гонок
let refreshing: Promise<boolean> | null = null;

adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (!refreshing) {
      refreshing = refreshTokens();
    }

    const ok = await refreshing;
    refreshing = null;

    if (!ok) {
      window.dispatchEvent(new CustomEvent("session-expired"));
      return Promise.reject(error);
    }

    const config = error.config;
    return adminApi(config);
  },
);

export default adminApi;
