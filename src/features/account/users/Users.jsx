import { useState, useEffect } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import { addUsers, getUsers } from "../../../api/admin";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { IoClose } from "react-icons/io5";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const { isOpen } = useSidebar();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setError("");

      const formattedUsers = res.users.map((u) => ({
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

  const addUser = async () => {
    if (!email || !first_name || !last_name || !username) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      await addUsers(email, first_name, last_name, role, username);
      await fetchUsers();
      setOpenCreateModal(false);
      setEmail("");
      setFirstName("");
      setLastName("");
      setUsername("");
      setRole("user");
    } catch (err) {
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
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Пользователи</div>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-8 gap-4 text-gray01 font-medium border-b pb-2">
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
                className="grid grid-cols-8 gap-4 text-gray01 font-medium text-center text-[12px] items-center border-b py-2 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/account/users/${user.identifier}`)}
              >
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

          {/* add button */}
          <div
            onClick={() => setOpenCreateModal((prev) => !prev)}
            className="absolute bottom-8 right-8 hover:bottom-4 hover:right-4 border rounded-full p-4 group cursor-pointer hover:bg-green-300/50 transition-all duration-300 "
          >
            <IoClose className="group-hover:w-16 group-hover:h-16 w-8 h-8 rotate-45 transition-all duration-300 cursor-pointer" />
          </div>

          {openCreateModal && (
            <div
              onClick={() => setOpenCreateModal(false)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 rounded-lg w-80 flex flex-col gap-4"
              >
                <p className="text-lg font-semibold mb-4 text-center">
                  Создание нового пользователя
                </p>

                <div className="flex flex-col gap-2">
                  <label>Никнейм</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Никнейм"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label>Имя</label>
                  <input
                    type="text"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Имя"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Фамилия"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label>Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>

                <button
                  onClick={addUser}
                  type="button"
                  className="uppercase border px-2 py-1 rounded text-black font-medium hover:bg-green-500/70 transition duration-300 w-full"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
