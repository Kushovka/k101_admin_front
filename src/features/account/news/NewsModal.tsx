import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createNews, updateNews } from "../../../api/news";
import { NewsItem } from "../../../types/news";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: NewsItem | null;
};

const emptyForm = {
  title: "",
  content: "",
  category: "planned_update",
  status: "draft",
  pinned: false,
  scheduled_at: "",
};

export const NEWS_CATEGORIES = [
  { value: "planned_update", label: "Обновление", color: "blue" },
  { value: "release", label: "Релиз", color: "green" },
  { value: "hotfix", label: "Хотфикс", color: "red" },
  { value: "maintenance", label: "Обслуживание", color: "yellow" },
  { value: "news", label: "Новости", color: "gray" },
];

export default function NewsModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}: Props) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title,
        content: editingItem.content,
        category: editingItem.category,
        status: editingItem.status,
        pinned: editingItem.pinned,
        scheduled_at: editingItem.scheduled_at || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      scheduled_at: form.scheduled_at || null,
    };

    if (editingItem) {
      await updateNews(editingItem.id, payload);
    } else {
      await createNews(payload);
    }

    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col gap-5 p-6"
      >
        {/* TITLE */}
        <p className="text-[18px] font-semibold tracking-tight text-slate-900 text-center">
          {editingItem ? "Редактирование новости" : "Новая новость"}
        </p>

        {/* TITLE INPUT */}
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-slate-600">Заголовок</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Обновление системы..."
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-slate-600">Контент</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Описание обновления..."
          />
        </div>

        {/* STATUS + PIN */}
        <div className="flex flex-col gap-3">
          <label className="text-[14px] text-slate-600">Статус</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="scheduled">Запланировано</option>
          </select>

          <label className="text-[14px] text-slate-600">Категория</label>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-blue-500 transition"
          >
            {NEWS_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-slate-600">Дата публикации</label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-100 transition"
          >
            Отмена
          </button>

          <button
            onClick={handleSubmit}
            className={clsx(
              "flex-1 px-4 py-2 rounded-lg text-white transition",
              "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {editingItem ? "Сохранить" : "Создать"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
