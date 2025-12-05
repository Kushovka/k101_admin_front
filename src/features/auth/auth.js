import axios from "axios";

const API_URL = "http://192.168.0.45:18100/api/v1/auth";

export const login = async (username, password) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  localStorage.setItem("access_token", res.data.access_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);
  return res.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  await axios.post(`${API_URL}/logout`, { refresh_token: refreshToken });
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
