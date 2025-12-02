import axios from "axios";

const API_URL = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export const getUserById = async (id) => {
  const res = await axios.get(`${API_URL}/admin/users/${id}`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axios.patch(`${API_URL}/admin/users/${id}`, data, {
    headers: getHeaders(),
  });
  return res.data;
};
