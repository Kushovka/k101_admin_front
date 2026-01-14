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

export const getAllFiles = async ({
  page,
  pageSize,
  sortOrder,
  search,
}: {
  page: number;
  pageSize: number;
  sortOrder?: "newest" | "oldest";
  search?: string;
}) => {
  const { data } = await userApi.get("/api/v1/files", {
    params: {
      page,
      page_size: pageSize,
      sort_order: sortOrder,
      ...(search?.trim() && { search: search.trim() }),
    },
    headers: getHeaders(),
  });
  return data;
};

export const postUploadFiles = async (
  files: File[],
  onProgress?: (file: File, progress: number) => void
) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No token");

  for (const file of files) {
    const formData = new FormData();
    formData.append("files", file);

    await userApi.post("/api/v1/files/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (e) => {
        if (!e.total || !onProgress) return;

        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(file, percent);
      },
    });
  }
};
