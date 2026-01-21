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
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Пользователи</div>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      {loading ? (
        <Loader />
      ) : (
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* ---------------- названия столбцов ---------------- */}
          <div className="grid grid-cols-8 gap-4 text-gray01 font-medium border-b pb-2">
            {chapterTitle.map((chapter) => (
              <span
                className={clsx(
                  " flex items-center justify-center text-[12px]",
                  chapter.id === chapterTitle.length ? "" : "border-r",
                )}
                key={chapter.id}
              >
                {chapter.title}
              </span>
            ))}
          </div>

          {/* ---------------- все пользователи ---------------- */}
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
                      : "bg-red-500/60",
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

          {/* ---------------- кнопка добавления ---------------- */}
          <div
            data-tooltip-id="add_plans-tooltip"
            onClick={() => setOpenCreateModal((prev) => !prev)}
            className="fixed z-50 bg-gray01/40 bottom-8 right-8 hover:bottom-7 hover:right-7 border rounded-full p-4 group cursor-pointer hover:bg-green-300/50 transition-all duration-200 "
          >
            <IoClose className="group-hover:w-10 group-hover:h-10 w-8 h-8 rotate-45 transition-all duration-200 cursor-pointer" />
            <Tooltip
              place="left"
              delayShow={400}
              content="Добавить нового пользователя"
              id="add_plans-tooltip"
            />
          </div>

          {/* ---------------- модалка создания нового пользователя ---------------- */}
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

          {/* ---------------- модалка с данными созданного пользователя ---------------- */}
          {showDataNewUser && (
            <div
              onClick={() => setShowDataNewUser(false)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 rounded-xl w-[420px] flex flex-col gap-6 shadow-xl"
              >
                <p className="text-lg font-semibold text-center">
                  Данные для входа
                </p>

                {/* Логин */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Логин</span>
                  <div className="bg-gray-100 relative rounded-lg px-4 py-3 text-center text-lg font-mono">
                    <p>{dataAddUser?.username}</p>
                    <span
                      onClick={() => handleCopy(`${dataAddUser?.username}`)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 shadow-sm p-1 rounded hover:shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                    >
                      <MdContentCopy className="w-6 h-6" />
                    </span>
                  </div>
                </div>

                {/* Пароль */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Пароль</span>
                  <div className="bg-gray-100 relative rounded-lg px-4 py-3 text-center text-lg font-mono">
                    <p>{dataAddUser?.temporary_password}</p>
                    <span
                      onClick={() =>
                        handleCopy(`${dataAddUser?.temporary_password}`)
                      }
                      className="absolute top-1/2 -translate-y-1/2 right-3 shadow-sm p-1 rounded hover:shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                    >
                      <MdContentCopy className="w-6 h-6" />
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <CgDanger className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    Сохраните эти данные. После закрытия окна пароль больше не
                    будет доступен.
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setShowDataNewUser(false)}
                  className="w-full border rounded-lg py-2 hover:bg-green-500/70 transition"
                >
                  Понятно
                </button>
              </div>
            </div>
          )}

          {/* ---------------- кнопка добавления ---------------- */}
          <div
            data-tooltip-id="all_requests-tooltip"
            onClick={() => setTelegramUsersModal((prev) => !prev)}
            className="fixed z-50 bg-gray01/40 bottom-28 right-8 hover:bottom-[107px] hover:right-7 border rounded-full p-4 group cursor-pointer hover:bg-green-300/50 transition-all duration-200 "
          >
            <div className="w-6 h-6 rounded-full bg-red-500 absolute -top-1 right-0 flex justify-center font-medium">
              {allRequests.length}
            </div>
            <FaUsers className="group-hover:w-10 group-hover:h-10 w-8 h-8 transition-all duration-200 cursor-pointer" />

            <Tooltip
              place="left"
              delayShow={400}
              content="Запросы на регистрацию"
              id="all_requests-tooltip"
            />
          </div>

          {telegramUsersModal && (
            <div
              onClick={() => setTelegramUsersModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 animate-fadeIn"
            >
              <div className="bg-white p-10 rounded-xl">
                {/* ---------------- названия столбцов ---------------- */}
                <div className="grid grid-cols-7 gap-4 text-gray01 font-medium border-b pb-2">
                  {chapterTitleTg.map((chapter) => (
                    <span
                      className={clsx(
                        " flex items-center justify-center text-[12px]",
                        chapter.id === chapterTitleTg.length ? "" : "border-r",
                      )}
                      key={chapter.id}
                    >
                      {chapter.title}
                    </span>
                  ))}
                </div>

                {/* ---------------- все телеграм пользователи ---------------- */}
                <div className="flex flex-col">
                  {allRequests.map((r) => (
                    <div className="grid grid-cols-7 gap-4 text-gray01 font-medium text-center text-[12px] items-center border-b py-2">
                      <p>{r.id}</p>
                      <p>{r.telegram_id}</p>
                      <h2>{r.telegram_username}</h2>
                      <p>{r.reviewed_by_admin_id}</p>
                      <p>{r.status}</p>
                      <p>{`${new Date(r.created_at).toLocaleString()}`}</p>
                      <div className="flex items-center justify-center gap-5">
                        <button
                          data-tooltip-id="approve-tooltip"
                          onClick={() => handleApprove(r.id)}
                          className="border px-2 py-2 rounded hover:bg-green-100 transition duration-300"
                        >
                          <IoMdCheckmark className="w-6 h-6" />
                        </button>
                        <Tooltip
                          place="left"
                          delayShow={400}
                          content="Принять запрос"
                          id="approve-tooltip"
                        />
                        <button
                          data-tooltip-id="reject-tooltip"
                          onClick={() => handleReject(r.id)}
                          className="border px-2 py-2 rounded hover:bg-red-100 transition duration-300"
                        >
                          <IoMdClose className="w-6 h-6" />
                        </button>
                        <Tooltip
                          place="left"
                          delayShow={400}
                          content="Отклонить запрос"
                          id="reject-tooltip"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {notify && toastConfig[notify] && (
            <Toast
              type="access"
              message={toastConfig[notify].message}
              onClose={() => setNotify(null)}
            />
          )}
        </motion.div>
      )}
    </section>
  );
}
