import React, { useEffect, useState } from "react";
import api from "../api/axios";

export const useFieldAliases = ({ file, token, onNotify, onError }) => {
  const [aliases, setAliases] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [aliasValue, setAliasValue] = useState("");

  useEffect(() => {
    if (!file) return;

    const loadAliases = async () => {
      try {
        const [fileRes, globalRes] = await Promise.all([
          api.get("http://192.168.0.45:18100/api/v1/field-mappings", {
            params: { raw_file_id: file.id },
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("http://192.168.0.45:18100/api/v1/field-mappings", {
            params: { is_global: true },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const map = {};

        [
          ...(globalRes.data?.mappings ?? []),
          ...(fileRes.data?.mappings ?? []),
        ].forEach((m) => {
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

  const saveAlias = async () => {
    if (!editingField || !aliasValue.trim()) return;

    const existing = aliases[editingField];

    try {
      if (existing?.id) {
        await api.patch(
          `http://192.168.0.45:18100/api/v1/field-mappings/${existing.id}`,
          { display_name: aliasValue.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post(
          "http://192.168.0.45:18100/api/v1/field-mappings",
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
