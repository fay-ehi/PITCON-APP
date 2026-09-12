import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest, added in the pre-launch hardening pass. Runs unit and
 * component tests (jsdom environment, React Testing Library) - see
 * README's "Tests" section for what is and isn't covered this way,
 * and `supabase/tests/database/` for the RLS tests this deliberately
 * doesn't try to replace.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    css: false,
  },
});
