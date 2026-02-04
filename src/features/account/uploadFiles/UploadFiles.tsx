import clsx from "clsx";
import { motion } from "framer-motion";
import { JSX, useEffect, useState } from "react";
import { CgDanger } from "react-icons/cg";
import { FaPlay, FaStop } from "react-icons/fa";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdDelete, MdRestartAlt } from "react-icons/md";
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
import {
  getAllFiles,
  getAllGroup,
  getFilesByGroup,
  getParsingQueue,
  patchFileGroup,
  patchPriorityFile,
  postRestartFile,
  postToTopFile,
} from "../../../api/uploadFiles";
import userApi from "../../../api/userApi";
import { getCurrentUser } from "../../../api/users";
import DeleteModal from "../../../components/deleteModal/DeleteModal";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { useUploadStore } from "../../../store/useUploadStore";
import type { FileGroup, FileItem, FileItemQueue } from "../../../types/file";
import FilePreviewModal from "./filePreviewModal/FilePreviewModal";
import GroupBlock from "./GroupBlock";
import UploadDropzone from "./UploadDropzone";

type User = {
  id: string;
};

const ACTIVE_STATUSES = ["queued", "paused", "processing"] as const;

type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

const UploadFiles = () => {
  const { isOpen } = useSidebar();
  const { files, removeFile, progress, uploading, handleUpload } =
    useUploadStore();

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [toastFile, setToastFile] = useState<FileItem | null>(null);

  const [notify, setNotify] = useState<string | null>(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [groups, setGroups] = useState<FileGroup[]>([]);
  const [filesByGroup, setFilesByGroup] = useState<Record<string, FileItem[]>>(
    {},
  );
  const [pageByGroup, setPageByGroup] = useState<Record<string, number>>({});
  const [loadingGroup, setLoadingGroup] = useState<Record<string, boolean>>({});

  const [queue, setQueue] = useState<any[]>([]);
  const [parsingCurrent, setParsingCurrent] = useState<any[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [totalFiles, setTotalFiles] = useState<number | null>(null);
  const [sortByGroup, setSortByGroup] = useState<
    Record<string, "newest" | "oldest">
  >({});

  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [duplicateMessages, setDuplicateMessages] = useState<string[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");

  const token = localStorage.getItem("access_token") ?? "";

  const auth = { headers: { Authorization: `Bearer ${token}` } };

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

  const isActiveStatus = (
    status?: FileItemQueue["status"],
  ): status is ActiveStatus => {
    return (
      status !== undefined && ACTIVE_STATUSES.includes(status as ActiveStatus)
    );
  };

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = search ? escapeRegExp(search) : "";

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

  // console.log(searchResults);
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const loadSearch = async () => {
      try {
        setSearchLoading(true);
        const res = await getAllFiles({
          page: 1,
          pageSize: 50,
          search,
        });
        setSearchResults(res.files);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeout = setTimeout(loadSearch, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const isCollapsed = prev[groupName] ?? true;
      const nextCollapsed = !isCollapsed;

      if (!nextCollapsed && !filesByGroup[groupName]) {
        loadGroupFiles(groupName);
      }

      return {
        ...prev,
        [groupName]: nextCollapsed,
      };
    });
  };

  /* ---------------- пагинация ---------------- */

  const loadFiles = async (pageToLoad = 1, replace = false): Promise<void> => {
    if (loadingFiles) return;

    setLoadingFiles(true);
    setError(null);

    try {
      const data = await getAllFiles({
        page: pageToLoad,
        pageSize,
        search,
      });

      setAllFiles((prev) => (replace ? data.files : [...prev, ...data.files]));

      setTotalFiles(data.total);
      setHasMore(data.files.length === pageSize);
    } catch (e) {
      console.error(e);
      setError("Произошла ошибка! Попробуйте позже.");
    } finally {
      setLoadingFiles(false);
    }
  };
  // console.log(filesByGroup);
  // console.log(pageByGroup);
  // console.log(groups);
  /* ---------------- initial load ---------------- */

  /* ---------------- queue api ---------------- */

  const queueApi = {
    pause: async (id: string) => {
      try {
        await userApi.post(`/api/v1/parsing-queue/${id}/pause`, {}, auth);
        await handleAllQueue();
      } catch (e: any) {
        console.error(e);
        setError(e.response?.data?.detail ?? "Ошибка при паузе файла");
      }
    },
    resume: async (id: string) => {
      try {
        await userApi.post(`/api/v1/parsing-queue/${id}/resume`, {}, auth);
        await handleAllQueue();
      } catch (e: any) {
        console.error(e);
        setError(e.response?.data?.detail ?? "Ошибка при возобновлении файла");
      }
    },
    cancel: async (id: string) => {
      try {
        await userApi.post(`/api/v1/parsing-queue/${id}/cancel`, {}, auth);
        await handleAllQueue();
      } catch (e: any) {
        console.error(e);
        setError(e.response?.data?.detail ?? "Ошибка при отмене файла");
      }
    },
  };

  const handleChangePriority = async (id: string, priority: number) => {
    try {
      const res = await patchPriorityFile(id, { priority });
      // обновляем локально
      setQueue((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, priority: res.priority, position: res.position }
            : f,
        ),
      );
    } catch (e) {
      console.error(e);
      setError("Ошибка при изменении приоритета");
    }
  };

  const handleAllQueue = async () => {
    try {
      const res = await getParsingQueue();
      setQueue(res?.entries);
    } catch (err) {
      // console.log(err);
    }
  };

  const handleMoveToTop = async (id: string) => {
    try {
      await postToTopFile(id);
      await handleAllQueue(); // подтянуть новую позицию
    } catch (err) {
      console.log(err);
      setError("Не удалось поднять в топ");
    }
  };

  useEffect(() => {
    const handleParsingCurrent = async () => {
      try {
        const res = await getParsingQueue();
        setParsingCurrent(res.currently_processing);
      } catch (err) {
        console.log(err);
      }
    };
    handleParsingCurrent();
  }, []);
  // console.log(parsingCurrent);

  useEffect(() => {
    handleAllQueue();
    const interval = setInterval(handleAllQueue, 2000);
    return () => clearInterval(interval);
  }, []);

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

      // 1. очередь
      await handleAllQueue();

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

  // console.log(queue);
  /* ---------------- форматер размера файла ---------------- */

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null) return "-";

    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} КБ`;

    return `${(kb / 1024).toFixed(2)} МБ`;
  };
  // console.log(queue);
  // console.log(searchResults);

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
        ["queued", "extracting", "uploaded"].includes(f.processing_status),
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
        // потом включить на тест
        // console.log(updates.map((u) => u.data.progress_percent));
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
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUser, token]);
  // console.log(duplicateMessages);
  // console.log(queue);
  const DISABLE_ANIMATION_LIMIT = 50;
  const shouldAnimate = files.length < DISABLE_ANIMATION_LIMIT;

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

      {notify === "delete_file" && (
        <Toast
          key="delete"
          type="access"
          message={`Файл ${toastFile?.display_name ?? ""} успешно удален `}
          onClose={() => setNotify(null)}
        />
      )}

      {duplicateMessages.map((msg, i) => (
        <Toast
          key={i}
          type="error"
          message={msg}
          onClose={() =>
            setDuplicateMessages((prev) => prev.filter((_, idx) => idx !== i))
          }
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex gap-8 items-start"
      >
        {/* Upload Dropzone */}

        <UploadDropzone />

        {/* Selected files */}
        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4 w-1/2">
            <p className="text-[15px] font-medium text-slate-900">
              Выбранные файлы
            </p>

            <ul className="flex flex-col gap-3">
              {files.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 min-w-0"
                >
                  <div
                    data-tooltip-id="see_file_name-tooltip"
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-700 shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <span className="truncate text-[14px] text-slate-800 max-w-full">
                      {file.name}
                    </span>
                  </div>

                  {uploading &&
                    progress[file.name] != null &&
                    (progress[file.name] >= 90 && progress[file.name] < 100 ? (
                      <span className="text-[13px] text-orange-500 shrink-0">
                        Сборка файла…
                      </span>
                    ) : (
                      <span className="text-[13px] text-slate-600 shrink-0">
                        {progress[file.name]}%
                      </span>
                    ))}

                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-500 hover:text-red-500 transition"
                  >
                    <IoMdClose className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() =>
                handleUpload({
                  onSuccess: ({ created, duplicates }) => {
                    if (created.length > 0) {
                      setNotify("upload_file");
                    }

                    if (duplicates.length > 0) {
                      setDuplicateMessages(
                        duplicates.map(
                          (d: any) => `Файл "${d.file_name}": ${d.message}`,
                        ),
                      );
                    }

                    setPage(1);
                    setHasMore(true);
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
            <p className="text-[13px] text-slate-500 mt-[2px]">
              В очереди: {queue.length}
            </p>
          </div>

          <IoIosArrowDown
            className={clsx(
              "w-5 h-5 text-slate-600 transition-transform duration-200",
              isProcessingModal && "rotate-180",
            )}
          />
        </div>

        {parsingCurrent.length > 0 && <div></div>}

        {isProcessingModal && queue.length > 0 && (
          <div className="flex flex-col gap-2 mt-6 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
            {queue.map((item) => {
              const name =
                item.file_description || item.file_name || "Без имени";
              // console.log(item);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4 items-center border-b last:border-0 py-3"
                >
                  {/* NAME + INFO */}
                  <div className="min-w-0 flex flex-col">
                    <p className="truncate font-medium text-[15px] text-slate-900">
                      {name}
                    </p>
                    <p className="text-[13px] text-slate-500">
                      {formatFileSize(item.file_size)}
                    </p>
                  </div>

                  <div>
                    {isActiveStatus(item.status) && (
                      <div className="flex items-center gap-2 shrink-0 text-slate-600">
                        {(item.status === "paused" ||
                          item.status === "cancelled") && (
                          <button
                            onClick={() => queueApi.resume(item.raw_file_id)}
                            className="p-[6px] rounded hover:bg-slate-200 transition"
                          >
                            <FaPlay className="w-[20px] h-[20px]" />
                          </button>
                        )}
                        {item.status === "queued" && (
                          <button
                            onClick={() => queueApi.pause(item.raw_file_id)}
                            className="p-[6px] rounded hover:bg-slate-200 transition"
                          >
                            <FaStop className="w-[20px] h-[20px]" />
                          </button>
                        )}
                        <button
                          onClick={() => queueApi.cancel(item.raw_file_id)}
                          className="p-[6px] rounded hover:bg-red-100 text-red-500 transition"
                        >
                          <IoClose className="w-[30px] h-[30px]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="text-[13px] text-center">
                    {item.status === "queued" && (
                      <span className="text-blue-600">В очереди...</span>
                    )}
                    {item.status === "paused" && (
                      <span className="text-cyan-600">На паузе</span>
                    )}
                    {item.status === "cancelled" && (
                      <span className="text-red-600">Отменен</span>
                    )}
                    {item.status === "completed" && (
                      <span className="text-green-600">Выполнен</span>
                    )}
                    {item.status === "processing" && (
                      <span className="text-green-600">Идет обработка</span>
                    )}
                    {item.status === "failed" && (
                      <span className="text-red-600">Ошибка</span>
                    )}
                  </div>

                  {/* PRIORITY SELECT */}
                  {["uploaded", "queued"].includes(item.status ?? "") ? (
                    <select
                      value={String(item.priority ?? 100)}
                      onChange={(e) =>
                        handleChangePriority(
                          item.raw_file_id,
                          Number(e.target.value),
                        )
                      }
                      className="px-3 py-[6px] rounded-md text-[13px] bg-white border border-gray-300 hover:border-gray-400 shadow-sm focus:ring-2 focus:ring-cyan-300 select-none"
                    >
                      <option value={1} className="text-red-600">
                        Высокий (1)
                      </option>
                      <option value={50} className="text-orange-500">
                        Средний (50)
                      </option>
                      <option value={100}>Обычный (100)</option>
                      <option value={999} className="text-slate-500">
                        Низкий (999)
                      </option>
                    </select>
                  ) : (
                    <div className="text-[13px] text-slate-500 text-center">
                      {item.priority}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 justify-end">
                    {item.status == "cancelled" && (
                      <button
                        onClick={() => setDeleteFile(item.raw_file_id)}
                        className="p-[6px] rounded hover:bg-red-100 text-red-500 transition"
                      >
                        <MdDelete className="w-[26px] h-[26px]" />
                      </button>
                    )}
                    {item.position !== null && (
                      <span className="text-[12px] text-slate-500">
                        pos: {item.position}
                      </span>
                    )}

                    <button
                      onClick={() => handleMoveToTop(item.raw_file_id)}
                      className="px-2 py-[3px] rounded border border-gray-300 text-[12px] text-slate-700 hover:bg-gray-100 transition"
                    >
                      ↑ в топ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isProcessingModal && queue.length === 0 && (
          <p className="text-[13px] text-slate-500 mt-4">Очередь пуста</p>
        )}
      </motion.div>

      {/* FILES LIST */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
              Загруженные файлы
            </h2>
          </div>

          <div className="flex gap-3 items-center">
            {/* SEARCH */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setHasMore(true);
              }}
              placeholder="Поиск по названию файла"
              className="w-64 px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
        {/* SEARCH RESULTS */}
        {search.trim() ? (
          <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Найдено файлов: {searchResults.length}
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
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="text-cyan-600 hover:text-cyan-700 underline underline-offset-2 transition"
                      >
                        Предпросмотр
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
                    {file.processing_status === "failed" && (
                      <span className="text-red-600">Ошибка</span>
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
    </section>
  );
};

export default UploadFiles;
