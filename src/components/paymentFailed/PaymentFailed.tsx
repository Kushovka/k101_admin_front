import React, { useEffect, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentError = () => {
  const navigate = useNavigate();

  const [count, setCount] = useState<number>(10);

  useEffect(() => {
    if (count < 1) navigate("/account/profile");

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, navigate]);
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">
        <IoCloseCircleOutline className="w-28 h-28 text-red-600" />
        <div className="flex flex-col items-center">
          <h1 className="subtitle">Ошибка пополнения баланса</h1>
          <h1 className="subtitle">Повторите позже</h1>
        </div>
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

export default PaymentError;
