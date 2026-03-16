import { motion } from "framer-motion";
import React, { useEffect } from "react";

import type { ToastProps } from "../../types/toast.types";

import clsx from "clsx";

const Toast: React.FC<ToastProps> = ({ message, type = "error", onClose }) => {
  const duration = 3000;
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: "-50%", y: -30 }}
      animate={{ opacity: 1, x: "-50%", y: 0 }}
      exit={{ opacity: 0, x: "-50%", y: -30 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-md text-white",
        type === "error" ? "bg-red01" : "bg-green-500",
      )}
      style={{ zIndex: 9999 }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute top-0 left-0 h-[3px] w-full bg-white/70 origin-left"
      />
      {message}
    </motion.div>
  );
};

export default Toast;
