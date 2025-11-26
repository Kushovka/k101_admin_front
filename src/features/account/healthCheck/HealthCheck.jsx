const HealthCheck = () => {
  return (
    <section className="p-6 flex flex-col gap-4">
      <div className="title">Health Check</div>
      <p className="text-gray01 text-[14px]">
        *Проверка состояния Admin Panel и Gateway.
      </p>
      <div className="border flex flex-col gap-5 p-4 rounded-[12px] w-1/3 text-gray01">
        <p className="flex items-center gap-5">status:</p>
        <p className="flex items-center gap-5">service:</p>
        <p className="flex items-center gap-5">version:</p>
        <p className="flex items-center gap-5">gateway - status:</p>
        <p className="flex items-center gap-5">url:</p>
        <p className="flex items-center gap-5">service:</p>
      </div>
    </section>
  );
};

export default HealthCheck;
