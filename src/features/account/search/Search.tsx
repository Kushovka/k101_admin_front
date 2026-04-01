import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement, useEffect, useState } from "react";
import { BsPassportFill } from "react-icons/bs";
import {
  IoCallSharp,
  IoCardSharp,
  IoDocumentTextSharp,
  IoLocationSharp,
  IoMaleFemale,
  IoPersonSharp,
} from "react-icons/io5";
import { PiCityFill } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";

import { SearchResponse, SearchResultItem } from "../../../types/search";
import { useSearch } from "./SearchContext";

type SearchMode =
  | "name"
  | "phone"
  | "email"
  | "snils"
  | "ipn"
  | "address"
  | "city"
  | "passport"
  | "gender"
  | "birthday"
  | "birthday_from"
  | "birthday_to";

type SearchField = {
  key: SearchMode;
  label: string;
  placeholder: string;
  icon: ReactElement;
  type?: "input" | "birthday";
};

type SearchGroup = {
  title: string;
  fields: SearchField[];
};

const SEARCH_GROUPS: SearchGroup[] = [
  {
    title: "Личная информация",
    fields: [
      {
        key: "gender",
        label: "Пол",
        placeholder: "м/ж",
        icon: <IoMaleFemale />,
      },
      {
        key: "phone",
        label: "Телефон",
        placeholder: "+7 999 123-45-67",
        icon: <IoCallSharp />,
      },
      {
        key: "birthday",
        type: "birthday",
        label: "",
        placeholder: "",
        icon: <></>,
      },
      {
        key: "address",
        label: "Адрес",
        placeholder: "Город, улица, дом",
        icon: <IoLocationSharp />,
      },
      {
        key: "city",
        label: "Город",
        placeholder: "Москва",
        icon: <PiCityFill />,
      },
    ],
  },
  {
    title: "Документы",
    fields: [
      {
        key: "passport",
        label: "Паспорт",
        placeholder: "4510 123456",
        icon: <BsPassportFill />,
      },
      {
        key: "snils",
        label: "СНИЛС",
        placeholder: "123-456-789 00",
        icon: <IoDocumentTextSharp />,
      },
      {
        key: "ipn",
        label: "ИНН",
        placeholder: "123456789000",
        icon: <IoCardSharp />,
      },
    ],
  },
];
const FILTER_LABELS: Record<string, string> = {
  name: "ФИО",
  phone: "Телефон",
  email: "Email",
  snils: "СНИЛС",
  ipn: "ИНН",
  address: "Адрес",
  city: "Город",
  passport: "Паспорт",
  gender: "Пол",
  birthday: "Дата рождения",
  birthday_from: "Дата от",
  birthday_to: "Дата до",
};

const FILTER_GROUPS: Record<string, string> = {
  name: "Основное",
  birthday: "Основное",
  birthday_from: "Основное",
  birthday_to: "Основное",

  phone: "Личная информация",
  email: "Личная информация",
  gender: "Личная информация",
  address: "Личная информация",
  city: "Личная информация",

  passport: "Документы",
  snils: "Документы",
  ipn: "Документы",
};
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notify, setNotify] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeSearch, setSeeSearch] = useState(false);
  const [mode, setMode] = useState<SearchMode>("name");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Основное: true,
    "Личная информация": true,
    Документы: true,
  });

  // хранит значения всех табов
  const [values, setValues] = useState<Record<SearchMode, string>>({
    name: "",
    phone: "",
    email: "",
    snils: "",
    ipn: "",
    address: "",
    city: "",
    passport: "",
    gender: "",
    birthday: "",
    birthday_from: "",
    birthday_to: "",
  });

  const { isOpen } = useSidebar();
  const pageSize = 15;

  const {
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
    res: SearchResponse | null;
    setRes: React.Dispatch<React.SetStateAction<SearchResponse>>;
  };

  /* ---------------- helpers ---------------- */
  const chapterTitleSearch = [
    { id: 1, title: "№" },
    { id: 2, title: "Фамилия" },
    { id: 3, title: "Имя" },
    { id: 4, title: "Отчество" },
    { id: 5, title: "Email" },
    { id: 6, title: "Телефон" },
    { id: 7, title: "Подробнее..." },
  ];

  const hasData = (item: SearchResultItem) => {
    return (
      cleanValue(item.last_name) ||
      cleanValue(item.first_name) ||
      cleanValue(item.middle_name) ||
      cleanValue(item.emails?.[0]) ||
      cleanValue(item.phones?.[0])
    );
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const cleanValue = (value: unknown) => {
    if (value === null || value === undefined) return "";
    return String(value)
      .trim()
      .replace(/^['"]+|['"]+$/g, "");
  };

  const normalizePhone = (raw: string) => {
    let phone = raw.replace(/\D/g, "");
    if (phone.startsWith("8")) phone = "7" + phone.slice(1);
    if (phone.startsWith("9")) phone = "7" + phone;
    if (!phone.startsWith("7")) phone = "7" + phone;
    return "+" + phone;
  };

  useEffect(() => {
    setResult([]);
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  useEffect(() => {
    if (location.state?.restore) {
      const restoredMode = location.state.mode ?? "name";
      const restoredValues =
        location.state.values ??
        ({
          name: "",
          phone: "",
          email: "",
          snils: "",
          ipn: "",
          address: "",
          city: "",
          passport: "",
          gender: "",
          birthday: "",
          birthday_from: "",
          birthday_to: "",
        } as Record<SearchMode, string>);

      setMode(restoredMode);
      setValues(restoredValues);
      handleSubmit(undefined, location.state.page ?? 1, restoredValues);
    }
  }, [location.state]);

  useEffect(() => {
    const saved = localStorage.getItem("search_groups");
    if (saved) setOpenGroups(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("search_groups", JSON.stringify(openGroups));
  }, [openGroups]);

  const handleSubmit = async (
    e?: React.FormEvent,
    page = 1,
    overrideValues?: Record<SearchMode, string>,
    options?: { silent?: boolean },
  ) => {
    e?.preventDefault();

    const params: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
      cascade_mode: "quick",
    };

    const searchValues = overrideValues ?? { ...values };

    if (searchValues.birthday) {
      searchValues.birthday_from = "";
      searchValues.birthday_to = "";
    }

    Object.entries(searchValues).forEach(([key, value]) => {
      const v = value.trim();

      if (!v) return;

      if (key === "phone") {
        params.phone = normalizePhone(v);
      } else {
        params[key] = v;
      }
    });

    const filledFields = Object.entries(searchValues).filter(
      ([, value]) => value.trim() !== "",
    );

    if (filledFields.length === 0) {
      setSeeSearch(false);
      setResult([]);

      // ❗ показываем ошибку только если НЕ silent
      if (!options?.silent) {
        setError("Введите хотя бы один параметр поиска");
      }

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams(params).toString();

      const response = await userApi.post<SearchResponse>(
        `/api/v1/search/advanced?${qs}`,
        null,
        { headers: getHeaders() },
      );

      setRes(response.data);
      setResult(response.data.entities?.map((item) => item.entity) ?? []);
      setTotalPages(Math.ceil((response.data.total_entities ?? 0) / pageSize));
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
    <section
      className={clsx(
        "section py-20 pr-[36px]",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      <div className="w-full mx-auto flex flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-slate-900">Поиск</h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border-t border-gray-200 rounded-xl shadow-sm p-6 flex  gap-5"
        >
          <div className="grid grid-cols-[320px_1fr] gap-6">
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => handleSubmit(e)}
            >
              <motion.div className="bg-white border rounded-xl p-4 flex flex-col gap-3 border-gray-200 hover:border-gray-300">
                <div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                  <span className="text-[18px]">
                    <IoPersonSharp />
                  </span>
                  ФИО
                </div>

                <div>
                  <input
                    placeholder="Фамилия Имя Отчество"
                    type="text"
                    className="h-[38px] px-3 border border-gray-300 rounded-lg w-full"
                    value={values.name}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
              </motion.div>

              <motion.div className="bg-white border rounded-xl p-4 flex flex-col gap-3 border-gray-200 hover:border-gray-300">
                <div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                  <span className="text-[18px]">
                    <IoPersonSharp />
                  </span>
                  Email
                </div>

                <div>
                  <input
                    placeholder="example@mail.ru"
                    type="text"
                    className="h-[38px] px-3 border border-gray-300 rounded-lg w-full"
                    value={values.email}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => setIsFiltersOpen(true)}
                className="h-[40px] border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50"
              >
                + Дополнительные фильтры
              </button>

              <button
                type="submit"
                onClick={() => handleSubmit(undefined, 1)}
                className="mt-2 h-[44px] bg-cyan-500 text-white rounded-lg font-medium
  hover:bg-cyan-600 transition"
              >
                Найти
              </button>
            </form>
          </div>

          <div className="w-full">
            {/* {seeSearch && (
              <div className="text-[14px] text-slate-600">
                Найдено: {result.filter(hasData).length}
              </div>
            )} */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(values).map(([key, value]) => {
                if (!value) return null;

                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 
                   bg-cyan-50 text-cyan-700 
                   border border-cyan-200 
                   rounded-full text-[12px] font-medium
                   hover:bg-cyan-100 transition"
                  >
                    <span className="opacity-70">
                      {FILTER_LABELS[key] || key}:
                    </span>

                    <span className="truncate max-w-[120px]">{value}</span>

                    <button
                      onClick={() => {
                        setValues((prev) => {
                          const updated = { ...prev, [key]: "" };
                          handleSubmit(undefined, 1, updated, { silent: true });
                          return updated;
                        });
                      }}
                      className="w-4 h-4 flex items-center justify-center 
                     rounded-full hover:bg-cyan-200 transition"
                    >
                      ✕
                    </button>
                  </motion.div>
                );
              })}
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 text-slate-700 text-[12px] uppercase tracking-wide font-medium py-3">
                {chapterTitleSearch.map((chapter) => (
                  <div key={chapter.id} className="text-center">
                    {chapter.title}
                  </div>
                ))}
              </div>

              {seeSearch && !loading && result.filter(hasData).length === 0 && (
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
                          navigate(`/account/search/${item.entity_id}`, {
                            state: {
                              item,
                              page: currentPage,
                              mode,
                              values,
                              from: "search",
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
        </motion.div>
      </div>
      <AnimatePresence>
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-black/30"
              onClick={() => setIsFiltersOpen(false)}
            />

            {/* panel */}
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-[420px] bg-white h-full shadow-xl p-5 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[16px] font-semibold">
                  Дополнительные фильтры
                </h2>
                <button onClick={() => setIsFiltersOpen(false)}>✕</button>
              </div>

              <div className="flex flex-col gap-3">
                {SEARCH_GROUPS.map((group) => {
                  const isOpen = openGroups[group.title];

                  return (
                    <div
                      key={group.title}
                      className="flex flex-col gap-3 pb-3 border-b last:border-none"
                    >
                      {/* header */}
                      <div
                        onClick={() => toggleGroup(group.title)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="text-[13px] font-semibold text-slate-500">
                          {group.title}
                        </span>

                        <motion.span
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400"
                        >
                          ▶
                        </motion.span>
                      </div>

                      {/* content */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden flex flex-col gap-3"
                          >
                            {group.fields.map((field, index) => {
                              if (field.type === "birthday") {
                                return (
                                  <div
                                    key="birthday"
                                    className="flex flex-col gap-2"
                                  >
                                    <div className="text-xs text-gray-500">
                                      Дата рождения
                                    </div>

                                    <div className="border rounded-xl p-3 flex flex-col gap-2">
                                      <input
                                        type="text"
                                        className="h-[36px] px-2 text-[14px] border border-gray-300 rounded-lg"
                                        placeholder="ДД.ММ.ГГГГ"
                                        maxLength={10}
                                        value={values.birthday}
                                        onChange={(e) => {
                                          let v = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 8);

                                          if (v.length >= 5)
                                            v = `${v.slice(0, 2)}.${v.slice(2, 4)}.${v.slice(4)}`;
                                          else if (v.length >= 3)
                                            v = `${v.slice(0, 2)}.${v.slice(2)}`;

                                          setValues((prev) => ({
                                            ...prev,
                                            birthday: v,
                                            birthday_from: "",
                                            birthday_to: "",
                                          }));
                                        }}
                                      />

                                      <div className="text-xs text-slate-500">
                                        или диапазон
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <input
                                          type="date"
                                          className="h-[36px] px-2 border border-gray-300 rounded-lg"
                                          value={values.birthday_from}
                                          onChange={(e) =>
                                            setValues((prev) => ({
                                              ...prev,
                                              birthday_from: e.target.value,
                                              birthday: "",
                                            }))
                                          }
                                        />

                                        <input
                                          type="date"
                                          className="h-[36px] px-2 border border-gray-300 rounded-lg"
                                          value={values.birthday_to}
                                          onChange={(e) =>
                                            setValues((prev) => ({
                                              ...prev,
                                              birthday_to: e.target.value,
                                              birthday: "",
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // обычные поля
                              return (
                                <div
                                  key={field.key}
                                  className="flex flex-col gap-1"
                                >
                                  <label className="text-xs text-gray-500">
                                    {field.label}
                                  </label>

                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                                      {field.icon}
                                    </span>

                                    <input
                                      type="text"
                                      placeholder={field.placeholder}
                                      className="h-[36px] pl-8 pr-2 border border-gray-300 rounded-md w-full"
                                      value={values[field.key]}
                                      onChange={(e) =>
                                        setValues((prev) => ({
                                          ...prev,
                                          [field.key]: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-0 bg-white pt-4 flex gap-2">
                <button
                  onClick={() =>
                    setValues({
                      name: "",
                      phone: "",
                      email: "",
                      snils: "",
                      ipn: "",
                      address: "",
                      city: "",
                      passport: "",
                      gender: "",
                      birthday: "",
                      birthday_from: "",
                      birthday_to: "",
                    })
                  }
                  className="flex-1 border rounded-lg h-[40px]"
                >
                  Очистить
                </button>

                <button
                  onClick={() => {
                    setIsFiltersOpen(false);
                    handleSubmit(undefined, 1);
                  }}
                  className="flex-1 bg-cyan-500 text-white rounded-lg h-[40px]"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Search;
