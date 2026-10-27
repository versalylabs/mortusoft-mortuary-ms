"use client";

import { createNeonDataClient } from "./data-client";

const url = process.env.NEXT_PUBLIC_NEON_URL;

export const neonClient = url
  ? createNeonDataClient(url)
  : null;

