import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // чтобы не импортировать describe/it каждый раз
    environment: "jsdom", // браузерная среда
    setupFiles: "./src/setupTests.js", // файл для глобальных импортов
    include: ["src/**/*.test.{js,jsx,ts,tsx}"], // где искать тесты
  },
});
