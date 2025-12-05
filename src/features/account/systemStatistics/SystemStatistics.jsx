import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { systemStatistics } from "../../../api/admin";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import clsx from "clsx";

const SystemStatistics = () => {
  const [stats, setStats] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen } = useSidebar();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await systemStatistics();
      setError("");
      setStats(res);
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
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Системная статистика</div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="flex flex-col items-center justify-center mb-4 text-error">
          {error}
          <span className="text-[30px]">😡</span>
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
