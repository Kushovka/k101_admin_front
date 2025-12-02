import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import axios from "axios";
import { IoExitOutline } from "react-icons/io5";
import Loader from "../../../components/loader/Loader";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";
import { getUserById, updateUser } from "../../../api/admin";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

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
    <section className="section">
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
