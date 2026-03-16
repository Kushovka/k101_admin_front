export type ToastType = "error" | "access";

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export type ToastItem = {
  id: number;
  message: string;
  type: "error" | "access";
};
