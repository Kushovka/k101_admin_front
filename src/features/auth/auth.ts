import axios, { AxiosResponse } from "axios";

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

  console.log(res.data.access_token);
  console.log(res.data.refresh_token);
  console.log(res.data);
  console.log(res);

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

    return true;
  } catch (e) {
    return false;
  }
}
