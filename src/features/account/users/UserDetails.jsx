import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import axios from "axios";
import { IoExitOutline } from "react-icons/io5";
import Loader from "../../../components/loader/Loader";

const API_URL = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users/${id}`, {
        headers: getHeaders(),
      });
      const u = res.data;

      // Преобразуем поля под UI
      setUser({
        id: u.id,
        nickName: u.username,
        name: u.first_name,
        surname: u.last_name,
        email: u.email,
        role: u.role === "user" ? "User" : "Admin",
        registrationDate: new Date(u.registration_date).toLocaleDateString(),
        status: u.is_blocked ? "Blocked" : "Active",
        confirmationEmail: u.is_email_verified ? "Yes" : "No",
        balance: u.balance || 0,
        freeRequest: u.free_requests_count || 0,
        allRequest: u.all_requests_count || 0,
        totalSpend: u.total_spent || 0,
      });
    } catch (err) {
      console.error("Ошибка при получении пользователя:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div>User not found</div>;

  return (
    <section className="p-6 flex flex-col gap-4">
      <div className="title">Пользователь: {user.name}</div>

      <div className="flex gap-10">
        {/* left content */}
        <div className="border flex flex-col gap-5 p-4 rounded-[12px]">
          <form className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <label className="mb-1 text-gray01 font-medium">Имя:</label>
              <input
                type="text"
                defaultValue={user.name}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex items-center gap-5">
              <label className="mb-1 text-gray01 font-medium">Фамилия:</label>
              <input
                type="text"
                defaultValue={user.surname}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex items-center gap-5">
              <label className="mb-1 text-gray01 font-medium">Email:</label>
              <input
                type="email"
                defaultValue={user.email}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </form>
          <p className="flex items-center gap-5">
            Роль: <span>{user.role}</span>
          </p>
          <p className="flex items-center gap-5">
            Дата регистрации: <span>{user.registrationDate}</span>
          </p>
          <p className="flex items-center gap-5">
            Подтверждение почты:{" "}
            <span
              className={clsx(
                "px-2 py-1 rounded-[8px]",
                user.confirmationEmail === "Yes"
                  ? "bg-green-400"
                  : "bg-red-500 text-white"
              )}
            >
              {user.confirmationEmail}
            </span>
          </p>
          <p className="flex items-center gap-5">
            Статус:{" "}
            <span
              className={clsx(
                "px-2 py-1 rounded-[8px]",
                user.status === "Active"
                  ? "bg-green-400"
                  : "bg-red-500 text-white"
              )}
            >
              {user.status}
            </span>
          </p>
        </div>
        {/* right content */}
        <div className="border flex flex-col gap-5 p-4 rounded-[12px]">
          <p className="flex items-center gap-5 text-gray01">
            Баланс: <span className="text-black">{user.balance}</span>
          </p>
          <p className="flex items-center gap-5 text-gray01">
            Осталось бесплатных запросов:{" "}
            <span className="text-black">{user.freeRequest}</span>
          </p>
          <p className="flex items-center gap-5 text-gray01">
            Всего запросов:{" "}
            <span className="text-black">{user.allRequest}</span>
          </p>
          <p className="flex items-center gap-5 text-gray01">
            Всего потрачено:{" "}
            <span className="text-black">{user.totalSpend}</span>
          </p>
        </div>
      </div>
      <div>
        <button
          onClick={() => navigate("/account/users")}
          className="flex items-center gap-3 border px-3 py-2 rounded-[8px] hover:bg-gray-400 hover:text-white transition"
        >
          <IoExitOutline className="rotate-180 h-[25px] w-[25px]" />
          Назад
        </button>
      </div>
    </section>
  );
};

export default UserDetails;
