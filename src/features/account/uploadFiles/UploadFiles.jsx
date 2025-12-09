import clsx from "clsx";
import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import axios from "axios";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [notify, setNotify] = useState(null);
  const [error, setError] = useState(null);

  const { isOpen } = useSidebar();

  const handleClick = () => fileInputRef.current.click();

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    event.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setDragOver(false);
  };

  const handleDeleteFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setError(null);
    setUploading(true);
    setProgress({});

    for (let file of files) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      try {
        await axios.post("http://192.168.0.45:18101/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress((prev) => ({ ...prev, [file.name]: percent }));
            }
          },
        });
        console.log(file);
        setNotify("access");
      } catch (err) {
        console.error("Ошибка загрузки файла:", file.name, err);
        setError(
          err.response.status === 400
            ? `Тип файла ${file.name} не поддерживается.`
            : "Ошибка при загрузке файла"
        );
        setNotify("error");
        continue;
      } finally {
        setUploading(false);
      }
    }
    setFiles([]);
    setProgress({});
  };

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <h1 className="title">Загрузка файлов</h1>

      {notify === "error" && (
        <Toast type="error" message={error} onClose={() => setNotify(null)} />
      )}
      {notify === "access" && (
        <Toast
          type="access"
          message="Все файлы успешно загружены!"
          onClose={() => setNotify(null)}
        />
      )}

      <div
        className={clsx(
          "relative border-2 border-dashed rounded-[12px] mt-5 p-20 flex flex-col items-center justify-center gap-4 transition-colors duration-300",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-white"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2 className="text-lg text-gray-700">Перетащите файлы сюда или</h2>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFiles}
          multiple
        />
        <button
          onClick={handleClick}
          className="bg-[#007bff] px-4 py-2 rounded-[8px] text-white hover:bg-blue-600 transition-colors"
        >
          Выберите файлы
        </button>
        <div className="absolute bottom-2 ">
          <p
            className={clsx("text-common", error && "text-red01 animate-pulse")}
          >
            Допустимые типы файлов:{" "}
            <span>
              ['.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf', '.html']
            </span>
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <h3 className="font-semibold mb-2">Выбранные файлы:</h3>
          <ul className="list-disc w-[300px] pl-5">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 mb-2"
              >
                <span>{file.name}</span>
                {uploading && progress[file.name] !== undefined && (
                  <span>{progress[file.name]}%</span>
                )}
                <button
                  onClick={() => handleDeleteFile(index)}
                  className="border p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  <IoMdClose />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={clsx(
              "mt-4 bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>
      )}
    </section>
  );
};

export default UploadFiles;
