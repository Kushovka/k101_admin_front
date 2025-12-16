import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import axios from "axios";
import { IoExitOutline } from "react-icons/io5";
import Loader from "../../../components/loader/Loader";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";
import {
  getUserById,
  isBlockedUser,
  postDeposit,
  updateUser,
} from "../../../api/admin";
import { useSidebar } from "../../../components/sidebar/SidebarContext";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notify, setNotify] = useState(null);
  const [payInput, setPayInput] = useState("100");
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const { isOpen } = useSidebar();

  /* getUserById */
  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUserById(id);
      setUser({
        id: res.id,
        nickName: res.username,
        name: res.first_name,
        surname: res.last_name,
        email: res.email,
        role: res.role === "user" ? "User" : "Admin",
        registrationDate: new Date(res.registration_date).toLocaleDateString(),
        status: res.is_blocked ? "Blocked" : "Active",
        confirmationEmail: res.is_email_verified ? "Yes" : "No",
        balance: res.balance || 0,
        freeRequest: res.free_requests_count || 0,
        allRequest: res.all_requests_count || 0,
        totalSpend: res.total_spent || 0,
      });
    } catch (err) {
      console.error("Ошибка при получении пользователя:", err);
    } finally {
      setLoading(false);
    }
  };

  /* blocked */
  const toggleBlocked = async () => {
    try {
      setLoading(true);
      const block = user.status === "Active";
      const res = await isBlockedUser(id, block);
      setUser((prev) => ({
        ...prev,
        status: res.is_blocked ? "Blocked" : "Active",
      }));
    } catch (err) {
      console.error(err);
      alert("Не удалось изменить статус пользователя");
    } finally {
      setLoading(false);
    }
  };

  /* deposit users */
  const handleDeposit = async () => {
    try {
      if (payInput < 100) {
        setNotify("error_pay");
        setTimeout(() => setNotify(null), 3000);
        return;
      }
      setLoading(true);
      const res = await postDeposit(payInput);

      const updatedUserRaw = await getUserById(id);
      setUser({
        id: updatedUserRaw.id,
        nickName: updatedUserRaw.username,
        name: updatedUserRaw.first_name,
        surname: updatedUserRaw.last_name,
        email: updatedUserRaw.email,
        role: updatedUserRaw.role === "user" ? "User" : "Admin",
        registrationDate: new Date(
          updatedUserRaw.registration_date
        ).toLocaleDateString(),
        status: updatedUserRaw.is_blocked ? "Blocked" : "Active",
        confirmationEmail: updatedUserRaw.is_email_verified ? "Yes" : "No",
        balance: updatedUserRaw.balance || 0,
        freeRequest: updatedUserRaw.free_requests_count || 0,
        allRequest: updatedUserRaw.all_requests_count || 0,
        totalSpend: updatedUserRaw.total_spent || 0,
      });

      setOpenModal(false);
      setPayInput("100");
      setNotify("access_pay");
      setTimeout(() => setNotify(null), 3000);
    } catch (err) {
      console.error("Ошибка при пополнении баланса:", err);
      setError("Ошибка при пополнении баланса");
    } finally {
      setLoading(false);
    }
  };

  /* updateUser */
  const saveUser = async () => {
    try {
      const res = await updateUser(id, formData);
      setUser((prev) => ({
        ...prev,
        name: res.first_name,
        surname: res.last_name,
        email: res.email,
      }));
      alert("Пользователь успешно обновлен");
    } catch (err) {
      console.log(err.response?.data);
      alert("Произошла ошибка");
    }
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

  if (loading) return <Loader />;
  if (!user) return <div>User not found</div>;

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Пользователь: {user.name}</div>

      <div className="flex gap-10">
        {/* left content */}
        <div className="border flex flex-col gap-5 p-4 rounded-[12px]">
          <form className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <EditableField
                label="Имя"
                value={formData.first_name}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, first_name: val }))
                }
              />
            </div>

            <div className="flex items-center gap-5">
              <EditableField
                label="Фаимилия"
                value={formData.last_name}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, last_name: val }))
                }
              />
            </div>

            <div className="flex items-center gap-5">
              <EditableField
                label="Email"
                value={formData.email}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, email: val }))
                }
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
          {user.role === "User" && (
            <button
              onClick={toggleBlocked}
              className="bg-red01/60 text-white px-4 py-2 rounded hover:bg-red01 transition duration-300"
            >
              {user.status === "Active"
                ? "Заблокировать пользователя"
                : "Разблокировать пользователя"}
            </button>
          )}
          <button
            onClick={saveUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Сохранить изменения
          </button>
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
          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Добавить баланс
          </button>
        </div>
      </div>
      {/* modal */}
      {openModal && (
        <div
          onClick={() => {
            setOpenModal(false);
            setPayInput("100");
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg w-80 flex flex-col gap-4"
          >
            <p className="text-lg font-semibold mb-4 text-center">Оплата</p>
            <div className="flex flex-col gap-2">
              <label htmlFor="amount">Введите сумму</label>
              <input
                id="amount"
                type="number"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPayInput(e.target.value)}
                value={payInput}
                placeholder="*введите сумму от 100₽"
              />
              {payInput < 0 || payInput === "" ? (
                <span className="text-error">*введите корректную сумму</span>
              ) : null}
              {payInput < 100 ? (
                <span className="text-error">*пополнение от 100₽</span>
              ) : null}
            </div>

            <p className="text-gray01 text-[12px]">
              *или выберете из предложенных
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setPayInput((prev) => Number(prev) + 100)}
                className="pay-btn"
              >
                +100₽
              </button>
              <button
                onClick={() => setPayInput((prev) => Number(prev) + 500)}
                className="pay-btn"
              >
                +500₽
              </button>
              <button
                onClick={() => setPayInput((prev) => Number(prev) + 1000)}
                className="pay-btn"
              >
                +1000₽
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeposit}
              className="uppercase border px-2 py-1 rounded text-black font-medium hover:bg-green-500/70 transition duration-300 w-full"
            >
              оплатить
            </button>
          </div>
        </div>
      )}
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
