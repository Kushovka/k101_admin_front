// src/store/useUploadStore.ts
import { create } from "zustand";
import { postUploadFiles } from "../api/uploadFiles";

type UploadState = {
  files: File[];
  uploading: boolean;
  progress: Record<string, number>;
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  handleUpload: (opts?: {
    onSuccess?: () => void;
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

  handleUpload: async (opts) => {
    const { onSuccess, onError } = opts || {};
    const { files } = get();
    if (!files.length) return;

    set({ uploading: true, progress: {} });

    try {
      await postUploadFiles(files, (file, percent) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [file.name]: percent,
          },
        }));
      });

      // Успешно
      get().clearFiles();
      set({ uploading: false });
      onSuccess?.();
    } catch (e) {
      console.error(e);
      set({ uploading: false });
      onError?.("Ошибка при загрузке файлов");
    }
  },
}));
