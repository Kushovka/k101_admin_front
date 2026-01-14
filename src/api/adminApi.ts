import axios from "axios";

/* редирект на SignIn, если токен исчерпан */
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }
    return Promise.reject(error);
  }
);

export default adminApi;
