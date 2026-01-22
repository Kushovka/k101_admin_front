import clsx from "clsx";
import React, { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "framer-motion";
import type { SearchUser } from "../../../types/searchDetails.types";

/* semantic helpers */
const isLatLon = (v: any) => {
  if (typeof v !== "string" && typeof v !== "number") return false;
  const n = parseFloat(String(v).replace(",", "."));
  return !isNaN(n) && n >= -180 && n <= 180;
};

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

const semanticGroups = {
  contacts: ["phones", "emails", "rfcont", "rfcont_name"],
  personal: [
    "грудь",
    "breast",
    "размер одежды",
    "clothing size",
    "рост",
    "height",
    "девушка",
    "nickname",
    "вес",
    "weight",
    "размер обуви",
    "shoes size",
    "номер анкеты",
    "anketa_id",
    "район",
    "area",
    "метро",
    "metro",
    "дата обновления",
    "updated ",
  ],
  docs: ["passport", "паспорт", "serial", "number", "snils"],
  work: [
    "fb",
    "facebook",
    "fb_profile_id",
    "fb_work",
    "external_share_link",
    "pic_max",
    "дата резюме",
    "зарплата",
    "образование",
    "профессия",
  ],
  transport: [
    "gibdd",
    "gibdd2",
    "car",
    "vin",
    "plate",
    "год вып",
    "кпп",
    "Кол-во хозяев по ПТС",
    "модель",
    "модификация",
    "наличие / таможня",
    "номер владельца",
    "обмен",
    "привод",
    "пробег",
    "руль",
    "состояние",
    "тип кузова/цвет",
    "цена",
    "кол-во хозяев по птс",
  ],
  delivery: [
    "delivery",
    "delivery2",
    "yandex",
    "comment",
    "commission",
    "currency code",
    "date added",
    "ip",
    "order id",
    "order status id",
    "password",
    "payment code",
    "payment country",
    "payment method",
    "payment postcode",
    "payment zone",
    "shipping address 1",
    "shipping city",
    "shipping country",
    "shipping method",
    "status",
    "user agent",
    "accept language",
  ],
  marketplace: ["avito", "wildberries", "wb"],
  geo: ["lat", "lon", "широта", "долгота"],
  security: ["password", "checkword", "external_auth_id", "login"],
  crm: [
    "lid",
    "crm",
    "активность",
    "активные сделки",
    "должности контактных лиц",
    "должность",
    "избранное",
    "информация о контактных лицах",
    "количество активных коммуникаций",
    "количество завершенных сделок",
    "количество коммуникаций",
    "количество неоплаченных счетов",
    "количество сделок",
    "количество счетов",
    "компания",
    "непрочитанные комментарии",
    "плательщики",
    "создана",
    "сумма активных сделок",
    "сумма всех сделок",
    "сумма всех счетов",
    "сумма завершенных сделок",
    "сумма неоплаченных счетов",
    "счетчик дел",
    "тип",
  ],
};

const prefixLabels: Record<string, string> = {
  delivery: "Доставка",
  delivery2: "Доставка (вторичная)",
  yandex: "Доставка Яндекс",
  avito: "Маркетплейсы (Avito)",
  wildberries: "Маркетплейсы (Wildberries)",
  beeline: "Сотовая связь (Beeline)",
  fb: "Работа/Соцсети (Facebook)",
  gibdd: "Транспорт (ГИБДД)",
  rfcont: "Контакты (RF)",
};

const SearchDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const user = location.state as SearchUser | null;

  const [notify, setNotify] = useState(false);
  const [openMain, setOpenMain] = useState(true);
  const [openDossier, setOpenDossier] = useState(true);

  if (!user) {
    return (
      <p className={clsx("pl-[336px] py-6 text-slate-700")}>
        Пользователь не найден
      </p>
    );
  }

  const cascade = user.additional_data ?? {};

  const buckets = {
    contacts: {},
    personal: {},
    docs: {},
    work: {},
    transport: {},
    delivery: {},
    marketplace: {},
    geo: {},
    security: {},
    crm: {},
    misc: {},
  } as Record<string, Record<string, any>>;

  Object.entries(cascade).forEach(([key, raw]) => {
    const value = raw?.value ?? raw;
    const prefix = key.split("_")[0].toLowerCase();
    const normalizedKey = key.toLowerCase();

    let target = "misc";

    for (const [bucket, patterns] of Object.entries(semanticGroups)) {
      if (
        patterns.some((p) => normalizedKey.includes(p) || prefix.includes(p))
      ) {
        target = bucket;
        break;
      }
    }

    if (target === "misc") {
      if (
        isLatLon(value) ||
        normalizedKey.includes("lat") ||
        normalizedKey.includes("lon")
      ) {
        target = "misc";
      }
    }

    buckets[target][key] = value;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotify(true);
    setTimeout(() => setNotify(false), 1200);
  };

  // const isValidName = (val: string) => /^[a-zA-Zа-яА-ЯёЁ-]+$/.test(val);
  const isValidName = (val: string) => /^\p{L}+$/u.test(val);

  const titleMap = {
    contacts: "Контакты",
    personal: "Личная информация",
    docs: "Документы",
    work: "Работа / Соц сети",
    transport: "Транспорт",
    marketplace: "Маркетплейсы",
    delivery: "Доставка",
    geo: "Гео",
    security: "Безопасность",
    crm: "Бизнес / CRM",
    misc: "Прочее",
  };

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
          onClick={() => navigate("/account/search")}
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
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
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
              {user.gender && <p>Пол: {user.gender}</p>}
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

              {user.addresses?.map((a, i) => (
                <p key={i}>
                  Адрес {i + 1}: {a}
                </p>
              ))}
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
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="font-medium text-slate-800">Досье</div>
            <IoIosArrowDown
              className={clsx(
                "transition",
                openDossier && "rotate-180 text-slate-600",
              )}
            />
          </div>

          {openDossier && (
            <div className="px-4 py-4 border-t border-gray-200 space-y-6">
              {Object.entries(buckets).map(([bucket, data]) => {
                if (Object.keys(data).length === 0) return null;

                return (
                  <div key={bucket} className="space-y-2">
                    <div className="font-medium text-slate-800">
                      {titleMap[bucket as keyof typeof titleMap]}
                    </div>

                    <div className="flex flex-col gap-1 text-[14px]">
                      {Object.entries(data).map(([field, val]) => {
                        const keyNormalized = field.toLowerCase();
                        const label = fieldLabels[keyNormalized] ?? field;

                        return (
                          <div
                            key={field}
                            className="flex gap-2 text-slate-700"
                          >
                            <span className="min-w-[180px] text-slate-500">
                              {label}:
                            </span>
                            <span className="text-slate-800">
                              {String(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SearchDetails;
