import { useEffect, useState } from "react";
import api from "../../api/adminApi";
import userApi from "../../api/userApi";

type FileLike = {
  id: string;
};

type FieldAlias = {
  id?: string;
  display_name: string;
};

type FieldAliasesMap = Record<string, FieldAlias>;

type UseFilePreviewArgs = {
  file: FileLike | null;
  token: string;

  onNotify?: (message: string) => void;
  onError?: (message: string) => void;
};

export const useFieldAliases = ({
  file,
  token,
  onNotify,
  onError,
}: UseFilePreviewArgs) => {
  const [aliases, setAliases] = useState<FieldAliasesMap>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [aliasValue, setAliasValue] = useState<string>("");

  useEffect(() => {
    if (!file) return;

    const loadAliases = async (): Promise<void> => {
      try {
        const [fileRes, globalRes] = await Promise.all([
          userApi.get("/api/v1/field-mappings", {
            params: { raw_file_id: file.id },
            headers: { Authorization: `Bearer ${token}` },
          }),
          userApi.get("/api/v1/field-mappings", {
            params: { is_global: true },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const map: FieldAliasesMap = {};

        [
          ...(globalRes.data?.mappings ?? []),
          ...(fileRes.data?.mappings ?? []),
        ].forEach((m: any) => {
          map[m.original_field_name] = {
            id: m.id,
            display_name: m.display_name,
          };
        });
        setAliases(map);
      } catch (err) {
        setAliases({});
      } finally {
      }
    };
    loadAliases();
  }, [file, token]);

  /* ---------------- save ---------------- */

  const saveAlias = async (): Promise<void> => {
    if (!file || !editingField || !aliasValue.trim()) return;

    const existing = aliases[editingField];

    try {
      if (existing?.id) {
        await userApi.patch(
          `/api/v1/field-mappings/${existing.id}`,
          { display_name: aliasValue.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await userApi.post(
          "/api/v1/field-mappings",
          {
            original_field_name: editingField,
            display_name: aliasValue.trim(),
            is_global: false,
            raw_file_id: file.id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setAliases((prev) => ({
        ...prev,
        [editingField]: {
          ...prev[editingField],
          display_name: aliasValue.trim(),
        },
      }));

      setEditingField(null);
      setAliasValue("");
      onNotify?.("Алиас поля сохранён");
    } catch {
      onError?.("Не удалось сохранить алиас поля");
    }
  };

  return {
    aliases,
    editingField,
    setEditingField,
    aliasValue,
    setAliasValue,
    saveAlias,
  };
};
