import { useState } from "react";
import clsx from "clsx";
import { Appeal, updateAppeal } from "../../../api/appeals";


type Props = {
  appeal: Appeal | null;
  onClose: () => void;
  onUpdated: () => void;
};

const AppealModal = ({ appeal, onClose, onUpdated }: Props) => {
  const [answer, setAnswer] = useState(appeal?.answer || "");
  const [status, setStatus] = useState(appeal?.status || "pending");
  const [loading, setLoading] = useState(false);

  if (!appeal) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await updateAppeal(appeal.id, {
        answer,
        status,
      });

      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Обращение #{appeal.id}
        </h3>

        {/* текст обращения */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Сообщение</div>
          <div className="p-3 bg-slate-50 rounded-md text-sm">
            {appeal.message}
          </div>
        </div>

        {/* статус */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Статус</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="pending">Ожидает</option>
            <option value="answered">Отвечено</option>
            <option value="closed">Закрыто</option>
          </select>
        </div>

        {/* ответ */}
        <div className="mb-6">
          <div className="text-xs text-slate-400 mb-1">Ответ</div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full border rounded-md p-2 text-sm resize-none"
            placeholder="Введите ответ..."
          />
        </div>

        {/* кнопки */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded-md"
          >
            Отмена
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={clsx(
              "px-4 py-2 text-sm text-white rounded-md",
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {loading ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppealModal;