const SystemStatistics = () => {
  return (
    <section className="p-6 flex flex-col gap-4">
      <div className="title">Системная статистика</div>
      <p className="text-gray01 text-[14px]">*Получение статистики системы.</p>
      <div className="border flex flex-col gap-3 p-4 rounded-[12px] w-1/3 text-gray01">
        <p className="flex items-center gap-5">gateway status :</p>
        <p className="flex items-center gap-5">total_files_uploaded:</p>
        <p className="flex items-center gap-5">total_records_parsed:</p>
      </div>
    </section>
  );
};

export default SystemStatistics;
