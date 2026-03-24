import clsx from "clsx";
import { useEffect, useState } from "react";
import { updateAppeal } from "../../../api/appeals";
import { Appeal } from "../../../types/appeals";

type Props = {
  appeal: Appeal | null;
  onClose: () => void;
  onUpdated: () => void;
};

const AppealModal = ({ appeal, onClose, onUpdated }: Props) => {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"new" | "in_progress" | "closed">("new");
  const [loading, setLoading] = useState(false);

  // 🔥 синхронизация при смене обращения
  useEffect(() => {
    if (appeal) {
      setAnswer(appeal.admin_reply || "");
      setStatus(appeal.status);
    }
  }, [appeal]);

  if (!appeal) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await updateAppeal(appeal.id, {
        admin_reply: answer,
        status: answer ? "in_progress" : status,
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
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Обращение #{appeal.id}</h3>

        {/* 👤 пользователь */}
        <div className="mb-4 text-xs text-slate-500">
          {appeal.username || appeal.telegram_username || "Без имени"} •{" "}
          {appeal.source}
        </div>

        {/* 📌 тема */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Тема</div>
          <div className="text-sm font-medium">{appeal.subject}</div>
        </div>

        {/* 💬 сообщение */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Сообщение</div>
          <div className="p-3 bg-slate-50 rounded-md text-sm">
            {appeal.message}
          </div>
        </div>

        {/* 📊 статус */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Статус</div>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "new" | "in_progress" | "closed")
            }
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="closed">Закрытые</option>
          </select>
        </div>

        {/* ✍️ ответ */}
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

        {/* 🔘 кнопки */}
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
