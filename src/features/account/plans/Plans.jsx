import clsx from "clsx";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Plan from "../../../components/plan/Plan";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  allArchivedPlans,
  allPlans,
  archivedPlans,
  unarchivedPlans,
} from "../../../api/admin";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { MdArchive } from "react-icons/md";
import { MdVisibilityOff } from "react-icons/md";
import Toast from "../../../components/toast/Toast";
import Loader from "../../../components/loader/Loader";
import api from "../../../api/axios";

const API_URL = "http://192.168.0.45:18100";

const Plans = () => {
  const { isOpen } = useSidebar();
  const [plans, setPlans] = useState([]);
  const [archivePlans, setArchivePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // модалки
  const [openModal, setOpenModal] = useState(false);
  const [planIdEditing, setPlanIdEditing] = useState(null);
  const [openArchivedPlans, setOpenArchivedPlans] = useState(false);

  // поля формы
  const [namePlan, setNamePlan] = useState("");
  const [pricePlan, setPricePlan] = useState("");
  const [timePlan, setTimePlan] = useState("");
  const [clicksPlan, setClicksPlan] = useState("");
  const [planType, setPlanType] = useState("month");

  // получение всех планов
  const getPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await allPlans();
      setPlans(res.plans);
      console.log(res);
    } catch (err) {
      console.error("Ошибка API:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS"
      );
    } finally {
      setLoading(false);
    }
  };
  console.log(plans);
  useEffect(() => {
    getPlans();
  }, []);

  // получение всех архивных планов
  const getArchivedPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await allArchivedPlans();
      setArchivePlans(res.plans);
      const updatedPlans = await allPlans();
      setPlans(updatedPlans.plans ?? []);
    } catch (err) {
      console.error("Ошибка API:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArchivedPlans();
  }, []);

  // открыть модалку добавления
  const openAdd = () => {
    setPlanIdEditing(null);
    setNamePlan("");
    setPricePlan("");
    setTimePlan("");
    setOpenModal(true);
  };

  // открыть модалку редактирования
  const openEdit = (plan) => {
    setPlanIdEditing(plan.id);
    setNamePlan(plan.plan_name);
    setPricePlan(plan.price);
    setTimePlan(plan.month ?? "");
    setClicksPlan(plan.clicks ?? "");
    setPlanType(plan.clicks ? "clicks" : "month");
    setOpenModal(true);
  };

  // сохранение (добавление или редактирование)
  const handleSavePlan = async () => {
    if (
      !namePlan ||
      !pricePlan ||
      (planType === "month" && timePlan === "") ||
      (planType === "clicks" && clicksPlan === "")
    )
      return;

    setLoading(true);
    setError(null);

    try {
      // Берем старый план, если редактируем
      const oldPlan = planIdEditing
        ? plans.find((p) => p.id === planIdEditing) || {}
        : {};

      const payload = {
        plan_name: namePlan,
        price: Number(pricePlan),
      };

      if (planType === "month") {
        payload.month = Number(timePlan);
      }

      if (planType === "clicks") {
        payload.clicks = Number(clicksPlan);
      }
      console.log("PAYLOAD", payload);
      if (planIdEditing) {
        await api.put(`${API_URL}/api/v1/plans/${planIdEditing}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      } else {
        await api.post(`${API_URL}/api/v1/plans`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const updatedPlans = await allPlans();
      setPlans(updatedPlans.plans);
      setOpenModal(false);
      setNamePlan("");
      setPricePlan("");
      setTimePlan("");
      setClicksPlan("");
      setPlanIdEditing(null);
      setPlanType("month");
    } catch (err) {
      console.error("Ошибка API:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при сохранении плана"
          : "Сетевая ошибка или CORS"
      );
    } finally {
      setLoading(false);
    }
  };

  // архивировать план
  const handleArchived = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await archivedPlans(id);
      const updatedPlans = await allPlans();
      setPlans(updatedPlans.plans);
      const res = await allArchivedPlans();
      setArchivePlans(res.plans);
    } catch (err) {
      console.error("Ошибка API:", err);
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS"
      );
    } finally {
      setLoading(false);
    }
  };

  // разархивировать план
  const handleUnarchive = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await unarchivedPlans(id);
      const updatedPlans = await allPlans();
      setPlans(updatedPlans.plans);
      const archivedPlans = await allArchivedPlans();
      setArchivePlans(archivedPlans.plans);
    } catch (err) {
      setError(
        err.response
          ? err.response.status === 500
            ? "Сервер временно недоступен. Попробуйте позже."
            : "Ошибка при загрузке пользователей"
          : "Сетевая ошибка или CORS"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Все тарифные планы</div>

      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      {loading && <Loader />}

      {/* все активные тарифные планы */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {plans.map((plan, idx) => (
          <div key={idx}>
            <Plan
              key={plan.id}
              name={plan.plan_name}
              price={plan.price}
              duration={plan.month}
              clicks={plan.clicks}
              archived={true}
              className={"bg-green-500/15"}
              onClick={() => openEdit(plan)}
              onClick_archived={() => handleArchived(plan.id)}
            />
            {plan.archived === true && <div>{plan.price}</div>}
          </div>
        ))}
      </div>

      {/* кнопка добавления */}
      <div
        data-tooltip-id="add_plans-tooltip"
        onClick={openAdd}
        className="fixed z-50 bg-gray01/40 bottom-8 right-8 hover:bottom-7 hover:right-7 border rounded-full p-4 group cursor-pointer hover:bg-green-300/50 transition-all duration-200 "
      >
        <IoClose className="group-hover:w-10 group-hover:h-10 w-8 h-8 rotate-45 transition-all duration-200 cursor-pointer" />
        <Tooltip
          place="left"
          effect="float"
          delayShow={400}
          content="Добавить тарифный план"
          id="add_plans-tooltip"
        />
      </div>

      {/* кнопка архивных чатов */}
      <div
        data-tooltip-id="archive_plans-tooltip"
        onClick={() => setOpenArchivedPlans((prev) => !prev)}
        className="fixed z-50 bg-gray01/40 bottom-28 right-8 hover:bottom-[108px] hover:right-7 border rounded-full p-4 group cursor-pointer hover:bg-green-300/50 transition-all duration-150 "
      >
        {openArchivedPlans ? (
          <MdVisibilityOff className="group-hover:w-10 group-hover:h-10 w-8 h-8 transition-all duration-150 cursor-pointer" />
        ) : (
          <MdArchive className="group-hover:w-10 group-hover:h-10 w-8 h-8 transition-all duration-150 cursor-pointer" />
        )}
        <Tooltip
          place="left"
          delayShow={400}
          content={
            openArchivedPlans ? "Скрыть архивные планы" : "Архивные планы"
          }
          id="archive_plans-tooltip"
        />
      </div>

      {/* архивные планы */}
      {openArchivedPlans && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {archivePlans.map((plan, index) => (
            <div>
              <Plan
                key={plan.id}
                name={plan.plan_name}
                price={plan.price}
                duration={plan.month}
                clicks={plan.clicks}
                className={"bg-red01/15"}
                archived={false}
                onClick_archived={() => handleUnarchive(plan.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* универсальная модалка */}
      {openModal && (
        <div
          onClick={() => setOpenModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg w-80 flex flex-col gap-4"
          >
            <p className="text-lg font-semibold mb-4 text-center">
              {planIdEditing
                ? "Редактирование тарифного плана"
                : "Создайте тарифный план"}
            </p>

            <div className="flex flex-col gap-2">
              <label>Название плана</label>
              <input
                value={namePlan}
                onChange={(e) => setNamePlan(e.target.value)}
                type="text"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="*PLUS"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label>Сумма</label>
              <input
                value={pricePlan}
                onChange={(e) => setPricePlan(e.target.value)}
                type="number"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="*3000"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label>Тип тарифа</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="planType"
                    value="month"
                    checked={planType === "month"}
                    onChange={() => setPlanType("month")}
                  />
                  месяцы
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="planType"
                    value="clicks"
                    checked={planType === "clicks"}
                    onChange={() => setPlanType("clicks")}
                  />
                  клики
                </label>
              </div>
            </div>
            {planType === "month" && (
              <div className="flex flex-col gap-2">
                <label>Количество месяцев</label>
                <input
                  value={timePlan}
                  onChange={(e) => setTimePlan(e.target.value)}
                  type="number"
                  className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="*3"
                />
              </div>
            )}
            {planType === "clicks" && (
              <div className="flex flex-col gap-2">
                <label>Количество кликов</label>
                <input
                  value={clicksPlan}
                  onChange={(e) => setClicksPlan(e.target.value)}
                  type="number"
                  className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="*1000"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSavePlan}
              className="uppercase border px-2 py-1 rounded text-black font-medium hover:bg-green-500/70 transition duration-300 w-full"
            >
              {planIdEditing ? "Сохранить" : "Добавить план"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Plans;
