import clsx from "clsx";
import React from "react";
import CountUp from "react-countup";
import { FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdRestore } from "react-icons/md";

import type { PlanType, PlanProps } from "../../types/plans.types";

const Plan: React.FC<PlanProps> = ({
  name,
  price,
  duration,
  clicks,
  type = "month",
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
    <>
      <div
        className={clsx(
          "relative border flex flex-col items-center gap-9 p-4 rounded-[12px] w-full",
          className
        )}
      >
        <div className="flex items-center justify-center">
          <p className="subtitle text-gray01 text-[32px] uppercase">{name}</p>
        </div>

        <div className=" flex items-end gap-3">
          <p className="subtitle leading-none text-gray01 text-[52px]">
            <CountUp start={100} end={price} duration={0.5} />₽
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="details-text text-[24px] flex items-baseline gap-2">
            <span className="text-3xl text-blue-500 ">
              {typeof clicks === "number"
                ? `${clicks} кликов`
                : typeof duration === "number"
                ? `${duration} ${getMonth(duration)}`
                : null}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center">
          <button className="uppercase bg-blue-500 px-5 py-2 rounded text-white">
            выбрать
          </button>
        </div>
        {archived ? (
          <div className="absolute top-3 right-3 flex items-center justify-center gap-2">
            <FaPen onClick={onClick} className="w-4 h-4  cursor-pointer" />

            <IoMdClose
              onClick={onClick_archived}
              className="w-6 h-6  cursor-pointer"
            />
          </div>
        ) : (
          <div className="absolute top-3 right-3 flex items-center justify-center gap-2">
            <MdRestore
              onClick={onClick_archived}
              className="w-6 h-6  cursor-pointer"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Plan;
