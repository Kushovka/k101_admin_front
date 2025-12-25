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
import FilePreviewModal from "../../../components/filePreviewModal/FilePreviewModal";
import { FaPlay, FaStop } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const UploadFiles = () => {
  const fileInputRef = useRef(null);
  // const sseSourcesRef = useRef({});
  const { isOpen } = useSidebar();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [toastFile, setToastFile] = useState(null);

  const [notify, setNotify] = useState(null);
  const [error, setError] = useState(null);

  const [allFiles, setAllFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [openUploadFiles, setOpenUploadFiles] = useState(true);

  const token = localStorage.getItem("access_token");

  /* ---------------- user ---------------- */

  // FIX: вернуть загрузку текущего пользователя
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  /* ---------------- helpers ---------------- */

  const getFileIcon = (name) => {
    if (name.endsWith(".xlsx"))
      return <PiMicrosoftExcelLogoBold className="w-10 h-10" />;
    if (name.endsWith(".xls")) return <PiFileXlsBold className="w-10 h-10" />;
    if (name.endsWith(".txt")) return <PiFileTxtBold className="w-10 h-10" />;
    if (name.endsWith(".json")) return <TbJson className="w-10 h-10" />;
    if (name.endsWith(".html")) return <PiFileHtmlBold className="w-10 h-10" />;
    if (name.endsWith(".pdf")) return <PiFilePdfBold className="w-10 h-10" />;
    if (name.endsWith(".csv")) return <PiFileCsvBold className="w-10 h-10" />;
    return <CgDanger className="w-6 h-6 text-red01/70" />;
  };

  const updatedFileDesc = (fileId, alias) => {
    setAllFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, file_description: alias, display_name: alias }
          : f
      )
    );

    setPreviewFile((prev) =>
      prev && prev.id === fileId
        ? { ...prev, file_description: alias, display_name: alias }
        : prev
    );
  };

  /* ---------------- пагинация ---------------- */

  const loadFiles = async (pageToLoad = 1, replace = false) => {
    if (loadingFiles) return;

    setLoadingFiles(true);
    setError(null);

    try {
      const res = await api.get("http://192.168.0.45:18003/api/v1/files", {
        params: { page: pageToLoad, page_size: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      const newFiles = res.data.files || [];
      console.log(res);
      setAllFiles((prev) => (replace ? newFiles : [...prev, ...newFiles]));

      if (newFiles.length < pageSize) {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setError("Произошла ошибка! Попробуйте позже.");
    } finally {
      setLoadingFiles(false);
    }
  };

  /* ---------------- initial load ---------------- */

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadFiles(1, true);
  }, []);

  /* ---------------- загрузка ---------------- */

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
              Authorization: `Bearer ${token}`,
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

      // FIX: НЕ затираем allFiles напрямую
      setNotify("upload_file");
      setFiles([]);

      setPage(1);
      setHasMore(true);
      loadFiles(1, true);
    } catch (e) {
      setError("Ошибка при загрузке файлов");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- удаление ---------------- */

  const handleDelete = async (id) => {
    setNotify(null);
    setError(null);
    try {
      await api.delete(`http://192.168.0.45:18003/api/v1/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deleted = allFiles.find((f) => f.id === id);

      setToastFile(deleted);
      setNotify("delete_file");
      setAllFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError("Не удалось найти файл");
    }
  };

  /* ---------------- queue api ---------------- */

  const queueApi = {
    pause: (id) =>
      api.post(
        `http://192.168.0.45:18100/api/v1/parsing-queue/${id}/pause`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    resume: (id) =>
      api.post(
        `http://192.168.0.45:18100/api/v1/parsing-queue/${id}/resume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    cancel: (id) =>
      api.post(
        `http://192.168.0.45:18100/api/v1/parsing-queue/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
  };

  /* ---------------- форматер размера файла ---------------- */

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "-";

    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} КБ`;

    return `${(kb / 1024).toFixed(2)} МБ`;
  };

  /* ---------------- загрузка персент процент через /api/v1/files/${f.id}/status  ---------------- */

  // в будущем нужно будет менять на подгрузку в
  // реальном времени через SSE или подключать WEB-SOCKET
  //  и двухсторонне общаться с бэком

  useEffect(() => {
    if (!currentUser) return;
    setError(null);
    const active = allFiles.filter(
      (f) =>
        f.uploaded_by_user_id === currentUser.id &&
        ["queued", "extracting", "uploaded"].includes(f.processing_status)
    );
    if (!active.length) return;

    const interval = setInterval(async () => {
      try {
        const updates = await Promise.all(
          active.map((f) =>
            api.get(`http://192.168.0.45:18100/api/v1/files/${f.id}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        console.log(updates);
        setAllFiles((prev) =>
          prev.map((file) => {
            const fresh = updates.find((u) => u.data.file_id === file.id)?.data;
            return fresh ? { ...file, ...fresh } : file;
          })
        );
      } catch (err) {
        console.error("Status polling error", err);
        setError("Ошибка попробуйте позже.");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [allFiles, currentUser, token]);

  /* ---------------- рендер ---------------- */

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {/* title */}
      <h1 className="title">Загрузка файлов</h1>
      {/* toast */}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {notify === "upload_file" && (
        <Toast
          type="access"
          message="Файлы успешно загружены"
          onClose={() => setNotify(null)}
        />
      )}
      {notify === "delete_file" && (
        <Toast
          type="access"
          message={`Файл ${toastFile.display_name} успешно удален `}
          onClose={() => setNotify(null)}
        />
      )}

      {/* ---------------- форма загрузки ---------------- */}
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

      {/* ---------------- нижний контент ---------------- */}
      <div className="flex gap-10">
        {/* выбранные файлы */}
        <div className="min-w-0 flex-1">
          {files.length > 0 && (
            <div className="mt-6 ">
              <ul className="flex flex-col gap-2">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 min-w-0"
                  >
                    <div
                      data-tooltip-id="see_file_name-tooltip"
                      className="flex items-center gap-2 min-w-0 cursor-pointer"
                    >
                      <div className="w-6 h-6 text-gray-700 flex items-center justify-center shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <span className="truncate max-w-full">{file.name}</span>
                    </div>
                    <Tooltip
                      place="top"
                      effect="float"
                      delayShow={400}
                      content={file.name}
                      id="see_file_name-tooltip"
                    />

                    {uploading && progress[file.name] !== undefined && (
                      <span className="shrink-0">{progress[file.name]}%</span>
                    )}

                    <button
                      className="shrink-0"
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

        {/* загруженные файлы */}
        <div className="mt-10 min-w-0 w-1/2">
          <div
            className="flex justify-center items-center gap-2 border select-none py-4 cursor-pointer"
            onClick={() => setOpenUploadFiles((p) => !p)}
          >
            <h2>Загруженные файлы</h2>
            <IoIosArrowDown className={clsx(openUploadFiles && "rotate-180")} />
          </div>

          {openUploadFiles && (
            <div className="mt-4 h-[250px] overflow-y-auto">
              {allFiles
                .filter((f) => f.uploaded_by_user_id === currentUser?.id)
                .map((file) => {
                  // const percent =
                  //   typeof file.progress_percent === "number"
                  //     ? file.progress_percent
                  //     : 2; // минимальный индикатор жизни
                  const percent =
                    file.progress_percent ??
                    (file.processing_status === "extracting" ? 100 : 0);
                  return (
                    <div
                      key={file.id}
                      className="border-b py-3 grid grid-cols-3 items-center gap-4 min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 text-common">
                        <div className="min-w-0 flex flex-col">
                          <p
                            data-tooltip-id={`name-file_${file.id}`}
                            className="font-medium subtitle truncate cursor-pointer"
                          >
                            {file.display_name}
                          </p>
                          <Tooltip
                            place="top"
                            effect="float"
                            delayShow={400}
                            id={`name-file_${file.id}`}
                            content={file.display_name}
                          />
                          <span>{formatFileSize(file.file_size)}</span>
                          <div>
                            {file.processing_status === "extracted" && (
                              <button
                                className="text-blue-600 underline "
                                onClick={() => setPreviewFile(file)}
                              >
                                Предпросмотр...
                              </button>
                            )}
                          </div>
                        </div>

                        {["uploaded", "extracting"].includes(
                          file.processing_status
                        ) && (
                          <div className="flex items-center gap-3 relative z-40">
                            <button
                              onClick={() => queueApi.resume(file.id)}
                              className="p-1 hover:text-blue-500 transition-all duration-300"
                            >
                              <FaPlay className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => queueApi.pause(file.id)}
                              className="p-1 hover:text-yellow-500 transition-all duration-300"
                            >
                              <FaStop className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => queueApi.cancel(file.id)}
                              className="p-1 hover:text-red-500 transition-all duration-300"
                            >
                              <MdDelete className="w-6 h-6" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-center text-common">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>

                      <div className="text-right text-common flex justify-end items-center gap-2">
                        {file.processing_status === "uploaded" && "Загрузка..."}
                        {file.processing_status === "extracting" && (
                          <>
                            <p>Обработка...</p>

                            {typeof file.progress_percent === "number" ? (
                              <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full transition-all duration-300"
                                  style={{ width: `${file.progress_percent}%` }}
                                />
                              </div>
                            ) : (
                              <div className="mini_loader"></div>
                            )}
                          </>
                        )}
                        {file.processing_status === "extracted" && "Выполнено"}
                        {file.processing_status === "failed" && "Ошибка"}
                        <button
                          data-tooltip-id="delete-file_tooltip"
                          className="p-1 cursor-pointer hover:text-red-500 transition-all duration-300"
                          onClick={() => setDeleteFile(file.id)}
                        >
                          <MdDelete className="w-6 h-6" />
                        </button>
                        <Tooltip
                          place="top"
                          effect="float"
                          delayShow={400}
                          id="delete-file_tooltip"
                          content="Удалить файл"
                        />
                      </div>

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
          {hasMore && (
            <div className="flex justify-center mt-3">
              <button
                disabled={loadingFiles}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadFiles(nextPage);
                }}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingFiles ? "Загрузка..." : "Загрузить ещё"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- модалка превью файла ---------------- */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onUpdateFile={updatedFileDesc}
        />
      )}
      {/* ---------------- модалка подтверждения удаления файла ---------------- */}
      {deleteFile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteFile(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-xl w-[420px] flex flex-col gap-6 shadow-xl"
          >
            <p className="text-lg font-semibold text-center">Удалить файл?</p>

            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <CgDanger className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Файл будет удалён без возможности восстановления.
              </p>
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
      )}
    </section>
  );
};

export default UploadFiles;
