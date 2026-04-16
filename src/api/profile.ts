import { ApiUser, TelegramLinkResponse, UpdateUserPayload } from "../types/user";
import userApi from "./userApi";

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

/* ---------------- update profile ---------------- */
export const updateProfile = async (
  payload: UpdateUserPayload,
): Promise<ApiUser> => {
  const { data } = await userApi.put<ApiUser>(
    `/api/v1/users/profile`,
    payload,
    {
      headers: getHeaders(),
    },
  );

  return data;
};

/* ---------------- link telegram ---------------- */
export const linkTelegramAccount = async (): Promise<TelegramLinkResponse> => {
  const { data } = await userApi.post<TelegramLinkResponse>(
    "/api/v1/users/link-telegram",
    {},
    {
      headers: getHeaders(),
    },
  );

  return data;
};
