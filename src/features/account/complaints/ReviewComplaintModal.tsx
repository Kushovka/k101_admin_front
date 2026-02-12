import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  complaintId: number;
  status: "resolved" | "rejected";
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
};

export const ReviewComplaintModal = ({
  complaintId,
  status,
  onClose,
  onSubmit,
}: Props) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComment("");
  }, [complaintId]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);
      await onSubmit(comment);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[420px] p-6 shadow-xl flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          {status === "resolved" ? "Исправить жалобу" : "Отклонить жалобу"}
        </h3>

        <textarea
          placeholder="Комментарий администратора..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 text-sm resize-none h-[120px] focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
          >
            отмена
          </button>

          <button
            disabled={loading || !comment.trim()}
            onClick={handleSubmit}
            className={clsx(
              "px-4 py-2 text-sm rounded-lg text-white",
              status === "resolved"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600",
              (loading || !comment.trim()) && "opacity-50 cursor-not-allowed",
            )}
          >
            {loading ? "Отправка..." : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
};
