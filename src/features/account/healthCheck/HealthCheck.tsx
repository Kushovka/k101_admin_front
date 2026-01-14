import React, { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { healthCheck } from "../../../api/healthCheck";
import { useSidebar } from "../../../components/sidebar/SidebarContext.jsx";
import clsx from "clsx";
import Toast from "../../../components/toast/Toast.jsx";
import { CgDanger } from "react-icons/cg";
import type { HealthCheckResponse } from "../../../types/healthCheck";

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
          : "Сетевая ошибка или CORS"
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
          <div className="border flex flex-col justify-center items-start w-1/3 gap-5 p-4 rounded-[12px] text-common">
            {subtitle.map((item, index) => (
              <div key={index}>
                <p className="text-health-system text-common">
                  {item.title}: {item.text}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white w-[380px] rounded-2xl shadow-2xl border border-gray-100 animate-scaleIn p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100">
              <CgDanger className="w-9 h-9 text-yellow-400/60" />
            </div>

            <h3 className="text-[18px] font-semibold">Сессия истекла</h3>

            <p className="text-[14px] text-gray-600 text-center leading-snug">
              Пожалуйста войдите снова чтобы продолжить работу.
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
              onClick={() => {
                localStorage.removeItem("access_token");
                window.location.href = "/sign-in";
              }}
            >
              Войти снова
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthCheck;
