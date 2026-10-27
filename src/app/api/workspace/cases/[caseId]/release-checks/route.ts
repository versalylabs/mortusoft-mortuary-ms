import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

type Context = { params: Promise<{ caseId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const { data, error: queryError } = await neonDb.from("case_release_checks").select("check_key,state,reason,updated_at,updated_by")
    .eq("facility_id", membership.facility_id).eq("case_id", caseId).order("check_key");
  if (queryError) return NextResponse.json({ error: "Release checks could not be loaded." }, { status: 403 });
  return NextResponse.json({ checks: data ?? [] });
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const key = String(input?.key ?? "").trim(); const state = String(input?.state ?? ""); const reason = String(input?.reason ?? "").trim();
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const allowedKeys = ["identityVerified", "documentsComplete", "authorityClearance", "familyAuthorization", "financialClearance", "recipientVerified", "releaseFormComplete", "finalAuthorization"];
  if (!allowedKeys.includes(key) || !["pending", "complete", "not_applicable"].includes(state) || reason.length > 500) return NextResponse.json({ error: "Release check details are invalid." }, { status: 400 });
  if (state === "not_applicable" && (!["authorityClearance", "familyAuthorization", "financialClearance"].includes(key) || reason.length < 4)) return NextResponse.json({ error: "This check cannot be waived without a reason." }, { status: 400 });
  const { data, error: saveError } = await neonDb.from("case_release_checks").upsert({ facility_id: membership.facility_id, case_id: caseId, check_key: key, state, reason: reason || null, updated_by: user!.id, updated_at: new Date().toISOString() }, { onConflict: "facility_id,case_id,check_key" }).select("check_key,state,reason,updated_at").single();
  if (saveError) return NextResponse.json({ error: "Only facility administrators and managers can update release checks." }, { status: 403 });
  return NextResponse.json({ check: data });
}

