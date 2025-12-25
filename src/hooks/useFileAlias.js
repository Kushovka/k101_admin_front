import React, { useEffect, useState } from "react";
import api from "../api/axios";

export const useFileAlias = ({
  file,
  token,
  onNotify,
  onError,
  onUpdateFile,
}) => {
  const [fileAlias, setFileAlias] = useState("");
  const [editingFileAlias, setEditingFileAlias] = useState(false);

  useEffect(() => {
    if (!file || editingFileAlias) return;
    setFileAlias(file.file_description ?? "");
  }, [file, editingFileAlias]);

  const saveFileAlias = async () => {
    if (!fileAlias.trim()) return;

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
