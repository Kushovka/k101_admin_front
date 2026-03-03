import { useMemo, useState } from "react";
import {
  browseServerPath,
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
  const { startBusy, endBusy } = useUploadStore();

  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
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

  const handleUploadDirectory = async () => {
    if (!currentPath || isUploading) return;

    try {
      startBusy();
      setIsUploading(true);

      await uploadServerDirectory({
        directory: currentPath,
        recursive: true,
        priority: 100,
        max_files: 5000,
      });
      setToast({
        type: "access",
        message: "Директория успешно добавлена в очередь",
      });
      onUploaded?.();
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

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!selected.length || isUploading}
        className="px-4 py-2 bg-cyan-500 text-white rounded disabled:bg-gray-300 flex items-center justify-center gap-2"
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
    </div>
  );
};

export default ServerFileBrowser;
