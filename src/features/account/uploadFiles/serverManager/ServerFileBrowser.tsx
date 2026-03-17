import { useEffect, useMemo, useRef, useState } from "react";
import {
  browseServerPath,
  getReclassifyStatus,
  getUploadDirectoryStatus,
  reclassifyUngrouped,
  uploadDatasetFromServer,
  uploadServerDirectory,
  uploadServerFiles,
} from "../../../../api/uploadFiles";
import Toast from "../../../../components/toast/Toast";
import { useUploadStore } from "../../../../store/useUploadStore";

type Item = {
  name: string;
  type: "file" | "directory";
  size: number;
};

type Props = {
  onUploaded?: () => void;
  onError?: (msg: string) => void;
};

type UploadJob = {
  jobId: string;
  progress: number;
  stats?: {
    total?: number;
    processed?: number;
    success?: number;
    failed?: number;
    duplicates?: number;
    status?: string;
  };
};

const ServerFileBrowser = ({ onUploaded, onError }: Props) => {
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const { startBusy, endBusy } = useUploadStore();
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);

  const [stats, setStats] = useState<{
    total?: number;
    processed?: number;
    success?: number;
    failed?: number;
    duplicates?: number;
    status?: string;
  } | null>(null);

  const [progress, setProgress] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    type: "error" | "access";
    message: string;
  } | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [reclassifyProgress, setReclassifyProgress] = useState<number | null>(
    null,
  );
  const [reclassifyStatus, setReclassifyStatus] = useState<string | null>(null);

  const loadDirectory = async (path: string) => {
    try {
      const data = await browseServerPath(path);
      setItems(data?.items ?? []);
      setCurrentPath(data?.current_path ?? path);
      setSelected([]); // сбрасываем выделение при смене папки
    } catch (e: any) {
      onError?.(e?.response?.data?.detail || "Ошибка при открытии директории");
    }
  };

  const filesOnly = useMemo(
    () =>
      items
        .filter((i) => i.type === "file")
        .map((i) => `${currentPath.replace(/\/$/, "")}/${i.name}`),
    [items, currentPath],
  );

  const allSelected =
    filesOnly.length > 0 && filesOnly.every((file) => selected.includes(file));

  const toggleSelect = (filePath: string) => {
    setSelected((prev) =>
      prev.includes(filePath)
        ? prev.filter((f) => f !== filePath)
        : [...prev, filePath],
    );
  };

  const selectAll = () => {
    setSelected(filesOnly);
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const pollReclassify = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getReclassifyStatus(jobId);

        setReclassifyStatus(status.status);
        setReclassifyProgress(status.progress_pct ?? 0);

        if (status.status === "completed") {
          clearInterval(interval);

          setToast({
            type: "access",
            message: "Переклассификация завершена",
          });

          setReclassifyProgress(null);
          setReclassifyStatus(null);

          endBusy();
        }

        if (status.status === "failed") {
          clearInterval(interval);

          setToast({
            type: "error",
            message: "Ошибка переклассификации",
          });

          setReclassifyProgress(null);
          setReclassifyStatus(null);

          endBusy();
        }
      } catch (e) {
        console.error(e);
      }
    }, 30000);
  };

  const startReclassify = async () => {
    try {
      startBusy();

      const res = await reclassifyUngrouped(1000, true);

      if (res.job_id) {
        pollReclassify(res.job_id);
      }
    } catch (e: any) {
      console.error(e);
      onError?.("Ошибка запуска переклассификации");
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const handleUpload = async () => {
    if (!selected.length || isUploading) return;

    try {
      startBusy();
      setIsUploading(true);

      await uploadServerFiles(selected, 100);
      setToast({
        type: "access",
        message: "Файлы успешно добавлены в очередь",
      });
      setSelected([]);
      onUploaded?.();
    } catch (e: any) {
      const message = e?.response?.data?.detail || "Ошибка при загрузке файлов";
      console.error(e);
      onError?.(message);
    } finally {
      setIsUploading(false);
      endBusy();
    }
  };

  const pollDirectoryProgress = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getUploadDirectoryStatus(jobId);

        setJobs((prev) =>
          prev.map((job) =>
            job.jobId === jobId
              ? {
                  ...job,
                  progress: status.progress_pct ?? 0,
                  stats: {
                    total: status.total,
                    processed: status.processed,
                    success: status.success,
                    failed: status.failed_count,
                    duplicates: status.duplicates,
                    status: status.status,
                  },
                }
              : job,
          ),
        );

        if (status.status === "completed" || status.status === "failed") {
          clearInterval(pollRefs.current[jobId]);
          delete pollRefs.current[jobId];
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);

    pollRefs.current[jobId] = interval;
  };

  useEffect(() => {
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handleUploadDirectory = async () => {
    if (!currentPath || isUploading) return;

    try {
      startBusy();
      setIsUploading(true);
      setProgress(0);
      setJobs([]);
      setShowModal(true);

      setStats({
        status: "Сканирование файлов...",
      });

      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const res = await uploadServerDirectory({
          directory: currentPath,
          recursive: true,
          priority: 100,
          max_files: 5000,
          offset,
        });

        console.log("UPLOAD BATCH:", res);

        if (res?.job_id) {
          setJobs((prev) => [
            ...prev,
            {
              jobId: res.job_id,
              progress: 0,
            },
          ]);

          pollDirectoryProgress(res.job_id);
        }

        if (res.truncated && res.next_offset !== null) {
          offset = res.next_offset;
        } else {
          hasMore = false;
        }
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.detail || "Ошибка при загрузке директории";

      console.error(e);
      onError?.(message);
    } finally {
      setIsUploading(false);
      endBusy();
    }
  };

  const handleUploadDataset = async () => {
    if (!selected.length || isUploading) return;

    const datasetName = prompt("Введите название датасета");

    if (!datasetName) return;

    try {
      startBusy();
      setIsUploading(true);

      const res = await uploadDatasetFromServer({
        dataset_name: datasetName,
        files: selected,
      });

      if (res.status === "success") {
        setToast({
          type: "access",
          message: `Dataset создан. Файлов: ${res.success_count}`,
        });

        setSelected([]);
        onUploaded?.();
      } else {
        setToast({
          type: "error",
          message: res.message,
        });
      }
    } catch (e: any) {
      setToast({
        type: "error",
        message: e?.response?.data?.detail || "Ошибка создания dataset",
      });
    } finally {
      setIsUploading(false);
      endBusy();
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-4">
      <h3 className="font-semibold">Файлы на сервере</h3>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {/* PATH INPUT */}
      <div className="flex gap-2">
        <input
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          placeholder="/mnt/usb"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={() => loadDirectory(currentPath)}
          className="px-3 py-2 bg-slate-700 text-white rounded"
        >
          Открыть
        </button>
      </div>

      {/* SELECT ALL BLOCK */}
      {filesOnly.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
            Выделить все ({filesOnly.length})
          </label>

          {selected.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-red-500 hover:underline"
            >
              Снять выделение
            </button>
          )}
        </div>
      )}

      {/* FILE LIST */}
      <ul className="border rounded divide-y max-h-[400px] overflow-y-auto">
        {items.map((item) => {
          const fullPath = `${currentPath}/${item.name}`;

          return (
            <li
              key={item.name}
              className="flex justify-between items-center px-3 py-2"
            >
              <span
                className="cursor-pointer"
                onClick={() =>
                  item.type === "directory"
                    ? loadDirectory(fullPath)
                    : toggleSelect(fullPath)
                }
              >
                {item.type === "directory" ? "📁" : "📄"} {item.name}
              </span>

              {item.type === "file" && (
                <input
                  type="checkbox"
                  checked={selected.includes(fullPath)}
                  onChange={() => toggleSelect(fullPath)}
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selected.length || isUploading}
          className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Загружается...
            </>
          ) : (
            <>Загрузить выбранные ({selected.length})</>
          )}
        </button>

        <button
          onClick={handleUploadDirectory}
          disabled={!currentPath || isUploading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-300"
        >
          Загрузить всю папку
        </button>
      </div>
      <button
        onClick={startReclassify}
        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Переклассифицировать файлы
      </button>
      <button
        onClick={handleUploadDataset}
        disabled={!selected.length || isUploading}
        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-300"
      >
        Создать датасет ({selected.length})
      </button>
      {jobs.length > 0 && !showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
        >
          Посмотреть загрузку ({jobs.length})
        </button>
      )}

      {reclassifyProgress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>AI переклассификация</span>
            <span>{reclassifyProgress.toFixed(1)}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-purple-500 rounded transition-all"
              style={{ width: `${reclassifyProgress}%` }}
            />
          </div>
        </div>
      )}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-[650px] max-h-[80vh] overflow-y-auto rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Загрузка батчей</h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            {jobs.map((job) => (
              <div
                key={job.jobId}
                className={`border rounded p-3 mb-3 ${
                  job.stats?.status === "completed"
                    ? "bg-green-50"
                    : job.stats?.status === "failed"
                      ? "bg-red-50"
                      : ""
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">{job.jobId}</div>

                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-indigo-500 rounded"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                {job.stats && (
                  <div className="text-xs mt-2 grid grid-cols-2 gap-2">
                    <div>Всего: {job.stats.total}</div>
                    <div>Обработано: {job.stats.processed}</div>

                    <div className="text-green-600">
                      Успешно: {job.stats.success}
                    </div>

                    <div className="text-red-600">
                      Ошибки: {job.stats.failed}
                    </div>

                    <div className="text-yellow-600">
                      Дубликаты: {job.stats.duplicates}
                    </div>

                    <div>Статус: {job.stats.status}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerFileBrowser;
