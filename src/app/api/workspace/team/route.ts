import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

const roles = ["facility_admin", "mortuary_manager", "mortuary_attendant", "embalming_staff", "reception", "finance", "funeral_coordinator", "driver", "auditor"];

export async function GET() {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ error: "No facility is linked to this account." }, { status: 409 });
  const { data, error: queryError } = await neonDb.from("facility_members").select("user_id,role,status,created_at")
    .eq("facility_id", membership.facility_id).order("created_at");
  if (queryError) return NextResponse.json({ error: "Team access could not be read." }, { status: 403 });
  return NextResponse.json({ members: data ?? [], canManage: membership.role === "facility_admin" });
}

export async function PATCH(request: NextRequest) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ error: "No facility is linked to this account." }, { status: 409 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const userId = String(input?.userId ?? "");
  const role = String(input?.role ?? "");
  const status = String(input?.status ?? "");
  if (!userId || userId === user?.id) return NextResponse.json({ error: "Choose another team member. You cannot change your own facility access here." }, { status: 400 });
  if (!(roles.includes(role) || ["active", "suspended"].includes(status))) return NextResponse.json({ error: "Choose a valid role or account status." }, { status: 400 });
  const changes: Record<string, string> = {};
  if (roles.includes(role)) changes.role = role;
  if (["active", "suspended"].includes(status)) changes.status = status;
  const { data, error: updateError } = await neonDb.from("facility_members").update(changes)
    .eq("facility_id", membership.facility_id).eq("user_id", userId).select("user_id,role,status").maybeSingle();
  if (updateError || !data) return NextResponse.json({ error: "Only a facility administrator can change another memberâ€™s role or status." }, { status: 403 });
  return NextResponse.json({ member: data });
}

