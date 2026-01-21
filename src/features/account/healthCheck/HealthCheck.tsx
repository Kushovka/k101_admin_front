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
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Health Check</div>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="subtitle">*Проверка состояния Admin Panel и Gateway.</p>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border flex flex-col justify-center items-start w-1/3 gap-5 p-4 rounded-[12px] text-common"
          >
            {subtitle.map((item, index) => (
              <div key={index}>
                <p className="text-health-system text-common">
                  {item.title}: {item.text}
                </p>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </section>
  );
};

export default HealthCheck;
