import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import api from "../../../api/axios";
import { getCurrentUser } from "../../../api/admin";
import { IoIosArrowDown } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import {
  PiFileXlsBold,
  PiMicrosoftExcelLogoBold,
  PiFileTxtBold,
  PiFileHtmlBold,
  PiFilePdfBold,
  PiFileCsvBold,
} from "react-icons/pi";
import { TbJson } from "react-icons/tb";
import { CgDanger } from "react-icons/cg";
import { EventSourcePolyfill } from "event-source-polyfill";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const sseSourcesRef = useRef({});
  const { isOpen } = useSidebar();

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  const [notify, setNotify] = useState(null);
  const [error, setError] = useState(null);

  const [allFiles, setAllFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [openUploadFiles, setOpenUploadFiles] = useState(true);

  /* ---------------- helpers ---------------- */

  const getFileIcon = (name) => {
    if (name.endsWith(".xlsx")) return <PiMicrosoftExcelLogoBold />;
    if (name.endsWith(".xls")) return <PiFileXlsBold />;
    if (name.endsWith(".txt")) return <PiFileTxtBold />;
    if (name.endsWith(".json")) return <TbJson />;
    if (name.endsWith(".html")) return <PiFileHtmlBold />;
    if (name.endsWith(".pdf")) return <PiFilePdfBold />;
    if (name.endsWith(".csv")) return <PiFileCsvBold />;
    return <CgDanger className="w-6 h-6 text-red01/70" />;
  };

  /* ---------------- upload ---------------- */

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setError(null);
    setProgress({});

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("files", file);

        await api.post(
          "http://192.168.0.45:18003/api/v1/files/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            onUploadProgress: (e) => {
              if (e.total) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setProgress((prev) => ({
                  ...prev,
                  [file.name]: percent,
                }));
              }
            },
          }
        );
      }

      const res = await api.get("http://192.168.0.45:18003/api/v1/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log(res);
      setAllFiles(res.data.files);
      setNotify("access");
      setFiles([]);
    } catch {
      setError("Ошибка при загрузке файлов");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- initial load ---------------- */

  useEffect(() => {
    api
      .get("http://192.168.0.45:18003/api/v1/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setAllFiles(res.data.files))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  /* ---------------- SSE ---------------- */

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!currentUser) return;

    const activeFile = allFiles.find(
      (f) =>
        f.uploaded_by_user_id === currentUser.id &&
        !["extracted", "failed"].includes(f.processing_status)
    );

    if (!activeFile) return;

    if (sseSourcesRef.current[activeFile.id]) return;

    console.log("[SSE START]", activeFile.id);

    const source = new EventSource(
      `http://192.168.0.45:18001/api/sse/file-status/${activeFile.id}?token=${token}&interval=2`
    );

    sseSourcesRef.current[activeFile.id] = source;

    source.onopen = () => {
      console.log("[SSE OPEN]", activeFile.id);
    };

    source.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE MSG]", data.processing_status, data.progress_percent);

      setAllFiles((prev) =>
        prev.map((f) =>
          f.id === data.file_id
            ? {
                ...f,
                processing_status: data.processing_status,
                progress_percent: data.progress_percent,
                error_message: data.error_message,
              }
            : f
        )
      );

      if (["extracted", "failed"].includes(data.processing_status)) {
        console.log("[SSE CLOSE]", activeFile.id);
        source.close();
        delete sseSourcesRef.current[activeFile.id];
      }
    };

    source.onerror = (err) => {
      console.log("[SSE ERROR]", err);
      source.close();
      delete sseSourcesRef.current[activeFile.id];
    };
  }, [allFiles, currentUser]);

  /* ---------------- render ---------------- */

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      <h1 className="title">Загрузка файлов</h1>

      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {notify && (
        <Toast
          type="access"
          message="Файлы успешно загружены"
          onClose={() => setNotify(null)}
        />
      )}

      {/* upload area */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-xl p-20 mt-5 flex flex-col items-center gap-4",
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
          onChange={(e) =>
            setFiles((prev) => [...prev, ...Array.from(e.target.files)])
          }
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Выбрать файлы
        </button>
      </div>
      <div className="flex justify-between">
        <div>
          {/* selected files */}
          {files.length > 0 && (
            <div className="mt-6">
              <ul className="flex flex-col gap-2">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <span>{file.name}</span>
                    </div>

                    {uploading && progress[file.name] && (
                      <span>{progress[file.name]}%</span>
                    )}

                    <button
                      onClick={() => setFiles(files.filter((_, x) => x !== i))}
                    >
                      <IoMdClose />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              >
                {uploading ? "Загрузка..." : "Загрузить"}
              </button>
            </div>
          )}
        </div>
        {/* uploaded files */}
        <div className="mt-10 w-1/2">
          <div
            className="flex justify-center items-center gap-2 border py-4 cursor-pointer"
            onClick={() => setOpenUploadFiles((p) => !p)}
          >
            <h2>Загруженные файлы</h2>
            <IoIosArrowDown className={clsx(openUploadFiles && "rotate-180")} />
          </div>

          {openUploadFiles && (
            <div className="mt-4 max-h-[300px] overflow-y-auto">
              {allFiles
                .filter((f) => f.uploaded_by_user_id === currentUser?.id)
                .map((file) => {
                  const percent =
                    typeof file.progress_percent === "number"
                      ? file.progress_percent
                      : 5; // минимальный индикатор жизни

                  return (
                    <div
                      key={file.id}
                      className="border-b py-3 grid grid-cols-3 gap-4"
                    >
                      <div>
                        <p>{file.display_name}</p>

                        {["uploaded", "extracting"].includes(
                          file.processing_status
                        ) && (
                          <div className="w-full bg-gray-200 h-2 rounded mt-1">
                            <div
                              className="bg-blue-500 h-2 rounded transition-all"
                              style={{
                                width: `${percent}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-center">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>

                      <p className="text-right">
                        {file.processing_status === "uploaded" && "Загружен"}
                        {file.processing_status === "extracting" &&
                          "Обработка..."}
                        {file.processing_status === "extracted" && "Выполнено"}
                        {file.processing_status === "failed" && "Ошибка"}
                      </p>

                      {file.processing_status === "failed" &&
                        file.error_message && (
                          <Tooltip
                            id={`error-${file.id}`}
                            content={file.error_message}
                          />
                        )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadFiles;
