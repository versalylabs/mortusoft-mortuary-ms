export function hasNeonConfig() {
  return Boolean(process.env.NEXT_PUBLIC_NEON_URL);
}

export function requireNeonConfig() {
  const url = process.env.NEXT_PUBLIC_NEON_URL;
  if (!url) throw new Error("Neon is not configured. Copy .env.example to .env.local and add your Neon database URL.");
  return { url };
}

