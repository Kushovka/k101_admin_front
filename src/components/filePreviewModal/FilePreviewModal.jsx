import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import api from "../../api/axios";

const FilePreviewModal = ({ file, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aliases, setAliases] = useState({});
  // original_field_name -> { id, display_name }

  const [editingField, setEditingField] = useState(null);
  const [aliasValue, setAliasValue] = useState("");

  const token = localStorage.getItem("access_token");

  /* ---------------- preview ---------------- */

  useEffect(() => {
    if (!file) return;

    setLoading(true);

    api
      .get(`http://192.168.0.45:18100/api/v1/files/${file.id}/preview`, {
        params: { limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("PREVIEW RESPONSE:", res.data);
        const records = res.data?.preview_records;
        setRows(Array.isArray(records) ? records : []);
      })
      .finally(() => setLoading(false));
  }, [file]);
  console.log(rows);

  useEffect(() => {
    // сохранить текущее состояние
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
            params: { file_id: file.id },
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("http://192.168.0.45:18100/api/v1/field-mappings", {
            params: { is_global: true },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const map = {};

        // сначала глобальные
        (globalRes.data || []).forEach((m) => {
          map[m.original_field_name] = {
            id: m.id,
            display_name: m.display_name,
          };
        });

        // потом файловые (перекрывают)
        (fileRes.data || []).forEach((m) => {
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
  }, [file]);

  /* ---------------- save alias ---------------- */

  const saveAlias = async () => {
    if (!editingField || !aliasValue.trim()) return;

    const existing = aliases[editingField];

    try {
      if (existing?.id) {
        // update
        await api.patch(
          `http://192.168.0.45:18100/api/v1/field-mappings/${existing.id}`,
          {
            display_name: aliasValue.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // create (file-specific)
        await api.post(
          "http://192.168.0.45:18100/api/v1/field-mappings",
          {
            original_field_name: editingField,
            display_name: aliasValue.trim(),
            is_global: false,
            file_id: file.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
      alert("Не удалось сохранить алиас");
    }
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  /* ---------------- render ---------------- */

  const columns =
    Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Предпросмотр: {file.display_name}
          </h2>
          <button onClick={onClose}>
            <IoMdClose size={22} />
          </button>
        </div>

        {loading && <p>Загрузка…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            Нет данных для предпросмотра
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-auto max-h-[80vh] border overscroll-contain">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="border px-2 py-1 bg-gray-100 cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setEditingField(col);
                        setAliasValue(aliases[col]?.display_name ?? "");
                      }}
                      title="Кликните, чтобы задать алиас"
                    >
                      {aliases[col]?.display_name ?? col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col} className="border px-2 py-1 text-common">
                        {renderCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingField && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm">
              Алиас для <b>{editingField}</b>:
            </span>

            <input
              className="border rounded px-3 py-1"
              value={aliasValue}
              onChange={(e) => setAliasValue(e.target.value)}
              autoFocus
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
    </div>
  );
};

export default FilePreviewModal;
