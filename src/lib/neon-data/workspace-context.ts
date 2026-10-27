import { createClient } from "./server";
import { getNeonAuth } from "@/lib/neon/server-auth";

export async function getWorkspaceContext() {
  const neonDb = await createClient();
  const { data: session, error: authError } = await getNeonAuth().getSession();
  const user = session?.user ?? null;
  if (authError || !user) return { neonDb, user: null, membership: null, error: "Sign in to continue." };
  const { data: membership, error } = await neonDb.from("facility_members")
    .select("facility_id,role,status").eq("user_id", user.id).eq("status", "active").order("created_at").limit(1).maybeSingle();
  if (error) return { neonDb, user, membership: null, error: "Could not load facility access. Check the Phase 14 migration." };
  return { neonDb, user, membership, error: null };
}

