import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import axios from "axios";
import api from "../../../api/axios";
import { getCurrentUser } from "../../../api/admin";
import { IoIosArrowDown } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import { PiFileXlsBold } from "react-icons/pi";
import { PiMicrosoftExcelLogoBold } from "react-icons/pi";
import { CgDanger } from "react-icons/cg";
import { PiFileTxtBold } from "react-icons/pi";
import { TbJson } from "react-icons/tb";
import { PiFileHtmlBold } from "react-icons/pi";
import { PiFilePdfBold } from "react-icons/pi";
import { PiFileCsvBold } from "react-icons/pi";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [notify, setNotify] = useState(null);
  const [error, setError] = useState(null);
  const [currentId, setCurrentId] = useState(null);

  const [openUploadFiles, setOpenUploadFiles] = useState(false);

  const [allFiles, setAllFiles] = useState([]);

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

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".xlsx")) return <PiMicrosoftExcelLogoBold />;
    if (fileName.endsWith(".xls")) return <PiFileXlsBold />;
    if (fileName.endsWith(".txt")) return <PiFileTxtBold />;
    if (fileName.endsWith(".json")) return <TbJson />;
    if (fileName.endsWith(".html")) return <PiFileHtmlBold />;
    if (fileName.endsWith(".pdf")) return <PiFilePdfBold />;
    if (fileName.endsWith(".csv")) return <PiFileCsvBold />;
    return <CgDanger className="w-7 h-7 text-red01/70" />;
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setError(null);
    setUploading(true);
    setProgress({});

    for (let file of files) {
      const formData = new FormData();
      formData.append("files", file); // <- только текущий файл

      try {
        const res = await api.post(
          "http://192.168.0.45:18100/api/v1/files/upload",
          formData,
          {
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
          }
        );

        console.log("Файл загружен:", file.name, res.data);

        const all = await api.get("http://192.168.0.45:18100/api/v1/files", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        console.log(all.data);
        setAllFiles(all.data.files);
      } catch (err) {
        console.error("Ошибка загрузки файла:", file.name, err);
        setError(
          err.name === "AxiosError"
            ? `Тип файла ${file.name} не поддерживается.`
            : "Ошибка при загрузке файла"
        );
      } finally {
        setUploading(false);
        setNotify("access");
        setFiles([]);
        setProgress({});
      }
    }
  };

  useEffect(() => {
    const getFiles = async () => {
      try {
        const res = await api.get("http://192.168.0.45:18100/api/v1/files", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        console.log(res.data);
        setAllFiles(res.data.files);
      } catch (err) {}
    };
    getFiles();
  }, []);

  useEffect(() => {
    const getId = async () => {
      const res = await getCurrentUser();
      setCurrentId(res);
      console.log(res);
    };
    getId();
  }, []);

  console.log(files);

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <h1 className="title">Загрузка файлов</h1>

      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {notify === "access" && !error && (
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
      <div
        className="flex justify-between"
        onClick={() => setOpenUploadFiles(false)}
      >
        <div className="w-1/2">
          {files.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold mb-2 title text-[20px]">
                Выбранные файлы:
              </h3>
              <ul className="list-disc w-full pl-5 pr-10">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-5 mb-2 text-[20px] text-common"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {getFileIcon(file.name)}
                      <span>{file.name}</span>
                    </div>
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
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex w-1/2 gap-3 flex-col"
        >
          <div
            onClick={() => {
              setOpenUploadFiles((prev) => !prev);
            }}
            className="flex items-center justify-center gap-2 border w-full text-center rounded py-4 uppercase text-common text-[18px] cursor-pointer select-none"
          >
            <h1>Загруженные файлы</h1>
            {openUploadFiles ? (
              <IoIosArrowDown className="w-6 h-6 rotate-180 transition-all duration-300" />
            ) : (
              <IoIosArrowDown className="w-6 h-6 transition-all duration-300" />
            )}
          </div>
          <div>
            {openUploadFiles && (
              <>
                <div className="grid grid-cols-3 text-center">
                  <p>название</p>
                  <p>дата загрузки</p>
                  <p>статус</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-0">
                    {allFiles
                      .filter(
                        (item) => currentId.id === item.uploaded_by_user_id
                      )
                      .map((item, idx) => (
                        <div
                          key={idx}
                          data-tooltip-id={`error-${item.id}`}
                          className={clsx(
                            "border-b last:border-b-0 py-2 grid grid-cols-3 text-center",
                            item.processing_status === "failed"
                              ? "bg-red01/30 cursor-pointer"
                              : item.processing_status === "pending"
                              ? "bg-orange-400/60"
                              : item.processing_status === "extracted"
                              ? "bg-green-400/40"
                              : "bg-orange-400/60"
                          )}
                        >
                          <p>{item.display_name}</p>
                          <p>
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          <p className="cursor-pointer">
                            {item.processing_status === "failed"
                              ? "Ошибка"
                              : "Выполнено"}
                          </p>
                          {item.processing_status === "failed" &&
                            item.error_message && (
                              <Tooltip
                                place="left"
                                effect="float"
                                delayShow={400}
                                content={`Неподдерживаемый тип файла - (.${item.file_type})`}
                                id={`error-${item.id}`}
                              />
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadFiles;
