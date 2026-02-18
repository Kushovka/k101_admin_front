import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { getDatasetById, getDatasets } from "../../../../api/uploadFiles";
import Toast from "../../../../components/toast/Toast";

const DatasetsList = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [openedDataset, setOpenedDataset] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const res = await getDatasets();
      setDatasets(res.datasets);
      console.log(res.datasets);
    } catch (e: any) {
      setError("Ошибка загрузки датасетов");
    }
  };

  const toggleDataset = async (id: string) => {
    if (openedDataset === id) {
      setOpenedDataset(null);
      return;
    }

    setOpenedDataset(id);

    if (!details[id]) {
      try {
        const data = await getDatasetById(id);
        setDetails((prev) => ({ ...prev, [id]: data }));
      } catch {
        setError("Ошибка загрузки информации о датасете");
      }
    }
  };

  return (
    <div className="mt-12">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* HEADER как у очереди */}
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer select-none pb-4 border-b hover:opacity-80 transition"
      >
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
            Датасеты
          </h2>
          <p className="text-sm text-slate-500">Всего: {datasets.length}</p>
        </div>

        <IoIosArrowDown
          className={clsx(
            "w-5 h-5 text-slate-600 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6 flex flex-col gap-4"
        >
          {datasets.slice(0, visibleCount).map((ds) => (
            <div
              key={ds.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              {/* HEADER ДАТАСЕТА */}
              <div
                onClick={() => toggleDataset(ds.id)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {ds.dataset_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Файлов: {ds.total_files} • Entities:{" "}
                    {ds.merged_entities_count}
                  </p>
                </div>

                <IoIosArrowDown
                  className={clsx(
                    "w-5 h-5 text-slate-600 transition-transform duration-200",
                    openedDataset === ds.id && "rotate-180",
                  )}
                />
              </div>

              {/* BODY */}
              {openedDataset === ds.id && details[ds.id] && (
                <div className="px-5 pb-5 border-t bg-slate-50">
                  {/* STATUS */}
                  <div className="text-sm mb-4">
                    <p>
                      Статус:{" "}
                      <span
                        className={clsx(
                          "font-medium",
                          ds.status === "failed" && "text-red-600",
                          ds.status === "completed" && "text-green-600",
                          ds.status === "processing" && "text-blue-600",
                        )}
                      >
                        {ds.status}
                      </span>
                    </p>

                    {ds.error_message && (
                      <p className="text-red-600 text-xs mt-1">
                        {ds.error_message}
                      </p>
                    )}
                  </div>

                  {/* FILES */}
                  <div className="border rounded-lg bg-white divide-y">
                    {details[ds.id].files.map((file: any) => (
                      <div
                        key={file.id}
                        className="px-4 py-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.total_rows} строк • {file.valid_rows} валидных
                          </p>
                        </div>

                        <span className="text-xs text-slate-600">
                          {file.processing_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {visibleCount < datasets.length && (
            <button
              onClick={() => setVisibleCount((p) => p + 10)}
              className="text-sm text-cyan-600 hover:underline"
            >
              Показать ещё
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DatasetsList;
