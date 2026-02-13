import { useEffect, useState } from "react";
import {
  getDocumentPreview,
  remapFields,
  updateDocument,
} from "../../../api/complaints";

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
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

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
    };
    fetchPreview();
  }, [docId]);

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({
      ...prev!,
      [key]: value,
    }));
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

      setRemapTarget(null);
      setRemapToField("");
      setRemapReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;

    const filtered: Record<string, any> = {};

    mainFields.forEach((field) => {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
    });

    try {
      setLoading(true);

      await updateDocument(docId, filtered, reason);

      onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-xl flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">Редактирование документа</h3>
          <h4 className="font-semibold mt-4">Основные поля</h4>

          {mainFields.map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">{field}</label>
              <input
                value={data[field] ?? ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
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
                    <div className="text-sm font-medium">{value as string}</div>
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
                </div>
              ))}
            </>
          )}

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
    </>
  );
};
