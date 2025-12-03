import clsx from "clsx";
import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { uploadFileToMinio } from "../../../api/minio";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    setProgress({});

    for (let file of files) {
      try {
        await uploadFileToMinio(file, (percent) => {
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });
      } catch (err) {
        console.error("Ошибка загрузки файла:", file.name, err);
        alert(`Ошибка загрузки файла: ${file.name}`);
      }
    }

    alert("Все файлы успешно загружены!");
    setFiles([]);
    setProgress({});
    setUploading(false);
  };

  return (
    <section className="section">
      <h1 className="title">Загрузка файлов</h1>

      <div
        className={clsx(
          "border-2 border-dashed rounded-[12px] mt-5 p-20 flex flex-col items-center justify-center gap-4 transition-colors duration-300",
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
