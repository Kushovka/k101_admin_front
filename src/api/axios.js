import axios from "axios";

/* редирект на SignIn, если токен исчерпан */
const api = axios.create({
  baseURL: "http://192.168.0.45:18001",
});


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default api;
