import clsx from "clsx";
import { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const SearchDetails = () => {
  const location = useLocation();
  const user = location.state;
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [openModalFull, setOpenModalFull] = useState(false);

  if (!user) return <p className="pl-[324px] py-6">Пользователь не найден</p>;

  return (
    <section className="section max-w-full">
      {/* title */}
      <div className="title ">
        Подробрая информация пользователя: {user._source.first_name}
      </div>
      {/* btn-for-back */}
      <div>
        <button
          onClick={() => navigate("/account/search")}
          className="flex items-center gap-3 border px-3 py-2 rounded-[8px] hover:bg-gray-400 hover:text-white transition"
        >
          <IoExitOutline className="rotate-180 h-[25px] w-[25px]" />
          Назад
        </button>
      </div>
      <div className="flex justify-between gap-5 w-full">
        {/* info */}
        <div className="flex gap-10 w-1/3 h-full">
          <div className="border flex flex-col gap-5 p-4 rounded-[12px] w-full">
            <div className="flex items-center justify-center">
              <p className="subtitle text-gray01">Основная информация</p>
            </div>

            <p className="details-text">
              Имя: <span className="text-black">{user._source.last_name}</span>
            </p>

            <p className="details-text">
              Фамилия:{" "}
              <span className="text-black">{user._source.first_name}</span>
            </p>

            <p className="details-text">
              Отчество:{" "}
              <span className="text-black">{user._source.middle_name}</span>
            </p>
            <p className="details-text">
              Телефон: <span className="text-black">{user._source.phone}</span>
            </p>
            <p className="details-text">
              Email: <span className="text-black">{user._source.email}</span>
            </p>
            <p className="details-text">
              Birthday:{" "}
              <span className="text-black">
                {new Date(user._source.birthday).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-5">
          {/* info-full */}
          {!openModalFull && (
            <button
              onClick={() => setOpenModalFull((prev) => !prev)}
              className=" text-black border px-3 py-2 rounded cursor-pointer z-50"
            >
              показать подробную информацию
            </button>
          )}

          {openModalFull && (
            <div className="relative flex gap-10 w-full">
              {!openModalFull && (
                <div className="absolute w-full h-full rounded-[12px] bg-black/50 top-0 left-0">
                  {" "}
                </div>
              )}
              <div
                className={clsx(
                  "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                  !openModalFull && "blur-sm"
                )}
              >
                <div
                  onClick={() => setOpenModalFull((prev) => !prev)}
                  className="flex items-center justify-center"
                >
                  <p className="subtitle text-gray01">Подробная информация</p>
                </div>

                <p className="details-text">
                  <span className="text-black">
                    {user._source.last_name} {user._source.first_name}{" "}
                    {user._source.middle_name} -{" "}
                    {new Date(user._source.birthday).toLocaleDateString()}
                  </span>
                </p>
                <p className="details-text">
                  <span className="text-black">
                    СНИЛС: {user._source.snils || ""}
                  </span>
                </p>
                <p className="details-text">
                  <span className="text-black">
                    Адрес проживания: {user._source.address || ""}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Dossie */}
          {!openModal && (
            <button
              onClick={() => setOpenModal((prev) => !prev)}
              className=" text-black border px-3 py-2 rounded cursor-pointer z-50"
            >
              показать досье
            </button>
          )}
          {openModal && (
            <div className="relative flex gap-10 w-full">
              {!openModal && (
                <div className="absolute w-full h-full rounded-[12px] bg-black/50 top-0 left-0">
                  {" "}
                </div>
              )}
              <div
                className={clsx(
                  "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                  !openModal && "blur-sm"
                )}
              >
                <div
                  onClick={() => setOpenModal((prev) => !prev)}
                  className="flex items-center justify-center"
                >
                  <p className="subtitle text-gray01">Досье</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchDetails;
