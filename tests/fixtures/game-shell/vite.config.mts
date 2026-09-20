import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: fileURLToPath(new URL("../../../public", import.meta.url)),
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": fileURLToPath(new URL("../../../src", import.meta.url)) } },
  server: { host: "127.0.0.1", port: 3101, strictPort: true },
});
