import React from "react";
import CountUp from "react-countup";

const Plan = ({ name, price, duration }) => {
  function getMonth(number) {
    const n = number % 100;
    if (n >= 11 && n <= 14) return "месяцев";
    const lastDigit = n % 10;
    if (lastDigit === 1) return "месяц";
    if (lastDigit >= 2 && lastDigit <= 4) return "месяца";
    return "месяцев";
  }
  return (
    <>
      <div className="border flex flex-col items-center gap-9 p-4 rounded-[12px] w-full">
        <div className="flex items-center justify-center">
          <p className="subtitle text-gray01 text-[32px]">{name}</p>
        </div>

        <div className=" flex items-end gap-3">
          <p className="subtitle leading-none text-gray01 text-[52px]">
            <CountUp start={100} end={price} duration={0.5} />₽
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="details-text text-[24px] flex items-baseline gap-2">
            <span className="font-bold text-3xl text-blue-500">
              {`${duration} ${getMonth(duration)}`}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center">
          <button className="uppercase bg-blue-500 px-5 py-2 rounded text-white">
            выбрать
          </button>
        </div>
      </div>
    </>
  );
};

export default Plan;
