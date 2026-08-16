import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
  resolve: {
    conditions: ["svelte"],
    alias: {
      "seditor-plugin-table": resolve(
        __dirname,
        "../../packages/plugin-table/src/index.ts",
      ),
    },
  },
  server: {
    port: 5175,
  },
});
