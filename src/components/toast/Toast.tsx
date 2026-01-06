import React, { useEffect } from "react";
import { motion } from "framer-motion";

import type { ToastProps } from "../../types/toast.types";

const Toast: React.FC<ToastProps> = ({ message, type = "error", onClose }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: "-50%", y: 30 }}
      animate={{ opacity: 1, x: "-50%", y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-md text-white ${
        type === "error" ? "bg-red01" : "bg-green-500"
      }`}
      style={{ zIndex: 9999 }}
    >
      {message}
    </motion.div>
  );
};

export default Toast;
