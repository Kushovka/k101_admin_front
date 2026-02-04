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

    set({ uploading: true, progress: {} });

    try {
      const res = await postUploadFiles(files, (file, percent) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [file.name]: percent,
          },
        }));
      });

      // ❗ ВАЖНО: ждём результаты
      const results = res?.results ?? [];

      set({ uploading: false });

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
