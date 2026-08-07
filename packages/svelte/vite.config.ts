import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
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
      external: ["svelte", "lexical", "seditor-core"],
    },
    sourcemap: true,
  },
  plugins: [
    svelte(),
    dts({
      tsconfigPath: "./tsconfig.json",
      exclude: ["**/*.test.ts", "**/*.test.svelte"],
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 15000,
  },
});
