import adminApi from "./adminApi";


const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

/* HEALTH CHECK */
export const healthCheck = async () => {
  const res = await adminApi.get(`/health`, {
    headers: getHeaders(),
  });
  return res.data;
};
