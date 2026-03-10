// src/store/useUploadStore.ts
import { create } from "zustand";
import { postUploadFiles } from "../api/uploadFiles";
import { refreshTokens } from "../features/auth/auth";

type UploadSuccessResult = {
  created: any[];
  duplicates: any[];
};

type UploadState = {
  files: File[];
  uploading: boolean;
  progress: Record<string, number>;
  totalProgress: number;

  busyCount: number;
  isBusy: boolean;
  startBusy: () => void;
  endBusy: () => void;

  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;

  handleUpload: (opts?: {
    onSuccess?: (result: UploadSuccessResult) => void;
    onError?: (msg: string) => void;
  }) => Promise<void>;
};

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  uploading: false,
  progress: {},
  totalProgress: 0,

  // 🔥 BUSY STATE
  busyCount: 0,
  isBusy: false,

  startBusy: () =>
    set((state) => {
      const next = state.busyCount + 1;
      return { busyCount: next, isBusy: next > 0 };
    }),

  endBusy: () =>
    set((state) => {
      const next = Math.max(0, state.busyCount - 1);
      return { busyCount: next, isBusy: next > 0 };
    }),

  setFiles: (files) => set({ files }),

  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),

  removeFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),

  clearFiles: () => set({ files: [], progress: {} }),

  handleUpload: async ({ onSuccess, onError } = {}) => {
    const { files, startBusy, endBusy } = get();
    if (!files.length) return;

    await refreshTokens();

    set({ uploading: true, totalProgress: 0 });
    startBusy();

    try {
      const res = await postUploadFiles(files, (_, percent) => {
        set({ totalProgress: percent });
      });

      const results = res?.results ?? [];

      get().clearFiles();

      onSuccess?.({
        created: results.filter((r) => r.created),
        duplicates: results.filter((r) => r.is_duplicate),
      });
    } catch (e) {
      console.error(e);
      onError?.("Ошибка при загрузке файлов");
    } finally {
      set({ uploading: false, totalProgress: 0 });
      endBusy();
    }
  },
}));
