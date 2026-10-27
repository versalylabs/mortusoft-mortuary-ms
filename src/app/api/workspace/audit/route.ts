import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

export async function GET(request: NextRequest) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ error: "No facility is linked to this account." }, { status: 409 });
  const params = request.nextUrl.searchParams;
  let query = neonDb.from("audit_events").select("id,actor_id,action,entity_table,entity_id,case_number,changed_fields,occurred_at")
    .eq("facility_id", membership.facility_id).order("occurred_at", { ascending: false }).limit(200);
  const from = params.get("from"); const to = params.get("to"); const action = params.get("action"); const search = params.get("q");
  if (from && Number.isFinite(Date.parse(from))) query = query.gte("occurred_at", new Date(from).toISOString());
  if (to && Number.isFinite(Date.parse(to))) query = query.lt("occurred_at", new Date(new Date(to).getTime() + 86400000).toISOString());
  if (action) query = query.ilike("action", `%${action.slice(0, 60)}%`);
  if (search) query = query.or(`case_number.ilike.%${search.slice(0, 60)}%,entity_table.ilike.%${search.slice(0, 60)}%`);
  const { data, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Audit records are available only to facility administrators and auditors." }, { status: 403 });
  return NextResponse.json({ events: data ?? [] });
}

