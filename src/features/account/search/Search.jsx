import { useState } from "react";
import clsx from "clsx";
import axios from "axios";
import Loader from "../../../components/loader/Loader";

const API_URL = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

const Search = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    person_id: "",
    page: 1,
    page_size: 10,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");

  const chapterTitleSearch = [
    { id: 1, title: "№" },
    { id: 2, title: "name" },
    { id: 3, title: "phone" },
    { id: 4, title: "person_id" },
    { id: 5, title: "page" },
    { id: 6, title: "page_size" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult([]);

    try {
      let endpoint = "";
      let body = {};

      if (form.name) {
        endpoint = "by-name";
        body = { name: form.name, page: form.page, page_size: form.page_size };
      } else if (form.phone) {
        endpoint = "by-phone";
        body = {
          phone: form.phone,
          page: form.page,
          page_size: form.page_size,
        };
      } else if (form.person_id) {
        endpoint = "by-id";
        body = {
          person_id: form.person_id,
          page: form.page,
          page_size: form.page_size,
        };
      } else {
        setError("Заполните хотя бы одно поле");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/v1/search/${endpoint}`,
        body,
        {
          headers: getHeaders(),
        }
      );

      setResult(res.data.results || []);
    } catch (err) {
      console.error(err);
      setError("Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  console.log(result);
  return (
    <section className="p-6 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="title">Поиск</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[250px]">
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
            name="page"
            type="number"
            placeholder="*page"
            value={form.page}
            onChange={handleChange}
            className="border-2 rounded-[6px] px-3"
          />
          <input
            name="page_size"
            type="number"
            placeholder="*page_size"
            value={form.page_size}
            onChange={handleChange}
            className="border-2 rounded-[6px] px-3"
          />
          <button className="bg-[#006dd2]/80 text-white rounded py-1 uppercase hover:bg-[#006dd2] transition duration-300">
            найти
          </button>
        </form>
      </div>

      {result.length >= 0 && (
        <div>
          <div className="grid grid-cols-6 gap-4 text-gray-600 font-medium border-b pb-2">
            {chapterTitleSearch.map((chapter) => (
              <span
                key={chapter.id}
                className={clsx(
                  "flex items-center justify-center text-[12px]",
                  chapter.id === chapterTitleSearch.length ? "" : "border-r"
                )}
              >
                {chapter.title}
              </span>
            ))}
          </div>
          {loading && <Loader />}
          {error && <p className="text-red-500">{error}</p>}

          {result.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 text-gray-600 text-center py-2 border-b"
            >
              <span>{index + 1}</span>
              <span>{item.name || "-"}</span>
              <span>{item.phone || "-"}</span>
              <span>{item.person_id || "-"}</span>
              <span>{form.page}</span>
              <span>{form.page_size}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Search;
