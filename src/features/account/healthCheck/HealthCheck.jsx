import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";

const API_URl = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

const HealthCheck = () => {
  const [property, setProperty] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URl}/health`, {
        headers: getHeaders(),
      });
      const prop = res.data;
      setError("");
      setProperty(prop);
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
    <section className="p-6 flex flex-col gap-4">
      <div className="title">Health Check</div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500 flex items-center justify-center mb-4 font-medium">
          {error}
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
