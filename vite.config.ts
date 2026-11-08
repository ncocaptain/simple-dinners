import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "https://dinners.ncocaptain.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
});