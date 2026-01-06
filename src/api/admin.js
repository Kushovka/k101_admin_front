import api from "./adminApi";

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;
const USER_API_URL = import.meta.env.VITE_USER_API_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// /* USERS */
// export const getUsers = async () => {
//   const res = await api.get(`${ADMIN_API_URL}/admin/users`, {
//     headers: getHeaders(),
//   });
//   console.log(res.data);
//   return res.data;
// };

// export const addUsers = async (
//   email,
//   first_name,
//   last_name,
//   role,
//   username
// ) => {
//   const res = await api.post(
//     `${ADMIN_API_URL}/admin/users/create`,
//     { email, first_name, last_name, role, username },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// export const getCurrentUser = async () => {
//   const token = localStorage.getItem("access_token");
//   if (!token) throw new Error("Нет токена");

//   const res = await api.get(`${USER_API_URL}/api/v1/users/profile`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   console.log(res.data);
//   return res.data;
// };

// // update profile
// export const updateProfile = async ({ email, first_name, last_name }) => {
//   const token = localStorage.getItem("access_token");
//   if (!token) throw new Error("Нет токена");

//   const res = await api.put(
//     `${USER_API_URL}/api/v1/users/profile`,
//     { email, first_name, last_name },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// /* USER DETAILS */
// export const getUserById = async (id) => {
//   const res = await api.get(`${ADMIN_API_URL}/admin/users/${id}`, {
//     headers: getHeaders(),
//   });
//   console.log(res.data);
//   return res.data;
// };

// export const updateUser = async (id, data) => {
//   const res = await api.patch(`${ADMIN_API_URL}/admin/users/${id}`, data, {
//     headers: getHeaders(),
//   });
//   return res.data;
// };

// export const isBlockedUser = async (id, block) => {
//   const res = await api.post(
//     `${ADMIN_API_URL}/admin/users/${id}/toggle-active`,
//     { is_blocked: block },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// /* HEALTH CHECK */
// export const healthCheck = async () => {
//   const res = await api.get(`${ADMIN_API_URL}/health`, {
//     headers: getHeaders(),
//   });
//   return res.data;
// };

// /* SYSTEM STATISTICS */
// export const systemStatistics = async () => {
//   const res = await api.get(`${ADMIN_API_URL}/api/stats`, {
//     headers: getHeaders(),
//   });
//   console.log(res.data);
//   return res.data;
// };

// // PLANS
// export const allPlans = async () => {
//   const res = await api.get(`${USER_API_URL}/api/v1/plans`, {
//     headers: getHeaders(),
//   });
//   console.log(res.data);
//   return res.data;
// };

// export const allArchivedPlans = async () => {
//   const res = await api.get(`${USER_API_URL}/api/v1/plans/archived`, {
//     headers: getHeaders(),
//   });
//   console.log(res.data);
//   return res.data;
// };

// export const createPlans = async (plan_name, price, month) => {
//   const res = await api.post(
//     `${USER_API_URL}/api/v1/plans`,
//     { plan_name, price, month },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// export const updatePlans = async (id, plan_name, price, month) => {
//   const res = await api.put(
//     `${USER_API_URL}/api/v1/plans/${id}`,
//     { plan_name, price, month },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// export const archivedPlans = async (id) => {
//   const res = await api.patch(
//     `${USER_API_URL}/api/v1/plans/${id}`,
//     { archived: true },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// export const unarchivedPlans = async (id) => {
//   const res = await api.patch(
//     `${USER_API_URL}/api/v1/plans/${id}`,
//     { archived: false },
//     {
//       headers: getHeaders(),
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

// // BALANCE
// export const postDeposit = async (amount) => {
//   const token = localStorage.getItem("access_token");
//   if (!token) throw new Error("Нет токена");

//   const res = await api.post(
//     `${USER_API_URL}/api/v1/users/balance/deposit`,
//     { amount: amount.toString() },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   console.log(res.data);
//   return res.data;
// };

/* SEARCH */
// export const searchUsers = async () => {
//   const res = await api.get(`${API_URL}/api/stats`, {
//     headers: getHeaders(),
//   });
//   return res.data;
// };
