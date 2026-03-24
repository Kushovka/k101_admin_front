import clsx from "clsx";
import { useEffect, useState } from "react";
import { getAppeals, type Appeal } from "../../../api/appeals";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import AppealModal from "./AppealModal";

const statusMap = {
  pending: "Ожидает",
  answered: "Отвечено",
  closed: "Закрыто",
};

const Appeals = () => {
  const { isOpen } = useSidebar();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const data = await getAppeals();
      setAppeals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div>Загрузка...</div>
        ) : appeals.length === 0 ? (
          <div className="text-slate-400">Нет обращений</div>
        ) : (
          <div className="flex flex-col gap-3">
            {appeals.map((appeal) => (
              <div
                onClick={() => setSelectedAppeal(appeal)}
                key={appeal.id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">#{appeal.id}</span>

                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      appeal.status === "pending" &&
                        "bg-yellow-100 text-yellow-700",
                      appeal.status === "answered" &&
                        "bg-green-100 text-green-700",
                      appeal.status === "closed" && "bg-gray-200 text-gray-700",
                    )}
                  >
                    {statusMap[appeal.status]}
                  </span>
                </div>

                <p className="text-sm text-slate-800">{appeal.message}</p>

                <div className="text-xs text-slate-400 mt-2">
                  {new Date(appeal.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AppealModal
        appeal={selectedAppeal}
        onClose={() => setSelectedAppeal(null)}
        onUpdated={fetchAppeals}
      />
    </section>
  );
};

export default Appeals;
