import clsx from "clsx";
import { motion } from "framer-motion";
import { JSX, useEffect, useState } from "react";
import { CgDanger } from "react-icons/cg";
import { FaPlay, FaStop } from "react-icons/fa6";
import {
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosClose,
  IoMdClose,
} from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdDelete, MdMoreVert, MdRestartAlt } from "react-icons/md";
import {
  PiFileCsvBold,
  PiFileHtmlBold,
  PiFilePdfBold,
  PiFileTxtBold,
  PiFileXlsBold,
  PiMicrosoftExcelLogoBold,
} from "react-icons/pi";
import { TbJson } from "react-icons/tb";
import { Tooltip } from "react-tooltip";
import { getFileStatuses } from "../../../api/search";
import {
  getAllFiles,
  getAllGroup,
  getFilesByGroup,
  patchFileGroup,
  postRestartFile,
} from "../../../api/uploadFiles";
import userApi from "../../../api/userApi";
import { getCurrentUser } from "../../../api/users";
import DeleteModal from "../../../components/deleteModal/DeleteModal";
import { InfoRow } from "../../../components/info/InfoRow";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { useParsingQueue } from "../../../hooks/uploadFiles/useParsingQueue";
import { useUploadStore } from "../../../store/useUploadStore";
import type { FileGroup, FileItem } from "../../../types/file";
import DatasetsList from "./dataset/DatasetsList";
import DatasetModal from "./DatasetModal";
import DatasetUploadBlock from "./DatasetUploadBlock";
import FilePreviewModal from "./filePreviewModal/FilePreviewModal";
import GroupBlock from "./GroupBlock";
import ServerFileBrowser from "./serverManager/ServerFileBrowser";
import ServerPathManager from "./serverManager/ServerPathManager";
import UploadDropzone from "./UploadDropzone";

type User = {
  id: string;
};

const UploadFiles = () => {
  const { isOpen } = useSidebar();
  const { files, removeFile, totalProgress, uploading, handleUpload } =
    useUploadStore();

  const {
    processingQueue,
    waitingQueue,
    completedQueue,
    failedQueue,
    queueLimit,
    setQueueLimit,
    pause,
    resume,
    cancel,
    moveToTop,
    changePriority,
    pauseAll,
    resumeAll,
    globalStatus,
  } = useParsingQueue();

  const [pageSize] = useState<number>(20);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [toastFile, setToastFile] = useState<FileItem | null>(null);

  const [notify, setNotify] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [groups, setGroups] = useState<FileGroup[]>([]);
  const [filesByGroup, setFilesByGroup] = useState<Record<string, FileItem[]>>(
    {},
  );
  const [pageByGroup, setPageByGroup] = useState<Record<string, number>>({});
  const [loadingGroup, setLoadingGroup] = useState<Record<string, boolean>>({});

  const [openServerModal, setOpenServerModal] = useState<boolean>(false);
  const [openDatasetModalBlock, setOpenDatasetModalBlock] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [fileStatuses, setFileStatuses] = useState<{
    total: number;
    statuses: { status: string; count: number }[];
  } | null>(null);

  const [sortByGroup, setSortByGroup] = useState<
    Record<string, "newest" | "oldest">
  >({});

  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [globalSortOrder, setGlobalSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [isGlobalListMode, setIsGlobalListMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [duplicatesCount, setDuplicatesCount] = useState(0);

  const [openAddFile, setOpenAddFile] = useState<FileItem | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");

  const [datasetModal, setDatasetModal] = useState<any | null>(null);

  const token = localStorage.getItem("admin_access_token") ?? "";

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
          : f,
      ),
    );

    setPreviewFile((prev) =>
      prev && prev.id === fileId
        ? { ...prev, file_description: alias, display_name: alias }
        : prev,
    );
  };

  const getErrorLabel = (code?: string | null) => {
    switch (code) {
      case "INVALID_FILE_FORMAT":
        return "Неверный формат файла";
      case "EMPTY_FILE":
        return "Файл пустой";
      case "UNSUPPORTED_FILE_TYPE":
        return "Неподдерживаемый тип файла";
      case "CORRUPTED_FILE":
        return "Файл повреждён";
      case "NO_VALID_DATA":
        return "Нет валидных данных";
      default:
        return "Ошибка парсинга";
    }
  };

  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString() : "-";

  const renderProcessingStatus = (file: FileItem) => {
    switch (file.processing_status) {
      case "uploaded":
        return <span className="text-blue-600">Загружен</span>;

      case "pending":
        return <span className="text-slate-500">Ожидание…</span>;

      case "extracting":
        return <span className="text-cyan-600">Обработка…</span>;

      case "extracted":
        return <span className="text-green-600">Готово</span>;

      case "reprocessing":
        return <span className="text-green-600">Повторная обработка</span>;

      case "failed":
        return (
          <>
            <span
              data-tooltip-id={`error-file-modal_${file.id}`}
              className="text-red-600 cursor-help"
            >
              Ошибка
            </span>

            <Tooltip
              id={`error-file-modal_${file.id}`}
              place="top"
              delayShow={400}
              content={
                file.error_code
                  ? getErrorLabel(file.error_code)
                  : file.error_message || "Ошибка парсинга"
              }
            />
          </>
        );

      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  const statusMeta: Record<string, { label: string }> = {
    extracting: {
      label: "Обрабатывается",
    },
    extracted: {
      label: "Выполнен",
    },
    failed: {
      label: "Ошибка",
    },
    reprocessing: {
      label: "Переобработка",
    },
    pending: {
      label: "Ожидание",
    },
    paused: {
      label: "На паузе",
    },
  };

  /* ---------------- API ---------------- */
  const loadGroups = async () => {
    try {
      const res = await getAllGroup();
      setGroups(res.groups);
    } catch {
      setError("Ошибка загрузки групп");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = search ? escapeRegExp(search) : "";
  const hasGlobalListFilters =
    isGlobalListMode || Boolean(search.trim()) || Boolean(statusFilter);

  const resetGlobalListFilters = () => {
    setSearch("");
    setStatusFilter("");
    setGlobalSortOrder("newest");
    setIsGlobalListMode(false);
    setSearchPage(1);
    setSearchResults([]);
    setSearchTotal(0);
  };

  const loadGroupFiles = async (
    groupName: string,
    options?: {
      page?: number;
      sort?: "newest" | "oldest";
    },
  ) => {
    if (loadingGroup[groupName]) return;

    const page = options?.page ?? pageByGroup[groupName] ?? 1;
    const sort = options?.sort ?? sortByGroup[groupName] ?? "newest";

    setLoadingGroup((p) => ({ ...p, [groupName]: true }));

    try {
      const res = await getFilesByGroup({
        group: groupName,
        page,
        pageSize,
        sort,
      });

      setFilesByGroup((prev) => ({
        ...prev,
        [groupName]:
          page === 1
            ? res.files.map((f: FileItem) => ({ ...f, file_group: groupName }))
            : [
                ...(prev[groupName] ?? []),
                ...res.files.map((f: FileItem) => ({
                  ...f,
                  file_group: groupName,
                })),
              ],
      }));

      setPageByGroup((prev) => ({
        ...prev,
        [groupName]: page + 1,
      }));
    } finally {
      setLoadingGroup((p) => ({ ...p, [groupName]: false }));
    }
  };

  const handleFileDeleted = (file: FileItem) => {
    // группы
    setFilesByGroup((prev) => {
      const next = { ...prev };
      for (const group in next) {
        next[group] = next[group]?.filter((f) => f.id !== file.id) ?? [];
      }
      return next;
    });

    // счётчик групп
    setGroups((prev) =>
      prev.map((g) =>
        g.name === file.file_group
          ? { ...g, total: Math.max(0, g.total - 1) }
          : g,
      ),
    );

    setSearchResults((prev) => prev.filter((f) => f.id !== file.id));
  };

  useEffect(() => {
    if (!hasGlobalListFilters) {
      setSearchResults([]);
      setSearchPage(1);
      setSearchTotal(0);
      return;
    }

    const loadSearch = async () => {
      try {
        setSearchLoading(true);

        const res = await getAllFiles({
          page: searchPage,
          pageSize: 50,
          sortOrder: globalSortOrder,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setSearchTotal(res.total);

        setSearchResults((prev) =>
          searchPage === 1 ? res.files : [...prev, ...res.files],
        );
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    };

    loadSearch();
  }, [globalSortOrder, hasGlobalListFilters, search, searchPage, statusFilter]);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await getFileStatuses();
        setFileStatuses(data);
      } catch (e) {
        console.error("Ошибка загрузки статусов", e);
      }
    };

    loadStatuses();
  }, []);

  /* ---------------- пагинация ---------------- */

  const loadFiles = async (
    pageToLoad = 1,
    replace = false,
    status?: string,
  ): Promise<void> => {
    if (loadingFiles) return;

    setLoadingFiles(true);
    setError(null);

    try {
      const data = await getAllFiles({
        page: pageToLoad,
        pageSize,
        sortOrder: globalSortOrder,
        search,
        status: status ?? statusFilter ?? undefined,
      });

      setAllFiles((prev) => (replace ? data.files : [...prev, ...data.files]));
    } catch (e) {
      console.error(e);
      setError("Произошла ошибка! Попробуйте позже.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileGroup = async (id: string, group: string) => {
    try {
      await patchFileGroup(id, group);

      setFilesByGroup((prev) => {
        const next = { ...prev };
        let movedFile: FileItem | null = null;

        // убираем файл из старой группы
        for (const g in next) {
          const idx = next[g]?.findIndex((f) => f.id === id);
          if (idx !== undefined && idx >= 0) {
            movedFile = next[g][idx];
            next[g] = next[g].filter((f) => f.id !== id);
            break;
          }
        }

        // добавляем в новую группу
        if (movedFile) {
          next[group] = [
            { ...movedFile, file_group: group },
            ...(next[group] ?? []),
          ];
        }

        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestartFile = async (id: string) => {
    try {
      await postRestartFile(id);

      // 2. allFiles
      setAllFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                processing_status: "uploaded",
                progress_percent: 0,
              }
            : f,
        ),
      );

      // 3. searchResults
      setSearchResults((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                processing_status: "uploaded",
                progress_percent: 0,
              }
            : f,
        ),
      );

      // 4. filesByGroup
      setFilesByGroup((prev) => {
        const next = { ...prev };

        for (const group in next) {
          next[group] = next[group].map((f) =>
            f.id === id
              ? {
                  ...f,
                  processing_status: "uploaded",
                  progress_percent: 0,
                }
              : f,
          );
        }
        setNotify("restart success");

        return next;
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.detail ?? "Ошибка при перезапуске файла");
    }
  };

  /* ---------------- форматер размера файла ---------------- */

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null) return "-";

    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} КБ`;

    return `${(kb / 1024).toFixed(2)} МБ`;
  };

  useEffect(() => {
    if (!currentUser) return;
    setError(null);
    const active = allFiles.filter(
      (f) =>
        f.uploaded_by_user_id === currentUser.id &&
        f.processing_status !== undefined &&
        ["queued", "extracting", "uploaded", "reprocessing"].includes(
          f.processing_status,
        ),
    );
    if (!active.length) return;

    const interval = setInterval(async () => {
      try {
        const updates = await Promise.all(
          active.map((f) =>
            userApi.get(`/api/v1/files/${f.id}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        );
        setAllFiles((prev) =>
          prev.map((file) => {
            const fresh = updates.find((u) => u.data.file_id === file.id)?.data;
            return fresh ? { ...file, ...fresh } : file;
          }),
        );
      } catch (err) {
        console.error("Status polling error", err);
        setError("Ошибка попробуйте позже.");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser, token]);

  /* ---------------- рендер ---------------- */
  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {/* ---------------- title ---------------- */}
      <h1 className="title">Загрузка файлов</h1>

      {/* ---------------- toasts ---------------- */}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {notify === "restart success" && (
        <Toast
          type="access"
          message="Успешно !"
          onClose={() => setNotify(null)}
        />
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
          key="delete"
          type="access"
          message={`Файл ${toastFile?.display_name ?? ""} успешно удален `}
          onClose={() => setNotify(null)}
        />
      )}
      {duplicatesCount > 0 && (
        <Toast
          type="error"
          message={`Не удалось загрузить ${duplicatesCount} файлов`}
          onClose={() => setDuplicatesCount(0)}
        />
      )}

      {notify === "duplicates_only" && (
        <Toast
          type="error"
          message="Все файлы уже были загружены ранее"
          onClose={() => setNotify(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex gap-8 items-start"
      >
        {/* Upload Dropzone */}
        <div className="flex flex-col gap-10 w-full">
          <UploadDropzone />

          {/* SERVER */}
          <div
            className={clsx(
              "max-w-3xl bg-white rounded-xl border border-gray-200 shadow-sm",
            )}
          >
            {/* HEADER */}
            <button
              type="button"
              onClick={() => setOpenServerModal((prev) => !prev)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition rounded-xl"
            >
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-slate-900">
                  Загрузка напрямую на сервер
                </span>
                <span className="text-[13px] text-slate-500">
                  Выбрать файлы из директорий сервера
                </span>
              </div>

              <IoIosArrowDown
                className={clsx(
                  "w-5 h-5 text-slate-600 transition-transform duration-200",
                  openServerModal && "rotate-180",
                )}
              />
            </button>

            {/* BODY */}
            {openServerModal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                className="px-5 pb-5 flex flex-col gap-6 border-gray-100"
              >
                <ServerFileBrowser
                  onUploaded={() => {
                    loadFiles(1, true);
                    loadGroups();
                    setNotify("upload_file");
                  }}
                  onError={(msg) => setError(msg)}
                />

                <ServerPathManager />
              </motion.div>
            )}
          </div>

          {/* DATASET */}
          <div className="max-w-3xl bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* HEADER */}
            <button
              type="button"
              onClick={() => setOpenDatasetModalBlock((prev) => !prev)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition rounded-xl"
            >
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-slate-900">
                  Загрузка датасета
                </span>
                <span className="text-[13px] text-slate-500">
                  Объединение нескольких файлов по ID
                </span>
              </div>

              <IoIosArrowDown
                className={clsx(
                  "w-5 h-5 text-slate-600 transition-transform duration-200",
                  openDatasetModalBlock && "rotate-180",
                )}
              />
            </button>

            {/* BODY */}
            {openDatasetModalBlock && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                className="px-5 pb-5 border-gray-100"
              >
                <DatasetUploadBlock
                  onCreated={(dataset) => setDatasetModal(dataset)}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Selected files */}

        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4 w-full">
            <p className="text-[15px] font-medium text-slate-900">
              Выбранные файлы
            </p>

            <ul className="flex flex-col gap-3">
              {files.map((file, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div
                    data-tooltip-id="see_file_name-tooltip"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-700 shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <span className="truncate text-[14px] text-slate-800 max-w-full">
                      {file.name}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-500 hover:text-red-500 transition"
                  >
                    <IoMdClose className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>

            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-[13px] text-slate-600 mb-1">
                  <span>Загрузка файлов</span>
                  <span>{totalProgress}%</span>
                </div>

                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-200"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>

                {totalProgress >= 95 && totalProgress < 100 && (
                  <p className="text-[12px] text-orange-500 mt-1">
                    Завершаем загрузку…
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() =>
                handleUpload({
                  onSuccess: ({ created, duplicates }) => {
                    if (created.length > 0) {
                      setNotify("upload_file");
                    } else if (duplicates.length > 0) {
                      setNotify("duplicates_only");
                    }

                    if (duplicates.length > 0) {
                      setDuplicatesCount(duplicates.length);
                    }
                    loadFiles(1, true);
                    loadGroups();
                  },
                  onError: (msg) => setError(msg),
                })
              }
              disabled={uploading}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition",
                uploading
                  ? "bg-gray-300 text-slate-600 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-600",
              )}
            >
              {uploading ? "Загрузка..." : "Загрузить"}
            </button>
          </div>
        )}

        {/* Spacer right area (files and queue later) */}
        <div className="flex-1 min-w-0" />
      </motion.div>

      {/* ---------------- нижний контент ---------------- */}

      {/* загруженные файлы */}

      {/* datasets */}
      <div>
        <DatasetsList />
      </div>

      {/* PROCESSING QUEUE */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-10"
      >
        <div
          onClick={() => setIsProcessingModal((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer select-none pb-4 border-b hover:opacity-80 transition"
        >
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
              Очередь обработки
            </h2>
            <p>В очереди: {processingQueue.length + waitingQueue.length}</p>
          </div>

          <IoIosArrowDown
            className={clsx(
              "w-5 h-5 text-slate-600 transition-transform duration-200",
              isProcessingModal && "rotate-180",
            )}
          />
        </div>

        {isProcessingModal && (
          <div className="mt-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!globalStatus?.is_paused ? (
                  <button
                    onClick={pauseAll}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                 bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    <FaStop />
                    Пауза для всех
                  </button>
                ) : (
                  <button
                    onClick={resumeAll}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                 bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    <FaPlay />
                    Возобновить
                  </button>
                )}
              </div>

              {globalStatus && (
                <p className="text-sm text-slate-500 mt-1">
                  {globalStatus.is_paused
                    ? `Глобальная пауза (в очереди: ${globalStatus.queued_count})`
                    : "Очередь работает"}
                </p>
              )}
            </div>
            {/* ================= PROCESSING ================= */}
            {processingQueue.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[15px] font-semibold text-green-600 mb-3">
                  Сейчас обрабатываются
                </h3>

                <div className="bg-white border border-green-200 rounded-xl divide-y">
                  {processingQueue.map((item) => (
                    <div
                      key={`processing-${item.raw_file_id}`}
                      className="grid grid-cols-3 gap-4 items-center px-4 py-3"
                    >
                      {/* NAME */}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {item.file_name}
                        </p>
                        <p className="text-[13px] text-slate-500">
                          {formatFileSize(item.file_size)}
                        </p>
                      </div>

                      {/* STATUS */}
                      <span className="text-green-600 text-sm text-center">
                        Идёт обработка
                      </span>

                      {/* POSITION */}
                      <div className="text-center text-[12px] text-slate-400">
                        pos: {item.position ?? "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= WAITING ================= */}
            {waitingQueue.length > 0 && (
              <div>
                <h3 className="text-[15px] font-semibold text-blue-600 mb-3">
                  В очереди
                </h3>

                <div className="bg-white border border-blue-200 rounded-xl divide-y">
                  {waitingQueue.slice(0, queueLimit).map((item) => (
                    <div
                      key={`waiting-${item.raw_file_id}`}
                      className="grid grid-cols-6 gap-4 items-center px-4 py-3"
                    >
                      {/* NAME */}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {item.file_name}
                        </p>
                        <p className="text-[13px] text-slate-500">
                          {formatFileSize(item.file_size)}
                        </p>
                      </div>

                      {/* STATUS */}
                      <span className="text-sm text-center">
                        {item.status === "queued" && (
                          <span className="text-blue-600">В очереди</span>
                        )}
                        {item.status === "paused" && (
                          <span className="text-cyan-600">На паузе</span>
                        )}
                      </span>

                      {/* PRIORITY */}
                      <select
                        value={item.priority}
                        onChange={(e) =>
                          changePriority(
                            item.raw_file_id,
                            Number(e.target.value),
                          )
                        }
                        className="text-[12px] px-2 py-[4px] rounded border border-gray-300 bg-white hover:border-gray-400"
                      >
                        {[1, 100, 999].map((p) => (
                          <option key={p} value={p}>
                            приоритет {p}
                          </option>
                        ))}
                      </select>

                      {/* POSITION */}
                      <div className="text-center text-[12px] text-slate-400">
                        pos: {item.position ?? "-"}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-2 col-span-2">
                        <button
                          onClick={() => moveToTop(item.raw_file_id)}
                          className="px-2 py-[3px] rounded border border-gray-300 text-[12px] hover:bg-gray-100 transition"
                        >
                          ↑ в топ
                        </button>

                        {item.status === "paused" && (
                          <button
                            onClick={() => resume(item.raw_file_id)}
                            className="p-1 rounded hover:bg-slate-200"
                          >
                            <FaPlay />
                          </button>
                        )}

                        {item.status === "queued" && (
                          <button
                            onClick={() => pause(item.raw_file_id)}
                            className="p-1 rounded hover:bg-slate-200"
                          >
                            <FaStop />
                          </button>
                        )}

                        <button
                          onClick={() => cancel(item.raw_file_id)}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                        >
                          <IoClose />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {waitingQueue.length > queueLimit && (
                  <button
                    onClick={() => setQueueLimit((p) => p + 20)}
                    className="mt-3 text-sm text-cyan-600 hover:underline"
                  >
                    Показать ещё
                  </button>
                )}
              </div>
            )}

            {/* ================= COMPLETED ================= */}

            {/* {completedQueue.length > 0 && (
                <div>
                  <h3 className="text-[15px] font-semibold text-emerald-600 mb-3">
                    Готово
                  </h3>

                  <div className="bg-white border border-emerald-200 rounded-xl divide-y">
                    {completedQueue.slice(0, queueLimit).map((item) => (
                      <div
                        key={`completed-${item.raw_file_id}`}
                        className="grid grid-cols-4 gap-4 items-center px-4 py-3"
                      >
                       
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {item.file_name}
                          </p>
                          <p className="text-[13px] text-slate-500">
                            {formatFileSize(item.file_size)}
                          </p>
                        </div>

                       
                        <span className="text-emerald-600 text-sm text-center">
                          Обработка завершена
                        </span>

                       
                        <div className="text-center text-[12px] text-slate-400">
                          pos: {item.position ?? "-"}
                        </div>

                       
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleRestartFile(item.raw_file_id)}
                            className="px-2 py-1 text-[12px] rounded border border-blue-300 text-blue-600 hover:bg-blue-50 transition"
                          >
                            <MdRestartAlt className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {completedQueue.length > queueLimit && (
                    <button
                      onClick={() => setQueueLimit((p) => p + 20)}
                      className="mt-3 text-sm text-cyan-600 hover:underline"
                    >
                      Показать ещё
                    </button>
                  )}
                </div>
              )} */}

            {/* ================= FAILED ================= */}
            {failedQueue.length > 0 && (
              <div>
                <h3 className="text-[15px] font-semibold text-red-600 mb-3">
                  Ошибка обработки
                </h3>

                <div className="bg-white border border-red-200 rounded-xl divide-y">
                  {failedQueue.map((item) => {
                    const tooltipId = `error-q-file_${item.raw_file_id}_failed`;

                    return (
                      <div
                        key={`failed-${item.raw_file_id}`}
                        className="grid grid-cols-5 gap-4 items-center px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {item.file_name}
                          </p>
                          <p className="text-[13px] text-slate-500">
                            {formatFileSize(item.file_size)}
                          </p>
                        </div>

                        <span
                          data-tooltip-id={tooltipId}
                          className="text-red-600 cursor-help"
                        >
                          Ошибка
                        </span>
                        <Tooltip
                          place="top"
                          delayShow={400}
                          id={tooltipId}
                          content={
                            item.error_code
                              ? getErrorLabel(item.error_code)
                              : item.error_message || "Ошибка парсинга"
                          }
                        />

                        <div className="col-span-3 flex justify-end gap-2">
                          <button
                            onClick={() => handleRestartFile(item.raw_file_id)}
                            className="px-2 py-1 text-[12px] rounded border border-green-300 text-green-600 hover:bg-green-50 transition"
                          >
                            <MdRestartAlt className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => cancel(item.raw_file_id)}
                            className="p-1 rounded hover:bg-red-100 text-red-500"
                          >
                            <IoClose />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {processingQueue.length === 0 &&
              waitingQueue.length === 0 &&
              failedQueue.length === 0 &&
              completedQueue.length === 0 && (
                <p className="text-[13px] text-slate-500">Очередь пуста</p>
              )}
          </div>
        )}
      </motion.div>

      {/* FILES LIST */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
              Загруженные файлы
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-end">
            {hasGlobalListFilters && (
              <motion.button
                type="button"
                onClick={resetGlobalListFilters}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-[14px] font-medium text-slate-700 border border-slate-300 rounded-xl bg-slate-50 shadow-sm hover:bg-slate-100 hover:border-slate-400 transition"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                  <IoClose className="w-3.5 h-3.5" />
                </span>
                Сбросить
              </motion.button>
            )}

            <button
              onClick={() => {
                setIsGlobalListMode(true);
                setGlobalSortOrder((prev) =>
                  prev === "newest" ? "oldest" : "newest",
                );
                setSearchPage(1);
                setSearchResults([]);
              }}
              className="px-3 py-2 text-[14px] border border-gray-300 rounded-xl bg-white shadow-sm hover:bg-slate-50 hover:border-slate-400 transition flex gap-2 items-center"
            >
              Сортировать по дате
              <IoIosArrowForward
                className={clsx(
                  "w-5 h-5 transition-transform",
                  globalSortOrder === "newest" ? "rotate-90" : "-rotate-90",
                )}
              />
            </button>

            <Tooltip id="sort_order" content="Сортировать по дате" />

            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value);
                setIsGlobalListMode(Boolean(value) || Boolean(search.trim()));
                setSearchPage(1);
                setSearchResults([]);
              }}
              className="px-3 py-2 text-[14px] border border-gray-300 rounded-xl bg-white hover:bg-slate-50 shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition cursor-pointer"
            >
              <option value="">Все статусы</option>
              <option value="extracting">Обработка</option>
              <option value="extracted">Готово</option>
              <option value="failed">Ошибка</option>
              <option value="reprocessing">Переобработка</option>
            </select>
            {/* SEARCH */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsGlobalListMode(
                  Boolean(e.target.value.trim()) || Boolean(statusFilter),
                );
                setSearchPage(1);
              }}
              placeholder="Поиск по названию файла"
              className="w-64 px-3 py-2 text-[14px] border border-gray-300 rounded-xl bg-white shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
            />
          </div>
        </div>

        {fileStatuses && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 mb-4 items-center">
            <div className="text-sm font-medium text-slate-700 mr-2">
              Всего файлов:
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {fileStatuses.total}
            </div>

            {fileStatuses.statuses
              .filter((s) => s.status !== "uploaded")
              .map((s) => {
                const meta = statusMeta[s.status] || {
                  label: s.status,
                  color: "bg-gray-100 text-gray-700",
                };

                return (
                  <div
                    key={s.status}
                    className={`px-3 py-1 rounded-full text-xs font-medium border`}
                  >
                    {meta.label}: {s.count}
                  </div>
                );
              })}
          </div>
        )}

        {/* GLOBAL LIST / SEARCH RESULTS */}
        {hasGlobalListFilters ? (
          <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Найдено файлов: {searchTotal}
              </h3>
            </div>

            {searchLoading && (
              <p className="px-4 py-4 text-sm text-slate-500">Поиск...</p>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <p className="px-4 py-4 text-sm text-slate-500">
                Ничего не найдено
              </p>
            )}

            {searchResults.map((file) => {
              const tooltipId = `error-file_${file.id}_search`;

              return (
                <div
                  key={file.id}
                  className={clsx(
                    "grid grid-cols-4 gap-4 items-center py-3 px-4 border-b last:border-0 transition",
                    file.uploaded_by_user_id === currentUser?.id &&
                      "bg-green-50/60",
                  )}
                >
                  {/* LEFT */}
                  <div className="flex flex-col min-w-0">
                    <p
                      data-tooltip-id={`name-file_${file.id}`}
                      className="text-[14px] font-medium text-slate-900 truncate"
                      dangerouslySetInnerHTML={{
                        __html: search
                          ? file.display_name.replace(
                              new RegExp(`(${safeSearch})`, "gi"),
                              "<mark class='bg-green-300'>$1</mark>",
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

                    <div className="flex items-center gap-4 text-[13px] text-slate-500">
                      <span>{formatFileSize(file.file_size)}</span>

                      {file.quality_score != null && (
                        <span
                          className={clsx(
                            "px-2 py-[2px] rounded text-xs font-medium",
                            file.needs_review
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-700",
                          )}
                        >
                          {Math.round(file.quality_score * 100)}%
                        </span>
                      )}

                      {file.needs_review && (
                        <>
                          <CgDanger
                            data-tooltip-id={`quality_warn_${file.id}`}
                            className="w-4 h-4 text-yellow-500"
                          />
                          <Tooltip
                            id={`quality_warn_${file.id}`}
                            content="Низкое качество данных (< 40%)"
                          />
                        </>
                      )}

                      <button
                        onClick={() => setPreviewFile(file)}
                        className="text-cyan-600 hover:text-cyan-700 underline underline-offset-2 transition"
                      >
                        Предпросмотр
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAddFile(file);
                        }}
                      >
                        <MdMoreVert className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* CREATED */}
                  <p className="text-[13px] text-slate-600 text-center">
                    {file.created_at
                      ? new Date(file.created_at).toLocaleDateString()
                      : "-"}
                  </p>

                  {/* FILE GROUP */}
                  <select
                    value={file.file_group ?? ""}
                    onChange={(e) => handleFileGroup(file.id, e.target.value)}
                    className="px-2 py-[4px] w-[250px] rounded border border-gray-300 text-[12px] bg-white hover:border-gray-400 focus:ring-2 focus:ring-cyan-300"
                  >
                    {groups.map((group) => (
                      <option key={group.name} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>

                  {/* STATUS + DELETE */}
                  <div className="flex items-center justify-end gap-3 text-[13px]">
                    {file.processing_status === "uploaded" && (
                      <span className="text-blue-600">Загружен</span>
                    )}
                    {file.processing_status === "pending" && (
                      <span className="text-slate-500">Ожидание...</span>
                    )}
                    {file.processing_status === "extracting" && (
                      <span className="text-cyan-600">Обработка...</span>
                    )}
                    {file.processing_status === "extracted" && (
                      <span className="text-green-600">Готово</span>
                    )}
                    {file.processing_status === "reprocessing" && (
                      <span className="text-green-600">
                        Повторная обработка
                      </span>
                    )}
                    {file.processing_status === "failed" && (
                      <>
                        <span
                          data-tooltip-id={tooltipId}
                          className="text-red-600 cursor-help"
                        >
                          Ошибка
                        </span>
                        <Tooltip
                          place="top"
                          delayShow={400}
                          id={tooltipId}
                          content={file.error_message}
                        />
                      </>
                    )}

                    <button
                      onClick={() => setDeleteFile(file.id)}
                      className="p-[6px] rounded hover:bg-red-100 text-red-500 transition"
                    >
                      <MdDelete className="w-[16px] h-[16px]" />
                    </button>
                    <button
                      onClick={() => handleRestartFile(file.id)}
                      className="p-[6px] rounded hover:bg-red-100 text-green-500 transition"
                    >
                      <MdRestartAlt className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setSearchPage((p) => p + 1)}
              className="w-full py-3 text-sm text-cyan-600 hover:underline"
            >
              Показать ещё
            </button>
          </div>
        ) : (
          /* GROUPS */
          <div className="mt-5 flex flex-col gap-6">
            {groups.map((group) => {
              const groupName = group.name;

              return (
                <GroupBlock
                  key={groupName}
                  group={group}
                  files={filesByGroup[groupName] ?? []}
                  collapsed={collapsedGroups[groupName] ?? true}
                  sort={sortByGroup[groupName] ?? "newest"}
                  loading={loadingGroup[groupName] ?? false}
                  currentUserId={currentUser?.id}
                  groups={groups}
                  search={search}
                  safeSearch={safeSearch}
                  formatFileSize={formatFileSize}
                  onToggle={() => {
                    setCollapsedGroups((prev) => {
                      const next = !(prev[groupName] ?? true);

                      // если открываем и файлов ещё нет — грузим
                      if (!next && !filesByGroup[groupName]) {
                        loadGroupFiles(groupName);
                      }

                      return {
                        ...prev,
                        [groupName]: next,
                      };
                    });
                  }}
                  onToggleSort={() => {
                    const nextSort =
                      (sortByGroup[groupName] ?? "newest") === "newest"
                        ? "oldest"
                        : "newest";

                    setSortByGroup((prev) => ({
                      ...prev,
                      [groupName]: nextSort,
                    }));

                    setFilesByGroup((prev) => ({
                      ...prev,
                      [groupName]: [],
                    }));

                    setPageByGroup((prev) => ({
                      ...prev,
                      [groupName]: 1,
                    }));

                    loadGroupFiles(groupName, {
                      page: 1,
                      sort: nextSort,
                    });
                  }}
                  onLoadMore={() => loadGroupFiles(groupName)}
                  onChangeGroup={handleFileGroup}
                  onPreview={(file) => setPreviewFile(file)}
                  onDelete={(id) => setDeleteFile(id)}
                  onRestart={handleRestartFile}
                  onAddFile={(file) => setOpenAddFile(file)}
                />
              );
            })}
          </div>
        )}
      </motion.div>

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
          onDeleted={handleFileDeleted}
          description={"Файл будет удалён без возможности восстановления."}
        />
      )}

      {/* ---------------- модалка подтверждения удаления файла ---------------- */}
      {openAddFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="bg-white p-6 rounded-xl w-[1200px] shadow-xl flex flex-col gap-5"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold text-slate-900">
                Дополнительная информация
              </p>
              <button
                onClick={() => setOpenAddFile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IoIosClose className="w-6 h-6" />
              </button>
            </div>

            {/* ОСНОВНАЯ ИНФА */}
            <div className="flex flex-col gap-2 text-sm">
              <InfoRow label="Название" value={openAddFile.display_name} />
              <InfoRow label="Тип файла" value={openAddFile.file_type} />
              <InfoRow
                label="Размер"
                value={formatFileSize(openAddFile.file_size)}
              />
              <InfoRow label="Группа" value={openAddFile.file_group ?? "-"} />
              <InfoRow
                label="Статус"
                value={renderProcessingStatus(openAddFile)}
              />
            </div>

            {/* СТАТИСТИКА */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <p className="text-xs uppercase text-slate-500 mb-2">
                Статистика обработки
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="Всего строк" value={"-"} />
                {/* openAddFile.total_rows */}
                <InfoRow label="Валидные" value={"-"} />
                {/* openAddFile.valid_rows */}
                <InfoRow label="Невалидные" value={"-"} />
                {/* openAddFile.invalid_rows */}
                <InfoRow label="Извлечённые сущности" value={"-"} />
                {/* openAddFile.extracted_entities */}
              </div>
              {openAddFile.quality_score != null && (
                <InfoRow
                  label="Качество данных"
                  value={`${Math.round(openAddFile.quality_score * 100)}%`}
                />
              )}

              {openAddFile.needs_review && (
                <div className="text-yellow-700 text-xs mt-1">
                  Требуется проверка качества данных
                </div>
              )}

              {openAddFile.error_code && (
                <InfoRow
                  label="Причина ошибки"
                  value={getErrorLabel(openAddFile.error_code)}
                />
              )}
            </div>

            {/* ДАТЫ */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <p className="text-xs uppercase text-slate-500 mb-2">Время</p>

              <div className="flex flex-col gap-1 text-sm">
                <InfoRow
                  label="Загружен"
                  value={formatDateTime(openAddFile.upload_date)}
                />
                <InfoRow
                  label="Начало обработки"
                  value={formatDateTime(openAddFile.processing_started_at)}
                />
                <InfoRow
                  label="Завершение обработки"
                  value={formatDateTime(openAddFile.processing_completed_at)}
                />
                <InfoRow
                  label="Обновлён"
                  value={formatDateTime(openAddFile.updated_at)}
                />
              </div>
            </div>

            {/* ТЕХНИЧКА */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <p className="text-xs uppercase text-slate-500 mb-2">
                Техническая информация
              </p>

              <InfoRow label="ID файла" mono value={openAddFile.id} />
              <InfoRow label="S3 bucket" mono value={openAddFile.s3_bucket} />
              <InfoRow label="S3 key" mono value={openAddFile.s3_key} />
              <InfoRow
                label="ID администратора"
                value={openAddFile.uploaded_by_user_id}
              />
            </div>

            {/* ERROR */}
            {openAddFile.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {openAddFile.error_message}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {datasetModal && (
        <DatasetModal
          dataset={datasetModal}
          onClose={() => setDatasetModal(null)}
        />
      )}
    </section>
  );
};

export default UploadFiles;
