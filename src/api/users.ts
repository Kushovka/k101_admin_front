import adminApi from "./adminApi";
import userApi from "./userApi";

import {
  TelegramUsersResponse,
  UserRequestsResponse,
  type ApiTelegramUser,
  type ApiUser,
  type CreatedUserResponse,
  type UpdateUserPayload,
  type UserRole,
  type UsersResponse,
} from "../types/user";

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

/* ---------------- USERS ---------------- */

export const getUsers = async ({
  page = 1,
  pageSize = 20,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<UsersResponse> => {
  const { data } = await adminApi.get<UsersResponse>(`/admin-api/admin/users`, {
    headers: getHeaders(),
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
    },
  });

  return data;
};

interface CreatedUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  username: string;
}

export const addUsers = async (
  payload: CreatedUserPayload,
): Promise<CreatedUserResponse> => {
  const res = await adminApi.post(`/admin-api/admin/users/create`, payload, {
    headers: getHeaders(),
  });

  return res.data;
};

export const getCurrentUser = async (): Promise<ApiUser> => {
  const { data } = await userApi.get<ApiUser>(`/api/v1/users/profile`, {
    headers: getHeaders(),
  });

  return data;
};

/* ---------------- USER DETAILS ---------------- */

export const getUserById = async (id: string): Promise<ApiUser> => {
  const { data } = await adminApi.get<ApiUser>(`/admin-api/admin/users/${id}`, {
    headers: getHeaders(),
  });

  return data;
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<ApiUser> => {
  const { data } = await adminApi.patch<ApiUser>(
    `/admin-api/admin/users/${id}`,
    payload,
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const isBlockedUser = async (
  id: string,
  isBlocked: boolean,
): Promise<ApiUser> => {
  const { data } = await adminApi.post(
    `/admin-api/admin/users/${id}/toggle-active`,
    { is_blocked: isBlocked },
    {
      headers: getHeaders(),
    },
  );

  return data;
};

export const isDeletedUser = async (id: string): Promise<ApiUser> => {
  const { data } = await adminApi.delete(`/admin-api/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
  });
  return data;
};

/* ---------------- BALANCE ---------------- */

export const postDeposit = async (
  amount: number,
  id: string,
): Promise<void> => {
  const { data } = await adminApi.post(
    `/admin-api/admin/users/${id}/top-up`,
    { amount: amount.toString() },
    {
      headers: getHeaders(),
    },
  );

  return data;
};

/* ---------------- TG USERS ---------------- */

export const getRequests = async (): Promise<ApiTelegramUser[]> => {
  const { data } = await adminApi.get<TelegramUsersResponse>(
    `/admin-api/admin/registration-requests`,
    {
      headers: getHeaders(),
    },
  );

  return data.requests;
};

export const isApproveRequest = async (id: number) => {
  const { data } = await adminApi.post(
    `/admin-api/admin/registration-requests/${id}/approve`,
    {},
    { headers: getHeaders() },
  );
  return data;
};

export const isRejectRequest = async (
  id: number,
  reason?: string,
): Promise<ApiTelegramUser> => {
  const { data } = await adminApi.post(
    `/admin-api/admin/registration-requests/${id}/reject`,
    reason ? { reason } : {},
    { headers: getHeaders() },
  );
  return data;
};

export const getUserRequests = async (
  userId: string,
  page = 1,
  pageSize = 10,
): Promise<UserRequestsResponse> => {
  const { data } = await adminApi.get<UserRequestsResponse>(
    `/api/v1/users/admin/${userId}/requests`,
    {
      headers: getHeaders(),
      params: {
        page,
        page_size: pageSize,
      },
    },
  );

  return data;
};
