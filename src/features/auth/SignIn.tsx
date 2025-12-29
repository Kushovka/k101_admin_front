import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import Toast from "../../components/toast/Toast";
import { login } from "./auth";
import axios from "axios";

interface SignInFormValues {
  username: string;
  password: string;
}

interface NotifyState {
  message: string;
  type: "error" | "success";
}

export default function SignIn() {
  const isAuth = Boolean(localStorage.getItem("access_token"));
  if (isAuth) return <Navigate to="/account/upload-files" replace />;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<SignInFormValues>();

  const navigate = useNavigate();
  const [notify, setNotify] = useState<NotifyState | null>(null);

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    try {
      await login(data.username, data.password);
      setNotify(null);

      navigate("/account/upload-files");
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
    <section className="flex items-center justify-center h-screen ">
      <form
        className="relative flex flex-col gap-6 p-8 bg-white rounded w-80"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="text-2xl tracking-widest text-black/80 text-center mb-4">
          Войти
        </h3>
        {/* login */}
        <div className="relative flex items-center justify-between">
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="username"
            {...register("username", { required: true, minLength: 4 })}
          />
          {touchedFields.username && errors.username && (
            <span className="absolute top-0 -right-[70%] ml-2 text-red-500 text-sm whitespace-nowrap">
              *введите username
            </span>
          )}
        </div>
        {/* password */}
        <div className="relative flex items-center justify-between">
          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Пароль"
            {...register("password", { required: true, minLength: 4 })}
          />
          {touchedFields.password && errors.password && (
            <span className="absolute top-0 -right-[63%] ml-2 text-red-500 text-sm whitespace-nowrap">
              *введите пароль
            </span>
          )}
        </div>
        {/* button */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Войти
        </button>
      </form>
      {/* message */}
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
