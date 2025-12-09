import clsx from "clsx";
import { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";

const SearchDetails = () => {
  const location = useLocation();
  const user = location.state;
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [openModalFull, setOpenModalFull] = useState(false);

  const [notify, setNotify] = useState(false);

  const { isOpen } = useSidebar();

  if (!user) return <p className="pl-[324px] py-6">Пользователь не найден</p>;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotify(true);
    });
  };

  const capitalize = (str = "") =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {notify && (
        <Toast
          type={"access"}
          message={"СКОПИРОВАНО!"}
          onClose={() => setNotify(false)}
        />
      )}
      {/* title */}
      <div
        onClick={() =>
          handleCopy(
            `${capitalize(user._source.last_name)} ${capitalize(
              user._source.first_name
            )} ${capitalize(user._source.middle_name)}`
          )
        }
        className="title cursor-copy"
      >
        Подробрая информация пользователя: {capitalize(user._source.last_name)}{" "}
        {capitalize(user._source.first_name)}{" "}
        {capitalize(user._source.middle_name)}
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
            {/* имя */}
            {user._source.last_name && (
              <p className="details-text">
                Имя:{" "}
                <span
                  className="text-black cursor-copy"
                  onClick={() => handleCopy(`${user._source.last_name}`)}
                >
                  {capitalize(user._source.last_name) || ""}
                </span>
              </p>
            )}
            {/* фамилия */}
            {user._source.first_name && (
              <p className="details-text">
                Фамилия:{" "}
                <span
                  onClick={() => handleCopy(`${user._source.first_name}`)}
                  className="text-black cursor-copy"
                >
                  {capitalize(user._source.first_name)}
                </span>
              </p>
            )}
            {/* отчество */}
            {user._source.middle_name && (
              <p className="details-text">
                Отчество:{" "}
                <span
                  onClick={() => handleCopy(`${user._source.middle_name}`)}
                  className="text-black cursor-copy"
                >
                  {capitalize(user._source.middle_name)}
                </span>
              </p>
            )}
            {/* телефон */}
            {user._source.phone && (
              <p className="details-text">
                Телефон:{" "}
                <span
                  onClick={() => handleCopy(`${user._source.phone}`)}
                  className="text-black cursor-copy"
                >
                  {user._source.phone}
                </span>
              </p>
            )}
            {/* емаил */}
            {user._source.email && (
              <p className="details-text">
                Email:{" "}
                <span
                  onClick={() => handleCopy(`${user._source.email}`)}
                  className="text-black cursor-copy"
                >
                  {user._source.email}
                </span>
              </p>
            )}
            {/* дата рождения */}
            {user._source.birthday && (
              <p className="details-text">
                Дата рождения:{" "}
                <span
                  onClick={() =>
                    handleCopy(
                      `${new Date(user._source.birthday).toLocaleDateString()}`
                    )
                  }
                  className="text-black cursor-copy"
                >
                  {new Date(user._source.birthday).toLocaleDateString()}
                </span>
              </p>
            )}
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
                    {capitalize(user._source.last_name)}{" "}
                    {capitalize(user._source.first_name)}{" "}
                    {capitalize(user._source.middle_name)}{" "}
                    {user._source.birthday
                      ? "- " +
                        new Date(user._source.birthday).toLocaleDateString()
                      : ""}
                  </span>
                </p>
                <p className="details-text">
                  {user._source.snils && (
                    <span
                      onClick={() => handleCopy(`${user._source.snils}`)}
                      className="text-black cursor-copy"
                    >
                      СНИЛС: {user._source.snils || ""}
                    </span>
                  )}
                </p>
                <p className="details-text">
                  {user._source.address && (
                    <span
                      onClick={() => handleCopy(`${user._source.address}`)}
                      className="text-black cursor-copy"
                    >
                      Адрес проживания: {user._source.address || ""}
                    </span>
                  )}
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
