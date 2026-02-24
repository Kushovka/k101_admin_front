import { useEffect, useState } from "react";
import userApi from "../../api/userApi";

type FileLike = { id: string };

type UseFilePreviewArgs = {
  file: FileLike | null;
  limit: number;
  token: string;
};

type FilePreviewResponse = {
  preview_records?: unknown[];
};

export const useFilePreview = ({ file, limit, token }: UseFilePreviewArgs) => {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;
    setLoading(true);

    userApi
      .get<FilePreviewResponse>(`/api/v1/files/${file.id}/preview`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const records = res.data?.preview_records;

        setRows(Array.isArray(records) ? records : []);

      })
      .finally(() => setLoading(false));
  }, [file, limit, token]);
  return { rows, loading };
};
