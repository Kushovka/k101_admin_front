import React, { useEffect, useState } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../../api/payments";
import { getCurrentUser } from "../../api/users";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("created");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const paymentId = localStorage.getItem("payment_id");
    if (!paymentId) {
      // если пришли сюда напрямую
      navigate("/account/profile");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const data = await getPaymentStatus(Number(paymentId));
        setStatus(data.status);

        if (["completed", "paid", "overpaid"].includes(data.status)) {
          clearInterval(interval);
          localStorage.removeItem("payment_id");
          setAmount(Number(data.amount_fiat));
          await getCurrentUser();
          setLoading(false);
        }

        if (["canceled", "expired", "partial"].includes(data.status)) {
          clearInterval(interval);
          localStorage.removeItem("payment_id");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Автоматический redirect в профиль
  useEffect(() => {
    if (!loading && ["completed", "paid", "overpaid"].includes(status)) {
      if (count > 0) {
        const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate("/account/profile");
      }
    }
  }, [count, status, loading, navigate]);

  // UI
  if (loading || status === "created") {
    return (
      <section className="w-full h-screen flex items-center justify-center">
        <h2 className="text-common">Проверяем оплату...</h2>
      </section>
    );
  }

  if (["canceled", "expired", "partial"].includes(status)) {
    return (
      <section className="w-full h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="subtitle text-red-500">Оплата не завершена</h1>
        <button
          onClick={() => navigate("/account/profile")}
          className="px-3 py-2 rounded uppercase hover:bg-red-400/20 transition duration-300"
        >
          вернуться в профиль
        </button>
      </section>
    );
  }

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">
        <IoIosCheckmarkCircleOutline className="w-28 h-28 text-green-600" />
        <h1 className="subtitle">
          Баланс успешно пополнен{amount ? ` на ${amount} ₽` : ""}!
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <button
          onClick={() => navigate("/account/profile")}
          className="px-3 py-2 rounded uppercase hover:bg-green-400/20 transition duration-300"
        >
          вернуться в профиль
        </button>
        <h2 className="text-common">
          автоматическая переадресация через {count}...
        </h2>
      </div>
    </section>
  );
};

export default PaymentSuccess;
