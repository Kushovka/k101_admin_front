import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { HiOutlineIdentification } from "react-icons/hi";
import { IoCarSportSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { SearchResultItem } from "../../../types/search";
import { useSearch } from "./SearchContext";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
  "Content-Type": "application/json",
});

const SearchByCar = () => {
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeSearch, setSeeSearch] = useState(false);

  const [vehicleValues, setVehicleValues] = useState({
    vin: "",
    license_plate: "",
  });

  const pageSize = 15;

  const {
    result,
    setResult,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
  } = useSearch() as {
    result: any[];
    setResult: React.Dispatch<React.SetStateAction<any[]>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  };

  const chapterTitleSearch = [
    { id: 1, title: "№" },
    { id: 2, title: "Фамилия" },
    { id: 3, title: "Имя" },
    { id: 4, title: "Отчество" },
    { id: 5, title: "Email" },
    { id: 6, title: "Телефон" },
    { id: 7, title: "Подробнее..." },
  ];

  const cleanValue = (value: unknown) => {
    if (value === null || value === undefined) return "";
    return String(value)
      .trim()
      .replace(/^['"]+|['"]+$/g, "");
  };

  useEffect(() => {
    setResult([]);
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  const handleSubmit = async (e?: React.FormEvent, page = 1) => {
    e?.preventDefault();

    const vin = vehicleValues.vin.trim();
    const licensePlate = vehicleValues.license_plate.trim();

    if (!vin && !licensePlate) {
      setError("Введите VIN или гос. номер");
      setSeeSearch(false);
      setResult([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });

      if (vin) {
        endpoint = "/api/v1/vehicle/by-vin";
        params.append("vin", vin);
      } else {
        endpoint = "/api/v1/vehicle/by-plate";
        params.append("license_plate", licensePlate);
      }

      const response = await userApi.get(`${endpoint}?${params.toString()}`, {
        headers: getHeaders(),
      });

      setResult(response.data.results ?? []);
      setTotalPages(response.data.total_pages ?? 1);
      setCurrentPage(page);
      setSeeSearch(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 402) {
        setError("Недостаточно средств. Пополните баланс");
      } else if (status === 500) {
        setError("Ошибка сервера");
      } else {
        setError(data?.message || "Ошибка поиска");
      }
    } finally {
      setLoading(false);
    }
  };

  const maxVisible = 7;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);

  const hasData = (item: SearchResultItem) => {
    return (
      cleanValue(item.last_name) ||
      cleanValue(item.first_name) ||
      cleanValue(item.middle_name) ||
      cleanValue(item.emails?.[0]) ||
      cleanValue(item.phones?.[0])
    );
  };

  return (
    <section
      className={clsx(
        "section",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      <div className="w-full mx-auto flex flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-slate-900">
          Поиск по авто
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex gap-5"
        >
          <div className="grid grid-cols-[320px_1fr] gap-6 w-full">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <motion.div className="bg-white border rounded-xl p-4 flex flex-col gap-4 border-gray-200 hover:border-gray-300">
                <div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                  <span className="text-[18px]">
                    <HiOutlineIdentification />
                  </span>
                  VIN-номер
                </div>

                <input
                  placeholder="XTA210990Y1234567"
                  className="h-[38px] px-3 border border-gray-300 rounded-lg"
                  value={vehicleValues.vin}
                  onChange={(e) =>
                    setVehicleValues((prev) => ({
                      ...prev,
                      vin: e.target.value,
                      license_plate: "",
                    }))
                  }
                />

                <div className="text-xs text-slate-400 text-center">или</div>

                <div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                  <span className="text-[18px]">
                    <IoCarSportSharp />
                  </span>
                  Гос. номер
                </div>

                <input
                  placeholder="А001АА77"
                  className="h-[38px] px-3 border border-gray-300 rounded-lg"
                  value={vehicleValues.license_plate}
                  onChange={(e) =>
                    setVehicleValues((prev) => ({
                      ...prev,
                      license_plate: e.target.value,
                      vin: "",
                    }))
                  }
                />

                <button
                  type="submit"
                  className="mt-2 h-[44px] bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition"
                >
                  Найти
                </button>
              </motion.div>
            </form>

            <div className="w-full">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-50 text-slate-700 text-[12px] uppercase tracking-wide font-medium py-3">
                  {chapterTitleSearch.map((chapter) => (
                    <div key={chapter.id} className="text-center">
                      {chapter.title}
                    </div>
                  ))}
                </div>

                {seeSearch && !loading && result.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-[14px]">
                    Ничего не найдено
                  </div>
                )}

                {loading ? (
                  <Loader center />
                ) : (
                  <>
                    {result.filter(hasData).map((item, index) => (
                      <motion.div
                        key={item.entity_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-7 text-[14px] text-slate-700 py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <span className="text-center">
                          {(currentPage - 1) * pageSize + index + 1}
                        </span>
                        <span className="text-center">
                          {cleanValue(item.last_name) || "-"}
                        </span>
                        <span className="text-center">
                          {cleanValue(item.first_name) || "-"}
                        </span>
                        <span className="text-center">
                          {cleanValue(item.middle_name) || "-"}
                        </span>
                        <span className="text-center truncate">
                          {cleanValue(item.emails?.[0]) || "-"}
                        </span>
                        <span className="text-center">
                          {cleanValue(item.phones?.[0]) || "-"}
                        </span>
                        <span
                          className="text-cyan-600 font-medium text-center"
                          onClick={() =>
                            navigate(`/account/search-car/${item.entity_id}`, {
                              state: {
                                item,
                                page: currentPage,
                                vehicleValues,
                                from: "search-car",
                              },
                            })
                          }
                        >
                          Подробнее →
                        </span>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              {!loading && result.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-4">
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handleSubmit(undefined, page)}
                      className={clsx(
                        "px-3 py-1 rounded-full text-[14px] border transition",
                        page === currentPage
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 hover:bg-gray-100",
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchByCar;
