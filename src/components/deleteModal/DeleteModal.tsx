import { CgDanger } from "react-icons/cg";
import api from "../../api/axios";
import type { FileItem } from "../../types/file";

type DeleteModalProps = {
  deleteFile: string | null;

  setDeleteFile: React.Dispatch<React.SetStateAction<string | null>>;
  setNotify: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  allFiles: FileItem[];
  setAllFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setToastFile: React.Dispatch<React.SetStateAction<FileItem | null>>;

  token: string;
  title: string;
  description: string;
};

const DeleteModal = ({
  setDeleteFile,
  deleteFile,
  setNotify,
  setError,
  setToastFile,
  setAllFiles,
  allFiles,
  token,
  title,
  description,
}: DeleteModalProps) => {
  /* ---------------- удаление ---------------- */

  const handleDelete = async (id: string): Promise<void> => {
    setNotify(null);
    setError(null);
    try {
      await api.delete(`http://192.168.0.45:18003/api/v1/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deleted = allFiles.find((f) => f.id === id) ?? null;

      setToastFile(deleted);
      setNotify("delete_file");
      setAllFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError("Не удалось найти файл");
    }
  };

  if (!deleteFile) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setDeleteFile(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-xl w-[420px] flex flex-col gap-6 shadow-xl"
      >
        <p className="text-lg font-semibold text-center">{title}</p>

        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <CgDanger className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-cetner gap-5 ">
          <button
            onClick={() => {
              handleDelete(deleteFile);
              setDeleteFile(null);
            }}
            className="w-full border rounded-lg py-2 hover:bg-red01 hover:text-white transition"
          >
            Удалить
          </button>
          <button
            onClick={() => setDeleteFile(null)}
            className="w-full border rounded-lg py-2 hover:bg-gray-100 transition"
          >
            Oтмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
