import clsx from "clsx";
import { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { IoIosArrowDown } from "react-icons/io";

const SearchDetails = () => {
  const location = useLocation();
  const user = location.state;
  const navigate = useNavigate();

  const [openDossier, setOpenDossier] = useState(false);
  const [openModalFull, setOpenModalFull] = useState(false);
  const [basicInfo, setBasicInfo] = useState(false);

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
            `${capitalize(user.last_name)} ${capitalize(
              user.first_name
            )} ${capitalize(user.middle_name)}`
          )
        }
        className="title cursor-copy"
      >
        Подробрая информация пользователя: {capitalize(user.last_name)}{" "}
        {capitalize(user.first_name)} {capitalize(user.middle_name)}
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

      {/* основная информация */}
      <div className="flex flex-col justify-between gap-5 w-full">
        {/* основная информация */}
        <div className="flex flex-col">
          <div
            className="flex gap-10 w-full h-full cursor-pointer select-none"
            onClick={() => setBasicInfo((prev) => !prev)}
          >
            <div
              className={clsx(
                "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                basicInfo ? "rounded-b-none border-b-0" : ""
              )}
            >
              <div className="flex items-center justify-center">
                <p className="subtitle text-gray01 flex items-center justify-center gap-2">
                  Основная информация{" "}
                  <IoIosArrowDown
                    className={clsx(
                      "w-6 h-6 transition-all duration-300",
                      basicInfo ? "rotate-180" : ""
                    )}
                  />
                </p>
              </div>
            </div>
          </div>

          {basicInfo && (
            <div className="flex gap-10 w-full h-full -space-y-5">
              <div className="border-x border-b rounded-t-none flex flex-col gap-5 p-4 rounded-[12px] w-full">
                {/* <div className="flex items-center justify-center">
                <p className="subtitle text-gray01">Основная информация</p>
              </div> */}
                {/* фамилия */}
                {user.last_name && (
                  <p className="details-text">
                    Фамилия:{" "}
                    <span
                      className="text-black cursor-copy"
                      onClick={() => handleCopy(`${user.last_name}`)}
                    >
                      {capitalize(user.last_name) || ""}
                    </span>
                  </p>
                )}
                {/* имя */}
                {user.first_name && (
                  <p className="details-text">
                    Имя:{" "}
                    <span
                      onClick={() => handleCopy(`${user.first_name}`)}
                      className="text-black cursor-copy"
                    >
                      {capitalize(user.first_name)}
                    </span>
                  </p>
                )}
                {/* отчество */}
                {user.middle_name && (
                  <p className="details-text">
                    Отчество:{" "}
                    <span
                      onClick={() => handleCopy(`${user.middle_name}`)}
                      className="text-black cursor-copy"
                    >
                      {capitalize(user.middle_name)}
                    </span>
                  </p>
                )}
                {/* дата рождения */}
                {user.birthdays[0] && (
                  <p className="details-text">
                    Дата рождения:{" "}
                    <span
                      onClick={() => handleCopy(`${user.birthdays[0]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.birthdays[0]}
                    </span>
                  </p>
                )}
                {/* телефон */}
                {user.phones[0] && (
                  <p className="details-text">
                    Телефон:{" "}
                    <span
                      onClick={() => handleCopy(`${user.phones[0]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.phones[0]}
                    </span>
                  </p>
                )}
                {/* емаилы */}
                {user.emails[0] && (
                  <p className="details-text">
                    Email №1:{" "}
                    <span
                      onClick={() => handleCopy(`${user.emails[0]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.emails[0]}
                    </span>
                  </p>
                )}
                {user.emails[1] && (
                  <p className="details-text">
                    Email №2:{" "}
                    <span
                      onClick={() => handleCopy(`${user.emails[1]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.emails[1]}
                    </span>
                  </p>
                )}
                {/* регион */}
                {user.additional_data?.Регион?.value && (
                  <p className="details-text">
                    Регион:{" "}
                    <span
                      onClick={() =>
                        handleCopy(`${user.additional_data?.Регион?.value}`)
                      }
                      className="text-black cursor-copy"
                    >
                      {user.additional_data?.Регион?.value}
                    </span>
                  </p>
                )}
                {/* город проживания */}
                {user.cities[0] && (
                  <p className="details-text">
                    Город:{" "}
                    <span
                      onClick={() => handleCopy(`${user.cities[0]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.cities[0]}
                    </span>
                  </p>
                )}
                {/* адреса */}
                {user.addresses[0] && (
                  <p className="details-text">
                    Адрес №1:{" "}
                    <span
                      onClick={() => handleCopy(`${user.addresses[0]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.addresses[0]}
                    </span>
                  </p>
                )}
                {user.addresses[1] && (
                  <p className="details-text">
                    Адрес №2:{" "}
                    <span
                      onClick={() => handleCopy(`${user.addresses[1]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.addresses[1]}
                    </span>
                  </p>
                )}
                {user.addresses[2] && (
                  <p className="details-text">
                    Адрес №3:{" "}
                    <span
                      onClick={() => handleCopy(`${user.addresses[2]}`)}
                      className="text-black cursor-copy"
                    >
                      {user.addresses[2]}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* подробная информация  */}
        <div>
          <div
            className="flex gap-10 w-full h-full cursor-pointer select-none"
            onClick={() => setOpenModalFull((prev) => !prev)}
          >
            <div
              className={clsx(
                "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                openModalFull ? "rounded-b-none border-b-0" : ""
              )}
            >
              <div className="flex items-center justify-center">
                <p className="subtitle text-gray01 flex items-center justify-center gap-2">
                  Подробная информация{" "}
                  <IoIosArrowDown
                    className={clsx(
                      "w-6 h-6 transition-all duration-300",
                      openModalFull ? "rotate-180" : ""
                    )}
                  />
                </p>
              </div>
            </div>
          </div>

          {openModalFull && (
            <div className="relative flex gap-10 w-full -space-y-5">
              <div
                className={clsx(
                  "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                  openModalFull ? "border-t-0 rounded-t-none" : ""
                )}
              >
                <p className="details-text">
                  <span className="text-black">
                    {capitalize(user.last_name)} {capitalize(user.first_name)}{" "}
                    {capitalize(user.middle_name)}{" "}
                    {user.birthday
                      ? "- " + new Date(user.birthday).toLocaleDateString()
                      : ""}
                  </span>
                </p>
                {/* snils */}
                <p className="details-text">
                  {user.snils[0] && (
                    <span
                      onClick={() => handleCopy(`${user.snils[0]}`)}
                      className="text-black cursor-copy"
                    >
                      СНИЛС: {user.snils[0] || ""}
                    </span>
                  )}
                </p>
                {/* pasport */}
                <p className="details-text flex gap-2">
                  {user.additional_data.serial?.value && (
                    <span
                      onClick={() =>
                        handleCopy(`${user.additional_data.serial?.value}`)
                      }
                      className="text-black cursor-copy"
                    >
                      Серия: {user.additional_data.serial?.value || ""}
                    </span>
                  )}
                  {user.additional_data.number?.value && (
                    <span
                      onClick={() =>
                        handleCopy(`${user.additional_data.number?.value}`)
                      }
                      className="text-black cursor-copy"
                    >
                      Номер: {user.additional_data.number?.value || ""}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Досье */}
        <div>
          <div
            className="flex gap-5 w-full h-full cursor-pointer select-none"
            onClick={() => setOpenDossier((prev) => !prev)}
          >
            <div
              className={clsx(
                "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                openDossier ? "rounded-b-none border-b-0" : ""
              )}
            >
              <div className="flex items-center justify-center">
                <p className="subtitle text-gray01 flex items-center justify-center gap-2">
                  Досье{" "}
                  <IoIosArrowDown
                    className={clsx(
                      "w-6 h-6 transition-all duration-300",
                      openDossier ? "rotate-180" : ""
                    )}
                  />
                </p>
              </div>
            </div>
          </div>

          {openDossier && (
            <div className="relative flex gap-5 w-full -space-y-5">
              <div
                className={clsx(
                  "border flex flex-col gap-5 p-4 rounded-[12px] w-full",
                  openDossier && "border-t-0 rounded-t-none"
                )}
              >
                <div
                  onClick={() => setOpenDossier((prev) => !prev)}
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
