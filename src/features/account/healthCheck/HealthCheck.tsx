import React, { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { healthCheck } from "../../../api/healthCheck";
import { useSidebar } from "../../../components/sidebar/SidebarContext.jsx";
import clsx from "clsx";
import Toast from "../../../components/toast/Toast.jsx";
import { CgDanger } from "react-icons/cg";
import type { HealthCheckResponse } from "../../../types/healthCheck";
import { motion } from "framer-motion";

interface SubtitleItem {
  title: string;
  text?: string;
}

const HealthCheck: React.FC = () => {
  const [property, setProperty] = useState<HealthCheckResponse | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen } = useSidebar();

  // function api
  const fetchProperty = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res: HealthCheckResponse = await healthCheck();
      setProperty(res);
      console.log(res);
    } catch (err: any) {
      console.error("Ошибка при получении пользователей:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, []);

  const subtitle: SubtitleItem[] = [
    {
      title: "status",
      text: property?.status,
    },
    {
      title: "service",
      text: property?.service,
    },
    {
      title: "version",
      text: property?.version,
    },
    {
      title: "gateway - status",
      text: property?.service,
    },
    {
      title: "url",
      text: property?.service,
    },
    {
      title: "service",
      text: property?.service,
    },
  ];

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      <div className="max-w-[900px] w-full mx-auto flex flex-col gap-6">
        <h1 className="text-[22px] font-medium tracking-tight text-slate-900">
          Health Check
        </h1>

        {loading ? (
          <Loader />
        ) : (
          <>
            <p className="text-[14px] text-slate-500">
              Проверка состояния Admin Panel и Gateway
            </p>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-4 text-[15px]"
            >
              {subtitle.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b last:border-none pb-2"
                >
                  <span className="text-slate-600">{item.title}</span>
                  <span className="font-medium text-slate-900">
                    {item.text ?? "-"}
                  </span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default HealthCheck;
