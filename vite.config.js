import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // El frontend llama a /api/... que el servidor Express maneja
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
