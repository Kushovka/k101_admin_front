import { ApiUser, UpdateUserPayload } from "../types/user";
import userApi from "./userApi";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;

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

// /* ---------------- link for telegram ---------------- */
// export const linkForTelegram = async () => {
//   const { data } = await userApi.post(
//     "/api/v1/users/link-telegram",
//     {},
//     {
//       headers: getHeaders(),
//     },
//   );
//   return data;
// };
