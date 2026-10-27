import { NextRequest, NextResponse } from "next/server";
import { getNeonAuth } from "@/lib/neon/server-auth";

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const handler = getNeonAuth().handler();
    return request.method === "GET" ? handler.GET(request, context) : handler.POST(request, context);
  } catch {
    return NextResponse.json({ error: "Neon Auth is not configured for this deployment." }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;

