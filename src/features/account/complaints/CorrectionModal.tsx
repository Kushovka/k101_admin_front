import { useEffect, useState } from "react";
import {
  correctEntireFile,
  deleteFieldValue,
  getCorrectionTaskStatus,
  getDocumentPreview,
  remapFields,
  renameColumnInFile,
  updateAdditionalData,
  updateMainInfo,
} from "../../../api/complaints";
import Toast from "../../../components/toast/Toast";

type Props = {
  docId: string;
  onClose: () => void;
  onUpdated: () => void;
};

const mainFields = [
  "first_name",
  "last_name",
  "middle_name",
  "phone",
  "email",
  "age",
  "city",
  "address",
  "gender",
  "birthday",
  "ipn",
  "snils",
];

export const CorrectionModal = ({ docId, onClose, onUpdated }: Props) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  type NotifyType = "reason_required_delete" | "reason_required_save" | null;
  const [notify, setNotify] = useState<NotifyType>(null);
  const [rawFileId, setRawFileId] = useState<string | null>(null);
  const [applyScope, setApplyScope] = useState<"single" | "file">("single");

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [originalData, setOriginalData] = useState<Record<string, any> | null>(
    null,
  );

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState("");

  const [remapTarget, setRemapTarget] = useState<{
    fromField: string;
    value: string;
  } | null>(null);

  const [remapToField, setRemapToField] = useState("");
  const [remapReason, setRemapReason] = useState("");

  useEffect(() => {
    const fetchPreview = async () => {
      const res = await getDocumentPreview(docId);
      setData(res.current_data);
      setOriginalData(res.current_data);
      setRawFileId(res.raw_file_id);
    };

    fetchPreview();
  }, [docId]);

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  const getMainInfoDiff = () => {
    if (!data || !originalData) return {};

    const diff: Record<string, any> = {};

    mainFields.forEach((field) => {
      if (data[field] !== originalData[field]) {
        diff[field] = data[field];
      }
    });

    return diff;
  };

  const handleRemap = async () => {
    if (!remapTarget || !remapToField || !remapReason.trim()) return;

    try {
      setLoading(true);

      await remapFields(
        docId,
        [
          {
            from_field: remapTarget.fromField,
            to_field: remapToField,
          },
        ],
        remapReason,
      );

      const refreshed = await getDocumentPreview(docId);
      setData(refreshed.current_data);
      setOriginalData(refreshed.current_data);

      setRemapTarget(null);
      setRemapToField("");
      setRemapReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pollTask = (taskId: string) => {
    const interval = setInterval(async () => {
      const status = await getCorrectionTaskStatus(taskId);

      if (status.status === "success" || status.status === "failed") {
        clearInterval(interval);
        setLoading(false);
        onUpdated();
        onClose();
      }
    }, 3000);
  };

  const handleFileCorrection = async () => {
    if (!rawFileId || !reason.trim()) return;

    const mainDiff = getMainInfoDiff();
    if (Object.keys(mainDiff).length === 0) return;

    try {
      setLoading(true);

      const res = await correctEntireFile(rawFileId, mainDiff, reason);

      const taskId = res.task_id;

      pollTask(taskId);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!data || !reason.trim()) {
      setNotify("reason_required_save");
      return;
    }

    if (applyScope === "file") {
      await handleFileCorrection();
      return;
    }

    try {
      setLoading(true);

      const mainDiff = getMainInfoDiff();
      const additionalDiff = getAdditionalDataDiff();

      if (Object.keys(mainDiff).length > 0) {
        await updateMainInfo(docId, mainDiff, reason);
      }

      if (additionalDiff.length > 0) {
        await updateAdditionalData(docId, additionalDiff, reason);
      }

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAdditionalDataDiff = () => {
    if (!data?.additional_data || !originalData?.additional_data) return [];

    const updates: {
      old_key: string;
      new_value?: string;
    }[] = [];

    const current = data.additional_data;
    const original = originalData.additional_data;

    // изменённые или новые поля
    Object.entries(current).forEach(([key, value]) => {
      if (original[key] !== value) {
        updates.push({
          old_key: key,
          new_value: value as string,
        });
      }
    });

    // удалённые поля
    Object.keys(original).forEach((key) => {
      if (!(key in current)) {
        updates.push({
          old_key: key,
          new_value: "", // или null — зависит от API
        });
      }
    });

    return updates;
  };

  const handleDeleteField = async (field: string) => {
    if (!reason.trim()) {
      setNotify("reason_required_delete");
      return;
    }

    try {
      setLoading(true);

      await deleteFieldValue(docId, field, reason);

      const refreshed = await getDocumentPreview(docId);
      setData(refreshed.current_data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdditionalField = (key: string) => {
    if (!reason.trim()) {
      setNotify("reason_required_delete");
      return;
    }

    setData((prev) => {
      const updated = { ...prev!.additional_data };
      delete updated[key];

      return {
        ...prev!,
        additional_data: updated,
      };
    });
  };

  if (!data) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        {notify && (
          <Toast
            type="error"
            message={
              notify === "reason_required_delete"
                ? "Укажите причину, чтобы удалить поле"
                : "Укажите причину, чтобы сохранить изменения"
            }
            onClose={() => setNotify(null)}
          />
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-xl flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">Редактирование документа</h3>
          <h4 className="font-semibold mt-4">Основные поля</h4>

          {mainFields.map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">{field}</label>

              <div className="flex gap-2">
                <input
                  value={data[field] ?? ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1"
                />

                {data[field] && (
                  <button
                    onClick={() => handleDeleteField(field)}
                    disabled={loading}
                    className="px-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}

          {data.additional_data && (
            <>
              <h4 className="font-semibold mt-6">Additional data</h4>

              {Object.entries(data.additional_data).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <div>
                    <div className="text-xs text-slate-500">{key}</div>
                    <div className="flex gap-2 flex-1">
                      <input
                        value={(data.additional_data?.[key] as string) ?? ""}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev!,
                            additional_data: {
                              ...prev!.additional_data,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        className="border rounded px-2 py-1 text-sm flex-1"
                      />

                      <button
                        onClick={() => handleDeleteAdditionalField(key)}
                        disabled={loading || !reason.trim()}
                        className="px-2 text-xs bg-red-500 text-white rounded disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setRemapTarget({
                        fromField: `additional_data.${key}`,
                        value: value as string,
                      })
                    }
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  >
                    Перенести
                  </button>
                  <button
                    onClick={() => {
                      setRenameTarget(key);
                      setNewColumnName(key);
                    }}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                  >
                    Переименовать
                  </button>
                </div>
              ))}
            </>
          )}

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm font-medium">Применить изменения:</label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="single"
                checked={applyScope === "single"}
                onChange={() => setApplyScope("single")}
              />
              Только этот документ
            </label>

            {rawFileId && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="file"
                  checked={applyScope === "file"}
                  onChange={() => setApplyScope("file")}
                />
                Ко всем записям этого файла
              </label>
            )}
          </div>

          <textarea
            placeholder="Причина изменения"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border rounded p-2 text-sm min-h-[100px] resize-y"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Отмена
            </button>

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
      {remapTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] p-5 rounded-xl shadow-xl flex flex-col gap-3">
            <h4 className="font-semibold text-slate-900">Перенос поля</h4>

            <div className="text-sm text-slate-600">
              Из: <b>{remapTarget.fromField}</b>
            </div>

            <select
              value={remapToField}
              onChange={(e) => setRemapToField(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="">Выберите поле</option>
              {mainFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Причина переноса"
              value={remapReason}
              onChange={(e) => setRemapReason(e.target.value)}
              className="border rounded p-2 text-sm"
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setRemapTarget(null)}
                className="px-3 py-1 border rounded"
              >
                Отмена
              </button>

              <button
                onClick={handleRemap}
                disabled={!remapToField || !remapReason.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Перенести
              </button>
            </div>
          </div>
        </div>
      )}
      {renameTarget && rawFileId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] p-5 rounded-xl shadow-xl flex flex-col gap-3">
            <h4 className="font-semibold">Переименование колонки</h4>

            <div className="text-sm text-slate-600">
              Старое имя: <b>{renameTarget}</b>
            </div>

            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="border rounded p-2 text-sm"
            />

            <textarea
              placeholder="Причина изменения"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border rounded p-2 text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1 border rounded"
              >
                Отмена
              </button>

              <button
                onClick={async () => {
                  if (!reason.trim()) return;

                  setLoading(true);

                  const res = await renameColumnInFile(
                    rawFileId,
                    renameTarget,
                    newColumnName,
                    reason,
                  );

                  pollTask(res.task_id);

                  setRenameTarget(null);
                }}
                className="px-3 py-1 bg-yellow-600 text-white rounded"
              >
                Переименовать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
