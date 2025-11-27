import { useState, useEffect } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../../components/loader/Loader";

const API_URL = "http://192.168.0.45:18001";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: getHeaders(),
      });
      setError("");

      const formattedUsers = res.data.users.map((u) => ({
        id: u.id,
        nickName: u.username,
        name: u.first_name,
        surname: u.last_name,
        email: u.email,
        role: u.role === "user" ? "User" : "Admin",
        registrationDate: new Date(u.registration_date).toLocaleDateString(),
        status: u.is_blocked ? "Blocked" : "Active",
        confirmationEmail: u.is_email_verified ? "Yes" : "No",
        identifier: u.id,
        balance: u.balance || 0,
        freeRequest: u.free_requests_count || 0,
        allRequest: u.all_requests_count || 0,
        totalSpend: u.total_spent || 0,
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error("Ошибка при получении пользователей:", err);
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

  const chapterTitle = [
    { id: 1, title: "№" },
    { id: 2, title: "Никнейм" },
    { id: 3, title: "Имя" },
    { id: 4, title: "Фамилия" },
    { id: 5, title: "Почта" },
    { id: 6, title: "Роль" },
    { id: 7, title: "Дата регистрации" },
    { id: 8, title: "Статус" },
    { id: 9, title: "Идентификатор" },
  ];

  return (
    <section className="px-6 py-4 flex flex-col gap-4">
      <div className="title">Пользователи</div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500 flex items-center justify-center mb-4 font-medium">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-9 gap-4 text-gray01 font-medium border-b pb-2">
            {chapterTitle.map((chapter) => (
              <span
                className={clsx(
                  " flex items-center justify-center text-[12px]",
                  chapter.id === chapterTitle.length ? "" : "border-r"
                )}
                key={chapter.id}
              >
                {chapter.title}
              </span>
            ))}
          </div>
          <div className="flex flex-col">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-9 gap-4 text-gray01 font-medium text-center text-[12px] items-center border-b py-2 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/account/users/${user.identifier}`)}
              >
                <p>{user.id}</p>
                <p>{user.nickName}</p>
                <p>{user.name}</p>
                <p>{user.surname}</p>
                <p
                  className={clsx(
                    "rounded-[4px] text-black/70",
                    user.confirmationEmail === "Yes"
                      ? "bg-green-400/60"
                      : "bg-red-500/60"
                  )}
                >
                  {user.email}
                </p>
                <p>{user.role}</p>
                <p>{user.registrationDate}</p>
                <p>{user.status}</p>
                <p>{user.identifier}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
