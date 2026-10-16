import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "prototype"),
  envDir: projectRoot,
  base: "./",
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    host: "127.0.0.1"
  }
});
