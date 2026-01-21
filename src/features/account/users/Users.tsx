import { useState, useEffect } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import {
  addUsers,
  getRequests,
  getUsers,
  isApproveRequest,
  isRejectRequest,
} from "../../../api/users";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { IoClose } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import { CgDanger } from "react-icons/cg";
import { MdContentCopy } from "react-icons/md";
import { motion } from "framer-motion";
import {
  type ApiUser,
  type UsersResponse,
  type CreatedUserResponse,
  type TableUser,
  type ApiTelegramUser,
} from "../../../types/user";
import { IoIosClose, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FaUsers } from "react-icons/fa";

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
  const [role, setRole] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState<string>("");

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
      console.log("getUsers res:", res);
      const formattedUsers: TableUser[] = res.map((u) => ({
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
        console.log(res);
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
      await getRequests();
    } catch (e) {
      console.log(e);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Причина отказа:") || null;
    try {
      await isRejectRequest(id, reason ?? undefined);
      await getRequests();
    } catch (e) {
      console.log(e);
    }
  };

  /* добавление пользователя */
  const addUser = async (): Promise<void> => {
    if (!email || !first_name || !last_name || !username) {
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

      console.log(res);

      setEmail("");
      setFirstName("");
      setLastName("");
      setUsername("");
      setRole("user");
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

  /* функция длдя копирования */
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

  console.log(toastConfig);
  console.log(dataAddUser);

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
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mx-auto flex flex-col gap-6"
        >
          {/* TITLE */}
          <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight">
            Пользователи
          </h1>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="grid grid-cols-8 text-sm font-medium text-slate-600 bg-slate-50 border-b border-gray-200">
              {chapterTitle.map((chapter) => (
                <div
                  key={chapter.id}
                  className="px-3 py-3 text-center uppercase tracking-wide text-[11px]"
                >
                  {chapter.title}
                </div>
              ))}
            </div>

            {/* ROWS */}
            <div className="flex flex-col divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/account/users/${u.identifier}`)}
                  className="grid grid-cols-8 text-sm text-slate-700 py-3 items-center text-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <span>{u.nickName}</span>
                  <span>{u.name}</span>
                  <span>{u.surname}</span>

                  {/* EMAIL */}
                  <span
                    className={clsx(
                      "px-2 py-[3px] rounded-md text-xs mx-auto",
                      u.confirmationEmail === "Yes"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {u.email}
                  </span>

                  {/* ROLE */}
                  <span
                    className={clsx(
                      "px-2 py-[3px] rounded-md  text-sm font-medium mx-auto",
                    )}
                  >
                    {u.role}
                  </span>

                  {/* DATE */}
                  <span className="text-slate-600 text-xs">
                    {u.registrationDate}
                  </span>

                  {/* STATUS */}
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

                  <span className="text-slate-600 text-xs font-mono">
                    {u.identifier}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FLOATING ACTION BUTTONS */}
          {/* CREATE USER */}
          <div
            data-tooltip-id="add_user"
            onClick={() => setOpenCreateModal((prev) => !prev)}
            className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-[54px] h-[54px] rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition cursor-pointer active:scale-95"
          >
            <IoClose className="w-6 h-6 rotate-45" />
            <Tooltip
              id="add_user"
              place="left"
              content="Добавить нового пользователя"
            />
          </div>

          {/* TELEGRAM REQUESTS */}
          <div
            data-tooltip-id="tg_requests"
            onClick={() => setTelegramUsersModal((prev) => !prev)}
            className="fixed bottom-28 right-8 z-50 flex items-center justify-center w-[54px] h-[54px] rounded-full bg-slate-700 text-white shadow-lg hover:bg-slate-800 transition cursor-pointer active:scale-95"
          >
            {!!allRequests.length && (
              <div className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center px-[6px]">
                {allRequests.length}
              </div>
            )}
            <FaUsers className="w-6 h-6" />
            <Tooltip
              id="tg_requests"
              place="left"
              content="Запросы на регистрацию"
            />
          </div>

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
          {/* ---------------- заявки из телеграма ---------------- */}
          {telegramUsersModal && (
            <div
              onClick={() => setTelegramUsersModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="bg-white rounded-xl shadow-xl p-6 w-[1300px] max-h-[75vh] overflow-hidden flex flex-col gap-4"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <p className="text-[18px] font-semibold text-slate-900">
                    Заявки из Telegram
                  </p>
                  <button
                    onClick={() => setTelegramUsersModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <IoIosClose className="w-6 h-6" />
                  </button>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                  {chapterTitleTg.map((c) => (
                    <div key={c.id} className="py-2 text-center uppercase">
                      {c.title}
                    </div>
                  ))}
                </div>

                {/* TABLE BODY */}
                <div className="flex flex-col divide-y divide-slate-200 overflow-y-auto pr-1">
                  {allRequests.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-7 text-xs text-slate-700 py-2 items-center text-center hover:bg-slate-50 transition"
                    >
                      <span>{r.id}</span>
                      <span>{r.telegram_id}</span>
                      <span>{r.telegram_username}</span>
                      <span>{r.reviewed_by_admin_id ?? "-"}</span>

                      {/* STATUS */}
                      <span
                        className={clsx(
                          "px-[6px] py-[2px] rounded text-[10px] font-medium mx-auto",
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {r.status}
                      </span>

                      {/* DATE */}
                      <span className="text-[10px] text-slate-600">
                        {new Date(r.created_at).toLocaleString()}
                      </span>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          data-tooltip-id="approve"
                          onClick={() => handleApprove(r.id)}
                          className="p-[6px] rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition active:scale-95"
                        >
                          <IoMdCheckmark className="text-green-600 w-4 h-4" />
                        </button>
                        <button
                          data-tooltip-id="reject"
                          onClick={() => handleReject(r.id)}
                          className="p-[6px] rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition active:scale-95"
                        >
                          <IoMdClose className="text-red-600 w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
