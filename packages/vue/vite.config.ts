import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
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
      external: ["vue", "lexical", "seditor-core"],
    },
    sourcemap: true,
  },
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.json",
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
  },
});
