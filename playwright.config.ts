import { defineConfig, devices } from "@playwright/test";

// Tests de bout en bout sur le build de production local (port 3100), Supabase local et Mailpit.
// Prérequis : colima + « pnpm exec supabase start » (voir replica/backend.md). La base est remise à zéro par global-setup.
export default defineConfig({
  testDir: "e2e",
  // Une seule base partagée : les fichiers s'exécutent l'un après l'autre.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
