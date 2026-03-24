import userApi from "./userApi";

export type Appeal = {
  id: number;
  message: string;
  status: "pending" | "answered" | "closed";
  created_at: string;
  answer?: string;
};

export const getAppeals = async (): Promise<Appeal[]> => {
  const res = await userApi.get("/api/v1/appeals");
  return res.data;
};

export const updateAppeal = async (
  id: number,
  data: { status?: string; answer?: string },
) => {
  const res = await userApi.patch(`/api/v1/appeals/${id}`, data);
  return res.data;
};
