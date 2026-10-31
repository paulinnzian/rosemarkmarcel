import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Tests unitaires de la logique pure (src/**/*.test.ts). Les parcours complets sont dans e2e/ (Playwright).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
