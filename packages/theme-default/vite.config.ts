import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.css"),
        dark: resolve(__dirname, "src/dark.css"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]",
        entryFileNames: "[name].js",
      },
    },
    sourcemap: true,
  },
});
