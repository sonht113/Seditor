import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "seditor-core": resolve(__dirname, "../../packages/core/src/index.ts"),
      "seditor-vue": resolve(__dirname, "../../packages/vue/src/index.ts"),
      "seditor-theme/index.css": resolve(
        __dirname,
        "../../packages/theme-default/src/index.css",
      ),
      "seditor-theme/dark.css": resolve(
        __dirname,
        "../../packages/theme-default/src/dark.css",
      ),
      "seditor-plugin-image": resolve(
        __dirname,
        "../../packages/plugin-image/src/index.ts",
      ),
    },
  },
  server: {
    port: 5174,
  },
});
