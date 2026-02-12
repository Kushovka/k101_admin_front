import clsx from "clsx";
import { useEffect, useState } from "react";
import { getAllComplaints, reviewComplaint } from "../../../api/complaints";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Complaint } from "../../../types/complaints.types";
import { ReviewComplaintModal } from "./ReviewComplaintModal";

const Complaints = () => {
  const { isOpen } = useSidebar();
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);

  const [reviewTarget, setReviewTarget] = useState<{
    id: number;
    status: "resolved" | "rejected";
  } | null>(null);

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints();
      setAllComplaints(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Обращения</h2>

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

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:bg-gray-50 transition"
                >
                  {/* верхняя строка */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      Документ:{" "}
                      <span className="font-medium text-slate-700">
                        {item.doc_id}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    </section>
  );
};

export default Complaints;
