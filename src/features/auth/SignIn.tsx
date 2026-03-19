import { motion } from "framer-motion";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import axios from "axios";
import Toast from "../../components/toast/Toast";
import { login } from "./auth";

interface SignInFormValues {
  username: string;
  password: string;
}

interface NotifyState {
  message: string;
  type: "error" | "access";
}

export default function SignIn() {
  const token = localStorage.getItem("admin_access_token");
  const role = localStorage.getItem("admin_role");

  if (token && role === "admin") {
    return <Navigate to="/account/profile" replace />;
  }
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<SignInFormValues>();

  const navigate = useNavigate();
  const [notify, setNotify] = useState<NotifyState | null>(null);

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    try {
      const res = await login(data.username, data.password);

      const role = localStorage.getItem("admin_role");

      if (role !== "admin") {
        setNotify({
          message: "У вас нет доступа к админ панели",
          type: "error",
        });
        return;
      }

      navigate("/account/profile");
    } catch (err) {
      console.error(err);
      let message = "Ошибка при входе";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          message = "Неверный логин или пароль";
        } else if (status === 403) {
          message = "Ваш аккаунт заблокирован. Доступ запрещен";
        }
      }
      setNotify({
        message,
        type: "error",
      });
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 shadow-sm rounded-xl w-full max-w-[380px] px-6 py-8 flex flex-col gap-6"
      >
        <h3 className="text-[22px] tracking-tight text-slate-900 text-center">
          Вход
        </h3>

        {/* login */}
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Логин"
            {...register("username", { required: true, minLength: 2 })}
            className="w-full px-3 py-2 rounded-lg border text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
          />
          {touchedFields.username && errors.username && (
            <span className="text-[12px] text-red-500">*введите логин</span>
          )}
        </div>

        {/* password */}
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Пароль"
            {...register("password", { required: true, minLength: 4 })}
            className="w-full px-3 py-2 rounded-lg border text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
          />
          {touchedFields.password && errors.password && (
            <span className="text-[12px] text-red-500">*введите пароль</span>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full py-2 rounded-lg text-[15px] font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition"
        >
          Войти
        </button>
      </motion.form>

      {notify && (
        <Toast
          message={notify.message}
          type={notify.type}
          onClose={() => setNotify(null)}
        />
      )}
    </section>
  );
}
