import { useState, useEffect } from "react";
import EditableField from "../../../components/editable-field-props/EditableFieldProps";

import { useSidebar } from "../../../components/sidebar/SidebarContext";
import clsx from "clsx";
import { getCurrentUser, postDeposit } from "../../../api/users";
import { updateProfile } from "../../../api/profile";
import Toast from "../../../components/toast/Toast";
import Loader from "../../../components/loader/Loader";
import { ApiUser } from "../../../types/user";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../../../api/payments";
import { motion } from "framer-motion";

type NotifyType = "access_pay" | "error_pay" | "access_save" | "error_save";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [payInput, setPayInput] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState<NotifyType | null>(null);
  const [provider, setProvider] = useState<"cryptocloud" | "bithide">(
    "cryptocloud",
  );

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const { isOpen } = useSidebar();

  /* fetch api */
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

  /* save profile */
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
      console.log(err);
      setNotify("error_save");
      setTimeout(() => setNotify(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // /* deposit function */
  // const handleDeposit = async () => {
  //   if (payInput < 100) {
  //     setNotify("error_pay");
  //     setTimeout(() => setNotify(null), 3000);
  //     return;
  //   }
  //   setLoading(true);

  //   try {
  //     await postDeposit(payInput);

  //     const updatedUser: ApiUser = await getCurrentUser();
  //     setUser(updatedUser);

  //     setOpenModal(false);
  //     navigate("/successful-payment", { state: { amount: payInput } });
  //     setPayInput(100);
  //     setNotify("access_pay");
  //     setTimeout(() => setNotify(null), 3000);
  //   } catch (err) {
  //     console.error("Ошибка при пополнении баланса:", err);
  //     navigate("/failed-payment");
  //     setError("Ошибка при пополнении баланса");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /* deposit function */
  const handleDeposit = async () => {
    if (payInput < 100) {
      setNotify("error_pay");
      setTimeout(() => setNotify(null), 3000);
      return;
    }
    setLoading(true);

    try {
      const invoice = await createInvoice(payInput, provider);
      console.log(invoice);

      if (!invoice?.success || !invoice.payment_url) {
        throw new Error("Invoice error");
      }
      localStorage.setItem("payment_id", invoice.payment_id.toString());

      window.location.href = invoice.payment_url;
    } catch (err: any) {
      console.error("Ошибка создания инвойса:", err);
      console.log("invoice error data:", err.response?.data);
      navigate("/failed-payment");
    } finally {
      setLoading(false);
    }
  };

  /* toast data */
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

  /* ---------------- motion animate ---------------- */

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {notify && toastConfig[notify] && (
        <Toast
          type={toastConfig[notify].type}
          message={toastConfig[notify].message}
          onClose={() => setNotify(null)}
        />
      )}
      {loading && <Loader />}
      {/* title */}
      <div className="title">Профиль пользователя</div>
      {!error ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex justify-between w-full gap-10"
        >
          {/* left-content-info-user */}
          <motion.div
            variants={item}
            className="border flex flex-col w-full gap-5 p-4 rounded-[12px]"
          >
            <div className="flex items-center justify-center">
              <p className="subtitle text-gray01">Основная информация</p>
            </div>

            <p className="details-text">
              Никнейм: <span className="text-black">{user?.username}</span>
            </p>

            <div className="details-text">
              <EditableField label="Имя" value={name} onChange={setName} />
            </div>

            <div className="details-text">
              <EditableField
                label="Фамилия"
                value={surname}
                onChange={setSurname}
              />
            </div>

            <div className="details-text">
              <EditableField label="Email" value={email} onChange={setEmail} />
            </div>

            <p className="details-text">
              Роль: <span className="text-black">{user?.role}</span>
            </p>

            <p className="details-text">
              Дата регистрации:{" "}
              <span className="text-black">
                {user?.registration_date
                  ? new Date(user.registration_date).toLocaleDateString()
                  : "-"}
              </span>
            </p>
            <button
              className="uppercase bg-cyan-500 px-5 py-2 rounded text-white"
              onClick={saveProfile}
            >
              сохранить изменения
            </button>
          </motion.div>

          {/* right-content-info-balance */}
          <motion.div
            variants={item}
            className="border flex flex-col gap-5 p-4 rounded-[12px] justify-between w-full"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-center">
                <p className="subtitle text-gray01">Тарифный план</p>
              </div>

              <p className="details-text">
                Число свободных запросов:{" "}
                <span className="text-black">{user?.free_requests_count}</span>
              </p>

              <p className="details-text">
                Баланс: <span className="text-black">{user?.balance} ₽</span>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setOpenModal(true)}
                className="uppercase bg-cyan-500 px-5 py-2 rounded text-white"
              >
                пополнить баланс
              </button>
            </div>
          </motion.div>

          {/* modal */}
          {openModal && (
            <div
              onClick={() => {
                setOpenModal(false);
                setPayInput(100);
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
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    onChange={(e) => setPayInput(Number(e.target.value))}
                    value={payInput}
                    placeholder="*введите сумму от 100₽"
                  />
                  {payInput < 0 || payInput === null ? (
                    <span className="text-error">
                      *введите корректную сумму
                    </span>
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
                <div className="flex flex-col gap-2">
                  <p className="text-gray01 text-[12px]">Способ оплаты</p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProvider("cryptocloud")}
                      className={clsx(
                        "px-3 py-2 rounded border text-sm flex-1 transition",
                        provider === "cryptocloud"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-black hover:bg-gray-100",
                      )}
                    >
                      CryptoCloud
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvider("bithide")}
                      className={clsx(
                        "px-3 py-2 rounded border text-sm flex-1 transition",
                        provider === "bithide"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-black hover:bg-gray-100",
                      )}
                    >
                      BitHide
                    </button>
                  </div>
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
        </motion.div>
      ) : (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </section>
  );
};

export default Profile;
