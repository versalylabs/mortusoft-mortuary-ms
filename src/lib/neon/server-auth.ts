import { createNeonAuth } from "@neondatabase/auth/next/server";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to use the Neon production workspace.`);
  return value;
}

let instance: ReturnType<typeof createNeonAuth> | undefined;

export function getNeonAuth() {
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: required("NEON_AUTH_BASE_URL"),
      cookies: { secret: required("NEON_AUTH_COOKIE_SECRET") },
    });
  }
  return instance;
}

