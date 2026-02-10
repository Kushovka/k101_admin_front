import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { useSearch } from "./SearchContext";

import userApi from "../../../api/userApi";
import { SearchResponse, SearchResultItem } from "../../../types/search";

type SearchMode =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "id"
  | "snils"
  | "ipn";

const SEARCH_TABS: { key: SearchMode; label: string; placeholder: string }[] = [
  { key: "name", label: "ФИО", placeholder: "Фамилия Имя Отчество" },
  { key: "phone", label: "Телефон", placeholder: "+7 999 123-45-67" },
  { key: "email", label: "Email", placeholder: "example@mail.ru" },
  { key: "address", label: "Адрес", placeholder: "Город, улица, дом" },
  { key: "snils", label: "СНИЛС", placeholder: "123-456-789 00" },
  { key: "ipn", label: "ИНН", placeholder: "123456789000" },
  // { key: "id", label: "ID", placeholder: "ID персоны" },
];

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notify, setNotify] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seeSearch, setSeeSearch] = useState(false);
  const [additionalOption, setAdditionalOption] = useState(false);
  const [mode, setMode] = useState<SearchMode>("name");
  const [value, setValue] = useState("");

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
  console.log(result);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (location.state?.restore) {
      setValue(location.state.searchValue);
      setCurrentPage(location.state.page);
      handleSubmit(undefined, location.state.page, true);
    }
  }, [location.key]);

  const handleSubmit = async (
    e?: React.FormEvent,
    page: number = 1,
    isPagination: boolean = false,
  ) => {
    if (e) e.preventDefault();

    if (!value.trim()) {
      setError("Введите значение для поиска");
      return;
    }
    if (location.state?.restore && value.trim())
      if (!isPagination) setResult([]);

    if (!isPagination) {
      setCurrentPage(1);
      setTotalPages(1);
    }

    setLoading(true);
    setError(null);
    setSeeSearch(false);

    try {
      let endpoint = "";

      const params: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
      };

      switch (mode) {
        case "name":
          endpoint = "/api/v1/search/by-name";
          params.name = value;
          break;

        case "phone":
          endpoint = "/api/v1/search";
          params.phone = normalizePhone(value);
          break;

        case "email":
          endpoint = "/api/v1/search";
          params.email = value;
          break;

        case "snils":
          endpoint = "/api/v1/search";
          params.snils = value;
          break;

        case "ipn":
          endpoint = "/api/v1/search";
          params.ipn = value;
          break;

        // case "id":
        //   endpoint = "/api/v1/search";
        //   params.person_id = value;
        //   break;

        case "address":
          endpoint = "/api/v1/search/by-address";
          params.address = value;
          break;
      }
      const qs = new URLSearchParams(params).toString();

      const response = await userApi.post<SearchResponse>(
        `${endpoint}?${qs}`,
        null,
        { headers: getHeaders() },
      );

      setSeeSearch(true);
      setRes(response.data);

      if ("entity" in response.data) {
        setResult(
          response.data.total_records_found === 0
            ? []
            : [response.data.entity as any],
        );
      } else {
        setResult(response.data.results ?? []);
      }

      setTotalPages(response.data.total_pages ?? 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(
        err?.response?.status === 500
          ? "Сервер временно недоступен"
          : "Ошибка поиска",
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
          <div className="flex gap-2">
            {SEARCH_TABS.map((tab) => {
              const isDisabled = false;

              return (
                <button
                  key={tab.key}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;

                    setMode(tab.key);
                    setValue("");
                    setResult([]);
                    setSeeSearch(false);
                  }}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-[14px] transition",
                    isDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : mode === tab.key
                        ? "bg-cyan-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={SEARCH_TABS.find((t) => t.key === mode)?.placeholder}
              className="flex-1 h-[42px] px-4 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-cyan"
            />

            <button
              className="px-6 h-[42px] bg-cyan-500 text-white rounded-lg
               hover:bg-cyan-600 transition"
            >
              Найти
            </button>
          </form>

          {/* {mode === "address" && (
            <p className="text-xs text-slate-500">
              Пример: Москва, ул. Ильинка, д. 23/16
            </p>
          )} */}

          <p className="text-[13px] text-slate-500">
            Система автоматически определит тип данных
          </p>

          {seeSearch && (
            <div className="text-[14px] text-slate-600">
              Найдено:{" "}
              {res.count === 10
                ? "Очень много совпадений, уточните запрос"
                : res.count || res.total_pages > 0
                  ? res.total
                  : 0}
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

            {result.length === 0 &&
              res?.total_records_found === 0 &&
              !loading && (
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
                  {item.emails?.[0] ?? "-"}
                </span>

                <span className="text-center">{item.phones?.[0] ?? "-"}</span>

                <span
                  className="text-cyan-600 font-medium text-center"
                  onClick={() =>
                    navigate(`/account/search/${item.entity_id}`, {
                      state: {
                        item,
                        searchValue: value,
                        page: currentPage,
                      },
                    })
                  }
                >
                  Подробнее →
                </span>
              </motion.div>
            ))}
          </div>

          {/* pagination */}
          {!loading && result.length > 0 && totalPages > 1 && (
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
