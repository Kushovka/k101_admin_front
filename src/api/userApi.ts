import axios from "axios";
import { refreshTokens } from "../features/auth/auth";

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<boolean> | null = null;

userApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;

    // нам интересует только access 401
    if (status !== 401) {
      return Promise.reject(error);
    }

    // проверка чтобы не уйти в retry-loop
    if (original.__isRetry) {
      window.dispatchEvent(new CustomEvent("session-expired"));
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


    // повторяем запрос 1 раз
    original.__isRetry = true;
    return userApi(original);
  },
);

export default userApi;
