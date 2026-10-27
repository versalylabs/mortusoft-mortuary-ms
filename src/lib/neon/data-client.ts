import { createClient, defaultDeriveNeonUrls, SupabaseAuthAdapter } from "@neondatabase/neon-js";

export function createNeonDataClient(databaseUrl: string, requestHeaders: Record<string, string> = {}) {
  const urls = defaultDeriveNeonUrls(databaseUrl);
  return createClient({
    auth: {
      url: urls.auth,
      adapter: (authUrl: string, fetchOptions?: { headers?: Record<string, string> }) => SupabaseAuthAdapter()(authUrl, {
        ...fetchOptions,
        headers: { ...fetchOptions?.headers, ...requestHeaders },
      }),
    },
    dataApi: { url: urls.dataApi },
  });
}

