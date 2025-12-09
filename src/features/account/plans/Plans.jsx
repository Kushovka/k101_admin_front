import clsx from "clsx";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Plan from "../../../components/plan/Plan";
import { IoClose } from "react-icons/io5";
import { useState } from "react";

const Plans = () => {
  const { isOpen } = useSidebar();
  const [openModalPlan, setOpenModalPlan] = useState(false);

  const [plans, setPlans] = useState([
    { name: "PLUS", price: 5000, duration: 3 },
  ]);

  const [namePlan, setNamePlan] = useState("");
  const [pricePlan, setPricePlan] = useState("");
  const [timePlan, setTimePlan] = useState("");

  const handleAddPlan = () => {
    if (!namePlan || !pricePlan || !timePlan) return; // простая валидация

    const newPlan = {
      name: namePlan,
      price: Number(pricePlan),
      duration: Number(timePlan),
    };

    setPlans((prev) => [...prev, newPlan]);

    // очищаем инпуты и закрываем модалку
    setNamePlan("");
    setPricePlan("");
    setTimePlan("");
    setOpenModalPlan(false);
  };

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <div className="title">Подробная информация пользователя:</div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {plans.map((plan, index) => (
          <Plan
            key={index}
            name={plan.name}
            price={plan.price}
            duration={plan.duration}
          />
        ))}
      </div>

      {/* кнопка добавить */}
      <div
        onClick={() => setOpenModalPlan(true)}
        className="absolute bottom-10 right-10 border rounded-full p-4 cursor-pointer hover:bg-green-300/50 transition duration-300"
      >
        <IoClose className="w-16 h-16 rotate-45 " />
      </div>

      {openModalPlan && (
        <div
          onClick={() => setOpenModalPlan(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()} // чтобы клик внутри модалки не закрывал
            className="bg-white p-6 rounded-lg w-80 flex flex-col gap-4"
          >
            <p className="text-lg font-semibold mb-4 text-center">
              Создайте тарифный план
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
              <label>Количество месяцев</label>
              <input
                value={timePlan}
                onChange={(e) => setTimePlan(e.target.value)}
                type="number"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="*3"
              />
            </div>

            <button
              type="button"
              onClick={handleAddPlan}
              className="uppercase border px-2 py-1 rounded text-black font-medium hover:bg-green-500/70 transition duration-300 w-full"
            >
              добавить план
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Plans;
