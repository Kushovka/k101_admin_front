import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { linkTelegramAccount, updateProfile } from "../../../api/profile";
import { getCurrentUser } from "../../../api/users";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { ApiUser } from "../../../types/user";

type NotifyType =
  | "access_save"
  | "error_save"
  | "error_telegram";

const Profile = () => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState<NotifyType | null>(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const { isOpen } = useSidebar();

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data: ApiUser = await getCurrentUser();
        setUser(data);
        setName(data.first_name ?? "");
        setSurname(data.last_name ?? "");
        setEmail(data.email ?? "");
      } catch {
        setError("Ошибка при загрузке профиля");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const saveProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await updateProfile({
        email,
        first_name: name,
        last_name: surname,
      });

      const updatedUser: ApiUser = await getCurrentUser();
      setUser(updatedUser);

      setNotify("access_save");
      setTimeout(() => setNotify(null), 3000);
    } catch {
      setNotify("error_save");
      setTimeout(() => setNotify(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramLink = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await linkTelegramAccount();
      window.open(response.deep_link, "_blank", "noopener,noreferrer");
    } catch {
      setNotify("error_telegram");
      setTimeout(() => setNotify(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toastConfig: Record<
    NotifyType,
    { type: "access" | "error"; message: string }
  > = {
    access_save: {
      type: "access",
      message: "Информация успешно обновлена",
    },
    error_save: {
      type: "error",
      message: "Ошибка при обновлении профиля",
    },
    error_telegram: {
      type: "error",
      message: "Не удалось создать ссылку для привязки Telegram",
    },
  };

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
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
      {notify && toastConfig[notify] && (
        <Toast
          type={toastConfig[notify].type}
          message={toastConfig[notify].message}
          onClose={() => setNotify(null)}
        />
      )}
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      {loading && <Loader fullScreen />}

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
          Профиль пользователя
        </h1>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full grid-cols-1 gap-8"
        >
          <motion.div
            variants={item}
            className="flex w-full flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-7"
          >
            <p className="text-[18px] font-semibold text-slate-900">
              Основная информация
            </p>

            <div className="space-y-3 text-[15px]">
              <p className="flex items-center justify-between rounded-xl text-slate-600">
                <span>Никнейм:</span>
                <span className="font-medium text-slate-900">
                  {user?.username}
                </span>
              </p>

              <EditableField label="Имя" value={name} onChange={setName} />

              <EditableField
                label="Фамилия"
                value={surname}
                onChange={setSurname}
              />

              <EditableField label="Email" value={email} onChange={setEmail} />

              <p className="flex items-center justify-between rounded-xl text-slate-600">
                <span>Роль:</span>
                <span className="font-medium text-slate-900">{user?.role}</span>
              </p>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-600">Telegram:</span>
                  <span className="font-medium text-slate-900">
                    {user?.telegram_username
                      ? `@${user.telegram_username}`
                      : "Не привязан"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTelegramLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#27A7E7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d96d3]"
                >
                  <FaTelegramPlane size={16} />
                  <span>
                    {user?.telegram_username
                      ? "Перепривязать Telegram"
                      : "Привязать Telegram"}
                  </span>
                </button>
              </div>

              <p className="flex items-center justify-between rounded-xl text-slate-600">
                <span>Дата регистрации:</span>
                <span className="font-medium text-slate-900">
                  {user?.registration_date
                    ? new Date(user.registration_date).toLocaleDateString()
                    : "-"}
                </span>
              </p>
            </div>

            <button
              onClick={saveProfile}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600"
            >
              Сохранить изменения
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Profile;
