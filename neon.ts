import { defineConfig } from "@neon/config/v1";

/** Neon provisions this bucket as private by default. */
export default defineConfig({
  auth: true,
  buckets: {
    "case-documents": {},
  },
});
