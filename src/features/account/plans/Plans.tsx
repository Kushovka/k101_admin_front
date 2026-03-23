import clsx from "clsx";
import React from "react";
import { IoClose } from "react-icons/io5";
import { MdArchive, MdVisibilityOff } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import Toast from "../../../components/toast/Toast";
import Loader from "../../../components/loader/Loader";
import { motion } from "framer-motion";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import {
  allPlans,
  createPlans,
  updatePlans,
  archivedPlans,
  allArchivedPlans,
  unarchivedPlans,
} from "../../../api/plans.api";
import type { PlanItem, CreatePlanPayload } from "../../../types/plans.types";
import type { AxiosError } from "axios";
import Plan from "../../../components/plan/Plan";

type PlanType = "month" | "clicks";

const Plans: React.FC = () => {
  const { isOpen } = useSidebar();

  const [plans, setPlans] = React.useState<PlanItem[]>([]);
  const [archivePlans, setArchivePlans] = React.useState<PlanItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [openArchivedPlans, setOpenArchivedPlans] =
    React.useState<boolean>(false);
  const [planIdEditing, setPlanIdEditing] = React.useState<string | null>(null);

  const [namePlan, setNamePlan] = React.useState<string>("");
  const [pricePlan, setPricePlan] = React.useState<string>("");
  const [timePlan, setTimePlan] = React.useState<string>("");
  const [clicksPlan, setClicksPlan] = React.useState<string>("");
  const [planType, setPlanType] = React.useState<PlanType>("month");

  const getPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await allPlans();
      setPlans(res.plans);
    } catch (err) {
      const error = err as AxiosError;
      setError(
        error.response?.status === 500 ? "Сервер ошибка" : "Ошибка загрузки",
      );
    } finally {
      setLoading(false);
    }
  };

  const getArchivedPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await allArchivedPlans();
      setArchivePlans(res.plans);
      const active = await allPlans();
      setPlans(active.plans);
    } catch (err) {
      const error = err as AxiosError;
      setError(
        error.response?.status === 500 ? "Сервер ошибка" : "Ошибка загрузки",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getPlans();
    getArchivedPlans();
  }, []);

  const openAdd = () => {
    setPlanIdEditing(null);
    setNamePlan("");
    setPricePlan("");
    setTimePlan("");
    setClicksPlan("");
    setPlanType("month");
    setOpenModal(true);
  };

  const openEdit = (plan: PlanItem) => {
    setPlanIdEditing(plan.id);
    setNamePlan(plan.plan_name);
    setPricePlan(String(plan.price));
    setTimePlan(plan.month ? String(plan.month) : "");
    setClicksPlan(plan.clicks ? String(plan.clicks) : "");
    setPlanType(plan.clicks ? "clicks" : "month");
    setOpenModal(true);
  };

  const handleSavePlan = async () => {
    if (
      !namePlan ||
      !pricePlan ||
      (planType === "month" && !timePlan) ||
      (planType === "clicks" && !clicksPlan)
    )
      return;
    setLoading(true);
    setError(null);

    try {
      const payload: CreatePlanPayload = {
        plan_name: namePlan,
        price: Number(pricePlan),
        ...(planType === "month" && { month: Number(timePlan) }),
        ...(planType === "clicks" && { clicks: Number(clicksPlan) }),
      };

      planIdEditing
        ? await updatePlans(planIdEditing, payload)
        : await createPlans(payload);

      const updated = await allPlans();
      setPlans(updated.plans);
      setOpenModal(false);
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const handleArchived = async (id: string) => {
    setLoading(true);
    try {
      await archivedPlans(id);
      const updated = await allPlans();
      setPlans(updated.plans);
      const res = await allArchivedPlans();
      setArchivePlans(res.plans);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    setLoading(true);
    try {
      await unarchivedPlans(id);
      const active = await allPlans();
      setPlans(active.plans);
      const arch = await allArchivedPlans();
      setArchivePlans(arch.plans);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <h1 className="text-[24px] font-medium tracking-tight text-slate-900">
        Все тарифные планы
      </h1>

      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {loading && <Loader fullScreen />}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <Plan
              name={plan.plan_name}
              price={plan.price}
              duration={plan.month}
              clicks={plan.clicks}
              archived={true}
              className="bg-cyan-50 border border-cyan-200"
              onClick={() => openEdit(plan)}
              onClick_archived={() => handleArchived(plan.id)}
            />
          </motion.div>
        ))}
      </div>

      <div
        data-tooltip-id="add-tooltip"
        onClick={openAdd}
        className="fixed bottom-8 right-8 z-50 bg-white shadow-lg border rounded-full p-4 hover:shadow-xl transition cursor-pointer"
      >
        <IoClose className="rotate-45 w-7 h-7 text-slate-700" />
        <Tooltip
          id="add-tooltip"
          content="Добавить тарифный план"
          place="left"
          delayShow={400}
        />
      </div>

      <div
        data-tooltip-id="arch-tooltip"
        onClick={() => setOpenArchivedPlans((x) => !x)}
        className="fixed bottom-28 right-8 z-50 bg-white shadow-lg border rounded-full p-4 hover:shadow-xl transition cursor-pointer"
      >
        {openArchivedPlans ? (
          <MdVisibilityOff className="w-7 h-7 text-slate-700" />
        ) : (
          <MdArchive className="w-7 h-7 text-slate-700" />
        )}
        <Tooltip
          id="arch-tooltip"
          content={openArchivedPlans ? "Скрыть архивные" : "Архивные планы"}
          place="left"
          delayShow={400}
        />
      </div>

      {openArchivedPlans && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {archivePlans.map((plan) => (
            <Plan
              key={plan.id}
              name={plan.plan_name}
              price={plan.price}
              duration={plan.month}
              clicks={plan.clicks}
              archived={false}
              className="bg-red-50 border border-red-200"
              onClick_archived={() => handleUnarchive(plan.id)}
            />
          ))}
        </div>
      )}

      {openModal && (
        <div
          onClick={() => setOpenModal(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-[420px] flex flex-col gap-6 p-6"
          >
            {/* TITLE */}
            <p className="text-[18px] font-semibold tracking-tight text-slate-900 text-center">
              {planIdEditing ? "Редактирование плана" : "Новый тарифный план"}
            </p>

            {/* NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] text-slate-600">Название</label>
              <input
                value={namePlan}
                onChange={(e) => setNamePlan(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="PLUS"
              />
            </div>

            {/* PRICE */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] text-slate-600">Цена</label>
              <input
                value={pricePlan}
                onChange={(e) => setPricePlan(e.target.value)}
                type="number"
                className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="3000"
              />
            </div>

            {/* TYPE */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] text-slate-600">Тип тарифа</label>

              <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 text-[14px]">
                <button
                  type="button"
                  onClick={() => setPlanType("month")}
                  className={clsx(
                    "px-3 py-2 rounded-md transition",
                    planType === "month"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-800",
                  )}
                >
                  месяцы
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType("clicks")}
                  className={clsx(
                    "px-3 py-2 rounded-md transition",
                    planType === "clicks"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-800",
                  )}
                >
                  клики
                </button>
              </div>
            </div>

            {/* MONTH FIELD */}
            {planType === "month" && (
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-slate-600">
                  Количество месяцев
                </label>
                <input
                  value={timePlan}
                  onChange={(e) => setTimePlan(e.target.value)}
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="3"
                />
              </div>
            )}

            {/* CLICKS FIELD */}
            {planType === "clicks" && (
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-slate-600">
                  Количество кликов
                </label>
                <input
                  value={clicksPlan}
                  onChange={(e) => setClicksPlan(e.target.value)}
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="1000"
                />
              </div>
            )}

            {/* ACTION */}
            <button
              onClick={handleSavePlan}
              className="px-4 py-2 rounded-lg border text-slate-900 text-sm font-medium hover:bg-green-500 hover:text-white transition w-full"
            >
              {planIdEditing ? "Сохранить" : "Добавить план"}
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Plans;
