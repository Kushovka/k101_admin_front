import { useEffect, useState } from "react";
import api from "../api/axios";

export const useFilePreview = ({ file, limit, token }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }, [file, limit, token]);
  return { rows, loading };
};
