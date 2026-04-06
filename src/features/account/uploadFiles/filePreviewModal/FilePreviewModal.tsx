import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Toast from "../../../../components/toast/Toast";
import {
  FieldSetting,
  SaveFieldSettingPayload,
  useFieldSettings,
} from "../../../../hooks/uploadFiles/useFieldSettings";
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

type ColumnConfig = {
  original_field_name: string;
  display_name: string;
  is_additional: boolean;
  target_field: string | null;
};

const findFieldConfig = (
  fields: FieldSetting[],
  columnName: string,
): FieldSetting | undefined =>
  fields.find(
    (field) =>
      field.original_field_name === columnName || field.display_name === columnName,
  );

const STATUS_LABELS: Record<string, string> = {
  idle: "Настройки ещё не сохранялись",
  PENDING: "Задача поставлена в очередь",
  STARTED: "Переиндексация началась",
  PROGRESS: "Переиндексация выполняется",
  SUCCESS: "Переиндексация завершена",
  DONE: "Настройки сохранены",
  FAILURE: "Ошибка при переиндексации",
  ERROR: "Ошибка при переиндексации",
};

const FilePreviewModal = ({
  file,
  onClose,
  onUpdateFile,
}: FilePreviewModalProps) => {
  const token = localStorage.getItem("admin_access_token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [activeBtn, setActiveBtn] = useState<string>("10");
  const [notify, setNotify] = useState<string | null>(null);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([]);

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
    fields,
    saveAll,
    loading: fieldsLoading,
    saving,
    saveError,
    taskId,
    status,
    opensearchAvailable,
  } = useFieldSettings(file, token);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const columns = useMemo(
    () => (Array.isArray(rows) && rows.length > 0 ? Object.keys(typedRows[0]) : []),
    [rows, typedRows],
  );

  useEffect(() => {
    if (columns.length === 0) {
      setColumnConfigs([]);
      return;
    }

    setColumnConfigs((prev) =>
      columns.map((columnName) => {
        const prevValue = prev.find(
          (item) => item.original_field_name === columnName,
        );

        if (prevValue) {
          return prevValue;
        }

        const matchedField = findFieldConfig(fields, columnName);

        return {
          original_field_name: columnName,
          display_name:
            matchedField?.display_name || matchedField?.original_field_name || columnName,
          is_additional: matchedField?.is_additional ?? true,
          target_field: matchedField?.target_field ?? null,
        };
      }),
    );
  }, [columns, fields]);

  const selectableFields = useMemo(
    () =>
      fields
        .map((field) => ({
          value: field.original_field_name,
          label: field.display_name || field.original_field_name,
        })),
    [fields],
  );

  const isTxtPreview =
    file.file_name?.toLowerCase().endsWith(".txt") ||
    (columns.length === 1 && columns[0] === "line");

  const statusText = STATUS_LABELS[status] ?? status;

  const handleDisplayNameChange = (
    originalFieldName: string,
    nextDisplayName: string,
  ) => {
    setColumnConfigs((prev) =>
      prev.map((field) =>
        field.original_field_name === originalFieldName
          ? { ...field, display_name: nextDisplayName }
          : field,
      ),
    );
  };

  const handleSaveAll = async () => {
    try {
      const payload: SaveFieldSettingPayload[] = columnConfigs.map((field) => ({
        original_field_name: field.original_field_name,
        display_name: field.display_name,
        is_additional: field.is_additional,
        target_field: field.target_field,
      }));

      await saveAll(payload);
      setNotify("Настройки полей сохранены");
      setError(null);
    } catch {
      setError("Не удалось сохранить настройки полей");
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {notify && (
        <Toast type="access" message={notify} onClose={() => setNotify(null)} />
      )}

      <div className="min-h-full flex items-center justify-center">
        <div className="bg-white rounded-lg px-6 py-6 w-full max-w-[1800px] my-6 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4">
            {!editingFileAlias ? (
              <div className="flex items-center gap-3 subtitle">
                <h2>Предпросмотр:</h2>
                <div
                  onClick={() => setEditingFileAlias(true)}
                  data-tooltip-id="file_alias-tooltip"
                  className="flex items-center gap-1 group cursor-pointer select-none font-semibold"
                >
                  <span className="px-2 py-1 cursor-pointer">
                    {fileAlias || file.display_name || file.file_name}
                  </span>
                  {fileAlias && <span>({file.file_name})</span>}

                  <FaPen className="group-hover:scale-125 transition duration-300 w-[14px] h-[14px]" />
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
                  placeholder="Добавьте алиас"
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

          {saveError && (
            <Toast
              type="error"
              message={saveError}
              onClose={() => setError(null)}
            />
          )}

          <div className="mb-4 border rounded p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold">Настройка колонок</h3>
                <p className="text-sm text-gray-500">
                  Выберите новое название для каждой колонки из пользователей
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{statusText}</div>
                {taskId && <div>ID задачи: {taskId}</div>}
                {!opensearchAvailable && (
                  <div className="text-orange-600">
                    OpenSearch недоступен, очередь может не стартовать
                  </div>
                )}
              </div>
            </div>

            {fieldsLoading ? (
              <div className="text-sm text-gray-500">Загрузка настроек...</div>
            ) : (
              <div className="max-h-[280px] overflow-auto border rounded">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border px-3 py-2 text-left bg-gray-50">
                        Колонка из файла
                      </th>
                      <th className="border px-3 py-2 text-left bg-gray-50">
                        Новое название
                      </th>
                      <th className="border px-3 py-2 text-left bg-gray-50">
                        Reindex
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {columnConfigs.map((field) => (
                      <tr key={field.original_field_name}>
                        <td className="border px-3 py-2 font-medium">
                          {field.original_field_name}
                        </td>
                        <td className="border px-3 py-2">
                          <select
                            value={field.display_name}
                            onChange={(e) =>
                              handleDisplayNameChange(
                                field.original_field_name,
                                e.target.value,
                              )
                            }
                            className="border rounded px-2 py-1 min-w-[260px]"
                          >
                            <option value={field.original_field_name}>
                              {field.original_field_name}
                            </option>
                            {selectableFields.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border px-3 py-2">
                          {field.is_additional ? "Будет при необходимости" : "Не нужен"}
                        </td>
                      </tr>
                    ))}

                    {columnConfigs.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="border px-3 py-4 text-center text-gray-500"
                        >
                          Нет колонок для настройки
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            className="h-[60vh] border rounded overflow-auto p-2 overscroll-contain"
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
                        <th key={col} className="border px-2 py-1 bg-gray-100">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {typedRows.map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td
                            key={col}
                            className={clsx(
                              "border px-2 py-1",
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

          <div className="flex justify-between items-center pt-4">
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
              <button
                onClick={handleSaveAll}
                disabled={saving || columnConfigs.length === 0}
                className={clsx(
                  "px-4 py-2 bg-blue-600 text-white rounded",
                  (saving || columnConfigs.length === 0) &&
                    "opacity-60 cursor-not-allowed",
                )}
              >
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
