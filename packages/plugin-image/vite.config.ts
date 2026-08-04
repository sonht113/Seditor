import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["lexical", "@seditor/editor-core"],
    },
    sourcemap: true,
  },
  plugins: [dts({ tsconfigPath: "./tsconfig.json" })],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
