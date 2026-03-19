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

export const exportPersonDossier = async (
  entityId: string,
  format: "pdf" | "txt" | "docx",
) => {
  const res = await userApi.get(`/api/v1/person/${entityId}/export`, {
    params: { format },
    headers: getHeaders(),
    responseType: "blob",
  });

  return res.data as Blob;
};

export const getFileStatuses = async () => {
  const { data } = await userApi.get("/api/v1/files/statuses", {
    headers: getHeaders(),
  });

  return data;
};
