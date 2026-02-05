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
    const { files } = get();
    if (!files.length) return;

    await refreshTokens();

    set({ uploading: true, totalProgress: 0 });

    try {
      const res = await postUploadFiles(files, (_, percent) => {
        set({ totalProgress: percent });
      });

      // ❗ ВАЖНО: ждём результаты
      const results = res?.results ?? [];

      set({ uploading: false, totalProgress: 0 });

      get().clearFiles();

      onSuccess?.({
        created: results.filter((r) => r.created),
        duplicates: results.filter((r) => r.is_duplicate),
      });
    } catch (e) {
      console.error(e);
      set({ uploading: false });
      onError?.("Ошибка при загрузке файлов");
    }
  },
}));
