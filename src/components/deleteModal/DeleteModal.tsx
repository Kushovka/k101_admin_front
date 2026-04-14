import { CgDanger } from "react-icons/cg";
import { useState } from "react";
import userApi from "../../api/userApi";
import type { FileItem } from "../../types/file";

type DeleteModalProps = {
  deleteFile: string | null;

  setDeleteFile: React.Dispatch<React.SetStateAction<string | null>>;
  setNotify: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  allFiles: FileItem[];
  setAllFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setToastFile: React.Dispatch<React.SetStateAction<FileItem | null>>;

  onDeleted(file: FileItem): void;

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
  onDeleted,
}: DeleteModalProps) => {
  const [deleteMode, setDeleteMode] = useState<"file_only" | "with_content">(
    "file_only",
  );

  /* ---------------- удаление ---------------- */

  const handleDelete = async (
    id: string,
    deleteContent: boolean,
  ): Promise<void> => {
    setNotify(null);
    setError(null);

    try {
      await userApi.delete(`/api/v1/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { delete_content: deleteContent },
      });

      setNotify("delete_file");

      setAllFiles((prev) => prev.filter((f) => f.id !== id));
      onDeleted({ id } as FileItem);
    } catch {
      setError("Не удалось удалить файл");
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

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-800">
            Что удалить?
          </p>

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="delete-mode"
              checked={deleteMode === "file_only"}
              onChange={() => setDeleteMode("file_only")}
              className="mt-1"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">
                Только файл
              </span>
              <span className="text-xs text-slate-500">
                Удалит запись о файле, но оставит связанный контент.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-red-200 rounded-lg cursor-pointer bg-red-50/60 hover:bg-red-50 transition">
            <input
              type="radio"
              name="delete-mode"
              checked={deleteMode === "with_content"}
              onChange={() => setDeleteMode("with_content")}
              className="mt-1"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">
                Файл и связанный контент
              </span>
              <span className="text-xs text-slate-500">
                Удалит файл и все связанные распарсенные записи.
              </span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-cetner gap-5 ">
          <button
            onClick={() => {
              handleDelete(deleteFile, deleteMode === "with_content");
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
