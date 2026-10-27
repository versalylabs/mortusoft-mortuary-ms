import { NextRequest, NextResponse } from "next/server";
import { getNeonAuth } from "@/lib/neon/server-auth";

export async function proxy(request: NextRequest) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    return NextResponse.next({ request });
  }
  return getNeonAuth().middleware({ loginUrl: "/sign-in" })(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

