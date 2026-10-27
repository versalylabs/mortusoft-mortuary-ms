import { neonClient } from "@/lib/neon/client";

export function createClient() {
  if (!neonClient) throw new Error("Neon is not configured. Add NEXT_PUBLIC_NEON_URL to .env.local.");
  return neonClient;
}

