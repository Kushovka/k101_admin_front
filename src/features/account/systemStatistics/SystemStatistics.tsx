import { useEffect, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { systemStatistics } from "../../../api/admin";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import clsx from "clsx";
import Toast from "../../../components/toast/Toast";

interface SystemStatisticsResponse {
  gateway_status: string;
  total_files_uploaded: number;
  total_records_parsed: number;
}

const SystemStatistics = () => {
  const [stats, setStats] = useState<SystemStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen } = useSidebar();

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
            : "Ошибка при загрузке пользователей"
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

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Системная статистика</div>
      {loading && <Loader />}
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      <p className="subtitle">*Получение статистики системы.</p>
      <div className="border flex flex-col gap-3 p-4 rounded-[12px] w-1/3 text-common">
        <p className="text-health-system">{`gateway status: ${stats?.gateway_status}`}</p>
        <p className="text-health-system">{`total_files_uploaded: ${stats?.total_files_uploaded}`}</p>
        <p className="text-health-system">{`total_records_parsed: ${stats?.total_records_parsed}`}</p>
      </div>
    </section>
  );
};

export default SystemStatistics;
