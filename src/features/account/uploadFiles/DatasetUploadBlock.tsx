import { useState } from "react";
import { CgDanger } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { PiFileCsvBold, PiFileTxtBold, PiFileXlsBold } from "react-icons/pi";
import { TbJson } from "react-icons/tb";
import Toast from "../../../components/toast/Toast";
import { useDatasetUploadStore } from "../../../store/useDatasetUploadStore";

type Props = {
  onCreated: (dataset: any) => void;
};

const DatasetUploadBlock = ({ onCreated }: Props) => {
  const {
    files,
    datasetName,
    description,
    linkingColumn,
    uploading,
    addFiles,
    removeFile,
    setDatasetName,
    setDescription,
    setLinkingColumn,
    upload,
  } = useDatasetUploadStore();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getFileIcon = (name: string) => {
    if (name.endsWith(".xlsx") || name.endsWith(".xls"))
      return <PiFileXlsBold className="w-5 h-5 text-emerald-600" />;
    if (name.endsWith(".csv"))
      return <PiFileCsvBold className="w-5 h-5 text-green-600" />;
    if (name.endsWith(".txt"))
      return <PiFileTxtBold className="w-5 h-5 text-slate-600" />;
    if (name.endsWith(".json"))
      return <TbJson className="w-5 h-5 text-amber-600" />;
    return <CgDanger className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full flex flex-col gap-6">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Toast
          type="access"
          message="Датасет успешно загружен"
          onClose={() => setSuccess(false)}
        />
      )}
      {/* HEADER */}
      <div>
        <h3 className="text-[18px] font-semibold text-slate-900">
          Загрузка датасета
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Минимум 2 файла. Файлы будут объединены по ID-полю.
        </p>
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Название датасета *"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
          className="px-3 py-2 text-[14px] border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
        />

        <input
          type="text"
          placeholder="Linking column (необязательно)"
          value={linkingColumn}
          onChange={(e) => setLinkingColumn(e.target.value)}
          className="px-3 py-2 text-[14px] border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
        />
      </div>

      <textarea
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="px-3 py-2 text-[14px] border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none resize-none min-h-[90px]"
      />

      {/* FILE INPUT */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-cyan-400 transition">
        <input
          type="file"
          multiple
          onChange={(e) => {
            if (!e.target.files) return;
            addFiles(Array.from(e.target.files));
          }}
          className="hidden"
          id="dataset-upload"
        />
        <label
          htmlFor="dataset-upload"
          className="cursor-pointer text-sm text-slate-600"
        >
          Нажмите, чтобы выбрать файлы
        </label>
      </div>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file.name)}
                <span className="truncate text-[14px] text-slate-800">
                  {file.name}
                </span>
              </div>

              <button
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={async () => {
          try {
            const dataset = await upload();
            console.log("UPLOAD RESPONSE:", dataset);
            onCreated(dataset); // ✅ откроем модалку
          } catch (err: any) {
            setError(err.message);
          }
        }}
        disabled={uploading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition
          ${
            uploading
              ? "bg-gray-300 text-slate-600 cursor-not-allowed"
              : "bg-cyan-500 text-white hover:bg-cyan-600"
          }`}
      >
        {uploading ? "Загрузка..." : "Загрузить датасет"}
      </button>
    </div>
  );
};

export default DatasetUploadBlock;
