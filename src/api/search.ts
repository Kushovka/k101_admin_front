import { CreateComplaintPayload } from "../types/search";
import userApi from "./userApi";

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

export const exportPersonDossier = async (
  entityId: string,
  format: "pdf" | "txt",
) => {
  const res = await userApi.get(`/api/v1/person/${entityId}/export`, {
    params: { format },
    headers: getHeaders(),
    responseType: "blob",
  });

  return res.data as Blob;
};
