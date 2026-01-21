import clsx from "clsx";
import React from "react";
import CountUp from "react-countup";
import { FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdRestore } from "react-icons/md";

import type { PlanProps } from "../../types/plans.types";

const Plan: React.FC<PlanProps> = ({
  name,
  price,
  duration,
  clicks,
  onClick,
  onClick_archived,
  className,
  archived,
}) => {
  function getMonth(number: number) {
    const n = number % 100;
    if (n >= 11 && n <= 14) return "месяцев";
    const lastDigit = n % 10;
    if (lastDigit === 1) return "месяц";
    if (lastDigit >= 2 && lastDigit <= 4) return "месяца";
    return "месяцев";
  }

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-between gap-6",
        "rounded-xl border border-gray-200 bg-white",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "px-6 py-6 w-full min-h-[280px]",
        className
      )}
    >
      {/* NAME */}
      <p className="text-[18px] font-medium text-slate-900 tracking-tight uppercase text-center">
        {name}
      </p>

      {/* PRICE */}
      <div className="flex items-end gap-1">
        <span className="text-[28px] font-semibold text-slate-900 leading-none">
          <CountUp start={100} end={price} duration={0.3} />
        </span>
        <span className="text-[16px] text-slate-600 leading-none">₽</span>
      </div>

      {/* DURATION/CLICKS */}
      <p className="text-[15px] text-cyan-600 font-medium text-center">
        {typeof clicks === "number"
          ? `${clicks} кликов`
          : typeof duration === "number"
          ? `${duration} ${getMonth(duration)}`
          : null}
      </p>

      {/* ACTION BTN */}
      <button
        className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition"
      >
        выбрать
      </button>

      {/* EDIT / ARCHIVE */}
      {archived ? (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <FaPen
            onClick={onClick}
            className="w-4 h-4 text-slate-700 cursor-pointer hover:text-slate-900 transition"
          />
          <IoMdClose
            onClick={onClick_archived}
            className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition"
          />
        </div>
      ) : (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <MdRestore
            onClick={onClick_archived}
            className="w-6 h-6 text-slate-600 cursor-pointer hover:text-slate-800 transition"
          />
        </div>
      )}
    </div>
  );
};

export default Plan;
