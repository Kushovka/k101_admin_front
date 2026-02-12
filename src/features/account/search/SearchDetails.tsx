import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import type {
  SearchUser,
  SourceFile,
} from "../../../types/searchDetails.types";

const fieldLabels: Record<string, string> = {
  height: "Рост",
  weight: "Вес",
  breast: "Грудь",
  "clothing size": "Размер одежды",
  "shoes size": "Размер обуви",
  nickname: "Имя",
  anketa_id: "Номер анкеты",
  area: "Район",
  metro: "Метро",
  "updated ": "Дата обновления",
  humannumber: "Номер очереди",
  pic_max: "Фотография",
  external_share_link: "Ссылка на профиль",
  number: "Номер паспорта",
  serial: "Серия паспорта",
  snils: "СНИЛС",
  delivery: "Доставка",
  delivery2: "Доставка",
  yandex: "Яндекс",
  comment: "Комментарий",
  commission: "Комиссия",
  "currency code": "Валюта",
  "date added": "Дата заказа",
  ip: "IP адрес",
  "order id": "ID заказа",
  "order status id": "ID статуса",
  password: "Пароль",
  "payment code": "Код оплаты",
  "payment country": "Страна оплаты",
  "payment method": "Метод оплаты",
  "payment postcode": "Посткод оплаты",
  "payment zone": "Зона оплаты",
  "shipping address 1": "Адрес доставки",
  "shipping city": "Город доставки",
  "shipping country": "Страна доставки",
  "shipping method": "Метод доставки",
  status: "Статус",
  "user agent": "Устройство пользователя",
};

type SearchDetailsState = {
  item: SearchUser;
  searchValue?: string;
  page?: number;
};

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const SearchDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const [notify, setNotify] = useState(false);
  const [openMain, setOpenMain] = useState(true);
  const [openDossier, setOpenDossier] = useState(false);
  const [aiDossier, setAIDossier] = useState("");
  const [dossierLoading, setDossierLoading] = useState(false);

  /* ---------------- helpers ---------------- */
  const state = location.state as SearchDetailsState | null;
  const user = state?.item ?? null;

  const groupedSources = user?.grouped_sources ?? [];

  const sortGroups = (a: { group_name: string }, b: { group_name: string }) => {
    if (a.group_name === "other") return 1;
    if (b.group_name === "other") return -1;
    return 0;
  };

  const getSourceLabel = (sources: SourceFile[]) => {
    if (!sources.length) return null;

    if (sources.length === 1) {
      return (
        sources[0].display_name ||
        sources[0].file_name ||
        sources[0].raw_file_id
      );
    }

    return `${sources.length} источника`;
  };

  if (!user) {
    return (
      <p className={clsx("pl-[336px] py-6 text-slate-700")}>
        Пользователь не найден
      </p>
    );
  }

  const sourceFiles = user.source_files ?? [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotify(true);
    setTimeout(() => setNotify(false), 1200);
  };

  const handleAIDossier = async (id: string) => {
    try {
      setDossierLoading(true);
      const response = await userApi.post(
        "/api/v1/search/dossier",
        { person_id: id },
        { headers: getHeaders() },
      );

      setAIDossier(response.data.dossier);
    } catch (err) {
      console.error(err);
    } finally {
      setDossierLoading(false);
    }
  };

  const isValidName = (val: string) => /^\p{L}+$/u.test(val);

  const personId = user.entity_id;

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {notify && (
        <Toast
          type="access"
          message="СКОПИРОВАНО!"
          onClose={() => setNotify(false)}
        />
      )}

      <div className="w-[1100px] mx-auto flex flex-col gap-6">
        {/* title */}
        <h1 className="text-[20px] font-semibold text-slate-900">
          Досье: {user.last_name} {user.first_name} {user.middle_name}
        </h1>

        {/* back button */}
        <button
          onClick={() =>
            navigate("/account/search", {
              state: {
                restore: true,
                searchValue: location.state?.searchValue,
                page: location.state?.page,
                mode: location.state?.mode,
              },
            })
          }
          className="flex items-center gap-3 h-[40px] w-fit border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition px-3 text-[14px]"
        >
          <IoExitOutline className="rotate-180 h-[20px] w-[20px] text-slate-600" />
          Назад
        </button>

        {/* MAIN INFO */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div
            onClick={() => setOpenMain(!openMain)}
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition  select-none"
          >
            <div className="font-medium text-slate-800">
              Основная информация
            </div>
            <IoIosArrowDown
              className={clsx(
                "transition",
                openMain && "rotate-180 text-slate-600",
              )}
            />
          </div>

          {openMain && (
            <div className="px-4 py-3 border-t border-gray-200 space-y-2 text-[14px] text-slate-700">
              {user?.first_name && isValidName(user.first_name) && (
                <p>
                  Имя: <span>{user?.first_name}</span>
                </p>
              )}

              {user?.last_name && isValidName(user.last_name) && (
                <p>
                  Фамилия: <span>{user?.last_name}</span>
                </p>
              )}

              {user?.middle_name && isValidName(user.middle_name) && (
                <p>
                  Отчество: <span>{user?.middle_name}</span>
                </p>
              )}

              {user.phones?.[0] && (
                <p>
                  Телефон:{" "}
                  <span
                    className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                    onClick={() => handleCopy(user.phones![0])}
                  >
                    {user.phones![0]}
                  </span>
                </p>
              )}
              {user.snils?.[0] && <p>СНИЛС: {user.snils[0]}</p>}
              {user.age && <p>Возраст: {user.age}</p>}
              {user.gender && (
                <p>Пол: {user.gender === "male" ? "Мужской" : "Женский"}</p>
              )}
              {user.birthdays?.[0] && <p>Дата рождения: {user.birthdays[0]}</p>}
              {user.emails?.map((e, i) => (
                <p key={i}>
                  Email {i + 1}:{" "}
                  <span
                    className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                    onClick={() => handleCopy(e)}
                  >
                    {e}
                  </span>
                </p>
              ))}

              {user.cities?.[0] && <p>Город: {user.cities[0]}</p>}
              {user.ipn?.[0] && <p>ИНН: {user.ipn[0]}</p>}

              {user.addresses?.map((a, i) => (
                <p key={i}>
                  Адрес {i + 1}: {a}
                </p>
              ))}

              {/* {user.entity_id && <p>ID: {user.entity_id}</p>} */}
            </div>
          )}
        </motion.div>

        {/* DOSSIER */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div
            onClick={() => setOpenDossier(!openDossier)}
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition select-none"
          >
            <div className="font-medium text-slate-800">Полное досье</div>
            <IoIosArrowDown
              className={clsx(
                "transition",
                openDossier && "rotate-180 text-slate-600",
              )}
            />
          </div>

          {openDossier && (
            <div className="px-4 py-4 border-t border-gray-200 space-y-6">
              {groupedSources
                .slice()
                .sort(sortGroups)
                .map((group) => {
                  if (!group.sources?.length) return null;

                  return (
                    <div key={group.group_name} className="space-y-4">
                      {/* Заголовок группы */}
                      <div className="font-medium text-slate-800">
                        {group.group_name === "other"
                          ? "Другие источники"
                          : `${group.group_name}`}
                      </div>

                      {/* Источники внутри группы */}
                      {group.sources.map((source) => {
                        const sourceName =
                          source.display_name || source.raw_file_id;

                        return (
                          <div
                            key={source.raw_file_id}
                            className="border border-gray-200 rounded-lg p-3 space-y-2"
                          >
                            {/* Источник */}
                            <div className="text-xs text-slate-500">
                              Источник: {sourceName}
                            </div>

                            {/* Поля источника */}
                            <div className="flex flex-col gap-1 text-[14px]">
                              {Object.entries(source.fields).map(
                                ([fieldKey, fieldValue]) => {
                                  const label =
                                    fieldLabels[fieldKey.toLowerCase()] ??
                                    fieldKey;

                                  return (
                                    <div
                                      key={fieldKey}
                                      className="flex gap-2 text-slate-700"
                                    >
                                      <span className="min-w-[180px] text-slate-500">
                                        {label}:
                                      </span>
                                      <span className="text-slate-800 break-all">
                                        {String(fieldValue)}
                                      </span>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>

        {/* досье ии */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-white p-4 flex justify-between items-center select-none">
            <div className="text-[15px] font-medium text-slate-800">
              AI-Досье
            </div>

            <button
              disabled={dossierLoading}
              onClick={() => handleAIDossier(personId)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium",
                dossierLoading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white",
              )}
            >
              {dossierLoading ? "Генерация..." : "Сгенерировать"}
            </button>
          </div>

          {aiDossier && (
            <motion.div
              className="bg-white border-t p-4 whitespace-pre-wrap text-[14px]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {aiDossier}
            </motion.div>
          )}
        </motion.div>

        {/* SOURCE FILES */}
        {sourceFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="font-medium text-slate-800">Источники данных</div>
            </div>

            <div className="px-4 py-3 space-y-2 text-[14px]">
              {sourceFiles.map((file) => {
                const name =
                  file.display_name && file.display_name !== "unknown"
                    ? file.display_name
                    : file.file_name;

                return (
                  <div
                    key={file.raw_file_id}
                    className="flex justify-between items-center text-slate-700"
                  >
                    <span>{name || "Неизвестный файл"}</span>

                    <span className="text-xs text-slate-400">
                      {file.raw_file_id}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SearchDetails;
