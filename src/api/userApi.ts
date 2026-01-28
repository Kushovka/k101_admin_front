import axios from "axios";
import { refreshTokens } from "../features/auth/auth";

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
});

// подставляем access
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// защита от гонок
let refreshing: Promise<boolean> | null = null;

userApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;

    // не 401 — просто пробрасываем
    if (status !== 401) {
      return Promise.reject(error);
    }

    // запускаем refresh если ещё не идёт
    if (!refreshing) {
      refreshing = refreshTokens(); // вызывает /auth/refresh
    }

    const ok = await refreshing;
    refreshing = null;

    if (!ok) {
      // refresh умер → сессия реально закончилась
      window.dispatchEvent(new CustomEvent("session-expired"));
      return Promise.reject(error);
    }

    // если refresh успешный — повторяем запрос
    const config = error.config;
    return userApi(config);
  },
);

export default userApi;
