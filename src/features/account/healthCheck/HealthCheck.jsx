import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { healthCheck } from "../../../api/admin.js";
import { useSidebar } from "../../../components/sidebar/SidebarContext.jsx";
import clsx from "clsx";
import Toast from "../../../components/toast/Toast.jsx";

const HealthCheck = () => {
  const [property, setProperty] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen } = useSidebar();

  // function api
  const fetchProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await healthCheck();
      setProperty(res);
      console.log(res);
    } catch (err) {
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

  const subtitle = [
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
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
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
    </section>
  );
};

export default HealthCheck;
