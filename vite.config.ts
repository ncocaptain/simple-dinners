import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://dinners.ncocaptain.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },


  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true }, // shows manifest in dev/preview

      // ✅ Optional: helps SPA routing + offline fallback
      workbox: {
        navigateFallback: "/index.html",
      },

      manifest: {
        name: "What's For Dinner",
        short_name: "Dinner",
        description: "Simple weekly dinner planner",
        start_url: "/",
        display: "standalone",
        background_color: "#111827",
        theme_color: "#14b8a6",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});