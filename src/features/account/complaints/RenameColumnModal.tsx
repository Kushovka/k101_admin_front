import { useState } from "react";
import { renameColumnInFile } from "../../../api/complaints";

type Props = {
  rawFileId: string;
  availableColumns: string[];
  onClose: () => void;
  onCompleted: (message: string, type?: "access" | "error") => void;
};

export const RenameColumnModal = ({
  rawFileId,
  availableColumns,
  onClose,
  onCompleted,
}: Props) => {
  const [oldColumn, setOldColumn] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldColumn || !newColumn || !reason.trim()) {
      onCompleted("Заполни все поля", "error");
      return;
    }

    if (oldColumn === newColumn) {
      onCompleted("Новое имя совпадает со старым", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await renameColumnInFile(
        rawFileId,
        oldColumn,
        newColumn,
        reason,
      );

      // закрываем модалку сразу
      onClose();

      // показываем нормальный текст, а не тех. message
      if (res?.status === "queued") {
        onCompleted(
          "Задача поставлена в очередь. Изменения появятся позже.",
          "access",
        );
      } else {
        onCompleted("Задача отправлена. Ожидайте изменений.", "access");
      }
    } catch (err) {
      console.error(err);
      onCompleted("Ошибка при постановке задачи", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-6 rounded-xl shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Переименование колонки файла</h3>

        <div className="text-sm text-red-600">
          ⚠ Изменение затронет все записи файла
        </div>

        <select
          value={oldColumn}
          onChange={(e) => setOldColumn(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Выберите колонку</option>
          {availableColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>

        <input
          placeholder="Новое имя колонки"
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Причина изменения"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border rounded p-2 text-sm min-h-[80px]"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Отмена
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Отправка..." : "Переименовать"}
          </button>
        </div>
      </div>
    </div>
  );
};
