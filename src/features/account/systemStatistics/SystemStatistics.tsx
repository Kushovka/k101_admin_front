import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { systemStatistics } from "../../../api/systemStatistics";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import clsx from "clsx";
import Toast from "../../../components/toast/Toast";

import type { SystemStatisticsResponse } from "../../../types/systemStatistics";

const SystemStatistics = () => {
  const [stats, setStats] = useState<SystemStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen } = useSidebar();

  const fetchStats = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await systemStatistics();
      setStats(res);
    } catch (err: unknown) {
      console.error("Ошибка при получении пользователей:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { status?: number } }).response;
        setError(
          response?.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
        );
      } else {
        setError("Сетевая ошибка или CORS");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title mb-4">Системная статистика</div>

      {loading && <Loader />}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-6 w-full">
          {/* Система */}
          <div className="p-4 border rounded-lg flex flex-col gap-2">
            <h2 className="subtitle mb-1 text-[20px]">Система</h2>
            <p
              className={clsx(
                "font-semibold",
                stats.gateway_status === "healthy"
                  ? "text-green-600"
                  : "text-red-500"
              )}
            >
              gateway: {stats.gateway_status}
            </p>
          </div>

          {/* Файлы */}
          <div className="p-4 border rounded-lg flex flex-col gap-3">
            <h2 className="subtitle text-[20px]">Файлы</h2>

            <div className="grid grid-cols-2 gap-3 gap-x-12 text-common">
              <div className="flex justify-between">
                <span>Всего загружено:</span>
                <span className="font-medium">
                  {stats.files.total_files_uploaded}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Записей извлечено:</span>
                <span className="font-medium">
                  {stats.files.total_records_parsed}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Выполнено:</span>
                <span className="font-medium">
                  {stats.files.files_completed}
                </span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>В обработке:</span>
                <span className="font-medium">
                  {stats.files.files_processing}
                </span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Ошибка:</span>
                <span className="font-medium">{stats.files.files_failed}</span>
              </div>
            </div>
          </div>

          {/* Платежи */}
          <div className="p-4 border rounded-lg flex flex-col gap-3">
            <h2 className="subtitle text-[20px]">Платежи</h2>

            <div className="grid grid-cols-2 gap-3 gap-x-12 text-common">
              <div className="flex justify-between">
                <span>Всего платежей:</span>
                <span className="font-medium">
                  {stats.financial.payments.total_payments}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Общая сумма:</span>
                <span className="font-medium">
                  {stats.financial.payments.total_amount}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Зачислено:</span>
                <span className="font-medium">
                  {stats.financial.payments.completed_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Средний баланс пользователя:</span>
                <span className="font-medium">
                  {stats.financial.average_user_balance}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Общий баланс пользователей:</span>
                <span className="font-medium">
                  {stats.financial.total_user_balance}
                </span>
              </div>
            </div>
          </div>

          {/* Пользователи */}
          <div className="p-4 border rounded-lg flex flex-col gap-3">
            <h2 className="subtitle text-[20px]">Пользователи</h2>

            <div className="grid grid-cols-2 gap-3 gap-x-12 text-common">
              <div className="flex justify-between">
                <span>Всего:</span>
                <span className="font-medium">{stats.users.total}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Активные:</span>
                <span className="font-medium">{stats.users.active}</span>
              </div>
              <div className="flex justify-between">
                <span>Подтвердили email:</span>
                <span className="font-medium">
                  {stats.users.email_verified}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Новые за 7 дней:</span>
                <span className="font-medium">{stats.users.new_last_7d}</span>
              </div>
              <div className="flex justify-between">
                <span>Новые за 30 дней:</span>
                <span className="font-medium">{stats.users.new_last_30d}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SystemStatistics;
