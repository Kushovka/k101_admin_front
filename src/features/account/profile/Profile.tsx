import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../../../api/payments";
import { updateProfile } from "../../../api/profile";
import { getCurrentUser } from "../../../api/users";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { ApiUser } from "../../../types/user";

type NotifyType = "access_pay" | "error_pay" | "access_save" | "error_save";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [payInput, setPayInput] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState<NotifyType | null>(null);
  const [provider, setProvider] = useState<
    "cryptocloud" | "bithide" | "plisio"
  >("plisio");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  // const [link, setLink] = useState("");

  const { isOpen } = useSidebar();

  /* ---------------- ger user ---------------- */
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
      } catch (err) {
        setError("Ошибка при загрузке пользователя");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /* ---------------- updated profile ---------------- */
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
    } catch (err) {

      setNotify("error_save");
      setTimeout(() => setNotify(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- deposit ---------------- */
  const handleDeposit = async () => {
    if (payInput < 100) {
      setNotify("error_pay");
      setTimeout(() => setNotify(null), 3000);
      return;
    }
    setLoading(true);

    try {
      const invoice = await createInvoice(payInput, provider);

      if (!invoice?.success || !invoice.payment_url) {
        throw new Error("Invoice error");
      }
      localStorage.setItem("payment_id", invoice.payment_id.toString());

      window.location.href = invoice.payment_url;
    } catch (err: any) {
      navigate("/failed-payment");
    } finally {
      setLoading(false);
    }
  };

  // /* ---------------- link for telegram ---------------- */
  // useEffect(() => {
  //   const handleLink = async () => {
  //     try {
  //       const res = await linkForTelegram();
  //       setLink(res.deep_link);

  //     } catch (err) {

  //     }
  //   };
  //   handleLink();
  // }, []);

  /* ---------------- toast config ---------------- */
  const toastConfig: Record<
    NotifyType,
    { type: "access" | "error"; message: string }
  > = {
    access_pay: {
      type: "access",
      message: `Баланс успешно пополнен! Текущий баланс: ${user?.balance} ₽`,
    },
    error_pay: {
      type: "error",
      message: "Минимальная сумма пополнения 100₽",
    },
    access_save: {
      type: "access",
      message: "Информация успешно обновлена",
    },
    error_save: {
      type: "error",
      message: "Ошибка при обновлении профиля",
    },
  };

  /* ---------------- animate motion ---------------- */

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

      {loading && <Loader />}

      <div className="max-w-[1100px] w-full mx-auto flex flex-col gap-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
          Профиль пользователя
        </h1>

        {!error ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-8"
          >
            {/* LEFT CARD */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col gap-6"
            >
              <p className="text-[16px] font-medium text-slate-900 text-center">
                Основная информация
              </p>

              <div className="space-y-3 text-[15px]">
                <p className="flex justify-between text-slate-600">
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

                <EditableField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                />

                <p className="flex justify-between text-slate-600">
                  <span>Роль:</span>
                  <span className="font-medium text-slate-900">
                    {user?.role}
                  </span>
                </p>

                <p className="flex justify-between text-slate-600">
                  <span>Дата регистрации:</span>
                  <span className="font-medium text-slate-900">
                    {user?.registration_date
                      ? new Date(user.registration_date).toLocaleDateString()
                      : "-"}
                  </span>
                </p>
              </div>
              {/* <a href={link} target="_blank" rel="noreferrer">
                <button className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition">
                  привязать тг
                </button>
              </a> */}

              <button
                onClick={saveProfile}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition"
              >
                сохранить изменения
              </button>
            </motion.div>

            {/* RIGHT CARD */}
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <p className="text-[16px] font-medium text-slate-900 text-center">
                  Тарифный план
                </p>

                <p className="flex justify-between text-slate-600 text-[15px]">
                  Число свободных запросов:{" "}
                  <span className="font-medium text-slate-900">
                    {user?.free_requests_count}
                  </span>
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Баланс:</span>
                  <span className="text-[20px] font-semibold text-slate-900">
                    {user?.balance} ₽
                  </span>
                </div>
              </div>

              <button
                onClick={() => setOpenModal(true)}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition"
              >
                пополнить баланс
              </button>
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
                <div
                  onClick={(e) => e.stopPropagation()}
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
                      placeholder="*введите сумму от 100₽"
                    />

                    {payInput < 100 && (
                      <span className="text-red-500 text-xs">
                        *пополнение от 100₽
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    *или выберите из предложенных
                  </p>

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

                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-slate-500">Способ оплаты</p>

                    <div className="flex gap-2">
                      {/* <button
                        type="button"
                        onClick={() => setProvider("cryptocloud")}
                        className={clsx(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition flex-1",
                          provider === "cryptocloud"
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        CryptoCloud
                      </button> */}

                      {/* <button
                        type="button"
                        onClick={() => setProvider("bithide")}
                        className={clsx(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition flex-1",
                          provider === "bithide"
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        BitHide
                      </button> */}
                      <button
                        type="button"
                        onClick={() => setProvider("plisio")}
                        className={clsx(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition flex-1",
                          provider === "plisio"
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        Plisio
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeposit}
                    className="px-3 py-2 rounded-lg border text-sm font-medium text-slate-900 hover:bg-green-500/70 hover:text-white transition w-full"
                  >
                    оплатить
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <Toast message={error} type="error" onClose={() => setError(null)} />
        )}
      </div>
    </section>
  );
};

export default Profile;
