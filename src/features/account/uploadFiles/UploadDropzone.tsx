import clsx from "clsx";
import { useRef, useState } from "react";
import { useUploadStore } from "../../../store/useUploadStore";
import { LuUpload } from "react-icons/lu";

const UploadDropzone = () => {
  const addFiles = useUploadStore((state) => state.addFiles);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center w-full rounded-2xl border-[2px] border-dashed transition-all cursor-pointer select-none py-10",
        dragOver
          ? "border-cyan-500 bg-cyan-50/60 shadow-[0_0_0_3px_rgba(6,182,212,0.15)]"
          : "border-slate-300 hover:border-cyan-400 hover:bg-slate-50/40",
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files));
        setDragOver(false);
      }}
    >
      {/* Icon */}
      <LuUpload
        className={clsx(
          "w-10 h-10 mb-3 transition-colors",
          dragOver ? "text-cyan-600" : "text-slate-500",
        )}
      />

      {/* Text */}
      <div className="text-center flex flex-col gap-1">
        <p className="text-[15px] text-slate-700 font-medium">
          Перетащите файлы сюда
        </p>
        <p className="text-[13px] text-slate-500">или нажмите чтобы выбрать</p>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.currentTarget.files;
          if (!files) return;
          addFiles(Array.from(files));
        }}
      />

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        className="mt-4 rounded-lg px-4 py-[6px] text-sm bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition"
      >
        Выбрать файлы
      </button>
    </div>
  );
};

export default UploadDropzone;
