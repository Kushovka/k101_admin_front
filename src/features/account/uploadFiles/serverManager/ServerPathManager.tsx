import { useEffect, useState } from "react";
import {
  addServerPath,
  getServerPaths,
  removeServerPath,
} from "../../../../api/uploadFiles";

const ServerPathManager = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [newPath, setNewPath] = useState("");

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    const data = await getServerPaths();
    setPaths(data.paths);
  };

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    const data = await addServerPath(newPath);
    setPaths(data.paths);
    setNewPath("");
  };

  const handleDelete = async (path: string) => {
    const data = await removeServerPath(path);
    setPaths(data.paths);
  };

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-4">
      <h3 className="font-semibold text-slate-900">Разрешённые пути сервера</h3>

      <div className="flex gap-2">
        <input
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="/mnt/usb"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-cyan-500 text-white rounded"
        >
          Добавить
        </button>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {paths.map((p) => (
          <li
            key={p}
            className="flex justify-between items-center border rounded px-2 py-1"
          >
            <span>{p}</span>
            <button onClick={() => handleDelete(p)} className="text-red-500">
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerPathManager;
