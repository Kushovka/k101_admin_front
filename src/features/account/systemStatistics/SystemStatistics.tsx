import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { systemStatistics } from "../../../api/systemStatistics";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";

import type { SystemStatisticsResponse } from "../../../types/systemStatistics";

const SystemStatistics = () => {
  const [stats, setStats] = useState<SystemStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { isOpen } = useSidebar();

  /* ---------------- helpers ---------------- */

  const REQUEST_TYPE_LABELS: Record<string, string> = {
    advanced_phone: "Расширенный поиск по телефону",
    advanced_email: "Расширенный поиск по email",
    advanced_snils: "Расширенный поиск по СНИЛС",
    advanced_ipn: "Расширенный поиск по ИНН",
    advanced_passport: "Расширенный поиск по паспорту",
    advanced_name: "Расширенный поиск по ФИО",
    advanced_person_id: "Поиск по ID",
    advanced_birthday: "Поиск по дате рождения",
    dossier: "Сбор досье",
  };

  /* ---------------- api ---------------- */

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
            : "Ошибка при загрузке пользователей",
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

  /* ---------------- motion animate ---------------- */

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        <h1 className="text-[22px] font-medium tracking-tight text-slate-900">
          Системная статистика
        </h1>

        {loading && <Loader />}
        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}

        {stats && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-6 w-full"
          >
            {/* SYSTEM */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-3"
            >
              <p className="text-[15px] text-slate-600">Система</p>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-slate-500">Gateway</span>
                <span
                  className={clsx(
                    "text-[14px] font-medium",
                    stats.gateway_status === "healthy"
                      ? "text-emerald-600"
                      : "text-red-500",
                  )}
                >
                  {stats.gateway_status}
                </span>
              </div>
            </motion.div>

            {/* FILES */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4"
            >
              <p className="text-[15px] text-slate-600">Файлы</p>

              <div className="flex flex-col gap-2 text-[14px] text-slate-700">
                <div className="flex justify-between">
                  <span>Всего загружено</span>
                  <span className="font-medium">
                    {stats.files.total_files_uploaded}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Записей извлечено</span>
                  <span className="font-medium">
                    {stats.files.total_records_parsed.toLocaleString("ru-RU")}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Выполнено</span>
                  <span className="font-medium">
                    {stats.files.files_completed}
                  </span>
                </div>

                <div className="flex justify-between text-blue-600">
                  <span>В обработке</span>
                  <span className="font-medium">
                    {stats.files.files_processing}
                  </span>
                </div>

                <div className="flex justify-between text-red-500">
                  <span>Ошибка</span>
                  <span className="font-medium">
                    {stats.files.files_failed}
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Общий объем обработанных файлов
                  </span>
                  <span className="font-medium">
                    {stats.files.total_raw_files_size_gb} GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Общий объем обработанных данных
                  </span>
                  <span className="font-medium">
                    {stats.opensearch.size_gb} GB
                  </span>
                </div>
              </div>
            </motion.div>

            {/* PAYMENTS */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4"
            >
              <p className="text-[15px] text-slate-600">Платежи</p>

              <div className="flex flex-col gap-2 text-[14px] text-slate-700">
                <div className="flex justify-between">
                  <span>Всего платежей</span>
                  <span className="font-medium">
                    {stats.financial.payments.total_payments}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Общая сумма</span>
                  <span className="font-medium">
                    {stats.financial.payments.total_amount}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Зачислено</span>
                  <span className="font-medium">
                    {stats.financial.payments.completed_amount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Средний баланс пользователя</span>
                  <span className="font-medium">
                    {stats.financial.average_user_balance}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Общий баланс пользователей</span>
                  <span className="font-medium">
                    {stats.financial.total_user_balance}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Потрачено</span>
                  <span className="font-medium">
                    {stats.financial.total_spent}
                  </span>
                </div>

                <div className="flex justify-between text-yellow-600">
                  <span>Ожидают</span>
                  <span className="font-medium">
                    {stats.financial.payments.by_status.pending ?? 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* USERS */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4"
            >
              <p className="text-[15px] text-slate-600">Пользователи</p>

              <div className="flex flex-col gap-2 text-[14px] text-slate-700">
                <div className="flex justify-between">
                  <span>Всего</span>
                  <span className="font-medium">{stats.users.total}</span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Активные</span>
                  <span className="font-medium">{stats.users.active}</span>
                </div>

                <div className="flex justify-between text-red-500">
                  <span>Заблокированные</span>
                  <span className="font-medium">{stats.users.blocked}</span>
                </div>

                <div className="flex justify-between">
                  <span>Новые за 24ч</span>
                  <span className="font-medium">
                    {stats.users.new_last_24h}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Новые за 7 дней</span>
                  <span className="font-medium">{stats.users.new_last_7d}</span>
                </div>

                <div className="flex justify-between">
                  <span>Новые за 30 дней</span>
                  <span className="font-medium">
                    {stats.users.new_last_30d}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* REQUESTS */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4"
            >
              <p className="text-[15px] text-slate-600">Запросы</p>

              <div className="flex flex-col gap-2 text-[14px] text-slate-700">
                <div className="flex justify-between">
                  <span>Всего</span>
                  <span className="font-medium">{stats.requests.total}</span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Успешные</span>
                  <span className="font-medium">
                    {stats.requests.successful}
                  </span>
                </div>

                <div className="flex justify-between text-red-500">
                  <span>Ошибки</span>
                  <span className="font-medium">{stats.requests.failed}</span>
                </div>

                <div className="flex justify-between">
                  <span>За 24ч</span>
                  <span className="font-medium">{stats.requests.last_24h}</span>
                </div>

                <div className="flex justify-between">
                  <span>За 7 дней</span>
                  <span className="font-medium">{stats.requests.last_7d}</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowDetails((prev) => !prev)}
                  className="text-[13px] text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showDetails ? "Скрыть" : "Подробнее"}
                </button>
              </div>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3"
                >
                  <p className="text-[13px] text-slate-500">Типы запросов</p>

                  {Object.entries(stats.requests.by_type)
                    .filter(([key]) => key.startsWith("advanced"))
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, value]) => {
                      const percent = (value / stats.requests.total) * 100;
                      const label = REQUEST_TYPE_LABELS[key] ?? key;

                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[13px] text-slate-700">
                            <span className="truncate max-w-[70%]">
                              {label}
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>

                          {/* 🔥 бар */}
                          <div className="w-full bg-gray-100 h-[4px] rounded">
                            <div
                              className="bg-indigo-500 h-[4px] rounded"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </motion.div>
              )}
            </motion.div>

            {/* REGISTRATION */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4"
            >
              <p className="text-[15px] text-slate-600">
                Заявки на регистрацию
              </p>

              <div className="flex flex-col gap-2 text-[14px] text-slate-700">
                <div className="flex justify-between">
                  <span>Всего</span>
                  <span className="font-medium">
                    {stats.registration_requests.total}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Одобрено</span>
                  <span className="font-medium">
                    {stats.registration_requests.approved}
                  </span>
                </div>

                <div className="flex justify-between text-red-500">
                  <span>Отклонено</span>
                  <span className="font-medium">
                    {stats.registration_requests.rejected}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SystemStatistics;
