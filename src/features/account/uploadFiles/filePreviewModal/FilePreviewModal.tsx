import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Toast from "../../../../components/toast/Toast";
import {
  AllowedTargetField,
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

type AllowedFieldDraft = {
  id: number;
  name: string;
  label: string;
  sort_order: number;
  is_active: boolean;
};

type ColumnSettingsModalProps = {
  columnConfigs: ColumnConfig[];
  fieldsLoading: boolean;
  selectableFields: Array<{ value: string; label: string }>;
  saving: boolean;
  statusText: string;
  taskId: string | null;
  opensearchAvailable: boolean;
  onClose: () => void;
  onOpenAllowedFields: () => void;
  onChange: (originalFieldName: string, nextDisplayName: string) => void;
  onSave: () => void;
};

type AllowedFieldsManagerModalProps = {
  fields: AllowedTargetField[];
  loading: boolean;
  onClose: () => void;
  onAdd: (payload: { name: string; label: string; sort_order: number }) => Promise<void>;
  onUpdate: (
    fieldId: number,
    payload: { label: string; sort_order: number; is_active: boolean },
  ) => Promise<void>;
  onDelete: (fieldId: number) => Promise<void>;
};

const findFieldConfig = (
  fields: FieldSetting[],
  columnName: string,
): FieldSetting | undefined =>
  fields.find(
    (field) =>
      field.original_field_name === columnName ||
      field.display_name === columnName,
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

const ColumnSettingsModal = ({
  columnConfigs,
  fieldsLoading,
  selectableFields,
  saving,
  statusText,
  taskId,
  opensearchAvailable,
  onClose,
  onOpenAllowedFields,
  onChange,
  onSave,
}: ColumnSettingsModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[900px] h-[min(80vh,700px)] bg-white rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b">
          <div>
            <h3 className="font-semibold text-lg">Настройка колонок</h3>
            <p className="text-sm text-gray-500">
              Выберите новое название для каждой колонки файла.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right text-sm text-gray-500">
              <div>{statusText}</div>
              {taskId && <div>ID задачи: {taskId}</div>}
              {!opensearchAvailable && (
                <div className="text-orange-600">
                  OpenSearch недоступен, очередь может не стартовать
                </div>
              )}
            </div>
            <button onClick={onClose} className="shrink-0">
              <IoMdClose size={22} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b flex justify-end">
          <button
            onClick={onOpenAllowedFields}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Изменить выбор колонок
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {fieldsLoading ? (
            <div className="text-sm text-gray-500">Загрузка настроек...</div>
          ) : (
            <div className="border rounded divide-y">
              {columnConfigs.map((field) => (
                <div
                  key={field.original_field_name}
                  className="flex items-center gap-3 px-3 py-3 text-sm"
                >
                  <div className="min-w-[140px] font-medium">
                    {field.original_field_name}
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <select
                      value={field.display_name}
                      onChange={(e) =>
                        onChange(field.original_field_name, e.target.value)
                      }
                      className="w-full border rounded px-2 py-1"
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
                  </div>
                  <div className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                    {field.is_additional
                      ? "Будет при необходимости"
                      : "Не нужен"}
                  </div>
                </div>
              ))}

              {columnConfigs.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Нет колонок для настройки
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Закрыть
          </button>
          <button
            onClick={onSave}
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
  );
};

const AllowedFieldsManagerModal = ({
  fields,
  loading,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: AllowedFieldsManagerModalProps) => {
  const [newName, setNewName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("0");
  const [drafts, setDrafts] = useState<AllowedFieldDraft[]>([]);

  useEffect(() => {
    setDrafts(
      fields
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((field) => ({ ...field })),
    );
  }, [fields]);

  const updateDraft = (
    fieldId: number,
    patch: Partial<AllowedFieldDraft>,
  ) => {
    setDrafts((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    );
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newLabel.trim()) return;

    await onAdd({
      name: newName.trim(),
      label: newLabel.trim(),
      sort_order: Number(newSortOrder) || 0,
    });

    setNewName("");
    setNewLabel("");
    setNewSortOrder("0");
  };

  const handleUpdate = async (field: AllowedFieldDraft) => {
    await onUpdate(field.id, {
      label: field.label.trim(),
      sort_order: Number(field.sort_order) || 0,
      is_active: field.is_active,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[980px] h-[min(85vh,760px)] bg-white rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b">
          <div>
            <h3 className="font-semibold text-lg">Управление вариантами выбора</h3>
            <p className="text-sm text-gray-500">
              Здесь можно добавить, изменить или удалить допустимые значения
              дропдауна.
            </p>
          </div>
          <button onClick={onClose}>
            <IoMdClose size={22} />
          </button>
        </div>

        <div className="px-6 py-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr_120px_140px] gap-3 items-end">
            <label className="text-sm">
              <div className="mb-1 text-gray-600">Name</div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="first_name"
              />
            </label>
            <label className="text-sm">
              <div className="mb-1 text-gray-600">Label</div>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Имя"
              />
            </label>
            <label className="text-sm">
              <div className="mb-1 text-gray-600">Sort</div>
              <input
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
                className="w-full border rounded px-3 py-2"
                inputMode="numeric"
              />
            </label>
            <button
              onClick={handleAdd}
              disabled={loading}
              className={clsx(
                "px-4 py-2 bg-blue-600 text-white rounded",
                loading && "opacity-60 cursor-not-allowed",
              )}
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="border rounded divide-y">
            {drafts.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_120px_110px_100px] gap-3 items-center px-3 py-3 text-sm"
              >
                <div className="font-medium">{field.name}</div>
                <input
                  value={field.label}
                  onChange={(e) =>
                    updateDraft(field.id, { label: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  value={String(field.sort_order)}
                  onChange={(e) =>
                    updateDraft(field.id, {
                      sort_order: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  inputMode="numeric"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.is_active}
                    onChange={(e) =>
                      updateDraft(field.id, { is_active: e.target.checked })
                    }
                  />
                  Активно
                </label>
                <button
                  onClick={() => void handleUpdate(field)}
                  disabled={loading}
                  className={clsx(
                    "px-3 py-2 border rounded hover:bg-gray-50",
                    loading && "opacity-60 cursor-not-allowed",
                  )}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => void onDelete(field.id)}
                  disabled={loading}
                  className={clsx(
                    "px-3 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50",
                    loading && "opacity-60 cursor-not-allowed",
                  )}
                >
                  Удалить
                </button>
              </div>
            ))}

            {drafts.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                Допустимые значения пока не добавлены
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAllowedFieldsOpen, setIsAllowedFieldsOpen] = useState(false);

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
    allowedTargetFields,
    saveAll,
    loading: fieldsLoading,
    saving,
    saveError,
    taskId,
    status,
    opensearchAvailable,
    managingAllowedFields,
    addAllowedTargetField,
    updateAllowedTargetField,
    deleteAllowedTargetField,
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
        if (isAllowedFieldsOpen) {
          setIsAllowedFieldsOpen(false);
          return;
        }

        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }

        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAllowedFieldsOpen, isSettingsOpen, onClose]);

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
            matchedField?.display_name ||
            matchedField?.original_field_name ||
            columnName,
          is_additional: matchedField?.is_additional ?? true,
          target_field: matchedField?.target_field ?? null,
        };
      }),
    );
  }, [columns, fields]);

  const selectableFields = useMemo(
    () =>
      fields.map((field) => ({
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
      setIsSettingsOpen(false);
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
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {notify && (
          <Toast
            type="access"
            message={notify}
            onClose={() => setNotify(null)}
          />
        )}

        <div className="bg-white rounded-lg px-6 py-6 w-full max-w-[1800px] h-[min(88vh,980px)] shadow-xl flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            {!editingFileAlias ? (
              <div className="flex items-center gap-3 subtitle min-w-0">
                <h2>Предпросмотр:</h2>
                <div
                  onClick={() => setEditingFileAlias(true)}
                  data-tooltip-id="file_alias-tooltip"
                  className="flex items-center gap-1 group cursor-pointer select-none font-semibold min-w-0"
                >
                  <span className="px-2 py-1 truncate">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Настройка колонок
              </button>
              <button onClick={onClose}>
                <IoMdClose size={22} />
              </button>
            </div>
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

          <div
            className="flex-1 border rounded overflow-auto p-2 overscroll-contain"
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
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <ColumnSettingsModal
          columnConfigs={columnConfigs}
          fieldsLoading={fieldsLoading}
          selectableFields={selectableFields}
          saving={saving}
          statusText={statusText}
          taskId={taskId}
          opensearchAvailable={opensearchAvailable}
          onClose={() => setIsSettingsOpen(false)}
          onOpenAllowedFields={() => setIsAllowedFieldsOpen(true)}
          onChange={handleDisplayNameChange}
          onSave={handleSaveAll}
        />
      )}

      {isAllowedFieldsOpen && (
        <AllowedFieldsManagerModal
          fields={allowedTargetFields}
          loading={managingAllowedFields}
          onClose={() => setIsAllowedFieldsOpen(false)}
          onAdd={addAllowedTargetField}
          onUpdate={updateAllowedTargetField}
          onDelete={deleteAllowedTargetField}
        />
      )}
    </>
  );
};

export default FilePreviewModal;
