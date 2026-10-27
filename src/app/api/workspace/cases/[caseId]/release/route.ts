import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

type Context = { params: Promise<{ caseId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const recipient = String(input?.recipient ?? "").trim(); const relationship = String(input?.relationship ?? "").trim(); const idReference = String(input?.idReference ?? "").trim();
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (recipient.length < 2 || recipient.length > 160 || relationship.length < 2 || relationship.length > 80 || idReference.length < 3 || idReference.length > 80) return NextResponse.json({ error: "Record the recipient, relationship, and an identity or authority reference." }, { status: 400 });
  const { data: current, error: caseError } = await neonDb.from("cases").select("id,status")
    .eq("facility_id", membership.facility_id).eq("id", caseId).maybeSingle();
  if (caseError || !current) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (current.status !== "active") return NextResponse.json({ error: "Only active cases can be released." }, { status: 409 });
  const { data, error: updateError } = await neonDb.from("cases").update({ status: "released", release_record: { recipient, relationship, idReference } })
    .eq("facility_id", membership.facility_id).eq("id", caseId).select("id,status,release_record").single();
  if (updateError) return NextResponse.json({ error: updateError.code === "23514" ? updateError.message : "Release requires facility administrator or manager access and valid completed checks." }, { status: updateError.code === "23514" ? 409 : 403 });
  return NextResponse.json({ case: data });
}

