import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoClose, IoTrashOutline } from "react-icons/io5";
import { PiPushPinSimpleBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";
import { deleteNews, getNews, togglePinNews } from "../../../api/news";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { NewsItem } from "../../../types/news";
import NewsModal from "./NewsModal";


export default function News() {
  const { isOpen } = useSidebar();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  /* ---------------- helpers ---------------- */

  const formatDateTime = (date?: string | null) => {
    if (!date) return "";

    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pinnedNews = items.filter((item) => item.pinned);
  const otherNews = items.filter((item) => !item.pinned);

  /* ---------------- API ---------------- */

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await getNews({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });

      const sorted = [...res.items].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();

        return dateB - dateA;
      });

      setItems(sorted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [categoryFilter, statusFilter]);

  const handleDelete = async (id: number) => {
    await deleteNews(id);
    setConfirmDeleteId(null);
    fetchNews();
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleTogglePin = async (item: NewsItem) => {
    // моментально обновляем UI
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, pinned: !item.pinned } : i)),
    );

    try {
      await togglePinNews(item.id, !item.pinned);
    } catch (e) {
      // откат если ошибка
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, pinned: item.pinned } : i)),
      );
    }
  };

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="mx-auto w-full px-6">
        {/* HEADER */}
        <h1 className="text-[24px] font-medium tracking-tight text-slate-900">
          Новости
        </h1>

        {/* LIST */}
        {loading && <p className="mt-6 text-slate-500">Загрузка...</p>}

        {!loading && items.length === 0 && (
          <p className="mt-6 text-slate-500">Новостей нет</p>
        )}

        <div className="mt-6 space-y-10">
          {/* PINNED NEWS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {pinnedNews.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => openEdit(item)}
                className="relative flex flex-col justify-between bg-blue-50/40 border border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition cursor-pointer"
              >
                {/* ACTIONS */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 flex gap-2"
                >
                  <button
                    onClick={() => handleTogglePin(item)}
                    className="p-1.5 rounded-md bg-blue-100 text-blue-600"
                  >
                    <PiPushPinSimpleBold className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-1.5 rounded-md bg-red-50 text-red-500"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <span className="px-2 py-1 w-fit rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                    {item.category_label}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 mt-4 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-4">
                      {item.content}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-xs text-slate-400">
                  <span>
                    {formatDateTime(item.published_at || item.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ALL NEWS */}
          <div>
            <div className="flex items-center justify-between pb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Все новости
              </h2>
              <div className="flex gap-3 flex-wrap ">
                {/* CATEGORY */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Все категории</option>
                  <option value="planned_update">Планируемое обновление</option>
                  <option value="release">Релиз</option>
                  <option value="hotfix">Хотфикс</option>
                  <option value="maintenance">Обслуживание</option>
                  <option value="news">Новости</option>
                </select>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Все статусы</option>
                  <option value="published">Опубликовано</option>
                  <option value="draft">Черновик</option>
                  <option value="scheduled">Запланировано</option>
                </select>
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setStatusFilter("");
                  }}
                  className="px-3 py-2 text-sm border rounded-lg hover:bg-slate-100"
                >
                  Сбросить
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherNews.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => openEdit(item)}
                  className="relative flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer"
                >
                  {/* ACTIONS */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 flex gap-2"
                  >
                    {/* PIN */}
                    <button
                      onClick={() => handleTogglePin(item)}
                      className={clsx(
                        "p-1.5 rounded-md transition",
                        item.pinned
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500 hover:text-slate-700",
                      )}
                    >
                      <PiPushPinSimpleBold className="w-4 h-4" />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-5">
                    <span className="px-2 py-1 w-fit rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {item.category_label}
                    </span>
                    <div>
                      {/* TITLE */}
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 mt-4">
                        {item.title}
                      </h3>

                      {/* CONTENT */}
                      <p className="text-sm text-slate-600 line-clamp-4">
                        {item.content}
                      </p>
                    </div>
                  </div>
                  {/* FOOTER */}
                  <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                    <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-200">
                      {item.status_label}
                    </span>
                    <span className="">
                      {formatDateTime(item.published_at || item.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FLOAT BUTTON */}
      <div
        data-tooltip-id="add-news"
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 bg-white shadow-lg border rounded-full p-4 hover:shadow-xl transition cursor-pointer"
      >
        <IoClose className="rotate-45 w-7 h-7 text-slate-700" />
        <Tooltip
          id="add-news"
          content="Создать новость"
          place="left"
          delayShow={400}
        />
      </div>

      {/* MODALs */}
      <NewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchNews}
        editingItem={editingItem}
      />
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-5 w-[320px] shadow-xl"
          >
            <p className="text-sm text-slate-700 mb-4 text-center">
              Удалить новость?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-slate-100"
              >
                Отмена
              </button>

              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
