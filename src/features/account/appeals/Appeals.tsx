import clsx from "clsx";
import { useEffect, useState } from "react";
import { getAppeals } from "../../../api/appeals";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Appeal } from "../../../types/appeals";
import AppealModal from "./AppealModal";

const statusMap = {
  new: "Новые",
  in_progress: "В работе",
  closed: "Закрытые",
};

const Appeals = () => {
  const { isOpen } = useSidebar();

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  const fetchAppeals = async () => {
    try {
      const data = await getAppeals({
        page,
        status: statusFilter,
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
  }, [page, statusFilter]);

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
        <div className="flex gap-2 mb-4">
          {[
            { label: "Все", value: undefined },
            { label: "Новые", value: "new" },
            { label: "В работе", value: "in_progress" },
            { label: "Закрытые", value: "closed" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setPage(1);
                setStatusFilter(item.value);
              }}
              className={clsx(
                "px-3 py-1 rounded-md text-sm",
                statusFilter === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100",
              )}
            >
              {item.label}
            </button>
          ))}
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

                {/* пользователь */}
                <div className="text-xs text-slate-400 mb-1">
                  {appeal.username || appeal.telegram_username || "Без имени"}
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
        <div className="flex justify-center gap-4 mt-6 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Назад
          </button>

          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Вперёд
          </button>
        </div>
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
