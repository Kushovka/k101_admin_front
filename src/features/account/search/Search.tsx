import React, { useState } from "react";
import clsx from "clsx";
import Loader from "../../../components/loader/Loader";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import Toast from "../../../components/toast/Toast";
import { useSearch } from "./SearchContext";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "framer-motion";

import {
  SearchForm,
  SearchResultItem,
  SearchResponse,
} from "../../../types/search";

// const API_URL = "http://192.168.0.45:18000/search/dynamic";
const API_URL = "http://192.168.0.45:18101/admin/search";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
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
          baseParams.person_id = raw;
        } else if (isId) {
          baseParams.email = raw;
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
      <div className="flex flex-col gap-5">
        <div className="title">Поиск</div>
        {notify && (
          <Toast
            type={"access"}
            message={"СКОПИРОВАНО!"}
            onClose={() => setNotify(null)}
          />
        )}
        <div className="flex items-center justify-center pb-10">
          <form onSubmit={handleSubmit} className="flex gap-4 ">
            <input
              name="name"
              type="text"
              placeholder="ФИО"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-2 rounded-[6px] px-3 w-[500px]"
            />
            <button
              data-tooltip-id="add_plans-tooltip"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              найти
            </button>
          </form>
          {/* <button
            className="w-full flex items-center justify-center gap-1 text-common text-[16px]"
            onClick={() => setAdditionalOption((prev) => !prev)}
          >
            Дополнительные параметры поиска{" "}
            {additionalOption ? (
              <IoIosArrowDown className="w-6 h-6 rotate-180 transition-all duration-300" />
            ) : (
              <IoIosArrowDown className="w-6 h-6 transition-all duration-300" />
            )}
          </button> */}
        </div>
        {/* {additionalOption && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="flex gap-4"
          >
            <input
              name="name"
              type="text"
              placeholder="ФИО"
              value={form.name}
              onChange={handleChange}
              className="border-2 rounded-[6px] px-3 py-2"
            />
            <input
              name="phone"
              type="text"
              placeholder="телефон"
              value={form.phone}
              onChange={handleChange}
              className="border-2 rounded-[6px] px-3"
            />
            <input
              name="person_id"
              type="text"
              placeholder="person_id"
              value={form.person_id}
              onChange={handleChange}
              className="border-2 rounded-[6px] px-3"
            />
            <input
              name="email"
              type="text"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border-2 rounded-[6px] px-3"
            />
          </motion.form>
        )} */}
      </div>

      {seeSearch && (
        <div className="text-common">
          Найдено:{" "}
          {res.count === 10
            ? "Очень много совпадений, введите дополнительные параметры"
            : `${res.count || res.total_pages}`}
        </div>
      )}
      {result.length >= 0 && (
        <div>
          <div className="grid grid-cols-7 gap-4 text-gray-600 font-medium border-b pb-2">
            {chapterTitleSearch.map((chapter) => (
              <div
                key={chapter.id}
                className={clsx(
                  "flex items-center justify-center text-[12px]",
                  chapter.id === chapterTitleSearch.length ? "" : "border-r",
                )}
              >
                <p>{chapter.title}</p>
              </div>
            ))}
          </div>
          {loading && <Loader />}
          {error && (
            <Toast
              message={error}
              type="error"
              onClose={() => setError(null)}
            />
          )}

          {result.map((item, index) => (
            <div
              key={item.entity_id}
              className="grid grid-cols-7 gap-4 text-[13px] text-gray-600 text-center py-2 border-b"
            >
              <span>{(currentPage - 1) * pageSize + index + 1}</span>
              <span
                className="cursor-copy"
                onClick={() => handleCopy(item.last_name || "")}
              >
                {item.last_name || "-"}
              </span>
              <span
                className="cursor-copy"
                onClick={() => handleCopy(item.first_name || "")}
              >
                {item.first_name || "-"}
              </span>
              <span
                className="cursor-copy"
                onClick={() => handleCopy(item.middle_name || "")}
              >
                {item.middle_name || "-"}
              </span>
              <span
                className="cursor-copy"
                onClick={() => handleCopy(item.emails[0] || "")}
              >
                {item.emails[0] || "-"}
              </span>
              <span
                className="cursor-copy"
                onClick={() => handleCopy(item.phones[0] || "")}
              >
                {item.phones[0] || "-"}
              </span>
              <div
                onClick={() =>
                  navigate(`/account/search/${item.entity_id}`, {
                    state: item,
                  })
                }
                className="text-center text-blue-500 underline cursor-pointer"
              >
                Подробнее...
              </div>
            </div>
          ))}
        </div>
      )}
      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handleSubmit(undefined, page, true)}
              className={clsx(
                "px-3 py-1 rounded border",
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100",
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Search;
