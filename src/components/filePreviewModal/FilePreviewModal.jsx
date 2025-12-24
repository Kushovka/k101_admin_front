import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import api from "../../api/axios";
import { Tooltip } from "react-tooltip";
import Toast from "../toast/Toast";
import clsx from "clsx";
import { CgDanger } from "react-icons/cg";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { MdOutlineQuestionMark } from "react-icons/md";

const FilePreviewModal = ({ file, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [activeBtn, setActiveBtn] = useState("10");

  const [aliases, setAliases] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [aliasValue, setAliasValue] = useState("");

  const token = localStorage.getItem("access_token");

  /* ---------------- preview ---------------- */

  useEffect(() => {
    if (!file) return;

    setLoading(true);

    api
      .get(`http://192.168.0.45:18100/api/v1/files/${file.id}/preview`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const records = res.data?.preview_records;
        setRows(Array.isArray(records) ? records : []);
      })
      .finally(() => setLoading(false));
  }, [file, token, limit]);

  /* ---------------- lock scroll ---------------- */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /* ---------------- aliases ---------------- */

  useEffect(() => {
    if (!file) return;

    const loadAliases = async () => {
      try {
        const [fileRes, globalRes] = await Promise.all([
          api.get("http://192.168.0.45:18100/api/v1/field-mappings", {
            params: { raw_file_id: file.id },
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("http://192.168.0.45:18100/api/v1/field-mappings", {
            params: { is_global: true },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const map = {};

        (globalRes.data?.mappings ?? []).forEach((m) => {
          map[m.original_field_name] = {
            id: m.id,
            display_name: m.display_name,
          };
        });

        (fileRes.data?.mappings ?? []).forEach((m) => {
          map[m.original_field_name] = {
            id: m.id,
            display_name: m.display_name,
          };
        });

        setAliases(map);
      } catch {
        setAliases({});
      }
    };

    loadAliases();
  }, [file, token]);

  /* ---------------- save alias ---------------- */

  const saveAlias = async () => {
    if (!editingField || !aliasValue.trim()) return;

    const existing = aliases[editingField];
    setError(null);

    try {
      if (existing?.id) {
        await api.patch(
          `http://192.168.0.45:18100/api/v1/field-mappings/${existing.id}`,
          { display_name: aliasValue.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post(
          "http://192.168.0.45:18100/api/v1/field-mappings",
          {
            original_field_name: editingField,
            display_name: aliasValue.trim(),
            is_global: false,
            raw_file_id: file.id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setAliases((prev) => ({
        ...prev,
        [editingField]: {
          ...prev[editingField],
          display_name: aliasValue.trim(),
        },
      }));

      setEditingField(null);
      setAliasValue("");
    } catch {
      setError("Не удалось сохранить алиас");
    }
  };

  /* ---------------- helpers ---------------- */

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const columns =
    Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : [];

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

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-6 py-6 w-[90%] max-w-[1200px]">
        {/* header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Предпросмотр: {file.display_name}
          </h2>
          <button onClick={onClose}>
            <IoMdClose size={22} />
          </button>
        </div>

        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* table container (fixed height) */}
        <div className="h-[60vh] border rounded overflow-auto p-2">
          {loading && <Skeleton />}

          {!loading && rows.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              Нет данных для предпросмотра
            </p>
          )}

          {!loading && rows.length > 0 && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      data-tooltip-id="alias-file_tooltip"
                      className="border px-2 py-1 bg-gray-100 cursor-pointer hover:bg-blue-50"
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
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col} className="border px-2 py-1">
                        {renderCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
              effect="float"
              delayShow={400}
              id="file_limit-tooltip"
              content="Количество строк"
            />
            {[10, 30, 50].map((n) => (
              <>
                <button
                  key={n}
                  onClick={() => {
                    setLimit(n);
                    setActiveBtn(String(n));
                  }}
                  className={clsx(
                    "px-3 py-1 border rounded",
                    activeBtn === String(n) &&
                      "bg-blue-500 text-white border-blue-500"
                  )}
                >
                  {n}
                </button>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
