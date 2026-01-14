import clsx from "clsx";
import { JSX, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Toast from "../../../components/toast/Toast";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import userApi from "../../../api/userApi";
import { getCurrentUser } from "../../../api/users";
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
import FilePreviewModal from "./filePreviewModal/FilePreviewModal";
import { FaPlay, FaStop } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import UploadDropzone from "./UploadDropzone";
import DeleteModal from "../../../components/deleteModal/DeleteModal";
import type { FileItem } from "../../../types/file";
import { IoIosArrowForward } from "react-icons/io";
import { getAllFiles, postUploadFiles } from "../../../api/uploadFiles";

type User = {
  id: string;
};

const ACTIVE_STATUSES = ["uploaded", "extracting"] as const;

type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

const UploadFiles = () => {
  const { isOpen } = useSidebar();

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  const [files, setFiles] = useState<File[]>([]);

  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [toastFile, setToastFile] = useState<FileItem | null>(null);

  const [notify, setNotify] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [totalFiles, setTotalFiles] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [search, setSearch] = useState<string>("");

  const token = localStorage.getItem("access_token") ?? "";

  /* ---------------- user ---------------- */

  // FIX: вернуть загрузку текущего пользователя
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  /* ---------------- helpers ---------------- */

  const getFileIcon = (name: string): JSX.Element => {
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

  const updatedFileDesc = (fileId: string, alias: string): void => {
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

  const isActiveStatus = (
    status?: FileItem["processing_status"]
  ): status is ActiveStatus => {
    return (
      status !== undefined && ACTIVE_STATUSES.includes(status as ActiveStatus)
    );
  };

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ---------------- пагинация ---------------- */

  const loadFiles = async (pageToLoad = 1, replace = false): Promise<void> => {
    if (loadingFiles) return;

    setLoadingFiles(true);
    setError(null);

    try {
      const data = await getAllFiles({
        page: pageToLoad,
        pageSize,
        sortOrder,
        search,
      });

      const newFiles: FileItem[] = data.files || [];
      console.log(data);
      setAllFiles((prev) => (replace ? newFiles : [...prev, ...newFiles]));

      setTotalFiles(data.total);
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
  }, [search]);

  /* ---------------- загрузка ---------------- */

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setError(null);
    setProgress({});

    try {
      await postUploadFiles(files, (file, percent) => {
        setProgress((prev) => ({
          ...prev,
          [file.name]: percent,
        }));
      });

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

  /* ---------------- queue api ---------------- */

  const queueApi = {
    pause: (id: string) =>
      userApi.post(
        `/api/v1/parsing-queue/${id}/pause`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    resume: (id: string) =>
      userApi.post(
        `/api/v1/parsing-queue/${id}/resume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    cancel: (id: string) =>
      userApi.post(
        `/api/v1/parsing-queue/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
  };

  /* ---------------- форматер размера файла ---------------- */

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null) return "-";

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
        f.processing_status !== undefined &&
        ["queued", "extracting", "uploaded"].includes(f.processing_status)
    );
    if (!active.length) return;

    const interval = setInterval(async () => {
      try {
        const updates = await Promise.all(
          active.map((f) =>
            userApi.get(`/api/v1/files/${f.id}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        console.log(updates.map((u) => u.data.progress_percent));
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
      {/* ---------------- title ---------------- */}
      <h1 className="title">Загрузка файлов</h1>

      {/* ---------------- toasts ---------------- */}
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
          message={`Файл ${toastFile?.display_name ?? ""} успешно удален `}
          onClose={() => setNotify(null)}
        />
      )}
      <div className="flex justify-between gap-10 items-start">
        {/* ---------------- форма загрузки ---------------- */}

        <UploadDropzone setFiles={setFiles} />

        {/* выбранные файлы */}
        <div className="min-w-0 flex-1 w-1/2">
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
      </div>
      {/* ---------------- нижний контент ---------------- */}

      {/* загруженные файлы */}

      <div className="mt-10 min-w-0 ">
        <div className="my-4 flex items-center justify-between border-b pb-5">
          <div>
            <h2 className="subtitle text-[22px]">Загруженные файлы</h2>
            <p className="text-common">Всего найдено файлов: {totalFiles}</p>
          </div>
          <div className="flex gap-3">
            <button
              data-tooltip-id="sort_order"
              onClick={() => {
                const next = sortOrder === "newest" ? "oldest" : "newest";
                setSortOrder(next);
                setPage(1);
                setHasMore(true);
                loadFiles(1, true);
              }}
              className="px-3 py-2 border rounded"
            >
              <IoIosArrowForward
                className={clsx(
                  sortOrder === "newest" ? "rotate-90" : "-rotate-90"
                )}
              />
            </button>
            <Tooltip
              place="top"
              delayShow={400}
              id="sort_order"
              content="Сортировать по дате"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setHasMore(true);
              }}
              placeholder="Поиск по названию файла"
              className="w-72 border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4">
          {allFiles.map((file) => {
            // const percent =
            //   typeof file.progress_percent === "number"
            //     ? file.progress_percent
            //     : 2; // минимальный индикатор жизни
            const percent =
              file.progress_percent ??
              (file.processing_status === "extracting" ? 100 : 0);
            const safeSearch = escapeRegExp(search);
            return (
              <div
                key={file.id}
                className={clsx(
                  "border-b py-3 grid grid-cols-3 items-center gap-4 min-w-0",
                  file.uploaded_by_user_id === currentUser?.id && "bg-green-50"
                )}
              >
                <div className="flex items-center justify-between gap-2 text-common">
                  <div className="min-w-0 flex flex-col">
                    <p
                      data-tooltip-id={`name-file_${file.id}`}
                      className="font-medium subtitle truncate cursor-pointer"
                      dangerouslySetInnerHTML={{
                        __html: search
                          ? file.display_name.replace(
                              new RegExp(`(${safeSearch})`, "gi"),
                              "<mark class='bg-green-300'>$1</mark>"
                            )
                          : file.display_name,
                      }}
                    />

                    <Tooltip
                      place="top"
                      delayShow={400}
                      id={`name-file_${file.id}`}
                      content={file.display_name}
                    />
                    <div className="flex  items-center gap-6">
                      <span>{formatFileSize(file.file_size)}</span>
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

                  {isActiveStatus(file.processing_status) && (
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
                  {file.created_at
                    ? new Date(file.created_at).toLocaleDateString()
                    : "-"}
                </p>

                <div className="text-right text-common flex justify-end items-center gap-2">
                  {file.processing_status === "uploaded" && "Подготовка..."}
                  {file.processing_status === "pending" && "Ожидание..."}

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
                    delayShow={400}
                    id="delete-file_tooltip"
                    content="Удалить файл"
                  />
                </div>

                {file.processing_status === "failed" && file.error_message && (
                  <Tooltip
                    id={`error-${file.id}`}
                    content={file.error_message}
                  />
                )}
              </div>
            );
          })}
        </div>

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
        <DeleteModal
          setDeleteFile={setDeleteFile}
          deleteFile={deleteFile}
          setError={setError}
          setNotify={setNotify}
          setToastFile={setToastFile}
          setAllFiles={setAllFiles}
          allFiles={allFiles}
          token={token}
          title={"Удалить файл?"}
          description={"Файл будет удалён без возможности восстановления."}
        />
      )}
    </section>
  );
};

export default UploadFiles;
