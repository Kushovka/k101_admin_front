import clsx from "clsx";
import { useEffect, useState } from "react";
import { getAppeals } from "../../../api/appeals";
import { getAllComplaints, reviewComplaint } from "../../../api/complaints";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Appeal, AppealCategory } from "../../../types/appeals";
import { Complaint } from "../../../types/complaints.types";
import AppealModal from "../appeals/AppealModal";
import { CorrectionModal } from "./CorrectionModal";
import { ReviewComplaintModal } from "./ReviewComplaintModal";

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

const Complaints = () => {
  const { isOpen } = useSidebar();
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [correctionDocId, setCorrectionDocId] = useState<string | null>(null);
  const [mode, setMode] = useState<"complaints" | "appeals">("complaints");
  const [reviewTarget, setReviewTarget] = useState<{
    id: number;
    status: "resolved" | "rejected";
  } | null>(null);

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<
    AppealCategory | undefined
  >();
  const [loadingAppeals, setLoadingAppeals] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints();
      setAllComplaints(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppeals = async () => {
    try {
      setLoadingAppeals(true);
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
      setLoadingAppeals(false);
    }
  };

  useEffect(() => {
    if (mode === "appeals") {
      setPage(1);
      setStatusFilter(undefined);
      setCategoryFilter(undefined);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "complaints") {
      fetchComplaints();
    } else {
      fetchAppeals();
    }
  }, [mode, page, statusFilter, categoryFilter]);

  const handleOpenCorrection = (docId: string) => {
    setCorrectionDocId(docId);
  };

  const handleReview = async (
    id: number,
    status: "resolved" | "rejected",
    comment: string,
  ) => {
    try {
      await reviewComplaint(id, status, comment);

      await fetchComplaints();

      setReviewTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

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
        "min-h-screen bg-slate-50 pr-[50px] py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200 bg-white">
        <button
          onClick={() => setMode("complaints")}
          className={clsx(
            "py-3 text-[18px] font-semibold transition",
            mode === "complaints"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          Жалобы на данные
        </button>

        <button
          onClick={() => setMode("appeals")}
          className={clsx(
            "py-3 text-[18px] font-semibold transition",
            mode === "appeals"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          Обращения пользователей
        </button>
      </div>

      {mode === "appeals" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full my-6 mx-auto">
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
          {loadingAppeals ? (
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
                        appeal.status === "closed" &&
                          "bg-gray-200 text-gray-700",
                      )}
                    >
                      {statusMap[appeal.status]}
                    </span>
                  </div>

                  {/* пользователь + категория */}
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <span>
                      {appeal.username ||
                        appeal.telegram_username ||
                        "Без имени"}
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
          {!loadingAppeals && appeals.length > 0 && totalPages > 1 && (
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
      )}

      {mode === "complaints" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full my-6 mx-auto">
          {allComplaints.length === 0 ? (
            <p className="text-sm text-slate-500">У вас пока нет обращений</p>
          ) : (
            <div className="flex flex-col gap-3">
              {allComplaints.map((item) => {
                const statusColor =
                  {
                    pending: "bg-yellow-100 text-yellow-700",
                    resolved: "bg-green-100 text-green-700",
                    rejected: "bg-red-100 text-red-700",
                    reviewed: "bg-blue-100 text-blue-700",
                  }[item.status] ?? "bg-gray-100 text-gray-600";

                const statusLabel =
                  {
                    pending: "На рассмотрении",
                    resolved: "Исправлено",
                    rejected: "Отклонено",
                    reviewed: "Проверено",
                  }[item.status] ?? item.status;

                const complaintFileName =
                  item.file_name ?? item.doc_summary?.file_name ?? null;
                const complaintFileGroup =
                  item.file_group ?? item.doc_summary?.file_group ?? null;

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:bg-gray-50 transition"
                  >
                    {/* верхняя строка */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {(complaintFileName || complaintFileGroup) && (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {complaintFileName && (
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                            Файл: {complaintFileName}
                          </span>
                        )}
                        {complaintFileGroup && (
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                            Группа: {complaintFileGroup}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-slate-500">
                    </div>

                    {/* поле */}
                    <div className="text-sm">
                      <span className="text-slate-500">Поле:</span>{" "}
                      <span className="font-medium text-slate-800">
                        {item.field_name}
                      </span>
                    </div>

                    {/* пользователь */}
                    <div className="text-sm">
                      <span className="text-slate-500">От пользователя:</span>{" "}
                      <span className="font-medium text-slate-800">
                        {item.username} (ID: {item.user_id})
                      </span>
                    </div>

                    {/* сообщение пользователя */}
                    <div className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                      {item.message}
                    </div>

                    {/* дата */}
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    {/* ответ администратора */}
                    {item.admin_comment && (
                      <div
                        className={clsx(
                          "mt-3 p-3 rounded-lg border",
                          item.status === "resolved"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200",
                        )}
                      >
                        <div className="text-xs text-slate-500 mb-1">
                          Ответ администратора
                        </div>

                        <div className="text-sm text-slate-800">
                          {item.admin_comment}
                        </div>

                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          {item.admin_username && (
                            <span>Админ: {item.admin_username}</span>
                          )}

                          {item.reviewed_by_admin_id && (
                            <span>ID админа: {item.reviewed_by_admin_id}</span>
                          )}

                          {item.reviewed_at && (
                            <span>
                              {new Date(item.reviewed_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {item.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() =>
                            setReviewTarget({ id: item.id, status: "resolved" })
                          }
                          className="px-3 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600"
                        >
                          Исправлено
                        </button>

                        <button
                          onClick={() =>
                            setReviewTarget({ id: item.id, status: "rejected" })
                          }
                          className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Отклонить
                        </button>
                        <button
                          onClick={() => handleOpenCorrection(item.doc_id)}
                          className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Редактировать документ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {reviewTarget && (
        <ReviewComplaintModal
          complaintId={reviewTarget.id}
          status={reviewTarget.status}
          onClose={() => setReviewTarget(null)}
          onSubmit={(comment) =>
            handleReview(reviewTarget.id, reviewTarget.status, comment)
          }
        />
      )}
      {correctionDocId && (
        <CorrectionModal
          docId={correctionDocId}
          onClose={() => setCorrectionDocId(null)}
          onUpdated={fetchComplaints}
        />
      )}
      {/* 🔥 модалка */}
      {selectedAppeal && (
        <AppealModal
          appeal={selectedAppeal}
          onClose={() => setSelectedAppeal(null)}
          onUpdated={fetchAppeals}
        />
      )}
    </section>
  );
};

export default Complaints;
