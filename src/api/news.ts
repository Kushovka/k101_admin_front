import { NewsListResponse } from "../types/news";
import userApi from "./userApi";

export const getNews = async (params?: {
  category?: string;
  status?: string;
}): Promise<NewsListResponse> => {
  const { data } = await userApi.get("/api/v1/news", {
    params: {
      include_drafts: true,
      ...params,
    },
  });

  return data;
};

export const createNews = async (payload: any) => {
  const { data } = await userApi.post("/api/v1/news", payload);
  return data;
};

export const updateNews = async (id: number, payload: any) => {
  const { data } = await userApi.patch(`/api/v1/news/${id}`, payload);
  return data;
};

export const deleteNews = async (id: number) => {
  await userApi.delete(`/api/v1/news/${id}`);
};

export const togglePinNews = async (id: number, pinned: boolean) => {
  const { data } = await userApi.post(`/api/v1/news/${id}/pin`, { pinned });

  return data;
};
