import axios, { AxiosResponse } from "axios";
import adminApi from "../../api/adminApi";
import userApi from "../../api/userApi";

const API_URL = import.meta.env.VITE_USER_API_URL;

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface LogoutRequest {
  refresh_token: string;
}

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const res: AxiosResponse<LoginResponse> = await axios.post(
    `${API_URL}/api/v1/auth/login`,
    { username, password } as LoginRequest,
  );

  const { access_token, refresh_token } = res.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  userApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  adminApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

  return res.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) return;

  await axios.post<void, AxiosResponse<void>, LogoutRequest>(
    `${API_URL}/api/v1/auth/logout`,
    { refresh_token: refreshToken },
  );
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export async function refreshTokens() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
      refresh_token: refresh,
    });

    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);

    axios.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.access_token}`;

    userApi.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.access_token}`;

    adminApi.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.access_token}`;

    return true;
  } catch (e: any) {
    const status = e.response?.status;

    // backend возвращает 422 если refresh просрочен → считаем это expired
    if (status === 422) return false;

    // все остальные ошибки → считаем истёкшей сессией
    return false;
  }
}
