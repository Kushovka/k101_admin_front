import { useCallback, useEffect, useRef, useState } from "react";
import userApi from "../../api/userApi";

type FileLike = {
  id: string;
};

type ReindexStatus =
  | "idle"
  | "PENDING"
  | "STARTED"
  | "PROGRESS"
  | "SUCCESS"
  | "DONE"
  | "FAILURE"
  | "ERROR";

export type FieldSetting = {
  original_field_name: string;
  display_name: string;
  is_additional: boolean;
  target_field: string | null;
  reindex_status: string | null;
  reindex_task_id: string | null;
  mapping_id?: number | null;
};

type FieldSettingsResponse = {
  fields?: FieldSetting[];
  opensearch_available?: boolean;
};

type SaveFieldSettingsResponse = {
  task_id?: string | null;
  reindex_task_id?: string | null;
  reindex_queued?: boolean;
  saved_count?: number;
  fields?: FieldSetting[];
};

type FieldSettingsStatusResponse = {
  task_id?: string | null;
  progress?: {
    status?: ReindexStatus;
    error?: string | null;
    result?: unknown;
    progress?: unknown;
  } | null;
};

export type SaveFieldSettingPayload = {
  original_field_name: string;
  display_name: string;
  is_additional: boolean;
  target_field: string | null;
};

export const useFieldSettings = (file: FileLike | null, token: string) => {
  const [fields, setFields] = useState<FieldSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<ReindexStatus>("idle");
  const [opensearchAvailable, setOpensearchAvailable] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const loadFieldSettings = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setSaveError(null);

    try {
      const res = await userApi.get<FieldSettingsResponse>(
        `/api/v1/files/${file.id}/field-settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setFields(Array.isArray(res.data.fields) ? res.data.fields : []);
      setOpensearchAvailable(Boolean(res.data.opensearch_available));
    } catch {
      setFields([]);
      setOpensearchAvailable(false);
      setSaveError("Не удалось загрузить настройки полей");
    } finally {
      setLoading(false);
    }
  }, [file, token]);

  useEffect(() => {
    void loadFieldSettings();
  }, [loadFieldSettings]);

  useEffect(() => stopPolling, [stopPolling]);

  const pollStatus = useCallback(
    async (nextTaskId: string) => {
      if (!file) return;

      stopPolling();
      setTaskId(nextTaskId);
      setStatus("PENDING");

      const fetchStatus = async () => {
        try {
          const res = await userApi.get<FieldSettingsStatusResponse>(
            `/api/v1/files/${file.id}/field-settings/status`,
            {
              params: { task_id: nextTaskId },
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const nextStatus = res.data?.progress?.status ?? "PENDING";
          setStatus(nextStatus);

          if (["SUCCESS", "DONE"].includes(nextStatus)) {
            stopPolling();
            await loadFieldSettings();
          }

          if (["FAILURE", "ERROR"].includes(nextStatus)) {
            stopPolling();
            setSaveError(
              res.data?.progress?.error ?? "Ошибка при переиндексации полей",
            );
          }
        } catch {
          stopPolling();
          setSaveError("Не удалось получить статус переиндексации");
        }
      };

      await fetchStatus();
      pollingRef.current = setInterval(() => {
        void fetchStatus();
      }, 3000);
    },
    [file, loadFieldSettings, stopPolling, token],
  );

  const updateFieldDisplayName = useCallback(
    (originalFieldName: string, displayName: string) => {
      setFields((prev) =>
        prev.map((field) =>
          field.original_field_name === originalFieldName
            ? { ...field, display_name: displayName }
            : field,
        ),
      );
    },
    [],
  );

  const saveAll = useCallback(
    async (payloadFields?: SaveFieldSettingPayload[]) => {
      if (!file) return;

      setSaving(true);
      setSaveError(null);

      const payload = {
        fields:
          payloadFields ??
          fields.map((field) => ({
            original_field_name: field.original_field_name,
            display_name: field.display_name,
            is_additional: field.is_additional,
            target_field: field.target_field,
          })),
      };

      try {
        const res = await userApi.put<SaveFieldSettingsResponse>(
          `/api/v1/files/${file.id}/field-settings`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const nextTaskId = res.data?.task_id ?? res.data?.reindex_task_id ?? null;

        if (Array.isArray(res.data?.fields)) {
          setFields(res.data.fields);
        }

        if (nextTaskId) {
          await pollStatus(nextTaskId);
        } else {
          setTaskId(null);
          setStatus("DONE");
          await loadFieldSettings();
        }
      } catch {
        setSaveError("Не удалось сохранить настройки полей");
        throw new Error("save_field_settings_failed");
      } finally {
        setSaving(false);
      }
    },
    [file, fields, loadFieldSettings, pollStatus, token],
  );

  return {
    fields,
    loading,
    saving,
    saveError,
    taskId,
    status,
    opensearchAvailable,
    updateFieldDisplayName,
    saveAll,
    reload: loadFieldSettings,
  };
};
