import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "https://dinners.ncocaptain.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
});