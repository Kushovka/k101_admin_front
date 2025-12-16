import api from "./axios";

const API_URL = "http://192.168.0.45:18101";
const API_URL_users = "http://192.168.0.45:18100";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

/* USERS */
export const getUsers = async () => {
  const res = await api.get(`${API_URL}/admin/users`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const addUsers = async (
  email,
  first_name,
  last_name,
  role,
  username
) => {
  const res = await api.post(
    `${API_URL}/admin/users/create`,
    { email, first_name, last_name, role, username },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

/* USER DETAILS */
export const getUserById = async (id) => {
  const res = await api.get(`${API_URL}/admin/users/${id}`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.patch(`${API_URL}/admin/users/${id}`, data, {
    headers: getHeaders(),
  });
  return res.data;
};

export const isBlockedUser = async (id, block) => {
  const res = await api.post(
    `${API_URL}/admin/users/${id}/toggle-active`,
    { is_blocked: block },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

/* HEALTH CHECK */
export const healthCheck = async () => {
  const res = await api.get(`${API_URL}/health`, {
    headers: getHeaders(),
  });
  return res.data;
};

/* SYSTEM STATISTICS */
export const systemStatistics = async () => {
  const res = await api.get(`${API_URL}/api/stats`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

// PLANS
export const allPlans = async () => {
  const res = await api.get(`${API_URL_users}/api/v1/plans`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const allArchivedPlans = async () => {
  const res = await api.get(`${API_URL_users}/api/v1/plans/archived`, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const createPlans = async (plan_name, price, month) => {
  const res = await api.post(
    `${API_URL_users}/api/v1/plans`,
    { plan_name, price, month },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

export const updatePlans = async (id, plan_name, price, month) => {
  const res = await api.put(
    `${API_URL_users}/api/v1/plans/${id}`,
    { plan_name, price, month },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

export const archivedPlans = async (id) => {
  const res = await api.patch(
    `${API_URL_users}/api/v1/plans/${id}`,
    { archived: true },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

export const unarchivedPlans = async (id) => {
  const res = await api.patch(
    `${API_URL_users}/api/v1/plans/${id}`,
    { archived: false },
    {
      headers: getHeaders(),
    }
  );
  console.log(res.data);
  return res.data;
};

// BALANCE
// balance
export const postDeposit = async (amount) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Нет токена");

  const res = await api.post(
    `${API_URL_users}/api/v1/users/balance/deposit`,
    { amount: amount.toString() },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(res.data);
  return res.data;
};

/* SEARCH */
// export const searchUsers = async () => {
//   const res = await api.get(`${API_URL}/api/stats`, {
//     headers: getHeaders(),
//   });
//   return res.data;
// };
