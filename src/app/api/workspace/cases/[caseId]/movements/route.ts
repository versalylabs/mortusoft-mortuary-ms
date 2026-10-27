import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

type Context = { params: Promise<{ caseId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const { data, error: queryError } = await neonDb.from("case_movements").select("id,from_location,to_location,reason,moved_at,moved_by")
    .eq("facility_id", membership.facility_id).eq("case_id", caseId).order("moved_at", { ascending: false });
  if (queryError) return NextResponse.json({ error: "Movement history could not be loaded." }, { status: 403 });
  return NextResponse.json({ movements: data ?? [] });
}

export async function POST(request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const to = String(input?.toLocation ?? "").trim(); const reason = String(input?.reason ?? "").trim();
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (to.length < 2 || to.length > 120 || reason.length < 3 || reason.length > 240) return NextResponse.json({ error: "Enter the new location and a short movement reason." }, { status: 400 });
  const { data, error: moveError } = await neonDb.rpc("move_case", { target_facility: membership.facility_id, target_case: caseId, destination: to, move_reason: reason });
  if (moveError) return NextResponse.json({ error: moveError.code === "42501" ? "Your role cannot record this movement." : moveError.message }, { status: moveError.code === "42501" ? 403 : 400 });
  return NextResponse.json({ movementId: data }, { status: 201 });
}

