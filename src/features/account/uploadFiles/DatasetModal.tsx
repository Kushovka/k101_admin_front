import { motion } from "framer-motion";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { confirmDataset } from "../../../api/uploadFiles"; // или datasetsApi
import Toast from "../../../components/toast/Toast";
import { DatasetUploadResponse } from "../../../types/file";

type Props = {
  dataset: DatasetUploadResponse;
  onClose: () => void;
};

const DatasetModal = ({ dataset, onClose }: Props) => {
  const [linking, setLinking] = useState<string>(
    dataset?.linking_column ?? dataset?.detected_linking_column ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Toast
          type="access"
          message="Linking column подтверждён. Merge запущен."
          onClose={() => setSuccess(false)}
        />
      )}

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white p-6 rounded-xl w-[900px] shadow-xl flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[18px] font-semibold text-slate-900">
              Датасет: {dataset?.dataset_name ?? dataset?.name ?? "—"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Проверь ID-колонку и подтверди запуск merge
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <IoIosClose className="w-7 h-7" />
          </button>
        </div>

        <div className="border rounded-lg p-4 bg-slate-50 flex flex-col gap-2">
          <p className="text-xs uppercase text-slate-500">Linking column</p>

          <input
            value={linking}
            onChange={(e) => setLinking(e.target.value)}
            placeholder="Например: client_id"
            className="px-3 py-2 text-[14px] border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none bg-white"
          />

          <p className="text-[12px] text-slate-500">
            Оставь пустым, если хочешь принять авто-детекцию (если она есть).
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition"
          >
            Закрыть
          </button>

          <button
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                // null = подтвердить предложенную
                await confirmDataset(
                  dataset.dataset_id,
                  linking.trim() ? linking.trim() : null,
                );
                setSuccess(true);

                setTimeout(() => {
                  onClose();
                }, 1000);
              } catch (e: any) {
                setError(
                  e?.response?.data?.detail ?? "Ошибка при подтверждении",
                );
              } finally {
                setLoading(false);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                loading
                  ? "bg-gray-300 text-slate-600 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              }`}
          >
            {loading ? "Подтверждаем..." : "Подтвердить и запустить merge"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetModal;
