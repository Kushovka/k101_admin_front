import { create } from "zustand";
import { postUploadDataset } from "../api/uploadFiles";
import { refreshTokens } from "../features/auth/auth";
import { useUploadStore } from "./useUploadStore";

type DatasetUploadState = {
  files: File[];
  datasetName: string;
  description: string;
  linkingColumn: string;
  uploading: boolean;

  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setDatasetName: (value: string) => void;
  setDescription: (value: string) => void;
  setLinkingColumn: (value: string) => void;
  clear: () => void;

  upload: (opts?: {
    onSuccess?: () => void;
    onError?: (msg: string) => void;
  }) => Promise<void>;
};

export const useDatasetUploadStore = create<DatasetUploadState>((set, get) => ({
  files: [],
  datasetName: "",
  description: "",
  linkingColumn: "",
  uploading: false,

  setFiles: (files) => set({ files }),
  addFiles: (newFiles) =>
    set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),

  setDatasetName: (value) => set({ datasetName: value }),
  setDescription: (value) => set({ description: value }),
  setLinkingColumn: (value) => set({ linkingColumn: value }),

  clear: () =>
    set({
      files: [],
      datasetName: "",
      description: "",
      linkingColumn: "",
    }),

  upload: async () => {
    const { files, datasetName, description, linkingColumn } = get();
    const { startBusy, endBusy } = useUploadStore.getState();

    if (files.length < 2) throw new Error("Минимум 2 файла для датасета");

    if (!datasetName.trim()) throw new Error("Введите название датасета");

    await refreshTokens();

    set({ uploading: true });
    startBusy(); // 🔥 блокируем idle logout

    try {
      const dataset = await postUploadDataset({
        dataset_name: datasetName.trim(),
        description: description?.trim() || undefined,
        linking_column: linkingColumn?.trim() || undefined,
        files,
      });

      get().clear();

      return dataset;
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Ошибка при загрузке датасета";

      throw new Error(msg);
    } finally {
      set({ uploading: false });
      endBusy(); // 🔥 снимаем блокировку
    }
  },
}));
