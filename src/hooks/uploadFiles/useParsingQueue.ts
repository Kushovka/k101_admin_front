// hooks/uploadFiles/useParsingQueue.ts
import { useEffect, useMemo, useState } from "react";
import {
  getParsingCurrent,
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

type ParsingCurrentResponse = {
  raw_file_id: string;
  file_name: string;
  file_size?: number;
  progress_percent?: number;
  processed_rows?: number;
  total_rows?: number | null;
  started_at?: string;
  celery_task_id?: string;
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

  const token = localStorage.getItem("admin_access_token") ?? "";
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

  const queuedQueue = useMemo(
    () => queue.filter((i) => i.status === "queued"),
    [queue],
  );

  const pausedQueue = useMemo(
    () => queue.filter((i) => i.status === "paused"),
    [queue],
  );

  const waitingQueue = useMemo(
    () => [...queuedQueue, ...pausedQueue],
    [pausedQueue, queuedQueue],
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
      const [queueRes, processingRes, currentRes] = await Promise.all([
        getParsingQueue(),
        getParsingQueue({ status: "processing", limit: 100 }),
        getParsingCurrent().catch(() => null),
      ]);

      const queueData = queueRes as ParsingQueueResponse;
      const processingData = processingRes as ParsingQueueResponse;
      const currentData = currentRes as ParsingCurrentResponse | null;

      const processingItems = normalizeQueue([
        ...(queueData.currently_processing ?? []),
        ...(processingData.currently_processing ?? []),
      ]);

      const processingWithCurrent = processingItems.map((item) =>
        currentData && item.raw_file_id === currentData.raw_file_id
          ? {
              ...item,
              progress_percent: currentData.progress_percent,
              processed_rows: currentData.processed_rows,
              total_rows: currentData.total_rows ?? item.total_rows,
              started_at: currentData.started_at ?? item.started_at,
              celery_task_id: currentData.celery_task_id ?? item.celery_task_id,
            }
          : item,
      );

      if (
        currentData &&
        !processingWithCurrent.some(
          (item) => item.raw_file_id === currentData.raw_file_id,
        )
      ) {
        processingWithCurrent.unshift({
          raw_file_id: currentData.raw_file_id,
          file_name: currentData.file_name,
          file_size: currentData.file_size,
          status: "processing",
          progress_percent: currentData.progress_percent,
          processed_rows: currentData.processed_rows,
          total_rows: currentData.total_rows ?? undefined,
          started_at: currentData.started_at,
          celery_task_id: currentData.celery_task_id,
          error_code: "",
        });
      }

      setParsingCurrent(normalizeQueue(processingWithCurrent));
      setQueue(normalizeQueue(queueData.entries ?? []));
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
    queuedQueue,
    pausedQueue,
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
