import axios, { AxiosResponse } from "axios";

// const API_URL = "http://192.168.0.45:18003/api/v1/auth";
const API_URL = "http://192.168.0.45:18100/api/v1/auth";
// const API_URL = "http://localhost:18003/api/v1/auth";

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
  password: string
): Promise<LoginResponse> => {
  const res: AxiosResponse<LoginResponse> = await axios.post(
    `${API_URL}/login`,
    { username, password } as LoginRequest
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
    `${API_URL}/logout`,
    { refresh_token: refreshToken }
  );
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
