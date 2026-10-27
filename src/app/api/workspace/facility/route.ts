import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/neon-data/server";

export async function POST(request: NextRequest) {
  const neonDb = await createClient();
  const { data: { user } } = await neonDb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to create a facility." }, { status: 401 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = String(input?.name ?? "").trim();
  const type = String(input?.type ?? "Private mortuary").trim();
  const county = String(input?.county ?? "").trim();
  const prefix = String(input?.prefix ?? "MRT").trim().toUpperCase();
  const timezone = String(input?.timezone ?? "Africa/Nairobi").trim();
  if (name.length < 2 || name.length > 120 || !county || !/^[A-Z0-9]{1,6}$/.test(prefix)) return NextResponse.json({ error: "Enter a facility name, county, and a prefix of up to six letters or numbers." }, { status: 400 });
  const { data, error } = await neonDb.rpc("create_facility_for_current_user", { facility_name: name, facility_type: type, facility_county: county, facility_prefix: prefix, facility_timezone: timezone });
  if (error) return NextResponse.json({ error: "Facility setup could not be saved. Confirm that the Phase 14 migration has been applied." }, { status: 503 });
  return NextResponse.json({ facilityId: data }, { status: 201 });
}

