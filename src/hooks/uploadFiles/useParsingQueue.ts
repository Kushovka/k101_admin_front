// hooks/uploadFiles/useParsingQueue.ts
import { useEffect, useMemo, useState } from "react";
import {
  getParsingQueue,
  patchPriorityFile,
  pauseAllFiles,
  postToTopFile,
  resumeAllFiles,
  statusAllFiles,
} from "../../api/uploadFiles";
import userApi from "../../api/userApi";
import { GlobalPauseStatus } from "../../types/file";

export type QueueStatus =
  | "queued"
  | "paused"
  | "processing"
  | "completed"
  | "failed";

export type ParsingQueueItem = {
  raw_file_id: string;
  file_name: string;
  file_size?: number;
  status?: QueueStatus;
  error_message?: string;
  priority?: number;
  position?: number;
  progress_percent?: number;
  processed_rows?: number;
  total_rows?: number;
  started_at?: string;
  celery_task_id?: string;
  error_code: string;
};

type ParsingQueueResponse = {
  currently_processing?: ParsingQueueItem[];
  entries?: ParsingQueueItem[];
};

export const useParsingQueue = () => {
  const [queue, setQueue] = useState<ParsingQueueItem[]>([]);
  const [parsingCurrent, setParsingCurrent] = useState<ParsingQueueItem[]>([]);
  const [queueLimit, setQueueLimit] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalStatus, setGlobalStatus] = useState<GlobalPauseStatus | null>(
    null,
  );

  const token = localStorage.getItem("access_token") ?? "";
  const auth = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const normalizeQueue = (items: ParsingQueueItem[]) => {
    const map = new Map<string, ParsingQueueItem>();

    for (const item of items) {
      map.set(item.raw_file_id, item);
    }

    return Array.from(map.values());
  };

  const processingQueue = parsingCurrent;

  const waitingQueue = useMemo(
    () => queue.filter((i) => i.status === "queued" || i.status === "paused"),
    [queue],
  );

  const failedQueue = useMemo(
    () => queue.filter((i) => i.status === "failed"),
    [queue],
  );

  const completedQueue = useMemo(
    () => queue.filter((i) => i.status === "completed"),
    [queue],
  );

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = (await getParsingQueue()) as ParsingQueueResponse;

      setParsingCurrent(normalizeQueue(res.currently_processing ?? []));

      setQueue(normalizeQueue(res.entries ?? []));
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Ошибка загрузки очереди");
    } finally {
      setLoading(false);
    }
  };

  const pause = async (rawFileId: string) => {
    try {
      await userApi.post(`/api/v1/parsing-queue/${rawFileId}/pause`, {}, auth);
      await fetchQueue();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Ошибка при паузе файла");
    }
  };

  const resume = async (rawFileId: string) => {
    try {
      await userApi.post(`/api/v1/parsing-queue/${rawFileId}/resume`, {}, auth);
      await fetchQueue();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Ошибка при возобновлении файла");
    }
  };

  const cancel = async (rawFileId: string) => {
    try {
      await userApi.post(`/api/v1/parsing-queue/${rawFileId}/cancel`, {}, auth);
      await fetchQueue();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Ошибка при отмене файла");
    }
  };

  const moveToTop = async (rawFileId: string) => {
    try {
      await postToTopFile(rawFileId);
      await fetchQueue();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Не удалось поднять в топ");
    }
  };

  const loadGlobalStatus = async () => {
    const data = await statusAllFiles();
    setGlobalStatus(data);
  };

  const pauseAll = async () => {
    await pauseAllFiles();
    await loadGlobalStatus();
  };

  const resumeAll = async () => {
    await resumeAllFiles();
    await loadGlobalStatus();
  };

  useEffect(() => {
    loadGlobalStatus();
  }, []);

  const changePriority = async (rawFileId: string, priority: number) => {
    try {
      const res = await patchPriorityFile(rawFileId, { priority });

      // локально обновляем, чтобы UI не ждал поллинга
      setQueue((prev) =>
        prev.map((f) =>
          f.raw_file_id === rawFileId
            ? { ...f, priority: res.priority, position: res.position }
            : f,
        ),
      );
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Ошибка при изменении приоритета");
    }
  };

  useEffect(() => {
    fetchQueue();

    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // raw data
    queue,
    parsingCurrent,

    // derived
    processingQueue,
    waitingQueue,
    completedQueue,
    failedQueue,

    // ui
    queueLimit,
    setQueueLimit,
    loading,
    error,
    setError,

    // actions
    fetchQueue,
    pause,
    resume,
    cancel,
    moveToTop,
    changePriority,

    pauseAll,
    resumeAll,
    globalStatus,
  };
};
