import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CgDanger } from "react-icons/cg";
import { IoIosClose, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  addUsers,
  getRequests,
  getUsers,
  isApproveRequest,
  isRejectRequest,
} from "../../../api/users";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import {
  type ApiTelegramUser,
  type CreatedUserResponse,
  type TableUser,
} from "../../../types/user";

type NotifyType = "user_create" | "access_copy";

export default function Users() {
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const [users, setUsers] = useState<TableUser[]>([]);
  const [allRequests, setAllRequests] = useState<ApiTelegramUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [role, setRole] = useState<"user" | "admin">("admin");
  const [username, setUsername] = useState<string>("");
  const [openModal, setOpenModal] = useState<"users" | "requests">("users");

  const [telegramUsersModal, setTelegramUsersModal] = useState<boolean>(false);

  const [dataAddUser, setDataAddUser] = useState<CreatedUserResponse | null>(
    null,
  );
  const [showDataNewUser, setShowDataNewUser] = useState<boolean>(false);
  const [notify, setNotify] = useState<NotifyType | null>(null);

  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);

  /* все пользователи */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await getUsers();


      const formattedUsers: TableUser[] = res.map((u) => ({
        id: u.id,
        nickName: u.username,
        name: u.first_name,
        surname: u.last_name,
        email: u.email,
        role: u.role === "user" ? "User" : "Admin",
        registrationDate: new Date(u.registration_date).toLocaleDateString(),
        status: u.is_blocked ? "Blocked" : "Active",
        identifier: u.id,
        balance: u.balance ?? 0,
        freeRequest: u.free_requests_count ?? 0,
        allRequest: u.all_requests_count ?? 0,
        totalSpend: u.total_spent ?? 0,
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("Ошибка при получении пользователей:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS",
      );
    } finally {
      setLoading(false);
    }
  };

  /* заявки из телеграма */
  useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const res = await getRequests();

        setAllRequests(res);
      } catch (err) {
      } finally {
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await isApproveRequest(id);
      const updated = await getRequests();
      setAllRequests(updated);
    } catch (e) {}
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Причина отказа:") || null;
    try {
      await isRejectRequest(id, reason ?? undefined);
      await getRequests();
    } catch (e) {}
  };

  const pendingRequests = allRequests.filter((r) => r.status === "pending");

  /* добавление пользователя */
  const addUser = async (): Promise<void> => {
    if (!email || !first_name || !last_name || !username || !role) {
      setError("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const res: CreatedUserResponse = await addUsers({
        email,
        first_name,
        last_name,
        role,
        username,
      });
      await fetchUsers();

      setDataAddUser(res);
      setShowDataNewUser(true);
      setNotify("user_create");
      setOpenCreateModal(false);

      setEmail("");
      setFirstName("");
      setLastName("");
      setUsername("");
      setRole("admin");
    } catch (err: any) {
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS",
      );
    } finally {
      setLoading(false);
    }
  };

  /* названия столбцов */
  const chapterTitle = [
    { id: 2, title: "Никнейм" },
    { id: 3, title: "Имя" },
    { id: 4, title: "Фамилия" },
    { id: 5, title: "Почта" },
    { id: 6, title: "Роль" },
    { id: 7, title: "Дата регистрации" },
    { id: 8, title: "Статус" },
    { id: 9, title: "Идентификатор" },
  ] as const;

  const chapterTitleTg = [
    { id: 1, title: "id" },
    { id: 2, title: "Телеграм id" },
    { id: 3, title: "Телеграм Никнейм" },
    { id: 4, title: "id админа" },
    { id: 5, title: "Статус" },
    { id: 6, title: "Дата создания" },
    { id: 7, title: "Действие" },
  ] as const;

  /* функция для копирования */
  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      setNotify("access_copy");
    });
  };

  /* toast кофиг */
  const toastConfig = {
    user_create: {
      message: `Пользователь "${dataAddUser?.username}" успешно создан !`,
    },
    access_copy: {
      message: "СКОПИРОВАНО !",
    },
  };

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all pr-[50px]",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      {loading ? (
        <Loader fullScreen />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full mx-auto flex flex-col gap-6"
        >
          {/* SWITCH HEADER */}
          <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200 bg-white">
            <button
              onClick={() => setOpenModal("users")}
              className={clsx(
                "py-3 text-[18px] font-semibold transition",
                openModal === "users"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50",
              )}
            >
              Пользователи
            </button>
            <button
              onClick={() => setOpenModal("requests")}
              className={clsx(
                "py-3 text-[18px] font-semibold transition",
                openModal === "requests"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50",
              )}
            >
              Заявки из Telegram
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* HEADER */}
            <div
              className={clsx(
                "grid text-sm font-medium text-slate-600 bg-slate-50 border-b border-gray-200",
                openModal === "users" ? "grid-cols-8" : "grid-cols-7",
              )}
            >
              {(openModal === "users" ? chapterTitle : chapterTitleTg).map(
                (c) => (
                  <div
                    key={c.id}
                    className="px-3 py-3 text-center uppercase tracking-wide text-[11px]"
                  >
                    {c.title}
                  </div>
                ),
              )}
            </div>

            {/* BODY */}
            <div className="flex flex-col divide-y divide-gray-100">
              {openModal === "users" &&
                users?.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => navigate(`/account/users/${u.identifier}`)}
                    className="grid grid-cols-8 text-sm text-slate-700 py-3 items-center text-center cursor-pointer hover:bg-slate-50 transition"
                  >
                    <span>{u.nickName}</span>
                    <span>{u.name}</span>
                    <span>{u.surname}</span>
                    <span className="text-xs">{u.email}</span>
                    <span className="font-medium">{u.role}</span>
                    <span className="text-xs text-slate-600">
                      {u.registrationDate}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-[3px] rounded-md text-xs mx-auto",
                        u.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700",
                      )}
                    >
                      {u.status}
                    </span>
                    <span className="text-xs font-mono text-slate-600">
                      {u.identifier}
                    </span>
                  </div>
                ))}

              {openModal === "requests" &&
                allRequests.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-7 text-sm text-slate-700 py-3 items-center text-center hover:bg-slate-50 transition"
                  >
                    <span>{r.id}</span>
                    <span>{r.telegram_id}</span>
                    <span>{r.telegram_username}</span>
                    <span>{r.reviewed_by_admin_id ?? "-"}</span>

                    <span
                      className={clsx(
                        "px-2 py-[3px] rounded-md text-xs mx-auto",
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {r.status}
                    </span>

                    <span className="text-xs text-slate-600">
                      {new Date(r.created_at).toLocaleString()}
                    </span>

                    <div className="flex items-center justify-center gap-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="p-2 rounded-md bg-green-50 hover:bg-green-100 border border-green-200 transition active:scale-95"
                          >
                            <IoMdCheckmark className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="p-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 transition active:scale-95"
                          >
                            <IoMdClose className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ADD USER FAB */}
          {openModal === "users" && (
            <div
              onClick={() => setOpenCreateModal(true)}
              className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-[54px] h-[54px] rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition cursor-pointer active:scale-95"
            >
              <IoClose className="w-6 h-6 rotate-45" />
            </div>
          )}

          {notify && toastConfig[notify] && (
            <Toast
              type="access"
              message={toastConfig[notify].message}
              onClose={() => setNotify(null)}
            />
          )}
          {/* ---------------- модалка создания нового пользователя ---------------- */}
          {openCreateModal && (
            <div
              onClick={() => setOpenCreateModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="bg-white rounded-xl p-6 shadow-xl w-[420px] flex flex-col gap-5"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <p className="text-[18px] font-semibold text-slate-900">
                    Создать нового пользователя
                  </p>
                  <button
                    onClick={() => setOpenCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <IoIosClose className="w-6 h-6" />
                  </button>
                </div>

                {/* FORM */}
                <div className="flex flex-col gap-4">
                  {/* Никнейм */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-600">Никнейм</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Введите ник"
                      className="border border-gray-300 rounded-lg px-3 py-[9px] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Имя */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-600">Имя</label>
                    <input
                      type="text"
                      value={first_name}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Введите имя"
                      className="border border-gray-300 rounded-lg px-3 py-[9px] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Фамилия */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-600">Фамилия</label>
                    <input
                      type="text"
                      value={last_name}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Введите фамилию"
                      className="border border-gray-300 rounded-lg px-3 py-[9px] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-600">Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="border border-gray-300 rounded-lg px-3 py-[9px] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  {/* role */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-600">Роль</label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={clsx(
                          "px-3 py-2 rounded-l-lg border text-sm font-medium transition flex-1",
                          role === "user"
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        user
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("admin")}
                        className={clsx(
                          "px-3 py-2 rounded-r-lg border text-sm font-medium transition flex-1",
                          role === "admin"
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        admin
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  onClick={addUser}
                  type="button"
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition w-full active:scale-[0.98]"
                >
                  Создать пользователя
                </button>
              </motion.div>
            </div>
          )}

          {/* ---------------- модалка с данными созданного пользователя ---------------- */}
          {showDataNewUser && (
            <div
              onClick={() => setShowDataNewUser(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="bg-white p-6 rounded-xl w-[420px] shadow-xl flex flex-col gap-6"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <p className="text-[18px] font-semibold text-slate-900">
                    Данные для входа
                  </p>
                  <button
                    onClick={() => setShowDataNewUser(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <IoIosClose className="w-6 h-6" />
                  </button>
                </div>

                {/* LOGIN */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-xs text-slate-500">Логин</span>
                  <div className="relative bg-slate-100 rounded-lg px-4 py-3 text-center font-mono text-[15px]">
                    {dataAddUser?.username}
                    <button
                      onClick={() => handleCopy(`${dataAddUser?.username}`)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 hover:scale-110 transition active:scale-95 text-slate-600"
                    >
                      <MdContentCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-xs text-slate-500">Пароль</span>
                  <div className="relative bg-slate-100 rounded-lg px-4 py-3 text-center font-mono text-[15px]">
                    {dataAddUser?.temporary_password}
                    <button
                      onClick={() =>
                        handleCopy(`${dataAddUser?.temporary_password}`)
                      }
                      className="absolute top-1/2 -translate-y-1/2 right-3 hover:scale-110 transition active:scale-95 text-slate-600"
                    >
                      <MdContentCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* WARNING */}
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <CgDanger className="w-5 h-5 text-red-500 shrink-0 mt-[2px]" />
                  <p className="text-sm text-red-700 leading-[1.35]">
                    Сохраните эти данные. После закрытия окна пароль больше не
                    будет доступен.
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  onClick={() => setShowDataNewUser(false)}
                  className="py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition active:scale-[0.97]"
                >
                  Понятно
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
