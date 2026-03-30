import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserById,
  getUserRequests,
  isBlockedUser,
  isDeletedUser,
  postDeposit,
  updateUser,
} from "../../../api/users";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";

import Toast from "../../../components/toast/Toast";
import type {
  UpdateUserPayload,
  UserDetailsApi,
  UserDetailsUI,
} from "../../../types/user";

const mapUser = (u: UserDetailsApi): UserDetailsUI => ({
  id: u.id,
  nickName: u.username,
  name: u.first_name,
  surname: u.last_name,
  email: u.email,
  role: u.role === "user" ? "User" : "Admin",
  registrationDate: new Date(u.registration_date).toLocaleDateString(),
  status: u.is_blocked ? "Blocked" : "Active",
  balance: u.balance ?? 0,
  freeRequest: u.free_requests_count ?? 0,
  allRequest: u.all_requests_count ?? 0,
  totalSpend: u.total_spent ?? 0,
});

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const [user, setUser] = useState<UserDetailsUI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [notify, setNotify] = useState<string | null>(null);
  const [payInput, setPayInput] = useState<number>(100);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [formData, setFormData] = useState<UpdateUserPayload>({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [reqPage, setReqPage] = useState(1);
  const [reqTotal, setReqTotal] = useState(0);
  const [loadingRequests, setLoadingRequests] = useState(false);

  /* ---------------- helpers ---------------- */

  const requestTypeLabels: Record<string, string> = {
    advanced_phone: "Телефон",
    advanced_name: "ФИО",
    advanced_person_id: "ID",
    advanced_email: "Email",
    advanced_snils: "СНИЛС",
    advanced_ipn: "ИНН",
    advanced_address: "Адрес",
    dossier: "Досье",
  };

  const statusStyles: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    insufficient_funds: "bg-red-100 text-red-700",
  };

  /* getUserById */
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res: UserDetailsApi = await getUserById(id);
        const mapped = mapUser(res);
        setUser(mapped);

        setFormData({
          first_name: mapped.name,
          last_name: mapped.surname,
          email: mapped.email,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* blocked */
  const toggleBlocked = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const res = await isBlockedUser(id, user.status === "Active");
      setUser({ ...user, status: res.is_blocked ? "Blocked" : "Active" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await isDeletedUser(id);
      navigate("/account/users");
    } catch (err) {}
  };

  /* deposit users */
  const handleDeposit = async () => {
    if (!id) return;

    if (payInput < 100) {
      setNotify("error_pay");
      setTimeout(() => setNotify(null), 3000);
      return;
    }
    setLoading(true);
    try {
      await postDeposit(payInput, id);
      const updated: UserDetailsApi = await getUserById(id);
      setUser(mapUser(updated));
      setOpenModal(false);
      setPayInput(100);
      setNotify("access_pay");
    } catch (err) {
      console.error("Ошибка при пополнении баланса:", err);
      setError("Ошибка при пополнении баланса");
    } finally {
      setLoading(false);
    }
  };

  /* updateUser */
  const saveUser = async () => {
    if (!id || !user) return;

    try {
      const res = await updateUser(id, formData);
      setUser({
        ...user,
        name: res.first_name,
        surname: res.last_name,
        email: res.email,
      });
    } catch (err) {}
  };

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.name || "",
        last_name: user.surname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;

    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await getUserRequests(id, reqPage, 10);

        setReqTotal(res.total);

        setRequests((prev) =>
          reqPage === 1 ? res.requests : [...prev, ...res.requests],
        );
      } catch (e) {
        setError("Ошибка загрузки истории запросов");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [id, reqPage]);

  if (loading) return <Loader fullScreen />;
  if (!user) return <div>User not found</div>;

  /* ---------------- motion animated ---------------- */

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {notify === "access_pay" && (
        <Toast
          type="access"
          message={`Баланс пользователя ${formData.first_name} успешно пополнен`}
          onClose={() => setNotify(null)}
        />
      )}
      <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
          Пользователь: {user.nickName}
        </h1>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex w-full"
        >
          {/* LEFT */}
          <motion.div
            variants={item}
            className="bg-white border w-full border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-6"
          >
            <p className="text-[16px] font-medium text-slate-900 text-center">
              Основная информация
            </p>

            <div className="space-y-3 text-[15px] text-slate-800">
              <EditableField
                label="Имя"
                value={formData.first_name}
                onChange={(val: string) =>
                  setFormData((p) => ({ ...p, first_name: val }))
                }
              />

              <EditableField
                label="Фамилия"
                value={formData.last_name}
                onChange={(val: string) =>
                  setFormData((p) => ({ ...p, last_name: val }))
                }
              />

              <EditableField
                label="Email"
                value={formData.email}
                onChange={(val: string) =>
                  setFormData((p) => ({ ...p, email: val }))
                }
              />

              <p className="flex justify-between text-slate-600">
                <span>Роль:</span>
                <span className="font-medium text-slate-900">{user.role}</span>
              </p>

              <p className="flex justify-between text-slate-600">
                <span>Дата регистрации:</span>
                <span className="font-medium text-slate-900">
                  {user.registrationDate}
                </span>
              </p>
              <p className="flex justify-between text-slate-600">
                <span>Статус:</span>
                <span
                  className={clsx(
                    "px-2 py-[2px] rounded text-xs font-medium",
                    user.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  )}
                >
                  {user.status}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {user.role === "User" && (
                <button
                  onClick={toggleBlocked}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                >
                  {user.status === "Active"
                    ? "Заблокировать пользователя"
                    : "Разблокировать пользователя"}
                </button>
              )}

              <button
                onClick={saveUser}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition"
              >
                сохранить изменения
              </button>
            </div>
          </motion.div>

          {/* RIGHT */}
          {/* <motion.div
            variants={item}
            className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col justify-between gap-6"
          >
            <div className="flex flex-col gap-4">
              <p className="text-[16px] font-medium text-slate-900 text-center">
                Баланс и расходы
              </p>

              <p className="flex justify-between text-slate-600 text-[15px]">
                Баланс:
                <span className="text-[20px] font-semibold text-slate-900">
                  {user.balance} ₽
                </span>
              </p>

              <p className="flex justify-between text-slate-600 text-[15px]">
                Бесплатные запросы:
                <span className="font-medium text-slate-900">
                  {user.freeRequest}
                </span>
              </p>

              <p className="flex justify-between text-slate-600 text-[15px]">
                Всего запросов:
                <span className="font-medium text-slate-900">
                  {user.allRequest}
                </span>
              </p>

              <p className="flex justify-between text-slate-600 text-[15px]">
                Потрачено:
                <span className="font-medium text-slate-900">
                  {user.totalSpend}
                </span>
              </p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition"
            >
              пополнить баланс
            </button>
          </motion.div> */}
        </motion.div>

        {/* QUERY */}
        <motion.div variants={item} className="flex flex-col gap-4">
          <p className="text-[18px] font-semibold text-slate-900">
            История запросов
          </p>

          {loadingRequests && (
            <p className="text-sm text-slate-400 text-center">Загрузка...</p>
          )}

          {!loadingRequests && requests.length === 0 && (
            <p className="text-sm text-slate-400 text-center">Нет запросов</p>
          )}

          {!loadingRequests && requests.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* HEADER */}
              <div className="grid grid-cols-[80px_1fr_1fr_120px_120px_140px_160px] text-xs font-medium text-slate-600 bg-slate-50 border-b border-gray-200">
                <div className="py-3 text-center uppercase">ID</div>
                <div className="py-3 text-center uppercase">Тип</div>
                <div className="py-3 text-center uppercase">Запрос</div>
                <div className="py-3 text-center uppercase">Цена</div>
                <div className="py-3 text-center uppercase">Результаты</div>
                <div className="py-3 text-center uppercase">Статус</div>
                <div className="py-3 text-center uppercase">Дата</div>
              </div>

              {/* ROWS */}
              <div className="flex flex-col divide-y divide-gray-100">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[80px_1fr_1fr_120px_120px_140px_160px] text-sm text-slate-700 py-3 items-center text-center hover:bg-slate-50 transition"
                  >
                    {/* ID */}
                    <span className="font-mono text-xs text-slate-500">
                      {r.id}
                    </span>

                    {/* TYPE */}
                    <span>
                      {requestTypeLabels[r.request_type] ?? r.request_type}
                    </span>

                    {/* QUERY */}
                    <span className="text-xs truncate px-2">
                      {r.search_query || "-"}
                    </span>

                    {/* COST */}
                    <span
                      className={clsx(
                        "font-medium",
                        Number(r.request_cost) === 0
                          ? "text-green-600"
                          : "text-slate-700",
                      )}
                    >
                      {r.request_cost} ₽
                    </span>

                    {/* RESULTS */}
                    <span className="text-xs text-slate-600">
                      {r.results_count ?? "-"}
                    </span>

                    {/* STATUS */}
                    <span
                      className={clsx(
                        "px-2 py-[3px] rounded-md text-xs mx-auto",
                        statusStyles[r.status] ?? "bg-gray-100 text-gray-600",
                      )}
                    >
                      {r.status === "success"
                        ? "Успешно"
                        : r.status === "insufficient_funds"
                          ? "Нет средств"
                          : r.status}
                    </span>

                    {/* DATE */}
                    <span className="text-xs text-slate-600">
                      {new Date(r.request_date).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOAD MORE */}
          {requests.length < reqTotal && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setReqPage((p) => p + 1)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-slate-100"
              >
                Показать ещё
              </button>
            </div>
          )}
        </motion.div>

        {/* MODAL */}
        {openModal && (
          <div
            onClick={() => {
              setOpenModal(false);
              setPayInput(100);
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-xl p-6 shadow-xl w-[360px] flex flex-col gap-5"
            >
              <p className="text-lg font-semibold text-slate-900 text-center">
                Оплата
              </p>

              <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-sm text-slate-600">
                  Введите сумму
                </label>
                <input
                  id="amount"
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onChange={(e) => setPayInput(Number(e.target.value))}
                  value={payInput}
                  placeholder="*от 100₽"
                />
                {payInput < 100 && (
                  <span className="text-red-500 text-xs">
                    *пополнение от 100₽
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">*быстрый выбор</p>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setPayInput((p) => Number(p) + 100)}
                  className="px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100 transition"
                >
                  +100₽
                </button>
                <button
                  onClick={() => setPayInput((p) => Number(p) + 500)}
                  className="px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100 transition"
                >
                  +500₽
                </button>
                <button
                  onClick={() => setPayInput((p) => Number(p) + 1000)}
                  className="px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100 transition"
                >
                  +1000₽
                </button>
              </div>

              <button
                onClick={handleDeposit}
                className="px-3 py-2 rounded-lg border text-sm font-medium text-slate-900 hover:bg-green-500/70 hover:text-white transition w-full"
              >
                оплатить
              </button>
            </motion.div>
          </div>
        )}

        {/* DELETE MODAL */}
        {openDelete && (
          <div
            onClick={() => setOpenDelete(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-xl w-[380px] flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xl font-bold">
                  !
                </div>

                <p className="text-lg font-semibold text-slate-900">
                  Удалить пользователя?
                </p>

                <p className="text-sm text-slate-500">
                  Пользователь{" "}
                  <span className="font-medium text-slate-800">
                    {user.nickName}
                  </span>{" "}
                  будет удалён без возможности восстановления.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium text-slate-700 hover:bg-gray-100 transition"
                >
                  Отмена
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/account/users")}
            className="flex items-center gap-3 border px-3 py-2 rounded-lg text-slate-700 hover:bg-gray-200 transition w-max"
          >
            <IoExitOutline className="rotate-180 h-[22px] w-[22px]" />
            Назад
          </button>

          <button
            onClick={() => setOpenDelete(true)}
            className="flex items-center gap-3 border px-3 py-2 rounded-lg text-slate-700 hover:bg-gray-200 transition w-max"
          >
            Удалить пользователя
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserDetails;
