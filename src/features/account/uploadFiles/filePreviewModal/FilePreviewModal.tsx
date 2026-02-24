import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Toast from "../../../../components/toast/Toast";
import { useFieldAliases } from "../../../../hooks/uploadFiles/useFieldAliases";
import { useFileAlias } from "../../../../hooks/uploadFiles/useFileAlias";
import { useFilePreview } from "../../../../hooks/uploadFiles/useFilePreview";

type FileLike = {
  id: string;
  display_name?: string;
  file_name?: string;
  file_description?: string | null;
};

type FilePreviewModalProps = {
  file: FileLike;
  onClose: () => void;
  onUpdateFile: (fileId: string, alias: string) => void;
};

type PreviewRow = Record<string, unknown>;

const FilePreviewModal = ({
  file,
  onClose,
  onUpdateFile,
}: FilePreviewModalProps) => {
  const token = localStorage.getItem("access_token") ?? "";

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [activeBtn, setActiveBtn] = useState<string>("10");
  const [notify, setNotify] = useState<string | null>(null);

  const {
    fileAlias,
    setFileAlias,
    editingFileAlias,
    setEditingFileAlias,
    saveFileAlias,
  } = useFileAlias({
    file,
    token,
    onNotify: setNotify,
    onError: setError,
    onUpdateFile,
  });

  const { rows, loading } = useFilePreview({ file, limit, token });
  const typedRows = rows as PreviewRow[];

  const {
    aliases,
    editingField,
    setEditingField,
    aliasValue,
    setAliasValue,
    saveAlias,
  } = useFieldAliases({ file, token, onNotify: setNotify, onError: setError });

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;

    e.preventDefault();
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  /* ---------------- lock scroll ---------------- */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /* ---------------- esc close ---------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  /* ---------------- helpers ---------------- */

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const columns =
    Array.isArray(rows) && rows.length > 0 ? Object.keys(typedRows[0]) : [];

  const isTxtPreview =
    file.file_name?.toLowerCase().endsWith(".txt") ||
    (columns.length === 1 && columns[0] === "line");

  /* ---------------- skeleton ---------------- */

  const Skeleton = () => (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-2 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-2 mb-2">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-5 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );



  type TxtLineProps = {
    value: string;
  };

  const TxtLine = ({ value }: TxtLineProps) => {
    const parts = value.split(":");

    return (
      <div className="flex gap-2 px-2 py-1 border rounded hover:bg-gray-50 whitespace-nowrap">
        {parts.map((part, i) => (
          <span
            key={i}
            className={clsx(
              "break-all",
              i === 0 && "text-blue-600",
              i === 1 && "text-green-600",
              i === 2 && "text-red-600",
              i > 2 && "text-gray-600",
            )}
          >
            {part}
          </span>
        ))}
      </div>
    );
  };

  /* ---------------- render ---------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {notify && (
        <Toast
          type="access"
          message="Алиас успешно добавлен!"
          onClose={() => setNotify(null)}
        />
      )}

      <div className="bg-white rounded-lg px-6 py-6 w-[90%] max-w-[1800px]">
        {/* header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {!editingFileAlias ? (
            <div className="flex items-center gap-3 subtitle">
              <h2>Предпросмотр:</h2>
              <div
                onClick={() => setEditingFileAlias(true)}
                data-tooltip-id="file_alias-tooltip"
                className="flex items-center gap-1 group cursor-pointer select-none font-semibold"
              >
                <span className="px-2 py-1 cursor-pointer ">
                  {fileAlias || file.display_name || file.file_name}
                </span>
                {fileAlias && <span>({file.file_name})</span>}

                <FaPen className="group-hover:scale-125 transition duration-300  w-[14px] h-[14px]" />
              </div>
              <Tooltip
                place="top"
                delayShow={400}
                id="file_alias-tooltip"
                content="Кликните, чтобы задать алиас"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1"
                value={fileAlias}
                onChange={(e) => setFileAlias(e.target.value)}
                placeholder="добавьте алиас"
              />
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded"
                onClick={saveFileAlias}
              >
                Сохранить
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => {
                  setEditingFileAlias(false);
                  setFileAlias(file.file_description ?? "");
                }}
              >
                Отмена
              </button>
            </div>
          )}
          <button onClick={onClose}>
            <IoMdClose size={22} />
          </button>
        </div>

        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* table container (fixed height) */}
        <div
          className="h-[60vh] border rounded overflow-auto  p-2 overscroll-contain"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          <div className="min-w-max">
            {loading && <Skeleton />}

            {!loading && rows.length === 0 && (
              <p className="text-gray-500 text-center mt-10">
                Нет данных для предпросмотра
              </p>
            )}

            {!loading && rows.length > 0 && isTxtPreview && (
              <div className="space-y-1 font-mono text-sm min-w-max">
                {typedRows.map((row, i) => (
                  <TxtLine key={i} value={String(row.line ?? "")} />
                ))}
              </div>
            )}

            {!loading && rows.length > 0 && !isTxtPreview && (
              <table className="min-w-max border-collapse text-sm">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        data-tooltip-id="alias-file_tooltip"
                        className="border px-2 py-1 bg-gray-100 cursor-pointer  hover:bg-blue-50"
                        onClick={() => {
                          setEditingField(col);
                          setAliasValue(aliases[col]?.display_name ?? "");
                        }}
                      >
                        {aliases[col]?.display_name ?? col}
                        <Tooltip
                          id="alias-file_tooltip"
                          place="top"
                          delayShow={400}
                          content="Кликните, чтобы задать алиас"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typedRows.map((row, i) => (
                    <tr key={i} className="">
                      {columns.map((col) => (
                        <td
                          key={col}
                          className={clsx(
                            "border px-2 py-1 ",
                            col === "additional_data" && "cursor-pointer",
                          )}
                          data-tooltip-id={`cell-tooltip-${i}-${col}`}
                        >
                          {renderCellValue(row[col])}
                          {col === "additional_data" && row[col] != null && (
                            <Tooltip
                              id={`cell-tooltip-${i}-${col}`}
                              place="top"
                              delayShow={400}
                              className="max-w-[500px] whitespace-normal break-words"
                              render={() => (
                                <pre className="whitespace-pre-wrap text-xs">
                                  {JSON.stringify(row[col], null, 2)}
                                </pre>
                              )}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-between items-center pt-4">
          <div>
            {editingField && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Алиас для <b>{editingField}</b>:
                </span>
                <input
                  className="border rounded px-3 py-1"
                  value={aliasValue}
                  onChange={(e) => setAliasValue(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={saveAlias}
                >
                  Сохранить
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => {
                    setEditingField(null);
                    setAliasValue("");
                  }}
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              data-tooltip-id="file_limit-tooltip"
              className="border-2 cursor-pointer border-black rounded-full px-[7px] text-[14px] font-bold"
            >
              ?
            </div>
            <Tooltip
              place="top"
              delayShow={400}
              id="file_limit-tooltip"
              content="Количество отображаемых строк"
            />
            {[10, 30, 50].map((n) => (
              <div key={n}>
                <button
                  onClick={() => {
                    setLimit(n);
                    setActiveBtn(String(n));
                  }}
                  className={clsx(
                    "px-3 py-1 border rounded",
                    activeBtn === String(n) &&
                      "bg-blue-500 text-white border-blue-500",
                  )}
                >
                  {n}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
