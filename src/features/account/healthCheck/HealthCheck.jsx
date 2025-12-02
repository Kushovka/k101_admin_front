import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { healthCheck } from "../../../api/admin.js";

const HealthCheck = () => {
  const [property, setProperty] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await healthCheck();
      setError("");
      setProperty(res);
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

  return (
    <section className="section">
      <div className="title">Health Check</div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="flex flex-col items-center justify-center mb-4 text-error">
          {error}
          <span className="text-[30px]">😡</span>
        </div>
      ) : (
        <>
          <p className="subtitle">*Проверка состояния Admin Panel и Gateway.</p>
          <div className="border flex flex-col gap-5 p-4 rounded-[12px] w-1/3 text-common">
            <p className="text-health-system">{`status: ${property.status}`}</p>
            <p className="text-health-system">{`service: ${property.service}`}</p>
            <p className="text-health-system">{`version: ${property.version}`}</p>
            <p className="text-health-system">{`gateway - status: ${property.service}`}</p>
            <p className="text-health-system">{`url: ${property.service}`}</p>
            <p className="text-health-system">{`service: ${property.service}`}</p>
          </div>
        </>
      )}
    </section>
  );
};

export default HealthCheck;
