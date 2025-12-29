import { useState } from "react";
import clsx from "clsx";
import Loader from "../../../components/loader/Loader";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../../components/toast/Toast";
import { useSearch } from "./SearchContext";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "framer-motion";

// const API_URL = "http://192.168.0.45:18000/search/dynamic";
const API_URL = "http://192.168.0.45:18101/admin/search";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seeSearch, setSeeSearch] = useState(false);
  const [additionalOption, setAdditionalOption] = useState(false);
  const { isOpen } = useSidebar();

  const pageSize = 10;

  const {
    form,
    setForm,
    result,
    setResult,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    res,
    setRes,
  } = useSearch();

  const chapterTitleSearch = [
    { id: 1, title: "№" },
    { id: 2, title: "Фамилия" },
    { id: 3, title: "Имя" },
    { id: 4, title: "Отчество" },
    { id: 5, title: "Email" },
    { id: 6, title: "Телефон" },
    { id: 7, title: "Подробнее..." },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, page = 1, isPagination = false) => {
    if (e) e.preventDefault();

    if (!form.name && !form.phone && !form.person_id && !form.email) {
      setError("Введите хотя бы одно поле для поиска");
      return;
    }

    if (!isPagination) setResult([]);
    setLoading(true);
    setError("");

    setSeeSearch(false);

    try {
      // Формируем query string
      const query = new URLSearchParams({
        page,
        page_size: pageSize,
        ...(form.name.trim() && { name: form.name.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.person_id.trim() && { person_id: form.person_id.trim() }),
        ...(form.email.trim() && { email: form.email.trim() }),
      }).toString();

      const res = await api.post(`${API_URL}?${query}`, null, {
        headers: getHeaders(),
      });
      setSeeSearch(true);
      setRes(res.data);
      setResult(res.data.results || []);
      setTotalPages(res.data.total_pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
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

  console.log(result);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotify(true);
      setTimeout(() => setNotify(false), 2000);
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
        {notify && <Toast type={"access"} message={"СКОПИРОВАНО!"} />}
        <div className="flex items-center justify-center">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              name="name"
              type="text"
              placeholder="ФИО"
              value={form.name}
              onChange={handleChange}
              className="border-2 rounded-[6px] px-3"
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
            <button
              data-tooltip-id="add_plans-tooltip"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              найти
            </button>
          </form>
          <button
            className="w-full flex items-center justify-center gap-1 text-common text-[16px]"
            onClick={() => setAdditionalOption((prev) => !prev)}
          >
            Дополнительные параметры поиска{" "}
            {additionalOption ? (
              <IoIosArrowDown className="w-6 h-6 rotate-180 transition-all duration-300" />
            ) : (
              <IoIosArrowDown className="w-6 h-6 transition-all duration-300" />
            )}
          </button>
        </div>
        {additionalOption && (
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
        )}
      </div>

      {seeSearch && (
        <div className="text-common">
          Найдено:{" "}
          {res.count === 10
            ? "Очень много совпадений, введите дополнительные параметры"
            : `${res.count} результатов`}
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
                  chapter.id === chapterTitleSearch.length ? "" : "border-r"
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
              key={index}
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
              onClick={() => handleSubmit(null, page, true)}
              className={clsx(
                "px-3 py-1 rounded border",
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
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
