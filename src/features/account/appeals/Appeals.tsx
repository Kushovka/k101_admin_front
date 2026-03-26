import clsx from "clsx";
import { useEffect, useState } from "react";
import { getAppeals } from "../../../api/appeals";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Appeal, AppealCategory } from "../../../types/appeals";
import AppealModal from "./AppealModal";

const statusMap = {
  new: "Новые",
  in_progress: "В работе",
  closed: "Закрытые",
};

const categoryMap: Record<AppealCategory, string> = {
  general: "Общий вопрос",
  billing: "Оплата",
  technical: "Техническая",
  data_error: "Ошибка в данных",
  other: "Другое",
};

const Appeals = () => {
  const { isOpen } = useSidebar();

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<
    AppealCategory | undefined
  >();

  const fetchAppeals = async () => {
    try {
      const data = await getAppeals({
        page,
        status: statusFilter,
        category: categoryFilter,
      });

      setAppeals(data.items);
      setTotalPages(data.total_pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAppeals();
  }, [page, statusFilter, categoryFilter]);

  const currentPage = page;

  const maxVisible = 7;

  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Обращения пользователей
        </h2>

        {/* 🔥 фильтр */}
        <div className="flex gap-3 mb-4">
          {/* статус */}
          <select
            value={statusFilter ?? ""}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value || undefined);
            }}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
          >
            <option value="">Все статусы</option>
            {Object.entries(statusMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* категория */}
          <select
            value={categoryFilter ?? ""}
            onChange={(e) => {
              setPage(1);
              setCategoryFilter(
                (e.target.value || undefined) as AppealCategory | undefined,
              );
            }}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
          >
            <option value="">Все категории</option>
            {Object.entries(categoryMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setCategoryFilter(undefined);
              setPage(1);
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            Сбросить
          </button>
        </div>

        {/* 🔥 список */}
        {loading ? (
          <div>Загрузка...</div>
        ) : appeals.length === 0 ? (
          <div className="text-slate-400">Нет обращений</div>
        ) : (
          <div className="flex flex-col gap-3">
            {appeals.map((appeal) => (
              <div
                key={appeal.id}
                onClick={() => setSelectedAppeal(appeal)}
                className="border rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">#{appeal.id}</span>

                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      appeal.status === "new" &&
                        "bg-yellow-100 text-yellow-700",
                      appeal.status === "in_progress" &&
                        "bg-blue-100 text-blue-700",
                      appeal.status === "closed" && "bg-gray-200 text-gray-700",
                    )}
                  >
                    {statusMap[appeal.status]}
                  </span>
                </div>

                {/* пользователь + категория */}
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <span>
                    {appeal.username || appeal.telegram_username || "Без имени"}
                  </span>

                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {appeal.category_label || "Без категории"}
                  </span>
                </div>

                {/* тема */}
                <div className="text-sm font-medium">{appeal.subject}</div>

                {/* сообщение */}
                <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                  {appeal.message}
                </p>

                {/* дата */}
                <div className="text-xs text-slate-400 mt-2">
                  {new Date(appeal.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 пагинация */}
        {!loading && appeals.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-6">
            {visiblePages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  "px-3 py-1 rounded-full text-[14px] border transition",
                  p === currentPage
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 hover:bg-gray-100",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 модалка */}
      <AppealModal
        appeal={selectedAppeal}
        onClose={() => setSelectedAppeal(null)}
        onUpdated={fetchAppeals}
      />
    </section>
  );
};

export default Appeals;
