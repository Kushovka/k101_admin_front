import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { MdDelete, MdRestartAlt } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import type { FileGroup, FileItem } from "../../../types/file";

type Props = {
  group: FileGroup;
  files: FileItem[];
  collapsed: boolean;
  sort: "newest" | "oldest";
  loading: boolean;
  currentUserId?: string;

  groups: FileGroup[];
  search: string;
  safeSearch: string;

  formatFileSize: (bytes?: number) => string;

  onToggle(): void;
  onLoadMore(): void;
  onToggleSort(): void;
  onChangeGroup(id: string, group: string): void;
  onPreview(file: FileItem): void;
  onDelete(id: string): void;
  onRestart(id: string): void;
};

const GroupBlock = memo(
  ({
    group,
    files,
    collapsed,
    sort,
    loading,
    currentUserId,
    groups,
    search,
    safeSearch,
    formatFileSize,
    onToggle,
    onLoadMore,
    onToggleSort,
    onChangeGroup,
    onPreview,
    onDelete,
    onRestart,
  }: Props) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* HEADER */}
        <div
          onClick={onToggle}
          className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100 transition"
        >
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">
              {group.name}
            </h3>
            <p className="text-[12px] text-slate-500">Файлов: {group.total}</p>
          </div>

          <IoIosArrowDown
            className={clsx(
              "w-5 h-5 text-slate-600 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col overflow-hidden"
            >
              {/* SORT */}
              <button
                onClick={onToggleSort}
                className="flex items-center gap-3 self-start m-3 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition"
              >
                Сортировать по дате
                <IoIosArrowForward
                  className={clsx(
                    "w-5 h-5 transition-transform",
                    sort === "newest" ? "rotate-90" : "-rotate-90",
                  )}
                />
              </button>

              <Tooltip id="sort_order" content="Сортировать по дате" />

              {files.map((file) => (
                <div
                  key={file.id}
                  className={clsx(
                    "grid grid-cols-4 gap-4 items-center py-3 px-4 border-b last:border-0",
                    file.uploaded_by_user_id === currentUserId &&
                      "bg-green-50/60",
                  )}
                >
                  {/* NAME */}
                  <div className="flex flex-col min-w-0">
                    <p
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

                    <div className="flex items-center gap-4 text-[13px] text-slate-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <button
                        onClick={() => onPreview(file)}
                        className="text-cyan-600 hover:text-cyan-700 underline underline-offset-2"
                      >
                        Предпросмотр
                      </button>
                    </div>
                  </div>

                  {/* DATE */}
                  <p className="text-[13px] text-slate-600 text-center">
                    {file.created_at
                      ? new Date(file.created_at).toLocaleDateString()
                      : "-"}
                  </p>

                  {/* GROUP SELECT */}
                  <select
                    value={file.file_group ?? ""}
                    onChange={(e) => onChangeGroup(file.id, e.target.value)}
                    className="px-2 py-[4px] w-[250px] rounded border border-gray-300 text-[12px]"
                  >
                    {groups.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>

                  {/* ACTIONS */}
                  <div className="flex items-center justify-end gap-3 text-[13px]">
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-[6px] rounded hover:bg-red-100 text-red-500"
                    >
                      <MdDelete className="w-[16px] h-[16px]" />
                    </button>

                    <button
                      onClick={() => onRestart(file.id)}
                      className="p-[6px] rounded hover:bg-green-100 text-green-500"
                    >
                      <MdRestartAlt className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>
              ))}

              {files.length < group.total && (
                <button
                  disabled={loading}
                  onClick={onLoadMore}
                  className="py-2 text-sm hover:bg-gray-50"
                >
                  {loading ? "Загрузка..." : "Загрузить ещё"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

export default GroupBlock;
