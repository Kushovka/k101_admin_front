/* ==== полный компонент ниже ==== */

import clsx from "clsx";
import React, { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { IoIosArrowDown } from "react-icons/io";
import type { SearchUser } from "../../../types/searchDetails.types";

/* ==== semantic helpers ==== */

const isLatLon = (v: any) => {
  if (typeof v !== "string" && typeof v !== "number") return false;
  const n = parseFloat(String(v).replace(",", "."));
  return !isNaN(n) && n >= -180 && n <= 180;
};

const semanticGroups = {
  contacts: ["phones", "emails", "rfcont", "rfcont_name"],
  docs: ["passport", "паспорт", "serial", "number", "snils"],
  work: [
    "fb",
    "facebook",
    "fb_profile_id",
    "fb_work",
    "external_share_link",
    "pic_max",
  ],
  transport: ["gibdd", "gibdd2", "car", "vin", "plate"],
  delivery: ["delivery", "delivery2", "yandex"],
  marketplace: ["avito", "wildberries", "wb"],
  geo: ["lat", "lon", "широта", "долгота"],
  security: ["password", "checkword", "external_auth_id", "login"],
  crm: ["lid", "crm"],
};

/* ==== prefix labeling ==== */
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

/* ==== main comp ==== */

const SearchDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const user = location.state as SearchUser | null;

  const [notify, setNotify] = useState(false);
  const [openMain, setOpenMain] = useState(true);
  const [openDossier, setOpenDossier] = useState(true);

  if (!user) return <p className="pl-[324px] py-6">Пользователь не найден</p>;

  const cascade = user.additional_data ?? {};

  /* ==== semantic containers ==== */

  const buckets = {
    contacts: {},
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

    /* prefix detect */
    const prefix = key.split("_")[0].toLowerCase();

    /* semantic classify */
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

    /* geo special detect */
    if (target === "misc") {
      if (
        isLatLon(value) ||
        normalizedKey.includes("lat") ||
        normalizedKey.includes("lon")
      ) {
        target = "geo";
      }
    }

    buckets[target][key] = value;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotify(true);
    setTimeout(() => setNotify(false), 1200);
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

      <div className="title">
        Досье: {user.last_name} {user.first_name} {user.middle_name}
      </div>

      <button
        onClick={() => navigate("/account/search")}
        className="flex items-center gap-3 border px-3 py-2 rounded-[8px] hover:bg-gray-400 hover:text-white transition mb-4"
      >
        <IoExitOutline className="rotate-180 h-[25px] w-[25px]" />
        Назад
      </button>

      {/* ==== MAIN INFO ==== */}
      <div
        className="border rounded p-4 mb-4 cursor-pointer"
        onClick={() => setOpenMain(!openMain)}
      >
        <div className="flex justify-between">
          <div className="font-medium">Основная информация</div>
          <IoIosArrowDown
            className={`transition ${openMain ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {openMain && (
        <div className="border rounded p-4 mb-8 flex flex-col gap-2">
          {user.phones && user.phones.length > 0 && (
            <p>
              Телефон:{" "}
              <span
                className="cursor-copy"
                onClick={() => handleCopy(user.phones![0])}
              >
                {user.phones![0]}
              </span>
            </p>
          )}
          {user.emails?.map((e, i) => (
            <p key={i}>
              Email {i + 1}:{" "}
              <span className="cursor-copy" onClick={() => handleCopy(e)}>
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

      {/* ==== DOSSIER ==== */}
      <div
        className="border rounded p-4 mb-4 cursor-pointer"
        onClick={() => setOpenDossier(!openDossier)}
      >
        <div className="flex justify-between">
          <div className="font-medium">Досье</div>
          <IoIosArrowDown
            className={`transition ${openDossier ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {openDossier && (
        <div className="border rounded p-4 flex flex-col gap-6">
          {Object.entries(buckets).map(([bucket, data]) => {
            if (Object.keys(data).length === 0) return null;

            const titleMap = {
              contacts: "Контакты",
              docs: "Документы",
              work: "Работа / Соц сети",
              transport: "Транспорт",
              marketplace: "Маркетплейсы",
              delivery: "Доставка",
              geo: "Гео",
              security: "Безопасность",
              crm: "CRM",
              misc: "Прочее",
            };

            return (
              <div key={bucket}>
                <div className="font-medium mb-2">
                  {titleMap[bucket as keyof typeof titleMap]}
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  {Object.entries(data).map(([field, val]) => (
                    <div key={field} className="flex gap-2">
                      <span className="text-gray-600 min-w-[180px]">
                        {field}:
                      </span>
                      <span className="text-black">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SearchDetails;
