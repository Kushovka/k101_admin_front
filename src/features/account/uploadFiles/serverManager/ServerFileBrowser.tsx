import { useState } from "react";
import {
  browseServerPath,
  uploadServerFiles,
} from "../../../../api/uploadFiles";
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

const ServerFileBrowser = ({ onUploaded, onError }: Props) => {
  const { startBusy, endBusy } = useUploadStore();

  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const loadDirectory = async (path: string) => {
    try {
      const data = await browseServerPath(path);
      setItems(data?.items ?? []);
      setCurrentPath(data?.current_path ?? path);
    } catch (e: any) {
      onError?.(e?.response?.data?.detail || "Ошибка при открытии директории");
    }
  };

  const toggleSelect = (filePath: string) => {
    setSelected((prev) =>
      prev.includes(filePath)
        ? prev.filter((f) => f !== filePath)
        : [...prev, filePath],
    );
  };

  const handleUpload = async () => {
    if (!selected.length || isUploading) return;

    try {
      startBusy();
      setIsUploading(true);

      await uploadServerFiles(selected, 100);

      setSelected([]);
      onUploaded?.();
    } catch (e: any) {
      const message = e?.response?.data?.detail || "Ошибка при загрузке файлов";

      onError?.(message);
    } finally {
      setIsUploading(false);
      endBusy();
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-4">
      <h3 className="font-semibold">Файлы на сервере</h3>

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

      <ul className="border rounded divide-y">
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
