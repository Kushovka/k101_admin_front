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
  const CHUNK_THRESHOLD = 100 * 1024 * 1024;

  for (const file of files) {
    if (file.size > CHUNK_THRESHOLD) {
      await uploadChunked(file, token, onProgress);
    } else {
      await uploadRegular(file, token, onProgress);
    }
  }
};

async function uploadRegular(
  file: File,
  token: string,
  onProgress?: (file: File, p: number) => void
) {
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

async function uploadChunked(
  file: File,
  token: string,
  onProgress?: (file: File, p: number) => void
) {
  const initRes = await userApi.post("/api/v1/upload/chunked/init", {
    filename: file.name,
    file_size: file.size,
  });
  console.log(initRes.data);
  const { upload_id, chunk_size, total_chunks } = initRes.data;

  let uploadedChunks = 0;

  for (let part = 1; part <= total_chunks; part++) {
    const start = (part - 1) * chunk_size;
    const end = part * chunk_size;
    const chunk = file.slice(start, end);

    const form = new FormData();
    form.append("part_number", part.toString());
    form.append("chunk", chunk);

    await userApi.post(`/api/v1/upload/chunked/${upload_id}/chunk`, form, {
      onUploadProgress: (e) => {
        if (!e.total || !onProgress) return;

        const chunkPercent = Math.round((e.loaded / e.total) * 100);
        const totalPercent = Math.round(
          ((uploadedChunks + chunkPercent / 100) / total_chunks) * 100
        );
        onProgress(file, totalPercent);
      },
    });

    uploadedChunks++;
  }

  await userApi.post(`/api/v1/upload/chunked/${upload_id}/complete`);
}
