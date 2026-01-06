import clsx from "clsx";
import { useRef, useState } from "react";

type UploadDropzoneProps = {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const UploadDropzone = ({ setFiles }: UploadDropzoneProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  return (
    <div
      className={clsx(
        "border-2 border-dashed rounded-xl p-20 mt-5 flex flex-col items-center gap-4 w-1/2",
        dragOver ? "border-blue-500 bg-blue-50" : "border-gray-400"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        setDragOver(false);
      }}
    >
      <p>Перетащите файлы сюда или</p>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.currentTarget.files;
          if (!files) return;
          setFiles((prev) => [...prev, ...Array.from(files)]);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Выбрать файлы
      </button>
    </div>
  );
};

export default UploadDropzone;
