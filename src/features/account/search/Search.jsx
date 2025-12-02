import { useState } from "react";
import clsx from "clsx";
import axios from "axios";
import Loader from "../../../components/loader/Loader";
import { useNavigate } from "react-router-dom";

const API_URL = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    person_id: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);

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
    if (!isPagination) {
      setResult([]);
    }
    setLoading(true);
    setError("");

    try {
      const params = {
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        person_id: form.person_id.trim() || null,
        email: form.email.trim() || null,
        page,
        page_size: pageSize,
      };

      const res = await axios.post(`${API_URL}/admin/search`, null, {
        params,
        headers: getHeaders(),
      });

      setResult(res.data.results || null);
      setTotalPages(res.data.total_pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Ошибка поиска");
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

  console.log(result);
  return (
    <section className="section">
      <div className="flex flex-col gap-5">
        <div className="title">Поиск</div>
        <form onSubmit={handleSubmit} className="flex gap-4 w-[250px]">
          <input
            name="name"
            type="text"
            placeholder="*name"
            value={form.name}
            onChange={handleChange}
            className="border-2 rounded-[6px] px-3"
          />
          <input
            name="phone"
            type="text"
            placeholder="*phone"
            value={form.phone}
            onChange={handleChange}
            className="border-2 rounded-[6px] px-3"
          />
          <input
            name="person_id"
            type="text"
            placeholder="*person_id"
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
            className="bg-[#006dd2]/80 text-white rounded py-2 px-3 uppercase hover:bg-[#006dd2]
          w-full  transition duration-300"
          >
            найти
          </button>
        </form>
      </div>

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
            <div className="flex flex-col items-center justify-center mb-4 text-error">
              {error}
              <span className="text-[30px]">😡</span>
            </div>
          )}

          {result.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-7 gap-4 text-gray-600 text-center py-2 border-b"
            >
              <span>{index + 1}</span>
              <span>{item._source.last_name || "-"}</span>
              <span>{item._source.first_name || "-"}</span>
              <span>{item._source.middle_name || "-"}</span>
              <span>{item._source.email || "-"}</span>
              <span>{item._source.phone || "-"}</span>
              <div
                onClick={() =>
                  navigate(`/account/search/${item._id}`, {
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
