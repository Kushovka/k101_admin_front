import axios from "axios";

/* редирект на SignIn, если токен исчерпан */
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

export default userApi;
