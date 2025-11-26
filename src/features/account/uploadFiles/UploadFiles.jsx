import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    event.target.value = null;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setDragOver(false);
  };

  const handleDeleteFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="flex flex-col p-5">
      <h1 className="title">Загрузка файлов</h1>

      <div
        className={`border-2 border-dashed rounded-[12px] mt-5 p-20 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-white"
        }`}
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
                className="flex items-center justify-between gap-8 mb-2"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => handleDeleteFile(index)}
                  className="border p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  <IoMdClose />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default UploadFiles;
