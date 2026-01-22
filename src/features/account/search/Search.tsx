import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Loader from "../../../components/loader/Loader";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import { useSearch } from "./SearchContext";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { motion } from "framer-motion";

import { SearchResultItem, SearchResponse } from "../../../types/search";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notify, setNotify] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seeSearch, setSeeSearch] = useState(false);
  const [additionalOption, setAdditionalOption] = useState(false);

  const { isOpen } = useSidebar();

  const pageSize = 10;

  const {
    query,
    setQuery,
    result,
    setResult,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    res,
    setRes,
  } = useSearch() as {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    result: SearchResultItem[];
    setResult: React.Dispatch<React.SetStateAction<SearchResultItem[]>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
    res: SearchResponse;
    setRes: React.Dispatch<React.SetStateAction<SearchResponse>>;
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

  const normalizePhone = (raw: string) => {
    let phone = raw.replace(/\D/g, "");

    if (phone.startsWith("8")) {
      phone = "7" + phone.slice(1);
    }

    if (phone.startsWith("9")) {
      phone = "7" + phone;
    }

    if (!phone.startsWith("7")) {
      phone = "7" + phone;
    }

    return "+" + phone;
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (
    e?: React.FormEvent,
    page: number = 1,
    isPagination: boolean = false,
  ): Promise<void> => {
    if (e) e.preventDefault();

    const raw = query.trim();

    if (!raw) {
      setError("Введите запрос");
      return;
    }

    const digit = raw.replace(/\D/g, "");
    const isEmail = /\S+@\S+\.\S+/.test(raw);
    const isPhone = digit.length >= 7;
    const isId = /^\d+$/.test(raw) && !isEmail;
    const isName = !isEmail && !isPhone && !isId;

    if (!isPagination) setResult([]);
    setLoading(true);
    setError(null);
    setSeeSearch(false);

    try {
      const baseParams: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
      };

      let endpoint = "";

      if (isName) {
        // ---- Обычный поиск по имени ----
        endpoint = "/admin/search";
        baseParams.name = raw;
      } else {
        // ---- Каскадный поиск ----
        endpoint = "/admin/cascade/search";

        if (isPhone) {
          baseParams.phone = normalizePhone(raw);
        } else if (isEmail) {
          baseParams.email = raw;
        } else if (isId) {
          baseParams.person_id = raw;
        }
      }

      const qs = new URLSearchParams(baseParams).toString();

      const response = await adminApi.post<SearchResponse>(
        `${endpoint}?${qs}`,
        null,
        { headers: getHeaders() },
      );

      setSeeSearch(true);

      if ("entity" in response.data) {
        setRes(response.data as any);
        setResult([response.data.entity as unknown as SearchResultItem]);
        setTotalPages(response.data.total_pages ?? 1);
        setCurrentPage(page);
        return;
      }
      console.log(response.data);
      setRes(response.data);
      setResult(response.data.results ?? []);
      setTotalPages(response.data.total_pages ?? 1);
      setCurrentPage(page);
    } catch (err: unknown) {
      console.error(err);

      const maybeAxiosErr = err as { response?: { status?: number } };

      const status = maybeAxiosErr.response?.status;

      setError(
        status === 500
          ? "Сервер временно недоступен. Попробуйте позже."
          : "Ошибка при загрузке пользователей",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotify("");
      setTimeout(() => setNotify(null), 2000);
    });
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
  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="max-w-[1100px] w-full mx-auto flex flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-slate-900">Поиск</h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-5"
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="ФИО, email, телефон или ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-cyan transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            <button
              className="px-5 h-[42px] bg-cyan-500 text-white rounded-lg text-[14px]
                     hover:bg-cyan-600 active:bg-cyan-600 transition"
            >
              Найти
            </button>
          </form>

          <p className="text-[13px] text-slate-500">
            Система автоматически определит тип данных
          </p>

          {seeSearch && (
            <div className="text-[14px] text-slate-600">
              Найдено:{" "}
              {res.count === 10
                ? "Очень много совпадений, уточните запрос"
                : res.count || res.total_pages}
            </div>
          )}

          {/* table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 text-slate-700 text-[12px] uppercase tracking-wide font-medium py-3">
              {chapterTitleSearch.map((chapter) => (
                <div key={chapter.id} className="text-center">
                  {chapter.title}
                </div>
              ))}
            </div>

            {loading && <Loader />}

            {result.length === 0 && !loading && (
              <div className="py-10 text-center text-slate-400 text-[14px]">
                Нет результатов
              </div>
            )}

            {result.map((item, index) => (
              <motion.div
                key={item.entity_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-7 text-[14px] text-slate-700 py-3 border-t border-gray-100
                       hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span className="text-center">
                  {(currentPage - 1) * pageSize + index + 1}
                </span>
                <span className="text-center">{item.last_name || "-"}</span>
                <span className="text-center">{item.first_name || "-"}</span>
                <span className="text-center">{item.middle_name || "-"}</span>
                <span className="text-center truncate">
                  {item.emails[0] || "-"}
                </span>
                <span className="text-center">{item.phones[0] || "-"}</span>

                <span
                  className="text-cyan-600 font-medium text-center"
                  onClick={() =>
                    navigate(`/account/search/${item.entity_id}`, {
                      state: item,
                    })
                  }
                >
                  Подробнее →
                </span>
              </motion.div>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => handleSubmit(undefined, page, true)}
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
        </motion.div>
      </div>
    </section>
  );
};

export default Search;
