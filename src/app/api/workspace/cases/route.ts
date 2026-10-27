import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/neon-data/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

export async function GET(request: NextRequest) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ cases: [], total: 0 });
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
  const pageSize = 50;
  const search = String(params.get("q") ?? "").replace(/[^\p{L}\p{N}\s-]/gu, " ").trim().slice(0, 80);
  const status = String(params.get("status") ?? "");
  let query = neonDb.from("cases").select("id,case_number,deceased_name,identification_status,status,admission_at,current_location", { count: "exact" })
    .eq("facility_id", membership.facility_id).order("admission_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  if (search) query = query.or(`case_number.ilike.%${search}%,deceased_name.ilike.%${search}%`);
  if (["active", "released", "closed"].includes(status)) query = query.eq("status", status);
  const { data, count, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Case register could not be loaded." }, { status: 503 });
  return NextResponse.json({ cases: data ?? [], total: count ?? 0, page, pageSize });
}

export async function POST(request: NextRequest) {
  const neonDb = await createClient();
  const { data: { user } } = await neonDb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to admit a case." }, { status: 401 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const facilityId = String(input?.facilityId ?? "");
  const personName = String(input?.personName ?? "").trim();
  const admissionAt = String(input?.admissionAt ?? "");
  if (!facilityId || personName.length < 2 || !Number.isFinite(Date.parse(admissionAt))) return NextResponse.json({ error: "Provide the deceased personâ€™s name and admission date." }, { status: 400 });
  const kin = input?.nextOfKin && typeof input.nextOfKin === "object" && !Array.isArray(input.nextOfKin)
    ? input.nextOfKin
    : { name: String(input?.kinName ?? "").trim(), phone: String(input?.kinPhone ?? "").trim() };
  const { data, error } = await neonDb.rpc("admit_case", {
    target_facility: facilityId, person_name: personName, admission_time: admissionAt,
    kin_details: kin, person_sex: String(input?.sex ?? "Not recorded"), person_age: String(input?.age ?? ""),
    source_text: String(input?.source ?? ""), notes_text: String(input?.notes ?? ""), identification_state: String(input?.identificationStatus ?? "identified").toLowerCase(),
  });
  if (error) return NextResponse.json({ error: error.code === "42501" ? "Your facility role cannot admit cases." : error.message || "Case admission failed." }, { status: error.code === "42501" ? 403 : 400 });
  return NextResponse.json({ case: data }, { status: 201 });
}

