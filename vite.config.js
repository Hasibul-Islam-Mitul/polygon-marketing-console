import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `vite dev` we proxy /api to the Vercel dev server (port 3000) so the
// serverless functions run exactly as they will in production. Run both with
// `vercel dev` (recommended) or run `vite` + `vercel dev` side by side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
