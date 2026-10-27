import { NextResponse } from "next/server";
import { createClient } from "@/lib/neon-data/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const neon = await createClient();
    const { error } = await neon.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = url.searchParams.get("next") || "/";
      return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/sign-in?error=auth_callback", url.origin));
}

