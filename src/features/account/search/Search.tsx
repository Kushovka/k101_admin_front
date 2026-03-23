import clsx from "clsx";
import { motion } from "framer-motion";
import React, { ReactElement, SVGProps, useEffect, useState } from "react";
import { BsPassportFill } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import {
  IoCallSharp,
  IoCardSharp,
  IoDocumentTextSharp,
  IoLocationSharp,
  IoMailSharp,
  IoMaleFemale,
  IoPersonSharp,
} from "react-icons/io5";
import { PiCityFill } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
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

const SEARCH_TABS: {
  key: SearchMode;
  label: string;
  placeholder: string;
  icon: ReactElement<SVGProps<SVGAElement>>;
}[] = [
  {
    key: "gender",
    label: "Пол",
    placeholder: "м/ж/мужской/женский",
    icon: <IoMaleFemale />,
  },
  {
    key: "phone",
    label: "Телефон",
    placeholder: "+7 999 123-45-67",
    icon: <IoCallSharp />,
  },
  {
    key: "email",
    label: "Email",
    placeholder: "example@mail.ru",
    icon: <IoMailSharp />,
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
  {
    key: "passport",
    label: "Серия и номер паспорта",
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
];

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
  const pageSize = 20;

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

  const handleSubmit = async (
    e?: React.FormEvent,
    page = 1,
    overrideValues?: Record<SearchMode, string>,
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
      setError("Введите хотя бы один параметр поиска");
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
      setError(
        err?.response?.status === 500 ? "Ошибка сервера" : "Ошибка поиска",
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
      <div className="max-w-[1500px] w-full mx-auto flex flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-slate-900">Поиск</h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex  gap-5"
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
                    <FaCalendarAlt />
                  </span>
                  Дата рождения
                </div>

                <div>
                  <input
                    type="text"
                    className="h-[38px] px-2 text-[14px] border border-gray-300 rounded-lg w-full"
                    placeholder="ДД.ММ.ГГГГ"
                    maxLength={10}
                    value={values.birthday}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 8);

                      // автоформат
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
                </div>

                <div className="text-xs text-slate-500">или диапазон</div>
                <div className="flex gap-2">
                  <div>
                    <span className="text-xs text-slate-500">от:</span>
                    <input
                      type="date"
                      className="h-[38px] px-2 text-[14px] border border-gray-300 rounded-lg w-full"
                      value={values.birthday_from}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          birthday_from: e.target.value,
                          birthday: "",
                        }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">до:</span>
                    <input
                      type="date"
                      className="h-[38px] px-2 text-[14px] border border-gray-300 rounded-lg w-full"
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
              </motion.div>
              {SEARCH_TABS.map((tab) => (
                <motion.div
                  key={tab.key}
                  className={clsx(
                    "bg-white border rounded-xl p-4 cursor-pointer transition flex flex-col gap-3",
                    mode === tab.key
                      ? "border-cyan-500 shadow"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                  onClick={() => setMode(tab.key)}
                >
                  <div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                    <span className="text-[18px]">{tab.icon}</span>
                    {tab.label}
                  </div>

                  <input
                    type="text"
                    placeholder={tab.placeholder}
                    className="h-[38px] px-3 border border-gray-300 rounded-lg"
                    value={values[tab.key]}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [tab.key]: e.target.value,
                      }))
                    }
                  />
                </motion.div>
              ))}

              <button
                type="submit"
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
    </section>
  );
};

export default Search;
