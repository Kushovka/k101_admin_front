import { ApiPriority, FilePosition, FilePriority } from "../types/file";
import userApi from "./userApi";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
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

export const getAllGroup = async () => {
  const { data } = await userApi.get(`/api/v1/files/groups`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
};

export const postUploadFiles = async (
  files: File[],
  onProgress?: (file: File, progress: number) => void,
) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No token");

  const CHUNK_THRESHOLD = 100 * 1024 * 1024;

  const regularFiles: File[] = [];
  const chunkedFiles: File[] = [];

  for (const file of files) {
    if (file.size > CHUNK_THRESHOLD) {
      chunkedFiles.push(file);
    } else {
      regularFiles.push(file);
    }
  }

  let results: any[] = [];

  // обычная загрузка
  if (regularFiles.length) {
    const res = await uploadRegular(regularFiles, onProgress);
    results.push(...(res?.results ?? []));
  }

  // чанковая загрузка
  for (const file of chunkedFiles) {
    const res = await uploadChunked(file, token, onProgress);
    if (res) results.push(res);
  }

  return {
    results,
  };
};

async function uploadRegular(
  files: File[],
  onProgress?: (file: File, p: number) => void,
) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await userApi.post("/api/v1/files/upload", formData, {
    onUploadProgress: (e) => {
      if (!e.total || !onProgress) return;

      const percent = Math.round((e.loaded / e.total) * 100);
      files.forEach((file) => onProgress(file, percent));
    },
  });

  return data;
}

async function uploadChunked(
  file: File,
  token: string,
  onProgress?: (file: File, p: number) => void,
) {
  const initRes = await userApi.post("/api/v1/upload/chunked/init", {
    filename: file.name,
    file_size: file.size,
  });

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
          ((uploadedChunks + chunkPercent / 100) / total_chunks) * 100,
        );
        onProgress(file, totalPercent);
      },
    });

    uploadedChunks++;
  }

  const { data } = await userApi.post(
    `/api/v1/upload/chunked/${upload_id}/complete`,
  );

  return data; // ← ВАЖНО
}

export const patchPriorityFile = async (
  id: string,
  payload: FilePriority,
): Promise<ApiPriority> => {
  const { data } = await userApi.patch(
    `/api/v1/parsing-queue/${id}/priority`,
    payload,
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const patchPositionFile = async (
  id: string,
  payload: FilePosition,
): Promise<ApiPriority> => {
  const { data } = await userApi.patch(
    `/api/v1/parsing-queue/${id}/position`,
    payload,
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const postToTopFile = async (id: string): Promise<ApiPriority> => {
  const { data } = await userApi.post(
    `/api/v1/parsing-queue/${id}/move-to-top`,
    {},
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const getParsingQueue = async () => {
  const { data } = await userApi.get("/api/v1/parsing-queue?limit=100", {
    headers: getHeaders(),
  });
  return data;
};

export const getParsingCurrent = async () => {
  const { data } = await userApi.get("/api/v1/parsing-queue/current", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
};

export const postRestartFile = async (id: string) => {
  const { data } = await userApi.post(`/api/v1/files/${id}/restart`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
};

export const patchFileGroup = async (id: string, file_group: string) => {
  const { data } = await userApi.patch(
    `/api/v1/files/${id}/group`,
    { file_group },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    },
  );

  return data;
};

export const getFilesByGroup = async ({
  group,
  page,
  pageSize,
  sort,
}: {
  group: string;
  page: number;
  pageSize: number;
  sort: "newest" | "oldest";
}) => {
  const { data } = await userApi.get("/api/v1/file-groups", {
    params: { group, page, pageSize, sort },
  });
  return data;
};
