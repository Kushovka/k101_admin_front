import adminApi from "./adminApi";
import userApi from "./userApi";

import {
  TelegramUsersResponse,
  type ApiTelegramUser,
  type ApiUser,
  type CreatedUserResponse,
  type UpdateUserPayload,
  type UserRole,
  type UsersResponse,
} from "../types/user";

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

/* ---------------- USERS ---------------- */

export const getUsers = async (): Promise<ApiUser[]> => {
  const { data } = await adminApi.get<UsersResponse>(`/admin/users`, {
    headers: getHeaders(),
  });
  console.log(data);
  return data.users;
};

interface CreatedUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  username: string;
}

export const addUsers = async (
  payload: CreatedUserPayload
): Promise<CreatedUserResponse> => {
  const res = await adminApi.post(`/admin/users/create`, payload, {
    headers: getHeaders(),
  });
  console.log(res.data);
  return res.data;
};

export const getCurrentUser = async (): Promise<ApiUser> => {
  const { data } = await userApi.get<ApiUser>(`/api/v1/users/profile`, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

/* ---------------- USER DETAILS ---------------- */

export const getUserById = async (id: string): Promise<ApiUser> => {
  const { data } = await adminApi.get<ApiUser>(`/admin/users/${id}`, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload
): Promise<ApiUser> => {
  const { data } = await adminApi.patch<ApiUser>(
    `/admin/users/${id}`,
    payload,
    {
      headers: getHeaders(),
    }
  );
  return data;
};

export const isBlockedUser = async (
  id: string,
  isBlocked: boolean
): Promise<ApiUser> => {
  const { data } = await adminApi.post(
    `/admin/users/${id}/toggle-active`,
    { is_blocked: isBlocked },
    {
      headers: getHeaders(),
    }
  );
  console.log(data);
  return data;
};

/* ---------------- BALANCE ---------------- */

export const postDeposit = async (amount: number): Promise<void> => {
  const { data } = await userApi.post(
    `/api/v1/users/balance/deposit`,
    { amount: amount.toString() },
    {
      headers: getHeaders(),
    }
  );
  console.log(data);
  return data;
};

/* ---------------- TG USERS ---------------- */

export const getRequests = async (): Promise<ApiTelegramUser[]> => {
  const { data } = await userApi.get<TelegramUsersResponse>(
    `api/v1/users/admin/registration-requests`,
    {
      headers: getHeaders(),
    }
  );
  console.log(data);
  return data.requests;
};

export const isApproveRequest = async (id: number) => {
  const { data } = await userApi.post(
    `api/v1/users/admin/registration-requests/${id}/approve`,
    {},
    { headers: getHeaders() }
  );
  return data;
};
export const isRejectRequest = async (
  id: number,
  reason?: string
): Promise<ApiTelegramUser> => {
  const { data } = await userApi.post(
    `api/v1/users/admin/registration-requests/${id}/reject`,
    reason ? { reason } : {},
    { headers: getHeaders() }
  );
  return data;
};
