import {
  ApiPriority,
  DatasetUploadPayload,
  FilePosition,
  FilePriority,
} from "../types/file";
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

const token = localStorage.getItem("access_token");

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
  onProgress?: UploadProgressFn,
): Promise<UploadResult> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await userApi.post("/api/v1/files/upload", formData, {
    timeout: 0,
    onUploadProgress: (e) => {
      if (!e.total || !onProgress) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      files.forEach((file) => onProgress(file, percent));
    },
  });

  return data;
};

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
  const { data } = await userApi.get("/api/v1/parsing-queue?limit=1000", {
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

export const pauseAllFiles = async () => {
  const { data } = await userApi.post(
    "/api/v1/parsing-queue/pause-all",
    {},
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const resumeAllFiles = async () => {
  const { data } = await userApi.post(
    "/api/v1/parsing-queue/resume-all",
    {},
    {
      headers: getHeaders(),
    },
  );
  return data;
};

export const statusAllFiles = async () => {
  const { data } = await userApi.get("/api/v1/parsing-queue/global-status", {
    headers: getHeaders(),
  });
  return data;
};

export const postUploadDataset = async ({
  dataset_name,
  description,
  linking_column,
  files,
}: DatasetUploadPayload) => {
  const formData = new FormData();

  formData.append("dataset_name", dataset_name);

  if (description) {
    formData.append("description", description);
  }

  if (linking_column) {
    formData.append("linking_column", linking_column);
  }

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await userApi.post("/api/v1/datasets/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 0,
  });

  return data;
};

export const getDatasets = async (limit = 100, offset = 0) => {
  const { data } = await userApi.get("/api/v1/datasets", {
    params: { limit, offset },
  });
  return data;
};

export const getDatasetById = async (id: string) => {
  const { data } = await userApi.get(`/api/v1/datasets/${id}`);
  return data;
};

export const confirmDataset = async (
  id: string,
  linking_column_name?: string | null,
) => {
  const { data } = await userApi.post(`/api/v1/datasets/${id}/confirm`, null, {
    params: { linking_column_name },
  });
  return data;
};

export const getDatasetEntities = async (
  id: string,
  limit = 100,
  offset = 0,
) => {
  const { data } = await userApi.get(`/api/v1/datasets/${id}/entities`, {
    params: { limit, offset },
  });
  return data;
};

export const addFileToDataset = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await userApi.post(
    `/api/v1/datasets/${id}/add-file`,
    formData,
  );

  return data;
};

export const restartDatasetMerge = async (id: string) => {
  const { data } = await userApi.post(`/api/v1/datasets/${id}/merge`);
  return data;
};

export const getServerPaths = async () => {
  const res = await userApi.get("/api/v1/files/server/paths");
  return res.data;
};
export const addServerPath = async (path: string) => {
  const res = await userApi.post("/api/v1/files/server/paths", { path });
  return res.data;
};
export const removeServerPath = async (path: string) => {
  const res = await userApi.delete("/api/v1/files/server/paths", {
    params: { path },
  });
  return res.data;
};

export const browseServerPath = async (path: string) => {
  const res = await userApi.get("/api/v1/files/server/browse", {
    params: { path },
  });
  return res.data;
};

export const uploadServerFiles = async (files: string[], priority = 100) => {
  const res = await userApi.post("/api/v1/files/server/upload", {
    files,
    priority,
  });
  return res.data;
}
