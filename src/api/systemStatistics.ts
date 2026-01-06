import adminApi from "./adminApi";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

export const systemStatistics = async () => {
  const res = await adminApi.get(`/api/stats`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};
