import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@seditor/editor-core": resolve(
        __dirname,
        "../../packages/core/src/index.ts",
      ),
      "@seditor/editor-react": resolve(
        __dirname,
        "../../packages/react/src/index.ts",
      ),
      "@seditor/editor-theme/index.css": resolve(
        __dirname,
        "../../packages/theme-default/src/index.css",
      ),
      "@seditor/editor-theme/dark.css": resolve(
        __dirname,
        "../../packages/theme-default/src/dark.css",
      ),
      "@seditor/plugin-image": resolve(
        __dirname,
        "../../packages/plugin-image/src/index.ts",
      ),
    },
  },
  server: {
    port: 5173,
  },
});
