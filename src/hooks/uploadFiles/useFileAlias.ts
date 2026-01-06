import { useEffect, useState } from "react";
import api from "../../api/adminApi";

type FileLike = {
  id: string;
  file_description?: string | null;
};

type UseFilePreviewArgs = {
  file: FileLike | null;
  token: string;

  onNotify?: (message: string) => void;
  onError?: (message: string) => void;

  onUpdateFile?: (fileId: string, alias: string) => void;
};

export const useFileAlias = ({
  file,
  token,
  onNotify,
  onError,
  onUpdateFile,
}: UseFilePreviewArgs) => {
  const [fileAlias, setFileAlias] = useState<string>("");
  const [editingFileAlias, setEditingFileAlias] = useState<boolean>(false);

  useEffect(() => {
    if (!file || editingFileAlias) return;
    setFileAlias(file.file_description ?? "");
  }, [file, editingFileAlias]);

  const saveFileAlias = async (): Promise<void> => {
    if (!file || !fileAlias.trim()) return;

    try {
      await api.patch(
        `http://192.168.0.45:18100/api/v1/files/${file.id}/description`,
        { file_description: fileAlias.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUpdateFile?.(file.id, fileAlias.trim());
      onNotify?.("Описание файла сохранено");
      setEditingFileAlias(false);
    } catch (err) {
      onError?.("Не удалось сохранить описание файла");
    }
  };

  return {
    fileAlias,
    setFileAlias,
    editingFileAlias,
    setEditingFileAlias,
    saveFileAlias,
  };
};
