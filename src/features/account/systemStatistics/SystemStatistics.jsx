import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";

const API_URl = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

const SystemStatistics = () => {
  const [stats, setStats] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URl}/api/stats`, {
        headers: getHeaders(),
      });
      const stat = res.data;
      setError("");
      setStats(stat);
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
    fetchStats();
  }, []);

  return (
    <section className="p-6 flex flex-col gap-4">
      <div className="title">Системная статистика</div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500 flex items-center justify-center mb-4 font-medium">
          {error}
        </div>
      ) : (
        <>
          <p className="subtitle">*Получение статистики системы.</p>
          <div className="border flex flex-col gap-3 p-4 rounded-[12px] w-1/3 text-common">
            <p className="text-health-system">{`gateway status: ${stats.gateway_status}`}</p>
            <p className="text-health-system">{`total_files_uploaded: ${stats.total_files_uploaded}`}</p>
            <p className="text-health-system">{`total_records_parsed: ${stats.total_records_parsed}`}</p>
          </div>
        </>
      )}
    </section>
  );
};

export default SystemStatistics;
