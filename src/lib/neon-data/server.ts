import { headers } from "next/headers";
import { createNeonDataClient } from "@/lib/neon/data-client";
import { requireNeonConfig } from "./config";

/** Request-scoped Neon Data API client forwards the HTTP-only Managed Auth cookie. */
export async function createClient() {
  const { url } = requireNeonConfig();
  const incoming = await headers();
  const cookie = incoming.get("cookie");
  return createNeonDataClient(url, cookie ? { cookie } : {});
}
