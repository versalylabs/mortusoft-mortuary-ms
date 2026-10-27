import { NextResponse } from "next/server";
import { createClient } from "@/lib/neon-data/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const neonDb = await createClient();
  const { data: { user }, error: authError } = await neonDb.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to open your facility workspace." }, { status: 401 });

  const { data: membership, error: membershipError } = await neonDb
    .from("facility_members").select("facility_id,role").eq("user_id", user.id).eq("status", "active").order("created_at").limit(1).maybeSingle();
  if (membershipError) return NextResponse.json({ error: "Could not load facility access. Check that the production migration has been applied." }, { status: 503 });
  if (!membership) return NextResponse.json({ facility: null, cases: [], metrics: null });

  const facilityId = membership.facility_id;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  const [facilityResult, casesResult, activeResult, monthResult, roomsResult, slotsResult, membersResult, invoicesResult, paymentsResult, releasesResult] = await Promise.all([
    neonDb.from("facilities").select("id,name,facility_type,county,case_prefix,timezone,contact_email,contact_phone").eq("id", facilityId).maybeSingle(),
    neonDb.from("cases").select("id,case_number,deceased_name,identification_status,status,admission_at,current_location").eq("facility_id", facilityId).order("admission_at", { ascending: false }).limit(100),
    neonDb.from("cases").select("id", { count: "exact", head: true }).eq("facility_id", facilityId).eq("status", "active"),
    neonDb.from("cases").select("id", { count: "exact", head: true }).eq("facility_id", facilityId).gte("admission_at", monthStart).lt("admission_at", nextMonth),
    neonDb.from("storage_rooms").select("id,name").eq("facility_id", facilityId),
    neonDb.from("storage_slots").select("id,current_case_id").eq("facility_id", facilityId),
    neonDb.from("facility_members").select("user_id,role,status").eq("facility_id", facilityId).eq("status", "active"),
    neonDb.from("invoices").select("id,status").eq("facility_id", facilityId),
    neonDb.from("payments").select("amount_minor").eq("facility_id", facilityId),
    neonDb.from("cases").select("id", { count: "exact", head: true }).eq("facility_id", facilityId).eq("status", "released"),
  ]);
  const failures = [facilityResult, casesResult, activeResult, monthResult, roomsResult, slotsResult, membersResult, invoicesResult, paymentsResult, releasesResult].filter(result => result.error);
  if (failures.length) return NextResponse.json({ error: "The workspace data could not be loaded. Confirm the Phase 14 migration and access policies are active." }, { status: 503 });

  const cases = casesResult.data ?? [];
  const slots = slotsResult.data ?? [];
  const collectedMinor = (paymentsResult.data ?? []).reduce((sum, payment) => sum + Number(payment.amount_minor || 0), 0);
  return NextResponse.json({
    facility: facilityResult.data,
    role: membership.role,
    cases,
    metrics: {
      activeCases: activeResult.count ?? 0, monthAdmissions: monthResult.count ?? 0, releases: releasesResult.count ?? 0,
      teamMembers: membersResult.data?.length ?? 0,
      storageOccupied: slots.filter(slot => slot.current_case_id).length,
      storageCapacity: slots.length,
      storageRooms: roomsResult.data?.length ?? 0,
      invoices: invoicesResult.data?.length ?? 0,
      collectedMinor,
    },
  });
}

