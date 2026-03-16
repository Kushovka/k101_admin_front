import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";

type ToastItem = {
  id: number;
  message: string;
  type?: "error" | "access";
};

type Props = {
  toasts: ToastItem[];
  removeToast: (id: number) => void;
};

export default function ToastContainer({ toasts, removeToast }: Props) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
