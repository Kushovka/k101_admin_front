import { ApiPriority, FilePosition, FilePriority } from "../types/file";
import userApi from "./userApi";

type UploadResultItem = {
  created: boolean;
  is_duplicate: boolean;
  file_name: string;
  message?: string;
};

type UploadResult = {
  results: UploadResultItem[];
};

type UploadProgressFn = (file: File, percent: number) => void;

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

const CHUNK_THRESHOLD = 100 * 1024 * 1024; // 2GB

export const postUploadFiles = async (
  files: File[],
  onProgress?: UploadProgressFn,
): Promise<UploadResult> => {
  const results: UploadResultItem[] = [];

  for (const file of files) {
    if (file.size >= CHUNK_THRESHOLD) {
      const res = await uploadChunked(file, onProgress);

      results.push({
        created:
          res.created === true ||
          (res.success === true && res.status !== "duplicate"),

        is_duplicate: res.is_duplicate === true || res.status === "duplicate",

        file_name: res.file_name ?? file.name,
        message: res.message,
      });
    } else {
      const res = await uploadRegular([file], onProgress);

      for (const r of res.results ?? []) {
        results.push({
          created: true,
          is_duplicate: r.is_duplicate === true,
          file_name: r.file_name,
          message: r.message,
        });
      }
    }
  }

  return { results };
};

async function waitForCompletion(upload_id: string) {
  for (let i = 0; i < 60; i++) {
    const { data } = await userApi.get(`/api/v1/upload/chunked/${upload_id}`, {
      timeout: 30000,
    });

    if (data.status === "completed") {
      return data;
    }

    if (data.status === "failed") {
      throw new Error(data.error_message ?? "Upload failed");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Upload completion timeout");
}

async function uploadRegular(
  files: File[],
  onProgress?: UploadProgressFn,
): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await userApi.post("/api/v1/files/upload", formData, {
    timeout: 300000,
    onUploadProgress: (e) => {
      if (!e.total || !onProgress) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      files.forEach((f) => onProgress(f, percent));
    },
  });

  return data;
}

async function uploadChunked(
  file: File,
  onProgress?: UploadProgressFn,
): Promise<any> {
  const init = await userApi.post("/api/v1/upload/chunked/init", {
    filename: file.name,
    file_size: file.size,
  });

  const { upload_id, chunk_size, total_chunks } = init.data;

  for (let part = 1; part <= total_chunks; part++) {
    const start = (part - 1) * chunk_size;
    const end = Math.min(start + chunk_size, file.size);

    const form = new FormData();
    form.append("part_number", String(part));
    form.append("chunk", file.slice(start, end));

    await userApi.post(`/api/v1/upload/chunked/${upload_id}/chunk`, form, {
      timeout: 300000,
    });

    const percent = Math.round((part / total_chunks) * 90);
    onProgress?.(file, percent);
  }

  onProgress?.(file, 95);

  // финализация на бэке
  await userApi.post(
    `/api/v1/upload/chunked/${upload_id}/complete`,
    {},
    { timeout: 300000 },
  );
  console.log("🔥 BEFORE COMPLETE", upload_id);

  const final = await waitForCompletion(upload_id);

  // ⬅️ БЭК ПОДТВЕРДИЛ
  onProgress?.(file, 100);
  console.log("✅ AFTER COMPLETE", upload_id);

  return final;
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
