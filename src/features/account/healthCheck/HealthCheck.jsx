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
          <p className="text-gray01 text-[14px]">
            *Проверка состояния Admin Panel и Gateway.
          </p>
          <div className="border flex flex-col gap-5 p-4 rounded-[12px] w-1/3 text-gray01">
            <p className="flex items-center gap-5">{`status: ${property.status}`}</p>
            <p className="flex items-center gap-5">{`service: ${property.service}`}</p>
            <p className="flex items-center gap-5">{`version: ${property.version}`}</p>
            <p className="flex items-center gap-5">{`gateway - status: ${property.service}`}</p>
            <p className="flex items-center gap-5">{`url: ${property.service}`}</p>
            <p className="flex items-center gap-5">{`service: ${property.service}`}</p>
          </div>
        </>
      )}
    </section>
  );
};

export default HealthCheck;
