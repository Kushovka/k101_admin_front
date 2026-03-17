import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {
  getDatasetById,
  getDatasetColumns,
  getDatasets,
  postConfirmDataset,
} from "../../../../api/uploadFiles";
import Toast from "../../../../components/toast/Toast";

const DatasetsList = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [openedDataset, setOpenedDataset] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const [columnsData, setColumnsData] = useState<Record<string, any>>({});
  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const res = await getDatasets();
      setDatasets(res.datasets);
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

        if (!data.linking_column_confirmed) {
          const cols = await getDatasetColumns(id);

          setColumnsData((prev) => ({
            ...prev,
            [id]: cols,
          }));
        }
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
                <div className="px-5 py-6 border-t bg-slate-50 flex flex-col gap-6">
                  {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase text-slate-500 mb-1">
                        Статус
                      </p>
                      <p
                        className={clsx(
                          "font-medium",
                          ds.status === "failed" && "text-red-600",
                          ds.status === "completed" && "text-green-600",
                          ds.status === "processing" && "text-blue-600",
                          ds.status === "pending" && "text-slate-500",
                        )}
                      >
                        {ds.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-slate-500 mb-1">
                        Linking column
                      </p>
                      <p className="font-medium text-slate-900">
                        {ds.linking_column_name ?? "Не выбрана"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-slate-500 mb-1">
                        Confirmed
                      </p>
                      <p className="font-medium">
                        {ds.linking_column_confirmed ? "Да" : "Нет"}
                      </p>
                    </div>
                  </div>

                  {/* СТАТИСТИКА */}
                  <div className="border rounded-lg bg-white p-4">
                    <p className="text-xs uppercase text-slate-500 mb-3">
                      Статистика
                    </p>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Всего файлов</p>
                        <p className="font-semibold text-slate-900">
                          {ds.total_files}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 text-xs">Unique IDs</p>
                        <p className="font-semibold text-slate-900">
                          {ds.unique_linking_ids}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 text-xs">
                          Merged entities
                        </p>
                        <p className="font-semibold text-green-600">
                          {ds.merged_entities_count}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 text-xs">Unlinked rows</p>
                        <p className="font-semibold text-orange-600">
                          {ds.unlinked_rows_count}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ОШИБКА */}
                  {ds.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {ds.error_message}
                    </div>
                  )}

                  {/* ДАТЫ */}
                  <div className="text-sm">
                    <p className="text-xs uppercase text-slate-500 mb-2">
                      Дата
                    </p>
                    <div className="flex flex-col gap-1">
                      <span>
                        Создан: {new Date(ds.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Обновлён: {new Date(ds.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* ФАЙЛЫ */}
                  <div className="border rounded-lg bg-white divide-y">
                    {details[ds.id].files.map((file: any) => (
                      <div
                        key={file.id}
                        className="px-4 py-3 flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.total_rows} строк • {file.valid_rows} валидных
                          </p>
                        </div>

                        <div className="text-xs text-slate-600 text-right">
                          <p>{file.processing_status}</p>
                          <p>{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!ds.linking_column_confirmed && columnsData[ds.id] && (
                    <div className="border rounded-lg bg-white p-4">
                      <p className="text-xs uppercase text-slate-500 mb-3">
                        Выберите linking column
                      </p>

                      <div className="flex flex-col gap-3">
                        {columnsData[ds.id].files.map((file: any) => (
                          <div
                            key={file.raw_file_id}
                            className="flex flex-col gap-1"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {file.filename}
                            </p>

                            <select
                              className="border rounded px-3 py-2 text-sm"
                              value={selectedColumns[file.raw_file_id] || ""}
                              onChange={(e) =>
                                setSelectedColumns((prev) => ({
                                  ...prev,
                                  [file.raw_file_id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Выберите колонку</option>

                              {file.columns.map((col: string) => (
                                <option key={col} value={col}>
                                  {col}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            await postConfirmDataset(ds.id, selectedColumns);

                            setSelectedColumns({});
                            await loadDatasets();
                          } catch {
                            setError("Ошибка подтверждения linking column");
                          }
                        }}
                        className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded"
                      >
                        Подтвердить linking column
                      </button>
                    </div>
                  )}
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
