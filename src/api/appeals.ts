import { AppealsResponse } from "../types/appeals";
import userApi from "./userApi";

export const getAppeals = async (params?: {
  status?: string;
  category?: string;
  page?: number;
  page_size?: number;
}) => {
  const res = await userApi.get<AppealsResponse>("/api/v1/appeals", {
    params,
  });
  return res.data;
};

export const updateAppeal = async (
  id: number,
  data: { admin_reply?: string; status?: string },
) => {
  const res = await userApi.patch(`/api/v1/appeals/${id}`, data);
  return res.data;
};
