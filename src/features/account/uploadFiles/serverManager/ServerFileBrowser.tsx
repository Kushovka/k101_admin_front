import { useEffect, useMemo, useRef, useState } from "react";
import {
  browseServerPath,
  getUploadDirectoryStatus,
  uploadServerDirectory,
  uploadServerFiles,
} from "../../../../api/uploadFiles";
import { useUploadStore } from "../../../../store/useUploadStore";
import Toast from "../../../../components/toast/Toast";

type Item = {
  name: string;
  type: "file" | "directory";
  size: number;
};

type Props = {
  onUploaded?: () => void;
  onError?: (msg: string) => void;
};

const ServerFileBrowser = ({ onUploaded, onError }: Props) => {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { startBusy, endBusy } = useUploadStore();

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
        .map((i) => `${currentPath}/${i.name}`),
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
    // если уже есть polling — остановить
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    pollRef.current = setInterval(async () => {
      try {
        const status = await getUploadDirectoryStatus(jobId);

        setProgress(status.progress_pct);

        setStats({
          total: status.total,
          processed: status.processed,
          success: status.success,
          failed: status.failed_count,
          duplicates: status.duplicates,
          status: status.status,
        });

        if (status.status === "completed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }

          setToast({
            type: "access",
            message: `Загружено ${status.success} файлов`,
          });

          setProgress(null);
          setIsUploading(false);
          endBusy();
          onUploaded?.();
        }

        if (status.status === "failed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }

          setToast({
            type: "error",
            message: "Ошибка обработки директории",
          });

          setProgress(null);
          setIsUploading(false);
          endBusy();
        }
      } catch (e) {
        console.error(e);

        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        setIsUploading(false);
        endBusy();
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleUploadDirectory = async () => {
    if (!currentPath || isUploading) return;

    try {
      startBusy();
      setIsUploading(true);
      setProgress(0);

      const job = await uploadServerDirectory({
        directory: currentPath,
        recursive: true,
        priority: 100,
        max_files: 50000,
      });

      const jobId = job?.job_id;

      if (!jobId) {
        throw new Error("Job ID not returned");
      }

      pollDirectoryProgress(jobId);
    } catch (e: any) {
      const message =
        e?.response?.data?.detail || "Ошибка при загрузке директории";
      console.error(e);
      onError?.(message);
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
      {progress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Обработка директории</span>
            <span>{progress.toFixed(1)}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-indigo-500 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {stats && (
        <div className="text-xs text-slate-500 mt-1">
          {stats.processed} / {stats.total} файлов
        </div>
      )}
      {stats && (
        <div className="mt-3 text-sm text-slate-600 grid grid-cols-2 gap-x-6 gap-y-1">
          <div>Всего: {stats.total}</div>
          <div>Обработано: {stats.processed}</div>
          <div className="text-green-600">Успешно: {stats.success}</div>
          <div className="text-red-600">Ошибки: {stats.failed}</div>
          <div className="text-yellow-600">Дубликаты: {stats.duplicates}</div>
          <div>Статус: {stats.status}</div>
        </div>
      )}
    </div>
  );
};

export default ServerFileBrowser;
