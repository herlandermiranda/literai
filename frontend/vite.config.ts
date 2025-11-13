import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

// Middleware for API configuration endpoint
function apiConfigMiddleware() {
  return {
    name: 'api-config-middleware',
    configureServer(server: any) {
      return () => {
        server.middlewares.use('/api/config/backend-url', (req: any, res: any) => {
          const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ backendUrl }));
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [...plugins, apiConfigMiddleware()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    middlewareMode: false,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    cors: {
      origin: true,
      credentials: true,
    },
    proxy: {
      '/api/v1': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
    },
  },
});
